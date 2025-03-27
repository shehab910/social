import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { genericErrorToast } from "@/utils/toast";

export const useFollowUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: number) => {
      await apiClient.put(`/users/${userId}/follow`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["isFollowing", "feed"] });
    },
    onError: () => {
      genericErrorToast();
    },
  });
};

export const useUnfollowUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: number) => {
      await apiClient.put(`/users/${userId}/unfollow`);
      return { userId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["isFollowing", "feed"] });
    },
    onError: () => {
      genericErrorToast();
    },
  });
};
