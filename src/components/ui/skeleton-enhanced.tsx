import { cn } from "@/lib/utils";

/**
 * Enhanced Skeleton component with improved styling
 * - Less bright, more subtle appearance
 * - Consistent with content structure
 * - Maintains layout stability
 */
function SkeletonEnhanced({
    className,
    ...props
}: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="skeleton-enhanced"
            className={cn(
                "bg-muted/30 animate-pulse rounded-md",
                "border border-muted/20",
                className,
            )}
            {...props}
        />
    );
}

/**
 * Card skeleton that matches the structure of actual cards
 */
function CardSkeleton({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            className={cn(
                "rounded-lg border bg-card/50 p-6 space-y-4",
                className,
            )}
            {...props}
        >
            <div className="space-y-2">
                <SkeletonEnhanced className="h-5 w-32" />
                <SkeletonEnhanced className="h-8 w-24" />
                <SkeletonEnhanced className="h-3 w-20" />
            </div>
        </div>
    );
}

/**
 * Table skeleton that matches table structure
 */
function TableSkeleton({
    rows = 5,
    columns = 4,
    className,
    ...props
}: React.ComponentProps<"div"> & { rows?: number; columns?: number }) {
    return (
        <div className={cn("rounded-md border", className)} {...props}>
            <div className="p-4 space-y-4">
                {/* Table header */}
                <div className="flex gap-4">
                    {Array.from({ length: columns }).map((_, i) => (
                        <SkeletonEnhanced
                            key={`header-${i}`}
                            className={i === 0 ? "h-8 flex-1" : "h-8 w-24"}
                        />
                    ))}
                </div>
                {/* Table rows */}
                {Array.from({ length: rows }).map((_, rowIndex) => (
                    <div key={`row-${rowIndex}`} className="flex gap-4">
                        {Array.from({ length: columns }).map((_, colIndex) => (
                            <SkeletonEnhanced
                                key={`cell-${rowIndex}-${colIndex}`}
                                className={
                                    colIndex === 0 ? "h-12 flex-1" : "h-12 w-24"
                                }
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

/**
 * Grid skeleton for stats cards
 */
function StatsGridSkeleton({
    items = 4,
    className,
    ...props
}: React.ComponentProps<"div"> & { items?: number }) {
    return (
        <div
            className={cn("grid grid-cols-2 md:grid-cols-4 gap-4", className)}
            {...props}
        >
            {Array.from({ length: items }).map((_, i) => (
                <div key={i} className="space-y-2">
                    <SkeletonEnhanced className="h-4 w-20" />
                    <SkeletonEnhanced className="h-8 w-24" />
                    <SkeletonEnhanced className="h-3 w-32" />
                </div>
            ))}
        </div>
    );
}

/**
 * Form skeleton for form fields
 */
function FormSkeleton({
    fields = 3,
    className,
    ...props
}: React.ComponentProps<"div"> & { fields?: number }) {
    return (
        <div className={cn("space-y-6", className)} {...props}>
            {Array.from({ length: fields }).map((_, i) => (
                <div key={i} className="space-y-2">
                    <SkeletonEnhanced className="h-4 w-24" />
                    <SkeletonEnhanced className="h-10 w-full" />
                </div>
            ))}
        </div>
    );
}

/**
 * List skeleton for peer lists, etc.
 */
function ListSkeleton({
    items = 3,
    className,
    ...props
}: React.ComponentProps<"div"> & { items?: number }) {
    return (
        <div className={cn("space-y-3", className)} {...props}>
            {Array.from({ length: items }).map((_, i) => (
                <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card/50"
                >
                    <SkeletonEnhanced className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <SkeletonEnhanced className="h-4 w-32" />
                        <SkeletonEnhanced className="h-3 w-24" />
                    </div>
                    <SkeletonEnhanced className="h-8 w-16" />
                </div>
            ))}
        </div>
    );
}

export {
    SkeletonEnhanced,
    CardSkeleton,
    TableSkeleton,
    StatsGridSkeleton,
    FormSkeleton,
    ListSkeleton,
};
