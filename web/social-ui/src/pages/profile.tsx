"use client";

import { useNavigate, useParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, LinkIcon, MapPin, UserPlus, UserCheck } from "lucide-react";
import ProfilePosts from "@/components/profile-posts";
import ProfileSkeleton from "@/components/profile-skeleton";
import { useCurrUser } from "@/hooks/use-curr-user";
import { useFollowUser, useUnfollowUser } from "@/hooks/use-followers";
import { useIsFollowedByCurr, useProfileData } from "@/hooks/use-profile";
import { authErrorToast } from "@/utils/toast";
import { ProfileData, User } from "@/types";

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: profile, isLoading, isError, error } = useProfileData(id || "");

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (isError || !profile) {
    return (
      <div className="text-center py-10">
        <h1 className="text-3xl font-bold mb-6">Profile not found</h1>
        <p className="text-muted-foreground mb-4">
          {error instanceof Error
            ? error.message
            : "The requested profile could not be found."}
        </p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        <div className="h-48 md:h-64 w-full bg-muted rounded-lg overflow-hidden">
          {profile.user.banner_url ? (
            <img
              src={profile.user.banner_url || "/placeholder.svg"}
              alt={`${profile.user.username}'s banner`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-500" />
          )}
        </div>

        <ProfileInfo profile={profile} />
      </div>

      <ProfileContent user={profile.user} />
    </div>
  );
}

type ProfileInfoProps = {
  profile: ProfileData;
};
function ProfileInfo({ profile }: ProfileInfoProps) {
  const isfollowedByCurr =
    profile?.is_followed ||
    useIsFollowedByCurr(String(profile.user.id) || "").data ||
    false;

  const currentUser = useCurrUser();

  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();

  const handleFollowToggle = () => {
    if (!currentUser) {
      authErrorToast();
      return;
    }

    if (isfollowedByCurr) {
      unfollowUser.mutate(profile.user.id);
    } else {
      followUser.mutate(profile.user.id);
    }
  };

  const isOwnProfile = currentUser?.userId === profile.user.id;

  // TODO: Remove demo defaults
  const location = profile?.user?.location || "New York, NY";
  const website = profile?.user?.website || "https://example.com";
  const bio =
    profile?.user?.bio ||
    "👨‍💻 Code junkie | 🚀 Building the future, one line at a time💡 Innovating | 🌍 Exploring tech";

  return (
    <div className="px-4 p-2">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        {/* Avatar and Name */}
        <div className="flex flex-col items-center md:items-start  md:flex-row md:gap-4">
          <div className="relative -mt-16 md:-mt-20">
            <Avatar className="w-32 h-32 border-4 border-background">
              <AvatarImage
                src={profile.user.img_url}
                alt={profile.user.username}
              />
              <AvatarFallback className="text-4xl">
                {profile.user.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {/* {profile.user.verified && (
              <VerifiedBadge />
            )} */}
          </div>
          <div className="space-y-3 text-center md:text-left">
            <div>
              <h1 className="text-2xl font-bold capitalize">
                {profile.user.username}
              </h1>
              <p className="text-muted-foreground">{profile.user.email}</p>
            </div>
            <p className="max-w-md">{bio}</p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              {location && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="mr-1 h-4 w-4" />
                  {location}
                </div>
              )}
              {website && (
                <div className="flex items-center text-sm">
                  <LinkIcon className="mr-1 h-4 w-4 text-muted-foreground" />
                  <a
                    href={website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {website.replace(/^https?:\/\//, "")}
                  </a>
                </div>
              )}
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="mr-1 h-4 w-4" />
                Joined{" "}
                {new Date(profile.user.created_at).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </div>
            </div>
            {/* stats */}
            <p className="flex flex-wrap gap-4 justify-center md:justify-start text-sm text-muted-foreground">
              {[
                [profile.posts_count, "Posts"],
                [profile.followers_count, "Followers"],
                [profile.following_count, "Following"],
              ].map((stat, i) => {
                return (
                  <span
                    key={`${stat[0]}-${i}`}
                    className="flex items-center gap-1"
                  >
                    <span className="text-foreground font-bold">{stat[0]}</span>
                    {stat[1]}
                  </span>
                );
              })}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-3 flex gap-2 justify-center  md:justify-start">
          {!isOwnProfile && (
            <>
              <Button
                variant={isfollowedByCurr ? "outline" : "default"}
                onClick={handleFollowToggle}
                className="gap-2"
                disabled={followUser.isPending || unfollowUser.isPending}
              >
                {isfollowedByCurr ? (
                  <>
                    <UserCheck className="h-4 w-4" />
                    Following
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    Follow
                  </>
                )}
              </Button>
              {/* <Button variant="outline" className="gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Message
                  </Button> */}
            </>
          )}
          {/* <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button> */}
        </div>
      </div>
    </div>
  );
}

function ProfileContent({ user }: { user: User }) {
  return (
    <Tabs defaultValue="posts" className="w-full">
      <TabsList className="w-full grid grid-cols-3">
        <TabsTrigger value="posts">Posts</TabsTrigger>
        <TabsTrigger disabled value="media">
          Media
        </TabsTrigger>
        <TabsTrigger disabled value="likes">
          Likes
        </TabsTrigger>
      </TabsList>
      <TabsContent value="posts" className="mt-6">
        <ProfilePosts userId={user.id} />
      </TabsContent>
      <TabsContent value="media" className="mt-6">
        {/* <ProfileMedia username={username || ""} userId={user.id} /> */}
      </TabsContent>
      <TabsContent value="likes" className="mt-6">
        {/* <ProfileLikes username={username || ""} userId={user.id} /> */}
      </TabsContent>
    </Tabs>
  );
}

export function InstaStyleStats({
  posts_count,
  followers_count,
  following_count,
}: {
  posts_count: number;
  followers_count: number;
  following_count: number;
}) {
  return (
    <div className="flex justify-center items-center md:justify-start gap-6 mt-6">
      <div className="text-center">
        <p className="font-bold">{posts_count}</p>
        <p className="text-sm text-muted-foreground">Posts</p>
      </div>
      <div className="text-center">
        <p className="font-bold">{followers_count}</p>
        <p className="text-sm text-muted-foreground">Followers</p>
      </div>
      <div className="text-center">
        <p className="font-bold">{following_count}</p>
        <p className="text-sm text-muted-foreground">Following</p>
      </div>
    </div>
  );
}
