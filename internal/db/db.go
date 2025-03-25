package db

import (
	"context"
	"database/sql"
	"time"
)

func New(addr string, maxOpenConns int, maxIdleConns int, maxIdleTime string, schemaName string) (*sql.DB, error) {
	db, err := sql.Open("postgres", addr)
	if err != nil {
		return nil, err
	}

	db.SetMaxOpenConns(maxOpenConns)
	db.SetMaxIdleConns(maxIdleConns)

	dur, err := time.ParseDuration(maxIdleTime)
	if err != nil {
		return nil, err
	}
	db.SetConnMaxIdleTime(dur)

	ctx, cancel := context.WithTimeout(context.Background(), time.Second*5)
	defer cancel()

	if _, err := db.ExecContext(ctx, "SET search_path to "+schemaName+", public"); err != nil {
		return nil, err
	}

	return db, nil
}
