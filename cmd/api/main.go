package main

import (
	"strings"
	"time"

	"github.com/joho/godotenv"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
	"github.com/shehab910/social/internal/db"
	"github.com/shehab910/social/internal/env"
	"github.com/shehab910/social/internal/mailer"
	ratelimiter "github.com/shehab910/social/internal/rate-limiter"
	"github.com/shehab910/social/internal/store"
)

// trigger build
const version = "v0.0.1"

func main() {
	zerolog.TimeFieldFormat = zerolog.TimeFormatUnix

	if err := godotenv.Load(); err != nil {
		log.Error().Msg("Error loading .env file")
	}

	emailCfg := mailer.EmailConfig{
		FromEmail:         env.GetString("FROM_EMAIL", ""),
		FromEmailSmtp:     env.GetString("FROM_EMAIL_SMTP", ""),
		FromEmailPassword: env.GetString("FROM_EMAIL_PASSWORD", ""),
		FromEmailPort:     env.GetString("FROM_EMAIL_PORT", ""),
		SupportEmail:      env.GetString("SUPPORT_EMAIL", "shehabs.910@gmail.com"),
	}

	dbCfg := dbConfig{
		addr:         env.GetString("DB_ADDR", "postgres://postgres:root@localhost/social?sslmode=disable"),
		maxOpenConns: env.GetInt("DB_MAX_OPEN_CONNS", 30),
		maxIdleConns: env.GetInt("DB_MAX_IDLE_CONNS", 30),
		maxIdleTime:  env.GetString("DB_MAX_IDLE_TIME", "15m"),
	}

	getAddr := func() string {
		// get port from PORT first and fall back to addr
		port := env.GetString("PORT", "")
		addr := env.GetString("ADDR", "http://localhost:8080")
		if port == "" {
			return addr
		}
		splitAddr := strings.Split(addr, ":")
		return splitAddr[0] + ":" + port

	}

	cfg := config{
		db:                  dbCfg,
		email:               emailCfg,
		addr:                getAddr(),
		env:                 env.GetString("ENV", "dev"),
		clientUrl:           env.GetString("CLIENT_URL", "http://localhost:5173"),
		serverUrl:           env.GetString("SERVER_URL", "http://localhost:8080"),
		tokenExpirationMins: env.GetInt("TOKEN_EXPIRATION_MINS", 60*24),
		jwtSecret:           env.GetString("JWT_SECRET", "jwtSecret"),
		rateLimiter: ratelimiter.Config{
			RequestsPerTimeFrame: env.GetInt("RATE_LIMITER_REQUESTS_PER_TIME_FRAME", 100),
			TimeFrame:            env.GetDuration("RATE_LIMITER_TIME_FRAME", 1*time.Minute),
			Enabled:              env.GetBool("RATE_LIMITER_ENABLED", false),
		},
	}

	db, err := db.New(
		cfg.db.addr,
		cfg.db.maxOpenConns,
		cfg.db.maxIdleConns,
		cfg.db.maxIdleTime,
	)
	if err != nil {
		log.Panic().Err(err).Msg("Couldn't connect to db\n")
	}
	defer db.Close()
	log.Info().Msg("DB Connection Established")

	store := store.NewStorage(db)

	mailer := mailer.NewSmtpMailer(emailCfg)

	rateLimiter := ratelimiter.NewFixedWindowRateLimiter(
		cfg.rateLimiter.RequestsPerTimeFrame,
		cfg.rateLimiter.TimeFrame,
	)

	app := &application{
		config:      cfg,
		store:       store,
		mailer:      mailer,
		rateLimiter: rateLimiter,
	}

	mux := app.mount()
	log.Fatal().Err(app.run(mux)).Msg("Error Running Server")
}
