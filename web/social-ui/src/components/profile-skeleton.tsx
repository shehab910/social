import { Skeleton } from "./ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import FeedSkeleton from "./feed-skeleton"

export default function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      {/* Profile Header Skeleton */}
      <div className="relative">
        {/* Banner Image Skeleton */}
        <Skeleton className="h-48 md:h-64 w-full rounded-lg" />

        {/* Profile Info Skeleton */}
        <div className="px-4 pb-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between">
            {/* Avatar and Name Skeleton */}
            <div className="flex flex-col items-center md:items-start md:flex-row md:gap-4">
              <div className="relative -mt-16 md:-mt-20">
                <Skeleton className="w-32 h-32 rounded-full" />
              </div>
              <div className="mt-4 md:mt-0 text-center md:text-left w-full max-w-md">
                <Skeleton className="h-8 w-48 mx-auto md:mx-0 mb-2" />
                <Skeleton className="h-4 w-32 mx-auto md:mx-0 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />

                <div className="flex flex-wrap gap-4 mt-3 justify-center md:justify-start">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
            </div>

            {/* Action Buttons Skeleton */}
            <div className="flex gap-2 mt-4 md:mt-0 justify-center md:justify-start">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-10" />
            </div>
          </div>

          {/* Stats Skeleton */}
          <div className="flex justify-center md:justify-start gap-6 mt-6">
            <div className="text-center">
              <Skeleton className="h-6 w-12 mx-auto mb-1" />
              <Skeleton className="h-4 w-10 mx-auto" />
            </div>
            <div className="text-center">
              <Skeleton className="h-6 w-12 mx-auto mb-1" />
              <Skeleton className="h-4 w-16 mx-auto" />
            </div>
            <div className="text-center">
              <Skeleton className="h-6 w-12 mx-auto mb-1" />
              <Skeleton className="h-4 w-16 mx-auto" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs Skeleton */}
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="likes">Likes</TabsTrigger>
        </TabsList>
        <TabsContent value="posts" className="mt-6">
          <FeedSkeleton count={3} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

