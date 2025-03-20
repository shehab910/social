import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export const useFollowUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      followUserId,
    }: {
      userId: number;
      followUserId: number;
    }) => {
      await apiClient.put(`/users/${userId}/follow`, { user_id: followUserId });
      return { userId, followUserId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });
};

export const useUnfollowUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      unfollowUserId,
    }: {
      userId: number;
      unfollowUserId: number;
    }) => {
      await apiClient.put(`/users/${userId}/unfollow`, {
        user_id: unfollowUserId,
      });
      return { userId, unfollowUserId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });
};
