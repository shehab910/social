"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SlidersHorizontal, X } from "lucide-react";
import { TagInput } from "@/components/tag-input";
import { PaginatedFeedQuery } from "@/types";
import { useCallback, useEffect, useState } from "react";

//TODO: fix: tags are case sensitive

type FeedFiltersProps = {
  feedQuery: PaginatedFeedQuery;
  setFeedQuery: React.Dispatch<React.SetStateAction<PaginatedFeedQuery>>;
  onSubmit: (() => void) | undefined;
};
export default function FeedFilters({
  feedQuery,
  setFeedQuery,
  onSubmit,
}: FeedFiltersProps) {
  const [open, setOpen] = useState(false);
  const [tagAction, setTagAction] = useState<"remove" | "clear" | null>(null);

  useEffect(() => {
    if (tagAction) {
      onSubmit?.();
      setTagAction(null);
    }
  }, [tagAction, onSubmit]);

  const removeTag = useCallback(
    (tag: string) => {
      setFeedQuery((prev) => {
        const newFQ = structuredClone(prev);
        if (!newFQ.tags) return prev;
        newFQ.tags = newFQ.tags.filter((t) => t !== tag);
        return newFQ;
      });
      setTagAction("remove");
    },
    [setFeedQuery]
  );

  const clearAllTags = useCallback(() => {
    setFeedQuery((prev) => {
      const newFQ = structuredClone(prev);
      newFQ.tags = [];
      return newFQ;
    });
    setTagAction("clear");
  }, [setFeedQuery]);

  const onFilterOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onSubmit?.();
    }
    setOpen(isOpen);
  };

  const selectedTags = feedQuery?.tags || [];

  const addTag = useCallback(
    (tag: string) => {
      setFeedQuery((prev) => {
        const newFQ = structuredClone(prev);
        if (!newFQ.tags) newFQ.tags = [];
        newFQ.tags.push(tag);
        return newFQ;
      });
    },
    [setFeedQuery]
  );

  const sort = feedQuery.sort;
  const setSort = (newSort: string) => {
    if (sort !== "asc" && sort !== "desc") return;
    setFeedQuery((prev) => {
      const newFQ = structuredClone(prev);
      newFQ.sort = newSort as "asc" | "desc";
      return newFQ;
    });
  };

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedTags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="flex items-center gap-1"
            >
              #{tag}
              <button
                onClick={() => removeTag(tag)}
                className="ml-1 rounded-full hover:bg-muted p-0.5"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove {tag} filter</span>
              </button>
            </Badge>
          ))}

          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={clearAllTags}
          >
            Clear
          </Button>
        </div>
      )}

      <DropdownMenu open={open} onOpenChange={onFilterOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="ml-auto">
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Sort by</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={sort} onValueChange={setSort}>
            <DropdownMenuRadioItem value="desc">
              Most Recent
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="asc">
              Oldest First
            </DropdownMenuRadioItem>
            {/* TODO: implement trending and most popular */}
            {/* <DropdownMenuRadioItem value="popular">
              Most Popular
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="trending">
              Trending
            </DropdownMenuRadioItem> */}
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Tags</DropdownMenuLabel>
          <div className="p-2 flex flex-wrap gap-1.5">
            <div
              className="sticky top-0 z-10 bg-white p-1"
              onKeyDown={(e) => e.stopPropagation()}
            >
              <TagInput fields={selectedTags} add={addTag} remove={removeTag} />
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
