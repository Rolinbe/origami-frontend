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

interface ServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service?: {
    id: string;
    name: string;
    code: string;
    description: string;
    color: string;
  } | null;
  onSubmit: (data: {
    name: string;
    code: string;
    description: string;
    color: string;
  }) => void;
}

export const ServiceDialog = ({ open, onOpenChange, service, onSubmit }: ServiceDialogProps) => {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    color: "#3B82F6"
  });

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name,
        code: service.code,
        description: service.description,
        color: service.color
      });
    } else {
      setFormData({
        name: "",
        code: "",
        description: "",
        color: "#3B82F6"
      });
    }
  }, [service, open]);

  const handleSubmit = () => {
    onSubmit(formData);
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
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Community Management"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="code">Code *</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="Ex: CM"
              maxLength={20}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Décrivez brièvement les activités du département"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="color">Couleur *</Label>
            <div className="flex gap-2">
              <Input
                id="color"
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-20 h-10"
              />
              <Input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                placeholder="#3B82F6"
                className="flex-1"
              />
            </div>
          </div>
          <Alert>
            <AlertDescription className="text-xs">
              Le code doit être unique et servira d'identifiant court pour le département.
            </AlertDescription>
          </Alert>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit}
            className="bg-[rgb(101,193,255)] hover:bg-[rgb(81,173,235)] text-white"
            disabled={!formData.name || !formData.code}
          >
            {service ? "Enregistrer" : "Créer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};