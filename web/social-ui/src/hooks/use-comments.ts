import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Comment, Envelope } from "@/types";

export const usePostComments = (postId: number | null) => {
  return useQuery({
    queryKey: ["comments", postId],
    queryFn: async () => {
      if (!postId) throw new Error("Post ID is required");
      const { data } = await apiClient.get<Envelope<Comment[]>>(
        `/posts/${postId}/comments`
      );
      return data;
    },
    enabled: !!postId, // Only fetch when postId exists
  });
};

export const useAddComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      postId,
      content,
    }: {
      postId: number;
      content: string;
    }) => {
      const { data } = await apiClient.post<Envelope<Comment>>(
        `/posts/${postId}/comments`,
        { content }
      );
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["comments", variables.postId],
      });
      queryClient.invalidateQueries({
        queryKey: ["post", variables.postId],
      });
      queryClient.invalidateQueries({
        queryKey: ["feed"],
      });
    },
  });
};
