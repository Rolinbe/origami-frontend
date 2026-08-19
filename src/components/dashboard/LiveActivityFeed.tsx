import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, CreditCard, LogIn, LogOut, RefreshCw, UserPlus } from "lucide-react";
import { toast } from "sonner";
import apiService from "@/services/api.service";
import { LoadingBar } from "@/components/LoadingBar";

interface ScanLog {
  id: string;
  scanTime: string;
  scanType: "check_in" | "check_out";
  user?: {
    firstName?: string;
    lastName?: string;
    service?: { name?: string } | null;
  } | null;
}

interface BadgeRecord {
  id: string;
  badgeId?: string;
  createdAt: string;
  user?: { firstName?: string; lastName?: string } | null;
}

interface EmployeeRecord {
  id: string;
  createdAt: string;
  firstName?: string;
  lastName?: string;
  employeeType?: string;
  service?: { name?: string } | null;
}

type ActivityType = "scan_in" | "scan_out" | "badge" | "employee";

interface ActivityEvent {
  id: string;
  type: ActivityType;
  text: string;
  detail: string;
  timestamp: string;
}

const fullName = (firstName?: string, lastName?: string) =>
  `${firstName ?? ""} ${lastName ?? ""}`.trim() || "Inconnu";

const fetchActivity = async (): Promise<ActivityEvent[]> => {
  const [scanResult, badgeResult, employeeResult] = await Promise.allSettled([
    apiService.get<{ scanLogs?: ScanLog[] }>("/scan/history?limit=100"),
    apiService.get<{ badges?: BadgeRecord[] }>("/badges"),
    apiService.get<{ employees?: EmployeeRecord[] }>("/employees?limit=100"),
  ]);

  const events: ActivityEvent[] = [];

  if (scanResult.status === "fulfilled") {
    for (const log of scanResult.value.data.scanLogs ?? []) {
      const name = fullName(log.user?.firstName, log.user?.lastName);
      const service =
        log.user?.service?.name && log.user.service.name.trim()
          ? ` · ${log.user.service.name}`
          : "";
      events.push({
        id: `scan-${log.id}`,
        type: log.scanType === "check_in" ? "scan_in" : "scan_out",
        text: log.scanType === "check_in" ? `Entrée pointée` : `Sortie pointée`,
        detail: `${name}${service}`,
        timestamp: log.scanTime,
      });
    }
  }

  if (badgeResult.status === "fulfilled") {
    for (const badge of badgeResult.value.data.badges ?? []) {
      const name = fullName(badge.user?.firstName, badge.user?.lastName);
      events.push({
        id: `badge-${badge.id}`,
        type: "badge",
        text: badge.badgeId
          ? `Badge ${badge.badgeId} créé`
          : "Badge créé",
        detail: name,
        timestamp: badge.createdAt,
      });
    }
  }

  if (employeeResult.status === "fulfilled") {
    for (const employee of employeeResult.value.data.employees ?? []) {
      events.push({
        id: `employee-${employee.id}`,
        type: "employee",
        text: "Employé ajouté",
        detail: `${fullName(employee.firstName, employee.lastName)}${
          employee.employeeType === "intern" ? " · Stagiaire" : ""
        }`,
        timestamp: employee.createdAt,
      });
    }
  }

  return events
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 30);
};

const timeAgo = (iso: string) => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days} j`;
};

const typeStyle: Record<ActivityType, { icon: typeof LogIn; label: string; class: string }> = {
  scan_in: { icon: LogIn, label: "Entrée", class: "bg-success/10 text-success hover:bg-success/10" },
  scan_out: { icon: LogOut, label: "Sortie", class: "bg-primary/10 text-primary hover:bg-primary/10" },
  badge: { icon: CreditCard, label: "Badge", class: "bg-primary/10 text-primary hover:bg-primary/10" },
  employee: { icon: UserPlus, label: "Employé", class: "bg-warning/10 text-warning hover:bg-warning/10" },
};

const LiveActivityFeed = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const {
    data: events = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["dashboard-live-activity"],
    queryFn: fetchActivity,
    refetchInterval: 15_000,
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
    toast.success("Données actualisées");
  };

  return (
    <Card className="relative transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-lift">
      <LoadingBar isLoading={isRefreshing || isLoading} />
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Activité en temps réel
            </CardTitle>
            <CardDescription>
              {isLoading
                ? "Chargement…"
                : isError
                  ? "Erreur de chargement"
                  : `${events.length} événement(s) récent(s)`}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
              </span>
              En direct
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading || isRefreshing}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Actualiser
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-96 space-y-3 overflow-y-auto pr-1">
          {isError ? (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
              {(error as Error)?.message ?? "Une erreur est survenue lors du chargement."}
              <div className="mt-3">
                <Button size="sm" variant="outline" onClick={() => refetch()}>
                  Réessayer
                </Button>
              </div>
            </div>
          ) : isLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div
                key={`activity-skeleton-${index}`}
                className="flex items-center justify-between p-3 rounded-lg border bg-card animate-pulse"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="h-8 w-8 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-2/3" />
                    <div className="h-3 bg-muted rounded w-1/3" />
                  </div>
                </div>
                <div className="h-4 bg-muted rounded w-16" />
              </div>
            ))
          ) : events.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Aucune activité pour le moment. Les scans, badges et employés apparaîtront ici en
              direct.
            </div>
          ) : (
            events.map((event) => {
              const style = typeStyle[event.type];
              const Icon = style.icon;
              return (
                <div
                  key={event.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{event.text}</p>
                        <Badge className={style.class}>{style.label}</Badge>
                      </div>
                      <p className="truncate text-sm text-muted-foreground">{event.detail}</p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-medium">{timeAgo(event.timestamp)}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(event.timestamp), "HH:mm")}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveActivityFeed;