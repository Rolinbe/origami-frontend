import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

const mockLateEmployees = [
  { name: "Marie Martin", service: "Design", delay: 15, checkIn: "09:15" },
  { name: "Luc Dubois", service: "Développement", delay: 8, checkIn: "08:38" },
  { name: "Emma Petit", service: "Marketing", delay: 25, checkIn: "09:25" },
  { name: "Antoine Morel", service: "Management", delay: 5, checkIn: "08:35" }
];

const LateEmployees = () => {
  return (
    <Card className="transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-lift">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Retardataires
        </CardTitle>
        <CardDescription>Employés en retard aujourd'hui</CardDescription>
      </CardHeader>
      <CardContent className="h-96 ">
        <div className="space-y-3 h-[50vh] overflow-y-auto">
          {mockLateEmployees.map((employee, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg border bg-card"
            >
              <div className="flex-1">
                <p className="font-medium">{employee.name}</p>
                <p className="text-sm text-muted-foreground">{employee.service}</p>
              </div>
              <div className="text-right">
                <Badge variant="destructive" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  +{employee.delay}min
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  Pointé à {employee.checkIn}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default LateEmployees;