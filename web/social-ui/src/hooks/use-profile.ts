import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../lib/api-client";
import type { Envelope, Post, ProfileData } from "../types";

export function useProfileData(id: string) {
  return useQuery({
    queryKey: ["profile", id],
    queryFn: async () => {
      const { data } = await apiClient.get<Envelope<ProfileData>>(
        `/users/${id}/profile`
      );
      return data.data;
    },
    enabled: !!id,
  });
}

type IsFollowedResponse = Envelope<{ is_followed: boolean }>;
export function useIsFollowedByCurr(id: string) {
  return useQuery({
    queryKey: ["isFollowing", id],
    queryFn: async () => {
      const res = await apiClient.get<IsFollowedResponse>(
        `/users/${id}/is_followed`
      );
      return res?.data?.data?.is_followed || false;
    },
    enabled: !!id,
  });
}

export function useUserPosts(userId: number) {
  return useQuery({
    queryKey: ["userPosts", userId],
    queryFn: async () => {
      const res = await apiClient.get<Envelope<Post[] | null>>(
        `/users/${userId}/posts`
      );
      return res?.data?.data || [];
    },
    enabled: !!userId,
  });
}
