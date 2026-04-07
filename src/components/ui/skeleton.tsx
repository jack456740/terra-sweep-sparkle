import { cn } from "@/lib/utils";

/**
 * Skeleton component.
 *  * 
 *  * @param props - The component props.
 * @returns The rendered Skeleton component.
 */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />;
}

export { Skeleton };
