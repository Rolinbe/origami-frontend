import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Employee, Service } from "@/types/employee.types";

interface EmployeeDetailsDialogProps {
  employee: Employee | null;
  services: Service[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EmployeeDetailsDialog: React.FC<EmployeeDetailsDialogProps> = ({
  employee,
  services,
  open,
  onOpenChange,
}) => {
  if (!employee) return null;

  const service = services.find((s) => s.id === employee.serviceId);

  const getInitials = (firstName: string, lastName: string): string => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Détails de l'employé</DialogTitle>
          <DialogDescription>
            Informations complètes sur {employee.firstName} {employee.lastName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profil */}
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={employee.profileImage || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-xl">
                {getInitials(employee.firstName, employee.lastName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-semibold">
                {employee.firstName} {employee.lastName}
              </h3>
              <p className="text-muted-foreground">{employee.position}</p>
              <div className="flex gap-2 mt-2">
                <Badge variant={employee.isActive ? "default" : "destructive"}>
                  {employee.isActive ? "Actif" : "Inactif"}
                </Badge>
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
              </div>
            </div>
          </div>

          {/* Informations */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">
                Email
              </h4>
              <p className="text-sm">{employee.email}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">
                Téléphone
              </h4>
              <p className="text-sm">{employee.phone || "Non renseigné"}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">
                Département
              </h4>
              {service ? (
                <Badge
                  style={{
                    backgroundColor: `${service.color}20`,
                    color: service.color,
                    borderColor: service.color,
                  }}
                  className="border"
                >
                  {service.name}
                </Badge>
              ) : (
                <span className="text-muted-foreground text-sm">
                  Non assigné
                </span>
              )}
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">
                Service
              </h4>
              <p className="text-sm">
                {employee.department || "Non renseigné"}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">
                Date de début
              </h4>
              <p className="text-sm">
                {employee.contractStartDate
                  ? new Date(employee.contractStartDate).toLocaleDateString(
                      "fr-FR"
                    )
                  : "Non renseigné"}
              </p>
            </div>
            {employee.contractEndDate && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  Date de fin
                </h4>
                <p className="text-sm">
                  {new Date(employee.contractEndDate).toLocaleDateString(
                    "fr-FR"
                  )}
                </p>
              </div>
            )}
            {employee.lastLogin && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  Dernière connexion
                </h4>
                <p className="text-sm">
                  {new Date(employee.lastLogin).toLocaleString("fr-FR")}
                </p>
              </div>
            )}
          </div>

          {/* Historique des présences */}
          {employee.attendances && employee.attendances.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                Historique des présences récentes
              </h4>
              <div className="border rounded-md p-2">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2">Date</th>
                      <th className="text-left py-2 px-2">Arrivée</th>
                      <th className="text-left py-2 px-2">Départ</th>
                      <th className="text-left py-2 px-2">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employee.attendances.map((attendance) => (
                      <tr key={attendance.id} className="border-b">
                        <td className="py-2 px-2">
                          {new Date(attendance.date).toLocaleDateString(
                            "fr-FR"
                          )}
                        </td>
                        <td className="py-2 px-2">
                          {attendance.checkInTime || "-"}
                        </td>
                        <td className="py-2 px-2">
                          {attendance.checkOutTime || "-"}
                        </td>
                        <td className="py-2 px-2">
                          {attendance.status && (
                            <Badge
                              variant={
                                attendance.status === "present"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {attendance.status}
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
