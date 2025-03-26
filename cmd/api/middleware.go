package main

import (
	"context"
	"net/http"

	"github.com/shehab910/social/internal/utils"
)

func (app *application) RateLimiterMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if app.config.rateLimiter.Enabled {
			if allow, retryAfter := app.rateLimiter.Allow(r.RemoteAddr); !allow {
				app.rateLimitExceededResponse(w, r, retryAfter.String())
				return
			}
		}

		next.ServeHTTP(w, r)
	})
}

type contextKey string

const currUserCtx contextKey = "authUser"

func (app *application) AuthenticateMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		tokenString := r.Header.Get("Authorization")

		if tokenString == "" {
			app.unauthorizedResponse(w, r, nil)
			return
		}

		claims, err := utils.ValidateToken(tokenString, app.config.jwtSecret)
		if err != nil {
			app.unauthorizedResponse(w, r, nil)
			return
		}

		if isVerified, ok := claims["is_verified"].(bool); !isVerified || !ok {
			app.jsonResponse(w, http.StatusUnauthorized, map[string]string{"error": "Please login again and if not verified, verify your email"})
			return
		}

		_, ok := claims["userId"].(float64)
		if !ok {
			app.jsonResponse(w, http.StatusUnauthorized, map[string]string{"error": "Please login again and if not verified, verify your email"})
			return
		}

		ctx := context.WithValue(r.Context(), currUserCtx, utils.ParseClaims(claims))

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func (app *application) getCurrentUserFromCtx(r *http.Request) utils.TokenClaims {
	user, _ := r.Context().Value(currUserCtx).(utils.TokenClaims)
	return user
}
