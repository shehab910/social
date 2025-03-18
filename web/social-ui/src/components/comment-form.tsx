"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CommentFormProps {
  postId: string;
  onCommentSubmit: (postId: string, content: string) => void;
}

export function CommentForm({ postId, onCommentSubmit }: CommentFormProps) {
  const [content, setContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onCommentSubmit(postId, content);
      setContent("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-start space-x-2">
      <Avatar className="w-8 h-8">
        <AvatarImage
          src="/placeholder.svg?height=32&width=32"
          alt="Your avatar"
        />
        <AvatarFallback>YA</AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-2">
        <Textarea
          placeholder="Write a comment..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[60px]"
        />
        <Button type="submit" size="sm" disabled={!content.trim()}>
          Post Comment
        </Button>
      </div>
    </form>
  );
}
