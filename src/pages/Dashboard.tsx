import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  LayoutDashboard,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import StatsCard from "@/components/dashboard/StatsCard";
import AttendanceList from "@/components/dashboard/AttendanceList";
import ServicePresence from "@/components/dashboard/ServicePresence";
import AbsentList from "@/components/dashboard/AbsentList";
import LateEmployees from "@/components/dashboard/LateEmployees";
import InternsList from "@/components/dashboard/InternsList";
import PresentEmployees from "@/components/dashboard/PresentEmployees";
import LiveActivityFeed from "@/components/dashboard/LiveActivityFeed";
import AttendanceCharts from "@/components/dashboard/AttendanceCharts";
import { Sidebar } from "@/components/sidebar/Sidebar";
import apiService from "@/services/api.service";

interface DashboardStatsResponse {
  totalEmployees: number;
  permanentEmployees: number;
  activeInterns: number;
  pendingEmployees: number;
  presentToday: number;
  lateToday: number;
  absentToday: number;
  attendanceRate: number;
}

const fetchDashboardStats = async (): Promise<DashboardStatsResponse> => {
  const response = await apiService.get<DashboardStatsResponse>("/dashboard/overview");
  return response.data;
};

const Dashboard = () => {
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["dashboard-overview"],
    queryFn: fetchDashboardStats,
    refetchInterval: 60_000,
    refetchOnMount: "always",
  });

  const stats = useMemo(
    () => ({
      total: data?.totalEmployees ?? 0,
      permanent: data?.permanentEmployees ?? 0,
      interns: data?.activeInterns ?? 0,
      pending: data?.pendingEmployees ?? 0,
      present: data?.presentToday ?? 0,
      late: data?.lateToday ?? 0,
      absent: data?.absentToday ?? Math.max((data?.totalEmployees ?? 0) - (data?.presentToday ?? 0), 0),
      attendanceRate: data?.attendanceRate ?? 0,
    }),
    [data],
  );

  return (
    <div className="min-h-screen bg-app flex">
      <Sidebar />

      <div className="flex-1 ml-64 overflow-auto h-screen">
        <main className="container mx-auto px-4 py-8 animate-fade-in-up">
          <PageHeader
            icon={LayoutDashboard}
            title="Tableau de bord principal"
            description="Vue d'ensemble en temps réel de la présence"
            className="mb-6"
          />

          <div className="space-y-8">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 stagger">
              <StatsCard
                title="Total Employés"
                value={isError ? "—" : stats.total}
                icon={Users}
                delay={60}
                isLoading={isLoading}
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
                delay={140}
                isLoading={isLoading}
                description="À l'heure aujourd'hui"
              />
              <StatsCard
                title="Retardataires"
                value={isError ? "—" : stats.late}
                icon={Clock}
                variant="warning"
                delay={220}
                isLoading={isLoading}
                description="En retard aujourd'hui"
              />
              <StatsCard
                title="Absents"
                value={isError ? "—" : stats.absent}
                icon={UserX}
                variant="destructive"
                delay={300}
                isLoading={isLoading}
                description="Non pointés aujourd'hui"
              />
            </div>

            <div className="stagger">
              <LiveActivityFeed />
            </div>

            <div className="grid gap-6 lg:grid-cols-3 stagger">
              <div className="lg:col-span-2">
                <AttendanceList />
              </div>
              <div className="lg:col-span-1">
                <ServicePresence />
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3 stagger">
              <div className="lg:col-span-2">
                <AttendanceCharts />
              </div>
              <div className="lg:col-span-1">
                <InternsList />
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3 stagger">
              <PresentEmployees />
              <LateEmployees />
              <AbsentList />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;