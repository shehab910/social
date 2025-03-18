"use client";

import { useState, useEffect } from "react";
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
import { useSearchParams } from "react-router";

export default function FeedFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialSort = searchParams.get("sort") || "desc";
  const initialTags = searchParams.get("tags")
    ? searchParams.get("tags")!.split(",")
    : [];

  const [sort, setSort] = useState(initialSort);
  const [selectedTags, setSelectedTags] = useState(initialTags);

  const popularTags = [
    "technology",
    "travel",
    "food",
    "health",
    "art",
    "music",
    "sports",
  ];

  useEffect(() => {
    const params = new URLSearchParams(searchParams);

    // Update sort parameter
    if (sort) {
      params.set("sort", sort);
    } else {
      params.delete("sort");
    }

    // Update tags parameter
    if (selectedTags.length > 0) {
      params.set("tags", selectedTags.join(","));
    } else {
      params.delete("tags");
    }

    // Reset offset when filters change
    params.set("offset", "0");

    setSearchParams(params);
  }, [sort, selectedTags, setSearchParams]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearAllTags = () => {
    setSelectedTags([]);
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
                onClick={() => handleTagToggle(tag)}
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

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="ml-auto">
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Sort by</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={sort} onValueChange={setSort}>
            <DropdownMenuRadioItem value="recent">
              Most Recent
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="popular">
              Most Popular
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="trending">
              Trending
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>

          <DropdownMenuSeparator />

          <DropdownMenuLabel>Popular Tags</DropdownMenuLabel>
          <div className="p-2 flex flex-wrap gap-1.5">
            {popularTags.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => handleTagToggle(tag)}
              >
                #{tag}
              </Badge>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
