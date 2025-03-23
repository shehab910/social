package main

import (
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/rs/zerolog/log"
	"github.com/shehab910/social/internal/mailer"
	ratelimiter "github.com/shehab910/social/internal/rate-limiter"
	"github.com/shehab910/social/internal/store"
)

type dbConfig struct {
	addr         string
	maxOpenConns int
	maxIdleConns int
	maxIdleTime  string
}

type config struct {
	db                  dbConfig
	email               mailer.EmailConfig
	addr                string
	env                 string
	clientUrl           string
	tokenExpirationMins int
	jwtSecret           string
	rateLimiter         ratelimiter.Config
}

type application struct {
	config      config
	store       *store.Storage
	mailer      mailer.Client
	rateLimiter ratelimiter.Limiter
}

func (app *application) mount() http.Handler {
	r := chi.NewRouter()

	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(time.Minute))

	r.Use(cors.Handler(cors.Options{
		// AllowedOrigins: []string{env.GetString("CORS_ALLOWED_ORIGIN", "http://127.0.0.1:5173/*")}, // Use this to allow specific origin hosts
		AllowedOrigins: []string{"https://*", "http://*"},
		// AllowOriginFunc:  func(r *http.Request, origin string) bool { return true },
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: false,
		MaxAge:           300, // Maximum value not ignored by any of major browsers
	}))

	if app.config.rateLimiter.Enabled {
		//TODO: test the ratelimiter
		r.Use(app.RateLimiterMiddleware)
	}

	r.Route("/v1", func(r chi.Router) {
		r.Get("/health", app.healthCheckHandler)

		r.Route("/posts", func(r chi.Router) {
			r.Use(app.AuthenticateMiddleware)

			r.Post("/", app.createPostHandler)
			r.Route("/{post_id}", func(r chi.Router) {
				r.Use(app.postContextMiddleware)

				r.Get("/", app.getPostHandler)
				r.Delete("/", app.deletePostHandler)
				r.Patch("/", app.updatePostHandler)

				r.Get("/comments", app.getPostCommentsHandler)
				r.Post("/comments", app.createPostCommentHandler)
			})
		})

		r.Route("/users", func(r chi.Router) {
			r.Use(app.AuthenticateMiddleware)

			r.Get("/me", app.getMeHandler)

			r.Route("/{user_id}", func(r chi.Router) {
				r.Use(app.userContextMiddleware)

				r.Get("/", app.getUserHandler)
				r.Put("/follow", app.followUserHandler)
				r.Put("/unfollow", app.unfollowUserHandler)
			})
			r.Group(func(r chi.Router) {
				r.Get("/feed", app.getUserFeedHandler)
			})
		})

		r.Route("/auth", func(r chi.Router) {
			//TODO: handle duplicate email/username
			r.Post("/register", app.registerUserHandler)
			r.Post("/login", app.loginUserHandler)
			r.Get("/verify/{token}", app.verifyUserHandler)
		})
	})
	return r
}

func (app *application) run(mux http.Handler) error {
	srv := http.Server{
		Addr:    app.config.addr,
		Handler: mux,

		WriteTimeout: time.Second * 30,
		ReadTimeout:  time.Second * 10,
		IdleTimeout:  time.Minute,
	}

	log.Info().Str("addr", srv.Addr).Str("env", app.config.env).Msg("Starting server")
	return srv.ListenAndServe()
}
