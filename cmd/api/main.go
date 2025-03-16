package main

import (
	"github.com/joho/godotenv"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
	"github.com/shehab910/social/internal/db"
	"github.com/shehab910/social/internal/env"
	"github.com/shehab910/social/internal/store"
)

const version = "v0.0.1"

func main() {
	zerolog.TimeFieldFormat = zerolog.TimeFormatUnix

	if err := godotenv.Load(); err != nil {
		log.Fatal().Msg("Error loading .env file")
	}

	dbCfg := dbConfig{
		addr:         env.GetString("DB_ADDR", "postgres://postgres:root@localhost/social?sslmode=disable"),
		maxOpenConns: env.GetInt("DB_MAX_OPEN_CONNS", 30),
		maxIdleConns: env.GetInt("DB_MAX_IDLE_CONNS", 30),
		maxIdleTime:  env.GetString("DB_MAX_IDLE_TIME", "15m"),
	}

	cfg := config{
		addr: env.GetString("ADDR", ":8080"),
		db:   dbCfg,
		env:  env.GetString("ENV", "dev"),
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

	app := &application{
		config: cfg,
		store:  store,
	}

	mux := app.mount()
	log.Fatal().Err(app.run(mux)).Msg("Error Running Server")
}
