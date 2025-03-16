package main

import (
	"errors"
	"net/http"

	"github.com/rs/zerolog/log"
)

var (
	ErrEmptyJSONBody   = errors.New("empty json body")
	ErrWrongFormat     = errors.New("wrong format")
	ErrAlreadyExists   = errors.New("resource already exists")
	ErrGenericInternal = errors.New("something went wrong")
	ErrNotFound        = errors.New("resource not found")
	ErrInvalidCreds    = errors.New("invalid credentials")
	ErrUnauthorized    = errors.New("unauthorized")
)

func (app *application) internalServerError(w http.ResponseWriter, r *http.Request, err error) {
	log.Error().Err(err).Str("path", r.URL.Path).Str("method", r.Method).Msg("internal server error")

	writeJSONErr(w, http.StatusInternalServerError, ErrGenericInternal.Error())
}

func (app *application) badRequestError(w http.ResponseWriter, r *http.Request, err error) {
	log.Warn().Err(err).Str("path", r.URL.Path).Str("method", r.Method).Msg("bad request error")

	// Passing validation errors to user
	writeJSONErr(w, http.StatusBadRequest, err.Error())
}

func (app *application) conflictResponse(w http.ResponseWriter, r *http.Request, err error) {
	log.Error().Err(err).Str("path", r.URL.Path).Str("method", r.Method).Msg("conflict error")

	// Passing validation errors to user
	writeJSONErr(w, http.StatusConflict, ErrAlreadyExists.Error())
}

func (app *application) notFoundResponse(w http.ResponseWriter, r *http.Request, err error) {
	log.Warn().Err(err).Str("path", r.URL.Path).Str("method", r.Method).Msg("not found error")

	writeJSONErr(w, http.StatusNotFound, ErrNotFound.Error())
}

func (app *application) unauthorizedResponse(w http.ResponseWriter, r *http.Request, err error) {
	log.Error().Err(err).Str("path", r.URL.Path).Str("method", r.Method).Msg("unauthorized error")

	writeJSONErr(w, http.StatusUnauthorized, ErrUnauthorized.Error())
}

func (app *application) invalidCredentialsResponse(w http.ResponseWriter, r *http.Request) {
	log.Warn().Str("path", r.URL.Path).Str("method", r.Method).Msg("invalid credentials error")

	writeJSONErr(w, http.StatusUnauthorized, ErrInvalidCreds.Error())
}

func (app *application) customErrorResponse(w http.ResponseWriter, r *http.Request, status int, err error) {
	log.Error().Err(err).Str("path", r.URL.Path).Str("method", r.Method).Msg("custom error")

	writeJSONErr(w, status, err.Error())
}
