import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCountUp } from "@/hooks/useCountUp";

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  description?: string;
  variant?: "default" | "success" | "warning" | "destructive";
  delay?: number;
  isLoading?: boolean;
}

const styleMap = {
  default: {
    iconBg: "bg-primary/10 group-hover:bg-primary",
    ring: "from-primary/20 via-primary/5 to-transparent",
    valueColor: "text-primary",
  },
  success: {
    iconBg: "bg-success/10 group-hover:bg-success",
    ring: "from-success/20 via-success/5 to-transparent",
    valueColor: "text-success",
  },
  warning: {
    iconBg: "bg-warning/10 group-hover:bg-warning",
    ring: "from-warning/20 via-warning/5 to-transparent",
    valueColor: "text-warning",
  },
  destructive: {
    iconBg: "bg-destructive/10 group-hover:bg-destructive",
    ring: "from-destructive/20 via-destructive/5 to-transparent",
    valueColor: "text-destructive",
  },
};

const StatsCard = ({ title, value, icon: Icon, description, variant = "default", delay = 0, isLoading = false }: StatsCardProps) => {
  const styles = styleMap[variant];
  const isNumeric = typeof value === "number";
  const animatedValue = useCountUp(isNumeric ? (value as number) : 0, { delay, enabled: !isLoading });

  return (
    <Card
      className="group relative overflow-hidden rounded-xl transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-lift-lg"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Halo dégradé en haut de carte */}
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b opacity-60 transition-opacity duration-300 group-hover:opacity-100",
          styles.ring
        )}
      />

      <div className="relative p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white/90 shadow-sm transition-all duration-300 ease-out group-hover:scale-110 group-hover:rotate-[6deg] group-hover:shadow-md",
              styles.iconBg
            )}
          >
            <Icon className="h-5 w-5" strokeWidth={2.1} />
          </div>
        </div>

        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-8 w-16 animate-pulse rounded-md bg-muted" />
                <div className="h-px flex-1 animate-pulse bg-border/60" />
              </div>
            ) : isNumeric ? (
              <span className={cn("text-3xl font-bold tracking-tight tabular-nums", styles.valueColor)}>
                {animatedValue}
              </span>
            ) : (
              <span className="text-3xl font-bold tracking-tight">{value}</span>
            )}
            {isNumeric && (
              <span
                className="h-px flex-1 translate-y-[-4px]"
                style={{
                  background:
                    "repeating-linear-gradient(90deg, hsl(var(--border)), hsl(var(--border)) 4px, transparent 4px, transparent 8px)",
                }}
              />
            )}
          </div>
          {description && (
            <p className="mt-1.5 text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default StatsCard;