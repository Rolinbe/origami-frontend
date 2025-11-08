import { Users, UserCheck, UserX, Clock, LogOut, LayoutDashboard, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatsCard from "@/components/dashboard/StatsCard";
import QRCodeDisplay from "@/components/dashboard/QRCodeDisplay";
import AttendanceList from "@/components/dashboard/AttendanceList";
import { NavLink } from "@/components/NavLink";

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
      <aside className="w-64 bg-card border-r min-h-screen p-4">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="mb-8">
            <h1 className="text-xl font-bold text-foreground">Système de Pointage</h1>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-2 flex-1">
            <NavLink
              to="/dashboard"
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
              activeClassName="bg-accent text-accent-foreground"
            >
              <LayoutDashboard size={20} />
              <span>Tableau de bord</span>
            </NavLink>
            
            <NavLink
              to="/settings"
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
              activeClassName="bg-accent text-accent-foreground"
            >
              <Settings size={20} />
              <span>Paramètres</span>
            </NavLink>
          </nav>

          {/* Logout Button */}
          <Button variant="outline" className="w-full" size="sm">
            <LogOut className="mr-2 h-4 w-4" />
            Déconnexion
          </Button>
        </div>
      </aside>

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