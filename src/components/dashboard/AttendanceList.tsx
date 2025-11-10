import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Données statiques pour la démo (augmentées pour tester la pagination)
const mockAttendances = [
  {
    id: "1",
    check_in_time: "2025-11-07T08:00:00",
    status: "present",
    is_late: false,
    late_minutes: 0,
    employee: {
      first_name: "Jean",
      last_name: "Dupont",
      position: "Développeur"
    }
  },
  {
    id: "2",
    check_in_time: "2025-11-07T09:15:00",
    status: "late",
    is_late: true,
    late_minutes: 15,
    employee: {
      first_name: "Marie",
      last_name: "Martin",
      position: "Designer"
    }
  },
  {
    id: "3",
    check_in_time: "2025-11-07T08:05:00",
    status: "present",
    is_late: false,
    late_minutes: 0,
    employee: {
      first_name: "Paul",
      last_name: "Bernard",
      position: "Manager"
    }
  },
  {
    id: "4",
    check_in_time: "2025-11-07T08:10:00",
    status: "present",
    is_late: false,
    late_minutes: 0,
    employee: {
      first_name: "Sophie",
      last_name: "Laurent",
      position: "Marketing"
    }
  },
  {
    id: "5",
    check_in_time: "2025-11-07T09:30:00",
    status: "late",
    is_late: true,
    late_minutes: 30,
    employee: {
      first_name: "Thomas",
      last_name: "Moreau",
      position: "Développeur"
    }
  },
  {
    id: "6",
    check_in_time: "2025-11-07T08:20:00",
    status: "present",
    is_late: false,
    late_minutes: 0,
    employee: {
      first_name: "Emma",
      last_name: "Petit",
      position: "Designer"
    }
  },
  {
    id: "7",
    check_in_time: "2025-11-07T08:15:00",
    status: "present",
    is_late: false,
    late_minutes: 0,
    employee: {
      first_name: "Lucas",
      last_name: "Robert",
      position: "Manager"
    }
  },
  {
    id: "8",
    check_in_time: "2025-11-07T09:45:00",
    status: "late",
    is_late: true,
    late_minutes: 45,
    employee: {
      first_name: "Camille",
      last_name: "Durand",
      position: "Marketing"
    }
  }
];

const ITEMS_PER_PAGE = 5;

const AttendanceList = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const getStatusBadge = (status: string, isLate: boolean) => {
    if (isLate) {
      return <Badge variant="destructive">En retard</Badge>;
    }
    
    switch (status) {
      case 'present':
        return <Badge className="bg-success text-success-foreground">Présent</Badge>;
      case 'late':
        return <Badge variant="destructive">En retard</Badge>;
      case 'absent':
        return <Badge variant="outline">Absent</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Calcul de la pagination
  const totalPages = Math.ceil(mockAttendances.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentAttendances = mockAttendances.slice(startIndex, endIndex);

  const handlePrevious = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  return (
    <Card className="h-full flex flex-col transition-all duration-300 ease-in-out hover:scale-105 hover:bg-card/90 hover:shadow-xl cursor-pointer">
      <CardHeader>
        <CardTitle>Pointages d'aujourd'hui</CardTitle>
        <CardDescription>
          {mockAttendances.length} pointage(s) enregistré(s) • Page {currentPage}/{totalPages}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <div className="flex-1 overflow-y-auto max-h-80 px-6 pb-4">
          <div className="space-y-3">
            {currentAttendances.map((attendance) => (
              <div
                key={attendance.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card"
              >
                <div className="flex-1">
                  <p className="font-medium"> 
                    {attendance.employee.first_name} {attendance.employee.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {attendance.employee.position}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {new Date(attendance.check_in_time).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    {attendance.is_late && (
                      <p className="text-xs text-destructive">
                        +{attendance.late_minutes} min
                      </p>
                    )}
                  </div>
                  {getStatusBadge(attendance.status, attendance.is_late)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t bg-muted/20 px-6 py-3">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={currentPage === 1}
                className="flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Précédent
              </Button>
              
              <span className="text-sm text-muted-foreground">
                Page {currentPage} sur {totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1"
              >
                Suivant
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AttendanceList;