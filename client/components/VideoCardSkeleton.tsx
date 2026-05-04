import { Skeleton } from "./ui/skeleton";
import { Card } from "./ui/card";

export function VideoCardSkeleton() {
  return (
    <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">
      <div className="relative aspect-video bg-zinc-800">
        <Skeleton className="absolute inset-0" />
      </div>
      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[80%]" />
        </div>
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-7 rounded-full" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-4 w-8" />
        </div>
      </div>
    </Card>
  );
}
