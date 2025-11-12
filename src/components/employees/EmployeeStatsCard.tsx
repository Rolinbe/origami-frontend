import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

type Variant = "default" | "success" | "warning" | "destructive";

interface EmployeeStatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  variant?: Variant;
  description?: string;
}

export const EmployeeStatsCard: React.FC<EmployeeStatsCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  variant = "default", 
  description 
}) => {
  const variants: Record<Variant, string> = {
    default: "bg-card border-border",
    success: "bg-success/10 border-success/20",
    warning: "bg-warning/10 border-warning/20",
    destructive: "bg-destructive/10 border-destructive/20"
  };

  const iconVariants: Record<Variant, string> = {
    default: "text-primary",
    success: "text-success",
    warning: "text-warning",
    destructive: "text-destructive"
  };

  return (
    <Card className={`${variants[variant]} border`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${iconVariants[variant]}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};