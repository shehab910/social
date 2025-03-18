import type React from "react";

import { useState, useEffect } from "react";
import type { Post } from "@/types/post";
import PostCard from "@/components/post-card";
import FeedSkeleton from "@/components/feed-skeleton";
import FeedFilters from "@/components/feed-filters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, RefreshCw } from "lucide-react";
import { useSearchParams } from "react-router";

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  const limit = Number(searchParams.get("limit")) || 10;
  const offset = Number(searchParams.get("offset")) || 0;
  const sort = searchParams.get("sort") || "desc";
  const tags = searchParams.get("tags") || "";
  const search = searchParams.get("search") || "";

  useEffect(() => {
    fetchFeed();
  }, [limit, offset, sort, tags, search]);

  const fetchFeed = async () => {
    setLoading(true);
    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (limit) params.append("limit", limit.toString());
      if (offset) params.append("offset", offset.toString());
      if (sort) params.append("sort", sort);
      if (tags) params.append("tags", tags);
      if (search) params.append("search", search);

      // In a real app, this would be your API endpoint
      const response = await fetch(
        `http://localhost:8090/v1/users/feed?${params.toString()}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch feed");
      }

      const { data } = await response.json();
      // console.log(data);
      setPosts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams(searchParams);
    if (searchQuery) {
      params.set("search", searchQuery);
    } else {
      params.delete("search");
    }
    params.set("offset", "0"); // Reset pagination when searching

    setSearchParams(params);
  };

  const handleLoadMore = () => {
    const params = new URLSearchParams(searchParams);
    params.set("offset", (offset + limit).toString());
    setSearchParams(params);
  };

  const handleRefresh = () => {
    fetchFeed();
  };

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={fetchFeed}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <form onSubmit={handleSearch} className="relative w-full md:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search posts..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span className="sr-only">Refresh</span>
          </Button>
          <FeedFilters />
        </div>
      </div>

      {loading && offset === 0 ? (
        <FeedSkeleton />
      ) : (
        <>
          {posts.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No posts found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}

              {loading && offset > 0 && <FeedSkeleton count={3} />}

              {!loading && posts.length >= limit && (
                <div className="text-center pt-4">
                  <Button onClick={handleLoadMore}>Load More</Button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
