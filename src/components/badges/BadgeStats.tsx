import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, CheckCircle2, XCircle } from "lucide-react";
import { BadgeStats as BadgeStatsType } from "./types";

interface BadgeStatsProps {
  stats: BadgeStatsType;
}

const statItems = [
  {
    key: "total",
    label: "Total Badges",
    description: "Tous les badges créés",
    color: "text-primary",
    iconBg: "bg-primary/10",
    icon: Building2,
  },
  {
    key: "active",
    label: "Badges Actifs",
    description: "En circulation",
    color: "text-success",
    iconBg: "bg-success/10",
    icon: CheckCircle2,
  },
  {
    key: "revoked",
    label: "Badges Révoqués",
    description: "Désactivés",
    color: "text-destructive",
    iconBg: "bg-destructive/10",
    icon: XCircle,
  },
] as const;

export const BadgeStats: React.FC<BadgeStatsProps> = ({ stats }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statItems.map(({ key, label, description, color, iconBg, icon: Icon }) => (
        <Card
          key={key}
          className="group transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-lift"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110 ${iconBg}`}
            >
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{stats[key]}</div>
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          </CardContent>
        </Card>
      ))}

      <Card className="group transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-lift lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Stagiaires</CardTitle>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 transition-transform duration-300 group-hover:scale-110">
            <Building2 className="h-5 w-5 text-purple-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight">{stats.interns}</div>
          <p className="mt-1 text-xs text-muted-foreground">Badges temporaires</p>
        </CardContent>
      </Card>
    </div>
  );
};