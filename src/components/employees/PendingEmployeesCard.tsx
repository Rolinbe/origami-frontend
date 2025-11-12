import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Employee } from "@/data/mockData";

interface PendingEmployeesCardProps {
  employees: Employee[];
  onValidate: (id: string) => void;
}

export const PendingEmployeesCard: React.FC<PendingEmployeesCardProps> = ({ 
  employees, 
  onValidate 
}) => {
  const getInitials = (firstName: string, lastName: string): string => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Employés en attente</CardTitle>
            <CardDescription>{employees.length} en attente de validation</CardDescription>
          </div>
          <Badge variant="warning">{employees.length}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {employees.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Aucun employé en attente
            </p>
          ) : (
            employees.map((employee) => (
              <div key={employee.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={employee.profileImage || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(employee.firstName, employee.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-sm">{employee.firstName} {employee.lastName}</div>
                    <div className="text-xs text-muted-foreground">{employee.position}</div>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => onValidate(employee.id)}
                  className="bg-success hover:bg-success/90"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Valider
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};