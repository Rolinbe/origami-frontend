import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader = ({
  title,
  description,
  icon: Icon,
  actions,
  className,
}: PageHeaderProps) => {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between animate-fade-in-up",
        className
      )}
    >
      <div className="flex items-center gap-3 sm:gap-3.5">
        {Icon && (
          <div className="group relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-primary via-chart-4 to-chart-5 text-white shadow-lg shadow-primary/25 transition-transform duration-300 hover:-rotate-6 hover:scale-105 sm:h-14 sm:w-14 sm:rounded-2xl">
            <div className="absolute inset-0 animate-gradient-x bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:200%_100%]" />
            <Icon className="relative h-6 w-6 sm:h-7 sm:w-7" strokeWidth={2.1} />
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl lg:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">{actions}</div>
      )}
    </div>
  );
};