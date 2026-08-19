import { cn } from "@/lib/utils";

interface LoadingBarProps {
  isLoading: boolean;
  className?: string;
}

export const LoadingBar = ({ isLoading, className }: LoadingBarProps) => {
  return (
    <div
      className={cn(
        "absolute inset-x-0 top-0 z-10 h-1 overflow-hidden rounded-t-xl transition-opacity duration-200",
        isLoading ? "opacity-100" : "opacity-0 pointer-events-none",
        className
      )}
    >
      <div className="h-full w-full -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
    </div>
  );
};
