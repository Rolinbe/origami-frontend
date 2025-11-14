import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, UserCheck, UserX, Clock } from "lucide-react";
import StatsCard from "@/components/dashboard/StatsCard";
import AttendanceList from "@/components/dashboard/AttendanceList";
import ServicePresence from "@/components/dashboard/ServicePresence";
import AbsentList from "@/components/dashboard/AbsentList";
import LateEmployees from "@/components/dashboard/LateEmployees";
import InternsList from "@/components/dashboard/InternsList";
import AttendanceCharts from "@/components/dashboard/AttendanceCharts";
import { Sidebar } from "@/components/sidebar/Sidebar";

const API_BASE_URL = import.meta.env.VITE_API_URL;

interface DashboardStatsResponse {
  totalEmployees: number;
  presentToday: number;
  lateToday: number;
  absentToday: number;
}

const fetchDashboardStats = async (): Promise<DashboardStatsResponse> => {
  const response = await fetch(`${API_BASE_URL}/dashboard/overview`);
  if (!response.ok) {
    throw new Error("Impossible de récupérer les statistiques du tableau de bord");
  }
  return response.json();
};

const Dashboard = () => {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["dashboard-overview-stats"],
    queryFn: fetchDashboardStats,
    refetchInterval: 60_000,
  });

  const stats = useMemo(
    () => ({
      total: data?.totalEmployees ?? 0,
      present: data?.presentToday ?? 0,
      late: data?.lateToday ?? 0,
      absent: data?.absentToday ?? Math.max((data?.totalEmployees ?? 0) - (data?.presentToday ?? 0), 0),
    }),
    [data],
  );

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />

      <div className="flex-1 ml-64 overflow-auto h-screen">
        <main className="container mx-auto px-4 py-8">
          <div className="mb-4 flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Tableau de bord principal</h1>
              <p className="text-muted-foreground">Vue d&apos;ensemble en temps réel de la présence</p>
            </div>
            {/* <button
              onClick={() => refetch()}
              className="text-sm text-primary underline"
              disabled={isLoading}
            >
              Actualiser les statistiques
            </button> */}
          </div>

          <div className="space-y-8">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatsCard
                title="Total Employés"
                value={isError ? "—" : stats.total}
                icon={Users}
                description={
                  isError
                    ? (error as Error)?.message ?? "Erreur de chargement"
                    : "Nombre total d'employés"
                }
              />
              <StatsCard
                title="Présents"
                value={isError ? "—" : stats.present}
                icon={UserCheck}
                variant="success"
                description="À l'heure aujourd'hui"
              />
              <StatsCard
                title="Retardataires"
                value={isError ? "—" : stats.late}
                icon={Clock}
                variant="warning"
                description="En retard aujourd'hui"
              />
              <StatsCard
                title="Absents"
                value={isError ? "—" : stats.absent}
                icon={UserX}
                variant="destructive"
                description="Non pointés aujourd'hui"
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <AttendanceList />
              </div>
              <div className="lg:col-span-1">
                <InternsList />
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <AttendanceCharts />
              </div>
              <div className="lg:col-span-1">
                <AbsentList />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;