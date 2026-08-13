import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { Employee, Service, EmployeeFormData } from "@/types/employee.types";

interface EmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: Employee | null;
  onSubmit: (data: EmployeeFormData) => void;
  services: Service[];
  isLoading?: boolean;
}

export const EmployeeDialog = ({
  open,
  onOpenChange,
  employee,
  onSubmit,
  services,
  isLoading = false,
}: EmployeeDialogProps) => {
  const [formData, setFormData] = useState<EmployeeFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    position: "",
    department: "",
    serviceId: "",
    employeeType: "permanent",
    contractStartDate: format(new Date(), "yyyy-MM-dd"),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (employee) {
      setFormData({
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        phone: employee.phone || "",
        position: employee.position,
        department: employee.department || "",
        serviceId: employee.serviceId || "",
        employeeType: employee.employeeType,
        contractStartDate: employee.contractStartDate,
        contractEndDate: employee.contractEndDate || "",
      });
    } else {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        position: "",
        department: "",
        serviceId: "",
        employeeType: "permanent",
        contractStartDate: format(new Date(), "yyyy-MM-dd"),
        contractEndDate: "",
      });
    }
    setErrors({});
  }, [employee, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim())
      newErrors.firstName = "Le prénom est requis";
    if (!formData.lastName.trim()) newErrors.lastName = "Le nom est requis";
    if (!formData.email.trim()) newErrors.email = "L'email est requis";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email))
      newErrors.email = "Email invalide";
    if (!formData.position.trim()) newErrors.position = "Le poste est requis";
    if (!formData.contractStartDate)
      newErrors.contractStartDate = "La date de début est requise";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    const sanitizedData: EmployeeFormData = {
      ...formData,
      serviceId: formData.serviceId?.trim() ? formData.serviceId : undefined,
      department: formData.department?.trim() ? formData.department : undefined,
      phone: formData.phone?.trim() ? formData.phone : undefined,
      contractEndDate: formData.contractEndDate?.trim()
        ? formData.contractEndDate
        : undefined,
    };

    onSubmit(sanitizedData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {employee ? "Modifier l'employé" : "Nouvel employé"}
          </DialogTitle>
          <DialogDescription>
            {employee
              ? "Modifiez les informations de l'employé."
              : "Remplissez les informations pour ajouter un nouvel employé. Il sera en attente de validation."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom *</Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={errors.firstName ? "border-red-500" : ""}
                disabled={isLoading}
              />
              {errors.firstName && (
                <p className="text-sm text-red-500">{errors.firstName}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nom *</Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={errors.lastName ? "border-red-500" : ""}
                disabled={isLoading}
              />
              {errors.lastName && (
                <p className="text-sm text-red-500">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? "border-red-500" : ""}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">Poste *</Label>
            <Input
              id="position"
              name="position"
              value={formData.position}
              onChange={handleChange}
              className={errors.position ? "border-red-500" : ""}
              disabled={isLoading}
            />
            {errors.position && (
              <p className="text-sm text-red-500">{errors.position}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="serviceId">Département</Label>
              <select
                id="serviceId"
                name="serviceId"
                value={formData.serviceId}
                onChange={(e) => handleSelectChange("serviceId", e.target.value)}
                disabled={isLoading}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">
                  {services.length === 0
                    ? "Aucun département disponible"
                    : "Sélectionner un département"}
                </option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Service (Détail)</Label>
              <Input
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="Ex: Marketing Digital"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employeeType">Type de contrat</Label>
              <select
                id="employeeType"
                name="employeeType"
                value={formData.employeeType}
                onChange={(e) =>
                  handleSelectChange(
                    "employeeType",
                    e.target.value as "permanent" | "intern"
                  )
                }
                disabled={isLoading}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="permanent">Permanent</option>
                <option value="intern">Stagiaire</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contractStartDate">Date de début *</Label>
              <Input
                id="contractStartDate"
                name="contractStartDate"
                type="date"
                value={formData.contractStartDate}
                onChange={handleChange}
                className={errors.contractStartDate ? "border-red-500" : ""}
                disabled={isLoading}
              />
              {errors.contractStartDate && (
                <p className="text-sm text-red-500">
                  {errors.contractStartDate}
                </p>
              )}
            </div>
          </div>

          {formData.employeeType === "intern" && (
            <div className="space-y-2">
              <Label htmlFor="contractEndDate">
                Date de fin (pour les stagiaires)
              </Label>
              <Input
                id="contractEndDate"
                name="contractEndDate"
                type="date"
                value={formData.contractEndDate}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading
              ? "Enregistrement..."
              : employee
              ? "Mettre à jour"
              : "Créer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
