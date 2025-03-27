package main

import (
	"context"
	"errors"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/shehab910/social/internal/store"
	"github.com/shehab910/social/internal/utils"
)

type userKey string

const userCtx userKey = "user"

func (app *application) getMeHandler(w http.ResponseWriter, r *http.Request) {
	claims, err := utils.ValidateToken(r.Header.Get("Authorization"), app.config.jwtSecret)
	if err != nil {
		app.internalServerError(w, r, err)
		return
	}

	app.jsonResponse(w, http.StatusOK, claims)
}

func (app *application) getUserHandler(w http.ResponseWriter, r *http.Request) {
	user := getUserFromCtx(r)

	if err := app.jsonResponse(w, http.StatusOK, user); err != nil {
		app.internalServerError(w, r, err)
		return
	}
}

func (app *application) followUserHandler(w http.ResponseWriter, r *http.Request) {
	followedUser := getUserFromCtx(r)
	followerUser := app.getCurrentUserFromCtx(r)

	if err := app.store.Followers.Follow(r.Context(), followerUser.UserId, followedUser.ID); err != nil {
		if errors.Is(err, store.ErrConflict) {
			app.conflictResponse(w, r, err)
			return
		}
		app.internalServerError(w, r, err)
		return
	}

	if err := app.jsonResponse(w, http.StatusNoContent, nil); err != nil {
		app.internalServerError(w, r, err)
		return
	}
}

type FollowUser struct {
	UserID int64 `json:"user_id"`
}

func (app *application) unfollowUserHandler(w http.ResponseWriter, r *http.Request) {
	followedUser := getUserFromCtx(r)
	followerUser := app.getCurrentUserFromCtx(r)

	if err := app.store.Followers.Unfollow(r.Context(), followerUser.UserId, followedUser.ID); err != nil {
		app.internalServerError(w, r, err)
		return
	}

	if err := app.jsonResponse(w, http.StatusNoContent, nil); err != nil {
		app.internalServerError(w, r, err)
		return
	}
}

func (app *application) userContextMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		userId, err := strconv.ParseInt(chi.URLParam(r, "user_id"), 10, 64)
		if err != nil {
			app.badRequestError(w, r, ErrWrongFormat)
			return
		}

		ctx := r.Context()
		user, err := app.store.Users.GetById(ctx, userId)
		if err != nil {
			if errors.Is(err, store.ErrNotFound) {
				app.notFoundResponse(w, r, err)
				return
			}
			app.internalServerError(w, r, err)
			return
		}

		ctx = context.WithValue(ctx, userCtx, user)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func (app *application) getUserProfileHandler(w http.ResponseWriter, r *http.Request) {
	user := getUserFromCtx(r)

	//todo: check if user is logged in and pass current user to GetProfileById
	// currUser, isLoggedIn := r.Context().Value(currUserCtx).(utils.TokenClaims)
	// var currUserId *int64
	// if !isLoggedIn {
	// 	currUserId = nil
	// } else {
	// 	currUserId = &currUser.UserId
	// }
	// log.Info().Msgf("currUserId: %v", currUserId)

	profileData, err := app.store.Users.GetProfileById(r.Context(), user.ID, nil)
	if err != nil {
		app.internalServerError(w, r, err)
		return
	}

	if err := app.jsonResponse(w, http.StatusOK, profileData); err != nil {
		app.internalServerError(w, r, err)
		return
	}
}

func (app *application) isFollowedHandler(w http.ResponseWriter, r *http.Request) {
	followedUser := getUserFromCtx(r)
	followerUser := app.getCurrentUserFromCtx(r)

	isFollowed, err := app.store.Followers.IsFollowed(r.Context(), followerUser.UserId, followedUser.ID)
	if err != nil {
		app.internalServerError(w, r, err)
		return
	}

	if err := app.jsonResponse(w, http.StatusOK, map[string]bool{"is_followed": isFollowed}); err != nil {
		app.internalServerError(w, r, err)
		return
	}
}

func (app *application) getUserPostsHandler(w http.ResponseWriter, r *http.Request) {
	user := getUserFromCtx(r)

	posts, err := app.store.Posts.GetUserPostsByUserId(r.Context(), user.ID)
	if err != nil {
		app.internalServerError(w, r, err)
		return
	}

	if err := app.jsonResponse(w, http.StatusOK, posts); err != nil {
		if errors.Is(err, store.ErrNotFound) {
			app.jsonResponse(w, http.StatusOK, []bool{})
			return
		}
		app.internalServerError(w, r, err)
		return
	}
}

func getUserFromCtx(r *http.Request) *store.User {
	user, _ := r.Context().Value(userCtx).(*store.User)
	return user
}
