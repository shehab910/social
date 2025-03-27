import { useUserPosts } from "@/hooks/use-profile";
import PostCard from "./post-card";
import FeedSkeleton from "./feed-skeleton";
import { Button } from "./ui/button";

interface ProfilePostsProps {
  userId: number;
}

export default function ProfilePosts({ userId }: ProfilePostsProps) {
  const { data: posts, isLoading, isError, error } = useUserPosts(userId);

  if (isLoading) {
    return <FeedSkeleton count={3} />;
  }

  if (isError) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground mb-4">
          {error instanceof Error ? error.message : "Failed to load posts."}
        </p>
        <Button variant="outline">Retry</Button>
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No posts yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
