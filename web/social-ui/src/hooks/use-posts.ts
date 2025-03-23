import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Post, PaginatedFeedQuery, Envelope } from "@/types";

export const buildFeedQueryString = (query: PaginatedFeedQuery): string => {
  const params = new URLSearchParams();

  if (query.limit) params.append("limit", query.limit.toString());
  if (query.offset) params.append("offset", query.offset.toString());
  if (query.sort) params.append("sort", query.sort);

  if (query?.tags?.length) {
    params.append("tags", query.tags.join(","));
  }
  if (query?.search) params.append("search", query.search);
  if (query?.since) params.append("since", query.since);
  if (query?.until) params.append("until", query.until);

  return params.toString();
};

export const parseFeedQueryString = (
  queryString: string
): PaginatedFeedQuery => {
  const params = new URLSearchParams(queryString);
  const query: PaginatedFeedQuery = {};

  const limit = params.get("limit");
  if (limit) query.limit = limit;

  const offset = params.get("offset");
  if (offset) query.offset = offset;

  const sort = params.get("sort");
  if (sort && (sort === "asc" || sort === "desc")) query.sort = sort;

  const tags = params.get("tags");
  const search = params.get("search");
  const since = params.get("since");
  const until = params.get("until");

  if (tags) query.tags = tags.split(",");
  if (search) query.search = search;
  if (since) query.since = since;
  if (until) query.until = until;

  return query;
};

export const useUserFeed = (query: PaginatedFeedQuery) => {
  return useQuery({
    queryKey: ["feed", query],
    queryFn: async () => {
      const queryString = buildFeedQueryString(query);

      const { data } = await apiClient.get<Envelope<Post[]>>(
        `/users/feed?${queryString}`
      );
      return data;
    },
  });
};

export const usePost = (postId: number | null) => {
  return useQuery({
    queryKey: ["post", postId],
    queryFn: async () => {
      if (!postId) throw new Error("Post ID is required");
      const { data } = await apiClient.get<Envelope<Post>>(`/posts/${postId}`);
      return data;
    },
    enabled: !!postId, // Only run if postId exists
  });
};
