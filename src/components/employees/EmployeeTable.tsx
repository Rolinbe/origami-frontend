import {
  MoreVertical,
  Eye,
  CheckCircle,
  XCircle,
  Trash2,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Employee, Service } from "@/types/employee.types";

interface EmployeeTableProps {
  employees: Employee[];
  services: Service[];
  onViewDetails: (employee: Employee) => void;
  onValidate: (id: string) => void;
  onDeactivate: (id: string) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
  onEdit?: (employee: Employee) => void;
}

export const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  services,
  onViewDetails,
  onValidate,
  onDeactivate,
  onDelete,
  isLoading = false,
  onEdit,
}) => {
  const getInitials = (firstName: string, lastName: string): string => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getServiceById = (serviceId?: string): Service | undefined => {
    if (!serviceId) return undefined;
    return services.find((s) => s.id === serviceId);
  };

  // Afficher un squelette de chargement
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Liste des employés</CardTitle>
          <CardDescription>Chargement...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Liste des employés</CardTitle>
        <CardDescription>{employees.length} employé(s)</CardDescription>
      </CardHeader>
      <CardContent>
        {employees.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Aucun employé trouvé avec les filtres actuels.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                    Employé
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                    Poste
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                    Département
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                    Type
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                    Statut
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => {
                  const service = getServiceById(employee.serviceId);
                  return (
                    <tr
                      key={employee.id}
                      className="border-b hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={employee.profileImage || undefined}
                            />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {getInitials(
                                employee.firstName,
                                employee.lastName
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {employee.firstName} {employee.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {employee.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">{employee.position}</div>
                      </td>
                      <td className="py-3 px-4">
                        {service ? (
                          <Badge
                            style={{
                              backgroundColor: `${service.color}20`,
                              color: service.color,
                              borderColor: service.color,
                            }}
                            className="border"
                          >
                            {service.code}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            Non assigné
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            employee.employeeType === "permanent"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {employee.employeeType === "permanent"
                            ? "Permanent"
                            : "Stagiaire"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            employee.isActive ? "default" : "destructive"
                          }
                        >
                          {employee.isActive ? "Actif" : "Inactif"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => onViewDetails(employee)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Voir détails
                              </DropdownMenuItem>
                              {onEdit && (
                                <DropdownMenuItem
                                  onClick={() => onEdit(employee)}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Modifier
                                </DropdownMenuItem>
                              )}
                              {!employee.isActive && (
                                <DropdownMenuItem
                                  onClick={() => onValidate(employee.id)}
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Valider
                                </DropdownMenuItem>
                              )}
                              {employee.isActive && (
                                <DropdownMenuItem
                                  onClick={() => onDeactivate(employee.id)}
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Désactiver
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => onDelete(employee.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
