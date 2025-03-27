"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAddComment } from "@/hooks/use-comments";
import { useCurrUser } from "@/hooks/use-curr-user";

interface CommentFormProps {
  postId: number;
}

export function CommentForm({ postId }: CommentFormProps) {
  const [content, setContent] = useState("");
  const addCommentMutation = useAddComment();

  const user = useCurrUser();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    addCommentMutation.mutate(
      { postId, content },
      {
        onSuccess: () => {
          setContent("");
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-start space-x-2">
      <Avatar className="w-8 h-8">
        <AvatarImage src={user?.imgUrl || ""} alt="Your avatar" />
        <AvatarFallback>YA</AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-2">
        <Textarea
          placeholder="Write a comment..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[60px]"
          disabled={addCommentMutation.isPending}
        />
        <div className="flex items-center justify-between">
          <Button
            type="submit"
            size="sm"
            disabled={!content.trim() || addCommentMutation.isPending}
          >
            {addCommentMutation.isPending ? "Posting..." : "Post Comment"}
          </Button>
          {addCommentMutation.isError && (
            <p className="text-sm text-red-500">
              Failed to post comment. Please try again.
            </p>
          )}
        </div>
      </div>
    </form>
  );
}
