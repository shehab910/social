package store

import (
	"context"
	"database/sql"
	"errors"

	"github.com/lib/pq"
	"github.com/shehab910/social/internal/utils"
)

type Post struct {
	ID        int64     `json:"id"`
	Content   string    `json:"content"`
	Title     string    `json:"title"`
	UserID    int64     `json:"user_id"`
	Tags      []string  `json:"tags"`
	CreatedAt string    `json:"created_at"`
	UpdatedAt string    `json:"updated_at"`
	Comments  []Comment `json:"comments"`
	User      User      `json:"user,omitempty"`
}

type PostWithMeta struct {
	Post
	CommentCount int `json:"comments_count"`
}

type PostStore struct {
	db *sql.DB
}

func (s *PostStore) Create(ctx context.Context, post *Post) error {
	query := `
		INSERT INTO posts (content, title, user_id, tags)
		VALUES ($1, $2, $3, $4)
		RETURNING id, created_at, updated_at
	`
	return s.db.QueryRowContext(
		ctx,
		query,
		post.Content,
		post.Title,
		post.UserID,
		pq.Array(post.Tags),
	).Scan(
		&post.ID,
		&post.CreatedAt,
		&post.UpdatedAt,
	)
}

func (s *PostStore) GetByIdWithUser(ctx context.Context, id int64) (*Post, error) {
	query := `
		SELECT p.id, p.title, p.content, p.user_id, p.created_at, p.updated_at, p.tags, p.user_id, u.username, u.email
		FROM posts p
		JOIN users u
		ON p.user_id = u.id
		WHERE p.id = $1
	`
	var post Post
	err := s.db.QueryRowContext(ctx, query, id).Scan(
		&post.ID,
		&post.Title,
		&post.Content,
		&post.UserID,
		&post.CreatedAt,
		&post.UpdatedAt,
		pq.Array(&post.Tags),
		&post.User.ID,
		&post.User.Username,
		&post.User.Email,
	)

	if err != nil {
		switch {
		case errors.Is(err, sql.ErrNoRows):
			return nil, ErrNotFound
		default:
			return nil, err
		}
	}

	return &post, nil
}

func (s *PostStore) DeleteById(ctx context.Context, postID int64) error {
	query := `DELETE FROM posts WHERE id = $1`
	res, err := s.db.ExecContext(ctx, query, postID)
	if err != nil {
		return err
	}

	rows, err := res.RowsAffected()
	if err != nil {
		return err
	}

	if rows == 0 {
		return ErrNotFound
	}
	return nil
}

func (s *PostStore) Update(ctx context.Context, post *Post) error {
	query := `
		UPDATE posts
		SET title = $1, content = $2
		WHERE id = $3
	`

	_, err := s.db.ExecContext(ctx, query, post.Title, post.Content, post.ID)

	if err != nil {
		return err
	}

	return nil
}

// pfq must be validated / sanitized before calling this function
func (s *PostStore) GetUserFeed(ctx context.Context, userId int64, pfq PaginatedFeedQuery) ([]PostWithMeta, error) {
	query := `
		SELECT p.id, p.content, p.title, p.user_id, p.tags, p.created_at, p.updated_at, COUNT(c.id), u.username
		FROM posts p
		LEFT JOIN comments c
		ON c.post_id = p.id
		LEFT JOIN users u
		ON p.user_id = u.id
		JOIN followers f 
		ON f.user_id = p.user_id OR p.user_id = $1
		WHERE f.follower_id = $1
		AND ($2::VARCHAR(100)[] = '{}' OR p.tags @> $2::VARCHAR(100)[])
		AND ($3 = '' OR p.content ILIKE '%' || $3 || '%' OR p.title ILIKE '%' || $3 || '%')
		AND ($4 = '' OR p.created_at >= $4::timestamp with time zone)
		AND ($5 = '' OR p.created_at <= $5::timestamp with time zone)
		GROUP BY p.id, u.username
		ORDER BY p.created_at ` + pfq.Sort + `
		LIMIT $6
		OFFSET $7
	`
	var postsWithMeta []PostWithMeta

	rows, err := s.db.QueryContext(
		ctx,
		query,
		userId,
		pq.Array(pfq.Tags),
		pfq.Search,
		parseDbTime(pfq.Since),
		parseDbTime(pfq.Until),
		pfq.Limit,
		pfq.Offset,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var p PostWithMeta

		err := rows.Scan(
			&p.ID,
			&p.Content,
			&p.Title,
			&p.User.ID,
			pq.Array(&p.Tags),
			&p.CreatedAt,
			&p.UpdatedAt,
			&p.CommentCount,
			&p.User.Username,
		)
		if err != nil {
			return nil, err
		}
		postsWithMeta = append(postsWithMeta, p)
	}

	return postsWithMeta, nil
}

func parseDbTime(t string) []byte {
	if t == "" {
		return []byte{}
	}
	parsedT, err := utils.ParseTime(t)
	if err != nil {
		return []byte{}
	}
	return pq.FormatTimestamp(parsedT)
}
