package main

import (
	"log"

	"github.com/shehab910/social/internal/db"
	"github.com/shehab910/social/internal/env"
	"github.com/shehab910/social/internal/store"
)

func main() {
	addr := env.GetString("DB_ADDR", "postgres://postgres:root@localhost/social?sslmode=disable")
	conn, err := db.New(addr, 3, 3, "15m")
	if err != nil {
		log.Fatal(err)
	}

	defer conn.Close()

	store := store.NewStorage(conn)

	db.Seed(store, conn)
}
