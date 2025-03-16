package main

import (
	"github.com/joho/godotenv"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
	"github.com/shehab910/social/internal/db"
	"github.com/shehab910/social/internal/env"
	"github.com/shehab910/social/internal/mailer"
	"github.com/shehab910/social/internal/store"
)

const version = "v0.0.1"

func main() {
	zerolog.TimeFieldFormat = zerolog.TimeFormatUnix

	if err := godotenv.Load(); err != nil {
		log.Fatal().Msg("Error loading .env file")
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

	cfg := config{
		db:                  dbCfg,
		email:               emailCfg,
		addr:                env.GetString("ADDR", ":8080"),
		env:                 env.GetString("ENV", "dev"),
		tokenExpirationMins: env.GetInt("TOKEN_EXPIRATION_MINS", 15),
		jwtSecret:           env.GetString("JWT_SECRET", ""),
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
	log.Print("DB Connection Established")

	store := store.NewStorage(db)

	mailer := mailer.NewSmtpMailer(emailCfg)

	app := &application{
		config: cfg,
		store:  store,
		mailer: mailer,
	}

	mux := app.mount()
	log.Fatal().Err(app.run(mux)).Msg("Error Running Server")
}
