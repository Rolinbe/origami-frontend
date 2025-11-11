import { Users, UserCheck, UserX, Clock } from "lucide-react";
import StatsCard from "@/components/dashboard/StatsCard";
import QRCodeDisplay from "@/components/dashboard/QRCodeDisplay";
import AttendanceList from "@/components/dashboard/AttendanceList";
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

      {/* Main Content */}
      <div className="flex-1">
        <main className="container mx-auto px-4 py-8">
          <div className="space-y-8">
            {/* Stats Cards */}
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

            {/* Main Content */}
            <div className="grid gap-6 lg:grid-cols-2">
              <QRCodeDisplay />
              <AttendanceList />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;