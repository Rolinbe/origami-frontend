import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const mockAbsentEmployees = [
  { name: "Sophie Laurent", service: "Marketing", reason: "Congé maladie" },
  { name: "Thomas Moreau", service: "Développement", reason: "Télétravail" },
  { name: "Sophie Laurent", service: "Marketing", reason: "Congé maladie" }
];

const AbsentList = () => {
  return (
    <Card className="transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-lift">
      <CardHeader>
        <CardTitle>Absents du jour</CardTitle>
        <CardDescription>Personnel absent aujourd'hui</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {mockAbsentEmployees.map((employee, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg border bg-card"
            >
              <div className="flex-1">
                <p className="font-medium">{employee.name}</p>
                <p className="text-sm text-muted-foreground">{employee.service}</p>
              </div>
              <Badge variant="outline">{employee.reason}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AbsentList;