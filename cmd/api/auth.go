package main

import (
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/shehab910/social/internal/store"
	"github.com/shehab910/social/internal/utils"
)

type RegisterUserPayload struct {
	Username string `json:"username" validate:"required,min=3,max=10,alphanum"`
	Email    string `json:"email" validate:"required,email,max=100"`
	Password string `json:"password" validate:"required,min=6,max=32"` //TODO: change with custom strong password validator
}

type LoginUserPayload struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

func (app *application) registerUserHandler(w http.ResponseWriter, r *http.Request) {
	var payload RegisterUserPayload

	if err := readJSON(w, r, &payload); err != nil {
		app.badRequestError(w, r, err)
		return
	}

	if err := Validate.Struct(payload); err != nil {
		app.badRequestError(w, r, err)
		return
	}

	hashedPass, err := utils.HashPassword(payload.Password)
	if err != nil {
		app.internalServerError(w, r, err)
		return
	}

	user := store.User{
		Username: payload.Username,
		Email:    payload.Email,
		Password: hashedPass,
	}

	if err := app.store.Users.Create(r.Context(), &user); err != nil {
		app.internalServerError(w, r, err)
		return
	}

	if err := app.jsonResponse(w, http.StatusCreated, user); err != nil {
		app.internalServerError(w, r, err)
		return
	}
}

func (app *application) loginUserHandler(w http.ResponseWriter, r *http.Request) {
	var payload LoginUserPayload

	if err := readJSON(w, r, &payload); err != nil {
		app.badRequestError(w, r, err)
		return
	}

	if err := Validate.Struct(payload); err != nil {
		app.badRequestError(w, r, err)
		return
	}

	dbUser, err := app.store.Users.GetByEmail(r.Context(), payload.Email)
	if err != nil {
		if errors.Is(err, store.ErrNotFound) {
			app.invalidCredentialsResponse(w, r)
			return
		}
		app.internalServerError(w, r, err)
		return
	}

	if !utils.CheckPasswordHash(payload.Password, dbUser.Password) {
		app.invalidCredentialsResponse(w, r)
		return
	}

	token, err := utils.GenerateToken(
		dbUser.Email,
		dbUser.ID,
		dbUser.Role,
		dbUser.Verified,
		app.config.tokenExpirationMins,
		app.config.jwtSecret,
	)
	if err != nil {
		app.internalServerError(w, r, err)
		return
	}

	if !dbUser.Verified {
		// if user not verified, last login is treated as last sent verification email
		parsedLastSentTokenAt := dbUser.LastLoginAt
		isLastSentTokenExpired := time.Since(parsedLastSentTokenAt.Time) > time.Minute*time.Duration(app.config.tokenExpirationMins)
		userNeverLoggedIn := parsedLastSentTokenAt.Time.IsZero()

		if isLastSentTokenExpired || userNeverLoggedIn {
			verifyUrl := "http://localhost:" + strings.Split(app.config.addr, ":")[1] + "/v1/auth/verify/" + token
			if err := utils.SendVerifyUserEmail(dbUser.Email, verifyUrl, app.config.email); err != nil {
				app.internalServerError(w, r, err)
				return
			}
			if err := app.store.Users.UpdateLastLogin(r.Context(), dbUser.ID); err != nil {
				app.internalServerError(w, r, err)
				return
			}
		}
		app.customErrorResponse(w, r, http.StatusUnauthorized, errors.New("user not verified, verification email sent"))
		return
	}

	app.store.Users.UpdateLastLogin(r.Context(), dbUser.ID)
	app.jsonResponse(w, http.StatusOK, map[string]string{
		"message": "Login successful",
		"token":   token,
	})
}

func (app *application) verifyUserHandler(w http.ResponseWriter, r *http.Request) {
	token := chi.URLParam(r, "token")
	claims, err := utils.ValidateToken(token, app.config.jwtSecret)
	if err != nil {
		app.customErrorResponse(w, r, http.StatusUnauthorized, errors.New("invalid or expired token, login again & reverify your email"))
		return
	}

	userId := int64(claims["userId"].(float64))

	if err := app.store.Users.VerifyUser(r.Context(), userId); err != nil {
		app.internalServerError(w, r, err)
		return
	}

	app.jsonResponse(w, http.StatusOK, map[string]string{
		"message": "User verified successfully",
	})
}
