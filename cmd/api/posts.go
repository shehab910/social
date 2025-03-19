package main

import (
	"context"
	"errors"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/shehab910/social/internal/store"
)

type postKey string

const postCtx postKey = "post"

type CreatePostPayload struct {
	Title   string   `json:"title" validate:"required,max=100"`
	Content string   `json:"content" validate:"required,max=1000"`
	Tags    []string `json:"tags" validate:"dive,max=20"`
}

func (app *application) createPostHandler(w http.ResponseWriter, r *http.Request) {
	var payload CreatePostPayload
	if err := readJSON(w, r, &payload); err != nil {
		app.badRequestError(w, r, err)
		return
	}

	if err := Validate.Struct(payload); err != nil {
		app.badRequestError(w, r, err)
		return
	}

	post := &store.Post{
		Title:   payload.Title,
		Content: payload.Content,
		Tags:    payload.Tags,
		//TODO: change after auth
		UserID: 1,
	}

	if err := app.store.Posts.Create(r.Context(), post); err != nil {
		app.internalServerError(w, r, err)
		return
	}

	if err := app.jsonResponse(w, http.StatusCreated, post); err != nil {

	}
}

func (app *application) getPostHandler(w http.ResponseWriter, r *http.Request) {
	post := getPostFromCtx(r)

	// comments, err := app.store.Comments.GetByPostIdWithUser(r.Context(), post.ID)
	// if err != nil {
	// 	app.internalServerError(w, r, err)
	// 	return
	// }

	// post.Comments = comments

	if err := app.jsonResponse(w, http.StatusOK, post); err != nil {
		app.internalServerError(w, r, err)
		return
	}
}

func (app *application) deletePostHandler(w http.ResponseWriter, r *http.Request) {
	// TODO: check if the post is not found from the already fetched post from the context
	postId := chi.URLParam(r, "post_id")
	postIdParsed, err := strconv.ParseInt(postId, 10, 64)
	if err != nil {
		app.badRequestError(w, r, errors.New("wrong post id"))
		return
	}

	if err := app.store.Posts.DeleteById(r.Context(), postIdParsed); err != nil {
		switch {
		case errors.Is(err, store.ErrNotFound):
			app.notFoundResponse(w, r, err)
		default:
			app.internalServerError(w, r, err)
		}
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

type UpdatePostPayload struct {
	Title   *string `json:"title" validate:"omitempty,max=100"`
	Content *string `json:"content" validate:"omitempty,max=1000"`
}

func (app *application) updatePostHandler(w http.ResponseWriter, r *http.Request) {
	//TODO: Handle update with tags
	post := getPostFromCtx(r)

	var payload UpdatePostPayload
	if err := readJSON(w, r, &payload); err != nil {
		app.badRequestError(w, r, err)
		return
	}

	if err := Validate.Struct(payload); err != nil {
		app.badRequestError(w, r, err)
		return
	}

	//TODO: find a better way to return early if the payload is empty
	isPayloadEmpty := true
	if payload.Content != nil {
		isPayloadEmpty = false
		post.Content = *payload.Content
	}

	if payload.Title != nil {
		isPayloadEmpty = false
		post.Title = *payload.Title
	}

	if isPayloadEmpty {
		app.badRequestError(w, r, ErrEmptyJSONBody)
		return
	}

	if err := app.store.Posts.Update(r.Context(), post); err != nil {
		app.internalServerError(w, r, err)
		return
	}

	if err := app.jsonResponse(w, http.StatusOK, post); err != nil {
		app.internalServerError(w, r, err)
	}

}

// TODO: Take a look again at this middleware, i feel like we are fetching posts and not using it in 2 out of 4 functions (create and delete)!
func (app *application) postContextMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		rCtx := r.Context()
		postId := chi.URLParam(r, "post_id")
		postIdParsed, err := strconv.ParseInt(postId, 10, 64)
		if err != nil {
			app.badRequestError(w, r, errors.New("wrong post id"))
			return
		}
		post, err := app.store.Posts.GetByIdWithUser(rCtx, postIdParsed)
		if err != nil {
			switch {
			case errors.Is(err, store.ErrNotFound):
				app.notFoundResponse(w, r, err)
			default:
				app.internalServerError(w, r, err)
			}
			return
		}

		ctx := context.WithValue(rCtx, postCtx, post)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func getPostFromCtx(r *http.Request) *store.Post {
	//TODO: check error handling here
	post, _ := r.Context().Value(postCtx).(*store.Post)
	return post
}
