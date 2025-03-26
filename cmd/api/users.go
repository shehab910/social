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

func getUserFromCtx(r *http.Request) *store.User {
	user, _ := r.Context().Value(userCtx).(*store.User)
	return user
}
