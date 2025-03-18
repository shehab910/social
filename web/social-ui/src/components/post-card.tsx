import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router";
// import Image from "next/image";
import type { Comment, Post } from "@/types/post";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Flag,
  UserMinus,
} from "lucide-react";
import { useState } from "react";
import { CommentForm } from "./comment-form";

interface PostCardProps {
  post: Post;
}
const mockComments: Comment[] = [
  {
    id: "comment1",
    author: {
      id: "user2",
      name: "Alex Johnson",
      username: "alexj",
      avatarUrl: "/placeholder.svg?height=32&width=32",
    },
    content: "Great post! Thanks for sharing.",
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
  },
  {
    id: "comment2",
    author: {
      id: "user3",
      name: "Sam Wilson",
      username: "samw",
      avatarUrl: "/placeholder.svg?height=32&width=32",
    },
    content: "I couldn't agree more. This is really insightful!",
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
  },
];
export default function PostCard({ post }: PostCardProps) {
  const [isCommenting, setIsCommenting] = useState(false);
  const [localComments, setLocalComments] = useState<Comment[]>(mockComments);

  const handleCommentSubmit = (postId: string, content: string) => {
    // In a real app, this would be an API call
    const newComment: Comment = {
      id: Date.now().toString(),
      author: {
        id: "current-user",
        name: "Current User",
        username: "currentuser",
        avatarUrl: "/placeholder.svg?height=32&width=32",
      },
      content,
      createdAt: new Date().toISOString(),
    };
    setLocalComments([...localComments, newComment]);
  };
  const {
    id,
    // author,
    content,
    imageUrl,
    created_at,
    likes,
    comments,
    tags,
    isLiked,
    isSaved,
  } = post;
  console.log({ post });

  const author = {
    name: "John Doe",
    username: "johndoe",
    avatarUrl: "",
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start space-y-0 gap-3 pb-3">
        <Avatar>
          <AvatarImage src={author.avatarUrl} alt={author.name} />
          <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <div>
              <Link
                to={`/profile/${author.username}`}
                className="font-semibold hover:underline"
              >
                {" "}
                {/* Use 'to' instead of 'href' */}
                {author.name}
              </Link>
              <p className="text-sm text-muted-foreground">
                @{author.username} ·{" "}
                {formatDistanceToNow(new Date(created_at), { addSuffix: true })}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">More options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Flag className="mr-2 h-4 w-4" />
                  Report
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <UserMinus className="mr-2 h-4 w-4" />
                  Unfollow @{author.username}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share post
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <p className="whitespace-pre-line">{content}</p>

        {imageUrl && (
          <div className="mt-3 rounded-md overflow-hidden">
            <img
              src={imageUrl || "/placeholder.svg"}
              alt="Post image"
              width={600}
              height={400}
              className="w-full object-cover"
            />
          </div>
        )}

        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-start">
        <div className="flex justify-between w-full pb-3 border-b">
          <div className="flex gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="flex gap-1.5 items-center"
            >
              <Heart
                className={`h-4 w-4 ${
                  isLiked ? "fill-red-500 text-red-500" : ""
                }`}
              />
              <span>{likes}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex gap-1.5 items-center"
              onClick={() => setIsCommenting(!isCommenting)}
            >
              <MessageCircle className="h-4 w-4" />
              <span>{localComments.length}</span>
            </Button>
            <Button variant="ghost" size="sm">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="ghost" size="sm">
            <Bookmark className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
          </Button>
        </div>
        {isCommenting && (
          <div className="w-full mt-3 space-y-3">
            <CommentForm
              postId={post.id}
              onCommentSubmit={handleCommentSubmit}
            />
            {localComments.map((comment) => (
              <div key={comment.id} className="flex items-start space-x-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage
                    src={comment.author.avatarUrl}
                    alt={comment.author.name}
                  />
                  <AvatarFallback>
                    {comment.author.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="bg-muted p-2 rounded-md">
                    <div className="flex items-center justify-between">
                      <Link
                        to={`/profile/${comment.author.username}`}
                        className="font-semibold text-sm hover:underline"
                      >
                        {comment.author.name}
                      </Link>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <p className="text-sm mt-1">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
