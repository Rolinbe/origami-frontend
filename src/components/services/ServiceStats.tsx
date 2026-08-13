import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, CheckCircle2, XCircle } from "lucide-react";

interface ServiceStatsProps {
  total: number;
  active: number;
  inactive: number;
}

const items = [
  {
    key: "total",
    label: "Total départements",
    icon: Building2,
    iconBg: "bg-primary/10",
    valueColor: "text-primary",
  },
  {
    key: "active",
    label: "Départements actifs",
    icon: CheckCircle2,
    iconBg: "bg-success/10",
    valueColor: "text-success",
  },
  {
    key: "inactive",
    label: "Départements inactifs",
    icon: XCircle,
    iconBg: "bg-muted",
    valueColor: "text-muted-foreground",
  },
] as const;

export const ServiceStats = ({ total, active, inactive }: ServiceStatsProps) => {
  const values = { total, active, inactive };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {items.map(({ key, label, icon: Icon, iconBg, valueColor }) => (
        <Card
          key={key}
          className="group transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-lift"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-6">
            <div>
              <CardDescription>{label}</CardDescription>
              <CardTitle className={`mt-1 text-3xl tracking-tight ${valueColor}`}>
                {values[key]}
              </CardTitle>
            </div>
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${iconBg}`}
            >
              <Icon className={`h-6 w-6 ${valueColor}`} />
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
};