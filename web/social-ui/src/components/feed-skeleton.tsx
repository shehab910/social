import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

interface FeedSkeletonProps {
  count?: number
}

export default function FeedSkeleton({ count = 5 }: FeedSkeletonProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-start space-y-0 gap-3 pb-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </CardHeader>
          <CardContent className="pb-3 space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
            {index % 2 === 0 && <Skeleton className="h-48 w-full rounded-md" />}
          </CardContent>
          <CardFooter className="border-t pt-3 flex justify-between">
            <div className="flex gap-4">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-8" />
            </div>
            <Skeleton className="h-8 w-8" />
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

