package main

import (
	"log"
	"net/http"
)

func (app *application) internalServerError(w http.ResponseWriter, r *http.Request, err error) {
	log.Printf("internal server error: %s path: %s error: %s", r.Method, r.URL.Path, err.Error())
	writeJSONErr(w, http.StatusInternalServerError, "Something went wrong")
}

func (app *application) badRequestError(w http.ResponseWriter, r *http.Request, err error) {
	log.Printf("bad request error: %s path: %s error: %s", r.Method, r.URL.Path, err.Error())
	// Passing validation errors to user
	writeJSONErr(w, http.StatusBadRequest, err.Error())
}

func (app *application) notFoundResponse(w http.ResponseWriter, r *http.Request, err error) {
	log.Printf("not found response : %s path: %s error: %s", r.Method, r.URL.Path, err.Error())
	writeJSONErr(w, http.StatusBadRequest, "Not found")
}
