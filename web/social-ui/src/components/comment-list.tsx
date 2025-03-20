import { Comment } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
              src={comment.user.avatarUrl}
              alt={comment.user.username}
            />
            <AvatarFallback>{comment.user.username.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="bg-white p-2 rounded shadow-sm">
              <div className="font-medium text-sm">{comment.user.username}</div>
              <p className="text-sm">{comment.content}</p>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {new Date(comment.created_at).toLocaleString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
