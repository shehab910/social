package main

import (
	"errors"
	"net/http"

	"github.com/shehab910/social/internal/store"
)

func (app *application) getUserFeedHandler(w http.ResponseWriter, r *http.Request) {
	pfq := store.PaginatedFeedQuery{
		Limit:  20,
		Offset: 0,
		Sort:   "desc",
		Tags:   []string{},
	}

	if err := pfq.Parse(r); err != nil {
		app.badRequestError(w, r, err)
		return
	}

	if err := Validate.Struct(pfq); err != nil {
		app.badRequestError(w, r, err)
		return
	}

	userId := app.currentUserIdFromCtx(r)
	posts, err := app.store.Posts.GetUserFeed(r.Context(), userId, pfq)
	if err != nil {
		app.internalServerError(w, r, err)
		return
	}

	if err := app.jsonResponse(w, http.StatusOK, posts); err != nil {
		if errors.Is(err, store.ErrNotFound) {
			app.notFoundResponse(w, r, err)
			return
		}
		app.internalServerError(w, r, err)
		return
	}

}

func (app *application) getExploreHandler(w http.ResponseWriter, r *http.Request) {
	pfq := store.PaginatedFeedQuery{
		Limit:  20,
		Offset: 0,
		Sort:   "desc",
		Tags:   []string{},
	}

	if err := pfq.Parse(r); err != nil {
		app.unProcessableContent(w, r, err)
		return
	}

	if err := Validate.Struct(pfq); err != nil {
		app.unProcessableContent(w, r, err)
		return
	}

	userId := app.currentUserIdFromCtx(r)
	posts, err := app.store.Posts.GetExploreFeed(r.Context(), userId, pfq)
	if err != nil {
		app.internalServerError(w, r, err)
		return
	}

	if err := app.jsonResponse(w, http.StatusOK, posts); err != nil {
		if errors.Is(err, store.ErrNotFound) {
			app.notFoundResponse(w, r, err)
			return
		}
		app.internalServerError(w, r, err)
		return
	}

}
