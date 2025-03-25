import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import PostCard from "@/components/post-card";
import FeedSkeleton from "@/components/feed-skeleton";
import FeedFilters from "@/components/feed-filters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCw, Search } from "lucide-react";
import {
  buildFeedQueryString,
  parseFeedQueryString,
  useUserFeed,
} from "@/hooks/use-posts";
import { PaginatedFeedQuery } from "@/types";

export default function Feed() {
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
    const parsedQuery = parseFeedQueryString(queryString);
    // using both (feedQuery & feedQueryBuilder) because i want to instantly fetch
    setFeedQueryBuilder((prev) => ({
      ...prev,
      ...parsedQuery,
    }));
    setFeedQuery((prev) => ({
      ...prev,
      ...parsedQuery,
    }));
  }, []);

  const { isError, error, refetch, isFetching, isLoading, data } =
    useUserFeed(feedQuery);
  const posts = data?.data;

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
    console.log("handle submit is running", feedQueryBuilder);
    setQueryString(buildFeedQueryString(feedQueryBuilder));
    setFeedQuery(feedQueryBuilder);
  };

  const loadMore = () => {
    // TODO: fix load more
    setFeedQueryBuilder((prev) => ({
      ...prev,
      offset: (prev.offset || "0") + (prev.limit || "10"),
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
          {!posts || posts.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">
                No posts found. Follow new users from{" "}
                <Link to="/explore">
                  <Button variant="link" className="p-0 m-0">
                    Explore
                  </Button>
                </Link>
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}

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
