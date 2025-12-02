import { Skeleton } from "@/components/ui/skeleton";

export const CardSkeleton = () => (
  <div className="glass-card rounded-2xl overflow-hidden">
    <Skeleton className="h-56 w-full" />
    <div className="p-6 space-y-3">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </div>
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-10 w-full mt-4" />
    </div>
  </div>
);

export const PodcastCardSkeleton = () => (
  <div className="glass-card rounded-xl overflow-hidden">
    <Skeleton className="aspect-video w-full" />
    <div className="p-4 space-y-2">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </div>
  </div>
);

export const GallerySkeleton = () => (
  <div className="glass-card rounded-xl overflow-hidden">
    <Skeleton className="aspect-square w-full" />
  </div>
);

export const PageLoadingSkeleton = () => (
  <div className="min-h-screen pt-24 bg-background">
    <div className="container mx-auto px-4">
      {/* Hero skeleton */}
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <Skeleton className="h-12 w-48 mx-auto" />
        <Skeleton className="h-8 w-64 mx-auto" />
        <Skeleton className="h-6 w-full max-w-xl mx-auto" />
      </div>
      
      {/* Cards grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  </div>
);

export const LoadingSpinner = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center justify-center ${className}`}>
    <div className="relative">
      <div className="w-10 h-10 border-4 border-muted rounded-full"></div>
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full absolute top-0 left-0 animate-spin"></div>
    </div>
  </div>
);
