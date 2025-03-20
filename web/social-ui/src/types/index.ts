export type Envelope<T> = {
  data: T;
};

export type User = {
  id: number;
  username: string;
  email: string;
  role: string;
  verified: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
  //TODO: implement what is below
  avatarUrl?: string;
};

export type Comment = {
  id: number;
  post_id: number;
  user_id: number;
  content: string;
  created_at: string;
  updated_at: string;
  user: User;
};

export type Post = {
  id: number;
  content: string;
  title: string;
  user_id: number;
  tags: string[];
  created_at: string;
  updated_at: string;
  user: User;
  comments_count?: number;
  //TODO: implement what is below
  imageUrl?: string;
  isLiked?: boolean;
  isSaved?: boolean;
  likes?: number;
};

export type PaginatedFeedQuery = {
  limit?: string;
  offset?: string;
  sort?: "asc" | "desc";
  tags?: string[];
  search?: string;
  since?: string;
  until?: string;
};
