import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "default" | "success" | "warning" | "destructive";

interface EmployeeStatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  variant?: Variant;
  description?: string;
}

const styles: Record<Variant, { iconBg: string; iconColor: string }> = {
  default: { iconBg: "bg-primary/10", iconColor: "text-primary" },
  success: { iconBg: "bg-success/10", iconColor: "text-success" },
  warning: { iconBg: "bg-warning/10", iconColor: "text-warning" },
  destructive: { iconBg: "bg-destructive/10", iconColor: "text-destructive" },
};

export const EmployeeStatsCard: React.FC<EmployeeStatsCardProps> = ({
  title,
  value,
  icon: Icon,
  variant = "default",
  description,
}) => {
  const { iconBg, iconColor } = styles[variant];

  return (
    <Card className="group transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-lift">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110",
            iconBg
          )}
        >
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        {description && (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};