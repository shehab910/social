import { GenericFeed } from "@/components/generic-feed";
import { Button } from "@/components/ui/button";
import {
  buildFeedQueryString,
  parseFeedQueryString,
  useUserFeed,
} from "@/hooks/use-posts";
import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <>
      <h1 className="text-3xl font-bold mb-6">Your Feed</h1>
      <GenericFeed
        useFeedQuery={useUserFeed}
        queryStringParser={parseFeedQueryString}
        queryStringBuilder={buildFeedQueryString}
        emptyStateMessage={
          <>
            No posts found. Follow new users from{" "}
            <Link to="/explore">
              <Button variant="link" className="p-0 m-0">
                Explore
              </Button>
            </Link>
          </>
        }
      />
    </>
  );
}
