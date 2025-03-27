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
	ImgUrl      *string      `json:"img_url"`
	Email       string       `json:"email"`
	Bio         *string      `json:"bio"`
	Password    string       `json:"-"`
	Role        string       `json:"role"`
	Verified    bool         `json:"verified"`
	LastLoginAt sql.NullTime `json:"last_login_at"`
	CreatedAt   string       `json:"created_at"`
	UpdatedAt   string       `json:"updated_at"`
}

type ProfileData struct {
	User           *User `json:"user"`
	IsFollowed     bool  `json:"is_followed"`
	PostsCount     int   `json:"posts_count"`
	FollowersCount int   `json:"followers_count"`
	FollowingCount int   `json:"following_count"`
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

func (s *UserStore) GetProfileById(ctx context.Context, userId int64, currUserIdIfExist *int64) (ProfileData, error) {
	query := `
		SELECT 
			u.id, 
			u.username, 
			u.email, 
			u.bio, 
			u.image_url, 
			u."role", 
			u.last_login_at, 
			u.verified, 
			u.created_at, 
			u.updated_at, 
			COUNT(DISTINCT f1.user_id) AS following_count, -- Counting who the user is following
			COUNT(DISTINCT f2.follower_id) AS followers_count,  -- Counting followers
			COUNT(p.id) AS posts_count,
			CASE 
				WHEN EXISTS (SELECT 1 FROM followers WHERE user_id = u.id AND follower_id = $2) THEN TRUE
				ELSE FALSE
			END AS is_followed
		FROM 
			users u
		LEFT JOIN 
			followers f1 ON f1.follower_id = u.id  -- Counting who the user is following
		LEFT JOIN 
			followers f2 ON f2.user_id = u.id     -- Counting followers (those who follow the user)
		LEFT JOIN posts p ON p.user_id = u.id
		WHERE u.id = $1
		GROUP BY 
			u.id, u.username, u.email, u.bio, u.image_url, u."role", u.last_login_at, u.verified, u.created_at, u.updated_at;

	`
	var currUserId int64 = 0
	if currUserIdIfExist != nil {
		currUserId = *currUserIdIfExist
	}

	var profile ProfileData
	profile.User = &User{}
	err := s.db.QueryRowContext(ctx, query, userId, currUserId).Scan(
		&profile.User.ID,
		&profile.User.Username,
		&profile.User.Email,
		&profile.User.Bio,
		&profile.User.ImgUrl,
		&profile.User.Role,
		&profile.User.LastLoginAt,
		&profile.User.Verified,
		&profile.User.CreatedAt,
		&profile.User.UpdatedAt,
		&profile.FollowingCount,
		&profile.FollowersCount,
		&profile.PostsCount,
		&profile.IsFollowed,
	)
	if err != nil {
		return ProfileData{}, err
	}

	return profile, nil

}
