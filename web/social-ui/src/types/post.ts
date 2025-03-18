export interface User {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
}

export interface Comment {
  id: string;
  author: User;
  content: string;
  createdAt: string;
}
export interface Post {
  id: string;
  author: User;
  content: string;
  imageUrl?: string;
  created_at: string;
  likes: number;
  comments: Comment[];
  tags: string[];
  isLiked: boolean;
  isSaved: boolean;
}
