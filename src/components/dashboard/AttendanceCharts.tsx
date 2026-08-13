import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { addDays, format, startOfWeek } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import apiService from "@/services/api.service";
import { useCountUp } from "@/hooks/useCountUp";

interface WeeklyTrendEntry {
  date: string;
  total: number | string;
  present: number | string;
  late: number | string;
}

interface WeeklyTrendResponse {
  weeklyTrends: WeeklyTrendEntry[];
}

interface OverviewResponse {
  totalEmployees: number;
  presentToday: number;
  lateToday: number;
  absentToday: number;
}

const fetchWeeklyTrends = async (): Promise<WeeklyTrendResponse> => {
  const response = await apiService.get<WeeklyTrendResponse>("/dashboard/weekly-trends");
  return response.data;
};

const fetchOverview = async (): Promise<OverviewResponse> => {
  const response = await apiService.get<OverviewResponse>("/dashboard/overview");
  return response.data;
};

const ChartDonut = ({ percent, size = 148 }: { percent: number; size?: number }) => {
  const [mounted, setMounted] = useState(false);
  const animatedPercent = useCountUp(percent, { duration: 1100 });

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 150);
    return () => clearTimeout(t);
  }, []);

  const stroke = 13;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = mounted ? c * (1 - percent / 100) : c;

  return (
    <div className="relative h-36 w-36">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#donut-grad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)" }}
        />
        <defs>
          <linearGradient id="donut-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--chart-1))" />
            <stop offset="100%" stopColor="hsl(var(--chart-4))" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold tabular-nums text-foreground">{animatedPercent}%</span>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          présents
        </span>
      </div>
    </div>
  );
};

const AttendanceCharts = () => {
  const [mounted, setMounted] = useState(false);

  const {
    data: weeklyResponse,
    isLoading: isLoadingWeekly,
    isError: isErrorWeekly,
    error: errorWeekly,
    refetch: refetchWeekly,
    isFetching: isFetchingWeekly,
  } = useQuery({
    queryKey: ["dashboard-weekly-trends"],
    queryFn: fetchWeeklyTrends,
    refetchInterval: 60_000,
  });

  const {
    data: overview,
    isLoading: isLoadingOverview,
    isError: isErrorOverview,
    error: errorOverview,
    refetch: refetchOverview,
    isFetching: isFetchingOverview,
  } = useQuery({
    queryKey: ["dashboard-overview"],
    queryFn: fetchOverview,
    refetchInterval: 60_000,
    refetchOnMount: "always",
  });

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 140);
    return () => clearTimeout(t);
  }, []);

  const weeklyBars = useMemo(() => {
    const data = weeklyResponse?.weeklyTrends ?? [];
    const start = startOfWeek(new Date(), { weekStartsOn: 1 }); // Lundi

    return Array.from({ length: 5 }).map((_, index) => {
      const currentDate = format(addDays(start, index), "yyyy-MM-dd");
      const label = ["Lun", "Mar", "Mer", "Jeu", "Ven"][index];
      const entry = data.find((item) => item.date === currentDate);

      const total = entry ? Number(entry.total) || 0 : 0;
      const presentCount = entry ? Number(entry.present) || 0 : 0;
      const lateCount = entry ? Number(entry.late) || 0 : 0;
      const attended = presentCount + lateCount;
      const presentPercent = total > 0 ? Math.round((attended / total) * 100) : 0;
      const latePercent = total > 0 ? Math.round((lateCount / total) * 100) : 0;

      return {
        label,
        presentPercent,
        latePercent,
        total,
      };
    });
  }, [weeklyResponse]);

  const distribution = useMemo(() => {
    if (!overview) {
      return { presentPercent: 0, present: 0, absent: 0, late: 0, total: 0 };
    }

    const present = Number.isFinite(overview.presentToday) ? Number(overview.presentToday) : 0;
    const late = Number.isFinite(overview.lateToday) ? Number(overview.lateToday) : 0;
    const absence = Number.isFinite(overview.absentToday) ? Number(overview.absentToday) : 0;
    const total = present + late + absence;

    const presentPercent = total > 0 ? Math.round((present / total) * 100) : 0;

    return {
      presentPercent,
      present,
      late,
      absent: absence,
      total,
    };
  }, [overview]);

  const handleRefresh = () => {
    refetchWeekly();
    refetchOverview();
  };

  const isLoading = isLoadingWeekly || isLoadingOverview;
  const isFetching = isFetchingWeekly || isFetchingOverview;
  const isError = isErrorWeekly || isErrorOverview;
  const errorMessage = (errorWeekly as Error)?.message || (errorOverview as Error)?.message;

  return (
    <Card className="group col-span-2 overflow-hidden rounded-xl transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lift">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>Graphiques de présence</CardTitle>
            <CardDescription>Statistiques hebdomadaires et répartition du jour</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading || isFetching}
            className="shrink-0"
          >
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${isFetching || isLoading ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
        </div>
      </CardHeader>
      <CardContent className="h-64">
        {isError ? (
          <div className="p-4 rounded-lg border border-destructive/40 bg-destructive/10 text-sm text-destructive">
            {errorMessage ?? "Une erreur est survenue lors du chargement des graphiques."}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2.5">
              <h4 className="font-medium text-sm">Présence cette semaine</h4>
              <div className="space-y-1.5">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="bg-muted h-3 w-6 rounded" />
                      <div className="flex-1 mx-2 bg-secondary h-4 rounded-full overflow-hidden animate-pulse" />
                      <span className="bg-muted h-3 w-8 rounded" />
                    </div>
                  ))
                ) : (
                  weeklyBars.map((entry, index) => (
                    <div key={index} className="group/bar flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground w-8">
                        {entry.label}
                      </span>
                      <div className="relative flex-1 mx-2 h-4 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="relative h-full rounded-full bg-gradient-to-r from-primary via-chart-1 to-chart-4 transition-[width] duration-1000 ease-out"
                          style={{
                            width: mounted ? `${entry.presentPercent}%` : "0%",
                            transitionDelay: `${index * 110 + 100}ms`,
                          }}
                        >
                          <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                        </div>
                      </div>
                      <span className="text-xs w-8 text-right tabular-nums text-muted-foreground">
                        {entry.presentPercent}%
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-sm">Répartition aujourd&apos;hui</h4>
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="h-36 w-36 rounded-full bg-muted animate-pulse" />
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <ChartDonut percent={distribution.presentPercent} />
                  <div className="flex justify-center gap-3 text-xs">
                    <div className="flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 font-medium text-success">
                      <span className="h-2 w-2 rounded-full bg-chart-2"></span>
                      Présents ({distribution.present})
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full bg-warning/10 px-2.5 py-1 font-medium text-warning">
                      <span className="h-2 w-2 rounded-full bg-chart-3"></span>
                      Retards ({distribution.late})
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full bg-muted/60 px-2.5 py-1 font-medium text-muted-foreground">
                      <span className="h-2 w-2 rounded-full bg-muted-foreground"></span>
                      Absents ({distribution.absent})
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AttendanceCharts;