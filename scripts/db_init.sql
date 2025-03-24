CREATE DATABASE IF NOT EXISTS social;

CREATE TABLE IF NOT EXISTS social.users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    bio VARCHAR(255),
    image_url VARCHAR(255),
    role VARCHAR(255) NOT NULL DEFAULT 'user',
    last_login_at TIMESTAMP(0) WITH TIME ZONE DEFAULT NULL,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP(0) with time zone NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP(0) with time zone NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS social.posts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    tags VARCHAR(100) [],
    created_at TIMESTAMP(0) with time zone NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP(0) with time zone NOT NULL DEFAULT NOW(),

    FOREIGN KEY (user_id) REFERENCES social.users(id)
);

CREATE TABLE IF NOT EXISTS social.comments (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGSERIAL NOT NULL,
    user_id BIGSERIAL NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP(0) with time zone NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP(0) with time zone NOT NULL DEFAULT NOW(),

    FOREIGN KEY (post_id) REFERENCES social.posts(id),
    FOREIGN KEY (user_id) REFERENCES social.users(id)
);

CREATE TABLE IF NOT EXISTS social.followers(
    user_id BIGINT NOT NULL,
    follower_id BIGINT NOT NULL,
    created_at TIMESTAMP(0) with time zone NOT NULL DEFAULT NOW(),

    PRIMARY KEY (user_id, follower_id),
    FOREIGN KEY (user_id) REFERENCES social.users(id) ON DELETE CASCADE,
    FOREIGN KEY (follower_id) REFERENCES social.users(id) ON DELETE CASCADE
);