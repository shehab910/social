package store

import (
	"context"
	"database/sql"
	"errors"
)

var (
	ErrNotFound = errors.New("record not found")
)

type Storage struct {
	Posts interface {
		GetById(ctx context.Context, id int64) (*Post, error)
		Create(context.Context, *Post) error
		Update(context.Context, *Post) error
		DeleteById(ctx context.Context, id int64) error
	}
	Users interface {
		Create(context.Context, *User) error
	}
	Comments interface {
		GetByPostID(ctx context.Context, postID int64) ([]Comment, error)
		Create(context.Context, *Comment) error
	}
}

func NewStorage(db *sql.DB) *Storage {
	return &Storage{
		Posts:    &PostStore{db},
		Users:    &UserStore{db},
		Comments: &CommentStore{db},
	}
}
