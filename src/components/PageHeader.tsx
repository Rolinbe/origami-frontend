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
        "flex flex-wrap items-start justify-between gap-4 animate-fade-in-up",
        className
      )}
    >
      <div className="flex items-center gap-3.5">
        {Icon && (
          <div className="group relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-chart-4 to-chart-5 text-white shadow-lg shadow-primary/25 transition-transform duration-300 hover:-rotate-6 hover:scale-105">
            <div className="absolute inset-0 animate-gradient-x bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:200%_100%]" />
            <Icon className="relative h-7 w-7" strokeWidth={2.1} />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
};