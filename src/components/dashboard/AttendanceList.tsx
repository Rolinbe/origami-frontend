import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Données statiques pour la démo
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
  }
];

const AttendanceList = () => {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pointages d'aujourd'hui</CardTitle>
        <CardDescription>
          {mockAttendances.length} pointage(s) enregistré(s)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockAttendances.map((attendance) => (
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
      </CardContent>
    </Card>
  );
};

export default AttendanceList;