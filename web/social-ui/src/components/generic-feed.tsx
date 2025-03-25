import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PostCard from "@/components/post-card";
import FeedSkeleton from "@/components/feed-skeleton";
import FeedFilters from "@/components/feed-filters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCw, Search } from "lucide-react";
import { Envelope, PaginatedFeedQuery, Post } from "@/types";
import { UseQueryResult } from "@tanstack/react-query";

type FeedItem = Post;

type GenericFeedProps = {
  useFeedQuery: (
    query: PaginatedFeedQuery
  ) => UseQueryResult<Envelope<FeedItem[]>>;
  queryStringParser: (queryString: string) => Partial<PaginatedFeedQuery>;
  queryStringBuilder: (query: PaginatedFeedQuery) => string;
  emptyStateMessage?: React.ReactNode;
  renderPost?: (post: Post) => React.ReactNode;
};

export function GenericFeed({
  useFeedQuery,
  queryStringParser,
  queryStringBuilder,
  emptyStateMessage,
  renderPost = (post) => <PostCard key={post.id} post={post} />,
}: GenericFeedProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const queryString = location.search;

  const setQueryString = (newQueryString: string) => {
    const newUrl = `${location.pathname}?${newQueryString}`;
    navigate(newUrl, { replace: true });
  };

  const [feedQuery, setFeedQuery] = useState<PaginatedFeedQuery>({
    limit: "10",
    offset: "0",
    sort: "desc",
  });

  const [feedQueryBuilder, setFeedQueryBuilder] =
    useState<PaginatedFeedQuery>(feedQuery);

  useEffect(() => {
    const parsedQuery = queryStringParser(queryString);
    // Update both states to ensure immediate fetching
    setFeedQueryBuilder((prev) => ({
      ...prev,
      ...parsedQuery,
    }));
    setFeedQuery((prev) => ({
      ...prev,
      ...parsedQuery,
    }));
  }, [queryString, queryStringParser]);

  const { isError, error, refetch, isFetching, isLoading, data } =
    useFeedQuery(feedQuery);

  const items = data?.data;

  const searchQuery = feedQueryBuilder?.search || "";
  const setSearchQuery = (value: string) => {
    setFeedQueryBuilder((prev) => {
      const newFQ = structuredClone(prev);
      newFQ.search = value;
      return newFQ;
    });
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault?.();
    setQueryString(queryStringBuilder(feedQueryBuilder));
    setFeedQuery(feedQueryBuilder);
  };

  const loadMore = () => {
    setFeedQueryBuilder((prev) => ({
      ...prev,
      offset: String(Number(prev.offset || "0") + Number(prev.limit || "10")),
    }));
  };

  if (isError) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 mb-4">
          {error instanceof Error ? error.message : "An error occurred"}
        </p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <form onSubmit={handleSubmit} className="relative w-full md:w-80">
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
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw
              className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
            <span className="sr-only">Refresh</span>
          </Button>
          <FeedFilters
            feedQuery={feedQueryBuilder}
            setFeedQuery={setFeedQueryBuilder}
            onSubmit={handleSubmit}
          />
        </div>
      </div>

      {isLoading ? (
        <FeedSkeleton />
      ) : (
        <>
          {!items || items.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">
                {emptyStateMessage || "No posts found."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => renderPost(item))}

              {isFetching && <FeedSkeleton count={3} />}

              {!isFetching && (
                <div className="text-center pt-4">
                  <Button onClick={loadMore}>Load More</Button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
