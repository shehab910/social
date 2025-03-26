package store

import (
	"context"
	"database/sql"
	"errors"
	"time"
)

type User struct {
	ID          int64        `json:"id"`
	Username    string       `json:"username"`
	ImgUrl      string       `json:"img_url"`
	Email       string       `json:"email"`
	Password    string       `json:"-"`
	Role        string       `json:"role"`
	Verified    bool         `json:"verified"`
	LastLoginAt sql.NullTime `json:"last_login_at"`
	CreatedAt   string       `json:"created_at"`
	UpdatedAt   string       `json:"updated_at"`
}

type UserStore struct {
	db *sql.DB
}

func (s *UserStore) Create(ctx context.Context, user *User) error {
	query := `
		INSERT INTO users (username, password, email)
		VALUES ($1, $2, $3)
		RETURNING id, created_at, updated_at
	`

	return s.db.QueryRowContext(
		ctx,
		query,
		user.Username,
		user.Password,
		user.Email,
	).Scan(
		&user.ID,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
}

func (s *UserStore) GetById(ctx context.Context, id int64) (*User, error) {
	query := `
		SELECT id, username, email, password, role, verified, last_login_at, created_at, updated_at, image_url
		FROM users
		WHERE id = $1
	`
	var user User

	err := s.db.QueryRowContext(ctx, query, id).Scan(
		&user.ID,
		&user.Username,
		&user.Email,
		&user.Password,
		&user.Role,
		&user.Verified,
		&user.LastLoginAt,
		&user.CreatedAt,
		&user.UpdatedAt,
		&user.ImgUrl,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}

	return &user, nil
}

func (s *UserStore) GetByEmail(ctx context.Context, email string) (*User, error) {
	query := `
		SELECT id, username, email, password, role, verified, last_login_at, created_at, updated_at, image_url
		FROM users
		WHERE email = $1
	`
	var user User

	err := s.db.QueryRowContext(ctx, query, email).Scan(
		&user.ID,
		&user.Username,
		&user.Email,
		&user.Password,
		&user.Role,
		&user.Verified,
		&user.LastLoginAt,
		&user.CreatedAt,
		&user.UpdatedAt,
		&user.ImgUrl,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}

	return &user, nil
}

func (s *UserStore) UpdateLastLogin(ctx context.Context, userId int64) error {
	query := `
		UPDATE users
		SET last_login_at = $1
		WHERE id = $2
	`

	_, err := s.db.ExecContext(
		ctx,
		query,
		time.Now(),
		userId,
	)

	return err
}

func (s *UserStore) VerifyUser(ctx context.Context, userId int64) error {
	query := `
		UPDATE users
		SET verified = true
		WHERE id = $1
	`

	_, err := s.db.ExecContext(ctx, query, userId)
	return err
}
