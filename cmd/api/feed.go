package main

import (
	"errors"
	"log"
	"net/http"

	"github.com/shehab910/social/internal/store"
)

func (app *application) getUserFeedHandler(w http.ResponseWriter, r *http.Request) {
	pfq := store.PaginatedFeedQuery{
		Limit:  20,
		Offset: 0,
		Sort:   "desc",
		Filter: store.FilterQuery{
			Tags: []string{},
		},
	}

	if err := pfq.Parse(r); err != nil {
		app.badRequestError(w, r, err)
		return
	}
	log.Printf("Parsed query: %+v", pfq)

	if err := Validate.Struct(pfq); err != nil {
		app.badRequestError(w, r, err)
		return
	}

	// TODO: replace when auth implemented
	posts, err := app.store.Posts.GetUserFeed(r.Context(), int64(3), pfq)
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
