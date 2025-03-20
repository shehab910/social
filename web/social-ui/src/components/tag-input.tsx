"use client";

import type React from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type TagT = string;

type TagInputProps = {
  fields: TagT[];
  add: (tag: TagT) => void;
  remove: (tag: TagT) => void;
};

export function TagInput(props: TagInputProps) {
  const { fields = [], add, remove } = props;

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const input = e.currentTarget;
      const value = input.value.trim();

      if (value) {
        // append(value as never);
        add(value);
        input.value = "";
      }
    }
  };

  return (
    <div className="space-y-2">
      <Input placeholder="Press Enter to add a tag" onKeyDown={handleAddTag} />
      <div className="flex flex-wrap gap-2">
        {fields.map((field, index) => (
          <Badge
            key={field + index}
            variant="outline"
            className="h-7 gap-1 px-2 text-xs font-medium"
          >
            #{field}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0 hover:bg-transparent hover:cursor-pointer"
              onClick={() => remove(field)}
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Remove tag</span>
            </Button>
          </Badge>
        ))}
      </div>
    </div>
  );
}
