import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, ImagePlus, Trash2 } from "lucide-react";
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

const readAndCompressPhoto = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 360;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas indisponible"));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

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
    profileImage: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const photoInputRef = useRef<HTMLInputElement | null>(null);

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
        profileImage: employee.profileImage || "",
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
        profileImage: "",
      });
    }
    setErrors({});
  }, [employee, open]);

  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, profileImage: "Image trop lourde (max 5 Mo)" }));
      return;
    }
    try {
      const dataUrl = await readAndCompressPhoto(file);
      setFormData((prev) => ({ ...prev, profileImage: dataUrl }));
      setErrors((prev) => ({ ...prev, profileImage: "" }));
    } catch {
      setErrors((prev) => ({ ...prev, profileImage: "Impossible de lire cette image" }));
    }
  };

  const removePhoto = () => {
    setFormData((prev) => ({ ...prev, profileImage: "" }));
  };

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
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-muted bg-muted flex items-center justify-center">
                {formData.profileImage ? (
                  <img
                    src={formData.profileImage}
                    alt="Photo de profil"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                    {formData.firstName?.[0]}
                    {formData.lastName?.[0]}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                title="Changer la photo"
                className="absolute -right-1 -bottom-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white shadow-md hover:bg-primary/90 transition-colors"
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => photoInputRef.current?.click()}
                >
                  <ImagePlus className="mr-2 h-4 w-4" />
                  {formData.profileImage ? "Changer la photo" : "Ajouter une photo"}
                </Button>
                {formData.profileImage && (
                  <Button type="button" variant="ghost" size="sm" onClick={removePhoto}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                    Retirer
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Format JPG/PNG · la photo sera affichée sur le badge (46×46 mm)
              </p>
              {errors.profileImage && (
                <p className="text-sm text-red-500">{errors.profileImage}</p>
              )}
            </div>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
