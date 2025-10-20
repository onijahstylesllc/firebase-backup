
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export function TestimonialCarouselSkeleton() {
  return (
    <div className="flex space-x-4 overflow-hidden">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="p-4 w-full md:w-1/2 lg:w-1/3 shrink-0">
          <Card className="h-full flex flex-col text-center">
            <CardContent className="pt-6 flex-1 flex flex-col items-center justify-center">
              <Skeleton className="w-20 h-20 rounded-full mb-4" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-4 w-56" />
                <Skeleton className="h-4 w-60" />
              </div>
              <div className="mt-auto w-full space-y-2">
                 <Skeleton className="h-5 w-32 mx-auto" />
                 <Skeleton className="h-4 w-24 mx-auto" />
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  )
}

    