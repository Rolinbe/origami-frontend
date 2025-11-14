import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Service, ServiceFormData } from "../../types/service.types";

interface ServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service?: Service | null;
  onSubmit: (data: ServiceFormData) => void;
  isLoading?: boolean;
}

export const ServiceDialog = ({
  open,
  onOpenChange,
  service,
  onSubmit,
  isLoading = false,
}: ServiceDialogProps) => {
  const [formData, setFormData] = useState<ServiceFormData>({
    name: "",
    code: "",
    description: "",
    color: "#3B82F6",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name,
        code: service.code,
        description: service.description || "",
        color: service.color,
      });
    } else {
      setFormData({
        name: "",
        code: "",
        description: "",
        color: "#3B82F6",
      });
    }
    // Réinitialiser les erreurs à chaque ouverture/fermeture
    setErrors({});
  }, [service, open]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Effacer l'erreur pour ce champ si l'utilisateur commence à taper
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Le nom du département est requis";
    }

    if (!formData.code.trim()) {
      newErrors.code = "Le code du département est requis";
    } else if (formData.code.length > 20) {
      newErrors.code = "Le code ne doit pas dépasser 20 caractères";
    }

    if (!formData.color.trim()) {
      newErrors.color = "La couleur est requise";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, color: value }));

    // Effacer l'erreur pour ce champ si l'utilisateur commence à taper
    if (errors.color) {
      setErrors((prev) => ({ ...prev, color: "" }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {service ? "Modifier le département" : "Nouveau département"}
          </DialogTitle>
          <DialogDescription>
            {service
              ? "Modifiez les informations du département"
              : "Créez un nouveau département pour votre entreprise"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom du département *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ex: Community Management"
              className={errors.name ? "border-red-500" : ""}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="code">Code *</Label>
            <Input
              id="code"
              name="code"
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value.toUpperCase() })
              }
              placeholder="Ex: CM"
              maxLength={20}
              className={errors.code ? "border-red-500" : ""}
              disabled={isLoading}
            />
            {errors.code && (
              <p className="text-sm text-red-500">{errors.code}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Décrivez brièvement les activités du département"
              rows={3}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="color">Couleur *</Label>
            <div className="flex gap-2">
              <Input
                id="color"
                type="color"
                value={formData.color}
                onChange={handleColorChange}
                className="w-20 h-10"
                disabled={isLoading}
              />
              <Input
                type="text"
                value={formData.color}
                onChange={handleColorChange}
                placeholder="#3B82F6"
                className={`flex-1 ${errors.color ? "border-red-500" : ""}`}
                disabled={isLoading}
              />
            </div>
            {errors.color && (
              <p className="text-sm text-red-500">{errors.color}</p>
            )}
          </div>
          <Alert>
            <AlertDescription className="text-xs">
              Le code doit être unique et servira d'identifiant court pour le
              département.
            </AlertDescription>
          </Alert>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-[rgb(101,193,255)] hover:bg-[rgb(81,173,235)] text-white"
            disabled={
              isLoading || !formData.name.trim() || !formData.code.trim()
            }
          >
            {isLoading ? "Chargement..." : service ? "Enregistrer" : "Créer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
