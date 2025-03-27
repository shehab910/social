import { Comment } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDistanceToNowStrict } from "date-fns";

interface CommentListProps {
  comments: Comment[];
}

export default function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <div className="text-gray-500 text-sm py-2">
        No comments yet. Be the first to comment!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {comments.map((comment) => (
        <div key={comment.id} className="flex gap-2">
          <Avatar className="w-8 h-8">
            <AvatarImage
              src={comment.user.img_url}
              alt={comment.user.username}
            />
            <AvatarFallback>
              {comment.user.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Card className="gap-0 px-3 py-2 rounded-sm dark:brightness-85">
              <CardHeader className="p-0">
                <CardTitle className="text-sm font-medium">
                  {comment.user.username}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-sm">{comment.content}</p>
              </CardContent>
              <CardFooter></CardFooter>
            </Card>
            <div className="py-1 px-2 text-xs text-gray-500">
              {formatDistanceToNowStrict(new Date(comment.created_at), {})}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
