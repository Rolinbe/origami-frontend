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
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="h-6 w-6" strokeWidth={2} />
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