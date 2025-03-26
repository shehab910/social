import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import type { Post } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
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
import { CommentForm } from "@/components/comment-form";
import CommentList from "@/components/comment-list";
import { usePostComments } from "@/hooks/use-comments";
import { toast } from "sonner";

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const [isCommenting, setIsCommenting] = useState(false);
  const { data, isLoading: commentsLoading } = usePostComments(
    isCommenting ? post.id : null
  );
  const comments = data?.data;

  return (
    <Card>
      <CardHeader className="flex flex-row items-start space-y-0 gap-3">
        <Avatar className="my-auto">
          <AvatarImage src={post.user.avatarUrl} alt={post.user.username} />
          <AvatarFallback>{post.user.username.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <div>
              <Link
                to={`/profile/${post.user.username}`}
                className="font-semibold hover:underline"
              >
                {post.user.username}
              </Link>
              <p className="text-sm text-muted-foreground">
                @{post.user.username} ·{" "}
                {formatDistanceToNow(new Date(post.created_at), {
                  addSuffix: true,
                })}
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
                <DropdownMenuItem onClick={() => toast.info("Coming soon!")}>
                  <Flag className="mr-2 h-4 w-4" />
                  Report
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.info("Coming soon!")}>
                  <UserMinus className="mr-2 h-4 w-4" />
                  Unfollow @{post.user.username}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => toast.info("Coming soon!")}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share post
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <CardTitle className="text-xl pb-1">{post.title}</CardTitle>
        <p className="whitespace-pre-line">{post.content}</p>

        {post.imageUrl && (
          <div className="mt-3 rounded-md overflow-hidden">
            <img
              src={post.imageUrl || "/placeholder.svg"}
              alt="Post image"
              className="w-full object-cover"
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-start">
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pb-2">
            {post.tags.map((tag, i) => (
              <Badge key={post.id + tag + i} variant="secondary">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
        <div className="flex justify-between w-full">
          <div className="flex gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="flex gap-1.5 items-center"
              onClick={() => {
                toast.info("Coming soon!");
              }}
            >
              <Heart
                className={`h-4 w-4 ${
                  post.isLiked ? "fill-red-500 text-red-500" : ""
                }`}
              />
              <span>{post.likes || 0}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex gap-1.5 items-center"
              onClick={() => setIsCommenting(!isCommenting)}
            >
              <MessageCircle className="h-4 w-4" />
              <span>{post.comments_count}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                toast.info("Coming soon!");
              }}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              toast.info("Coming soon!");
            }}
          >
            <Bookmark
              className={`h-4 w-4 ${post.isSaved ? "fill-current" : ""}`}
            />
          </Button>
        </div>

        {isCommenting && (
          <div className="w-full mt-3 space-y-3">
            <CommentForm postId={post.id} />
            {commentsLoading ? (
              <div className="text-center py-2">Loading comments...</div>
            ) : (
              <CommentList comments={comments || []} />
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
