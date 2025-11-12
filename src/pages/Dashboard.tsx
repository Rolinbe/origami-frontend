import { Users, UserCheck, UserX, Clock } from "lucide-react";
import StatsCard from "@/components/dashboard/StatsCard";
import QRCodeDisplay from "@/components/dashboard/QRCodeDisplay";
import AttendanceList from "@/components/dashboard/AttendanceList";
import ServicePresence from "@/components/dashboard/ServicePresence";
import AbsentList from "@/components/dashboard/AbsentList";
import LateEmployees from "@/components/dashboard/LateEmployees";
import InternsList from "@/components/dashboard/InternsList";
import AttendanceCharts from "@/components/dashboard/AttendanceCharts";
import { Sidebar } from "@/components/sidebar/Sidebar";

const Dashboard = () => {
  const stats = {
    present: 15,
    late: 3,
    absent: 2,
    total: 20
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content - avec marge pour la sidebar fixe */}
      <div className="flex-1 ml-64 overflow-auto h-screen">
        <main className="container mx-auto px-4 py-8">
          {/* En-tête */}
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-foreground mb-2">Tableau de bord principal</h1>
            <p className="text-muted-foreground">Vue d'ensemble en temps réel de la présence</p>
          </div>

          <div className="space-y-8">
            {/* Cartes de statistiques */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatsCard
                title="Total Employés"
                value={stats.total}
                icon={Users}
                description="Nombre total d'employés"
              />
              <StatsCard
                title="Présents"
                value={stats.present}
                icon={UserCheck}
                variant="success"
                description="À l'heure aujourd'hui"
              />
              <StatsCard
                title="Retardataires"
                value={stats.late}
                icon={Clock}
                variant="warning"
                description="En retard aujourd'hui"
              />
              <StatsCard
                title="Absents"
                value={stats.absent}
                icon={UserX}
                variant="destructive"
                description="Non pointés aujourd'hui"
              />
            </div>

            {/* Première ligne : Vue d'ensemble */}

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <AttendanceList />
              </div>

              {/* Stagiaires */}

              <div className="lg:col-span-1">
                <InternsList />
              </div>
            </div>

            {/* Deuxième ligne : Graphiques + Absents du jour  */}
            <div className="grid gap-6 lg:grid-cols-3">

              <div className="lg:col-span-2">
                <AttendanceCharts />
              </div>

              {/* Absents du jour */}
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