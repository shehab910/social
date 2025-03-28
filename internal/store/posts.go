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

// pfq.Sort must be validated / sanitized before calling this function
func (s *PostStore) GetUserFeed(ctx context.Context, userId int64, pfq PaginatedFeedQuery) ([]PostWithMeta, error) {
	query := `
		SELECT p.id, p.content, p.title, p.user_id, p.tags, p.created_at, p.updated_at, COUNT(c.id), u.username, u.email, u.created_at, u.image_url, u.id
		FROM posts p
		LEFT JOIN comments c
		ON c.post_id = p.id
		LEFT JOIN users u
		ON p.user_id = u.id
		JOIN followers f 
		ON f.user_id = p.user_id OR p.user_id = $1
		WHERE f.follower_id = $1
		AND ($2 = '{}' OR EXISTS (
			SELECT 1 
			FROM unnest($2::text[]) AS search_tag 
			WHERE p.tags::text ILIKE '%' || search_tag || '%'
		))
		AND ($3 = '' OR p.content ILIKE '%' || $3 || '%' OR p.title ILIKE '%' || $3 || '%')
		AND ($4 = '' OR p.created_at >= $4::timestamp with time zone)
		AND ($5 = '' OR p.created_at <= $5::timestamp with time zone)
		GROUP BY p.id, u.id
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
			&p.UserID,
			pq.Array(&p.Tags),
			&p.CreatedAt,
			&p.UpdatedAt,
			&p.CommentCount,
			&p.User.Username,
			&p.User.Email,
			&p.User.CreatedAt,
			&p.User.ImgUrl,
			&p.User.ID,
		)
		if err != nil {
			return nil, err
		}
		postsWithMeta = append(postsWithMeta, p)
	}

	return postsWithMeta, nil
}

// pfq.Sort must be validated / sanitized before calling this function
func (s *PostStore) GetExploreFeed(ctx context.Context, pfq PaginatedFeedQuery) ([]PostWithMeta, error) {
	query := `
		SELECT p.id, p.content, p.title, p.user_id, p.tags, p.created_at, p.updated_at, COUNT(c.id), u.username, u.email, u.created_at, u.image_url, u.id
		FROM posts p
		LEFT JOIN comments c
		ON c.post_id = p.id
		LEFT JOIN users u
		ON p.user_id = u.id
		WHERE ($1 = '{}' OR EXISTS (
			SELECT 1 
			FROM unnest($1::text[]) AS search_tag 
			WHERE p.tags::text ILIKE '%' || search_tag || '%'
		))
		AND ($2 = '' OR p.content ILIKE '%' || $2 || '%' OR p.title ILIKE '%' || $2 || '%')
		AND ($3 = '' OR p.created_at >= $3::timestamp with time zone)
		AND ($4 = '' OR p.created_at <= $4::timestamp with time zone)
		GROUP BY p.id, u.id
		ORDER BY p.created_at ` + pfq.Sort + `
		LIMIT $5
		OFFSET $6
	`
	var postsWithMeta []PostWithMeta

	rows, err := s.db.QueryContext(
		ctx,
		query,
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
			&p.UserID,
			pq.Array(&p.Tags),
			&p.CreatedAt,
			&p.UpdatedAt,
			&p.CommentCount,
			&p.User.Username,
			&p.User.Email,
			&p.User.CreatedAt,
			&p.User.ImgUrl,
			&p.User.ID,
		)
		if err != nil {
			return nil, err
		}
		postsWithMeta = append(postsWithMeta, p)
	}

	return postsWithMeta, nil
}

func (s *PostStore) GetUserPostsByUserId(ctx context.Context, userId int64) ([]PostWithMeta, error) {
	query := `
	SELECT p.id, p.content, p.title, p.user_id, p.tags, p.created_at, p.updated_at, COUNT(c.id), u.username, u.email, u.created_at, u.image_url, u.id
	FROM posts p
	LEFT JOIN comments c
	ON c.post_id = p.id
	LEFT JOIN users u
	ON p.user_id = u.id
	WHERE p.user_id = $1
	GROUP BY p.id, u.id
	ORDER BY p.created_at DESC
`
	var postsWithMeta []PostWithMeta

	rows, err := s.db.QueryContext(
		ctx,
		query,
		userId,
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
			&p.UserID,
			pq.Array(&p.Tags),
			&p.CreatedAt,
			&p.UpdatedAt,
			&p.CommentCount,
			&p.User.Username,
			&p.User.Email,
			&p.User.CreatedAt,
			&p.User.ImgUrl,
			&p.User.ID,
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
