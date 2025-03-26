package store

import (
	"context"
	"database/sql"
	"errors"
)

var (
	ErrNotFound = errors.New("record not found")
	ErrConflict = errors.New("resource already exist")
)

type Storage struct {
	Posts interface {
		GetByIdWithUser(ctx context.Context, id int64) (*Post, error)
		Create(context.Context, *Post) error
		Update(context.Context, *Post) error
		DeleteById(ctx context.Context, id int64) error
		GetUserFeed(context.Context, int64, PaginatedFeedQuery) ([]PostWithMeta, error)
		GetExploreFeed(context.Context, PaginatedFeedQuery) ([]PostWithMeta, error)
	}
	Users interface {
		GetById(ctx context.Context, id int64) (*User, error)
		GetByEmail(ctx context.Context, email string) (*User, error)
		Create(context.Context, *User) error
		VerifyUser(ctx context.Context, userId int64) error
		UpdateLastLogin(ctx context.Context, userId int64) error
	}
	Comments interface {
		GetByPostIdWithUser(ctx context.Context, postID int64) ([]Comment, error)
		Create(context.Context, *Comment) error
	}
	Followers interface {
		Follow(ctx context.Context, followerId int64, followedId int64) error
		Unfollow(ctx context.Context, followerId int64, followedId int64) error
	}
}

func NewStorage(db *sql.DB) *Storage {
	return &Storage{
		Posts:     &PostStore{db},
		Users:     &UserStore{db},
		Comments:  &CommentStore{db},
		Followers: &FollowerStore{db},
	}
}
