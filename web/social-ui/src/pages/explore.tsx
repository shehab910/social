import { GenericFeed } from "@/components/generic-feed";
import {
  buildFeedQueryString,
  parseFeedQueryString,
  useExploreFeed,
} from "@/hooks/use-posts";

export default function ExplorePage() {
  return (
    <>
      <h1 className="text-3xl font-bold mb-6">Explore</h1>
      <GenericFeed
        useFeedQuery={useExploreFeed}
        queryStringParser={parseFeedQueryString}
        queryStringBuilder={buildFeedQueryString}
        emptyStateMessage="No posts found. Be the first to post something!"
      />
    </>
  );
}
