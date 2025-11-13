import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { addDays, format, startOfWeek } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const API_BASE_URL = import.meta.env.VITE_API_URL;

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
  const response = await fetch(`${API_BASE_URL}/dashboard/weekly-trends`);
  if (!response.ok) {
    throw new Error("Impossible de récupérer les tendances hebdomadaires");
  }
  return response.json();
};

const fetchOverview = async (): Promise<OverviewResponse> => {
  const response = await fetch(`${API_BASE_URL}/dashboard/overview`);
  if (!response.ok) {
    throw new Error("Impossible de récupérer la synthèse du jour");
  }
  return response.json();
};

const AttendanceCharts = () => {
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
    queryKey: ["dashboard-overview-stats"],
    queryFn: fetchOverview,
    refetchInterval: 60_000,
  });

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
    <Card className="col-span-2 transition-all duration-300 ease-in-out hover:scale-105 hover:bg-card/90 hover:shadow-xl cursor-pointer">
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
          >
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
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Présence cette semaine</h4>
              <div className="space-y-1">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-xs w-8">
                        <span className="bg-muted h-3 w-6 rounded block" />
                      </span>
                      <div className="flex-1 mx-2 bg-secondary h-3 rounded-full overflow-hidden">
                        <div className="bg-muted h-3 w-1/2" />
                      </div>
                      <span className="text-xs w-8 text-right">—</span>
                    </div>
                  ))
                ) : (
                  weeklyBars.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-xs w-8">{entry.label}</span>
                      <div className="flex-1 mx-2 bg-secondary h-3 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-500 h-3"
                          style={{ width: `${entry.presentPercent}%` }}
                        />
                      </div>
                      <span className="text-xs w-8 text-right">{`${entry.presentPercent}%`}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-sm">Répartition aujourd&apos;hui</h4>
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="relative w-32 h-32 rounded-full bg-muted animate-pulse" />
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                    <div className="absolute inset-2 bg-card rounded-full flex items-center justify-center">
                      <span className="text-lg font-bold">{distribution.presentPercent}%</span>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex justify-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>Présents ({isLoading ? "—" : distribution.present})</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span>Retards ({isLoading ? "—" : distribution.late})</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-muted-foreground rounded"></div>
                  <span>Absents ({isLoading ? "—" : distribution.absent})</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AttendanceCharts;