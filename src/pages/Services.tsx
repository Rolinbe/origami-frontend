import { useState, useEffect } from "react";
import { Plus, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { ServiceStats } from "../components/services/ServiceStats";
import { ServiceGrid } from "../components/services/ServiceGrid";
import { ServiceDialog } from "../components/services/ServiceDialog";
import serviceService from "../services/service.service";
import { Service, ServiceFormData } from "../types/service.types";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ConfirmDialog";

const Services = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deactivateTarget, setDeactivateTarget] = useState<string | null>(null);

  // Charger les services au montage du composant
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setIsLoading(true);
        const servicesData = await serviceService.getAllServices(true);
        console.log(servicesData);
        setServices(servicesData);
      } catch (error) {
        console.error("Erreur lors du chargement des services:", error);
        toast.error("Impossible de charger les services");
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, []);

  const handleCreate = () => {
    setEditingService(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setIsDialogOpen(true);
  };

  const handleDelete = async (serviceId: string) => {
    setDeactivateTarget(serviceId);
  };

  const confirmDeactivate = async () => {
    if (!deactivateTarget) return;
    try {
      await serviceService.deleteService(deactivateTarget);
      setServices(
        services.map((s) =>
          s.id === deactivateTarget ? { ...s, isActive: false } : s
        )
      );
      toast.success("Département désactivé avec succès");
    } catch (error) {
      console.error("Erreur lors de la supprimer du service:", error);
      toast.error("Impossible de supprimer le département");
    } finally {
      setDeactivateTarget(null);
    }
  };

  const handleToggleActive = async (serviceId: string) => {
    try {
      const service = services.find((s) => s.id === serviceId);
      if (!service) return;

      // Si le service est actif, on le désactive
      if (service.isActive) {
        await serviceService.deactivateService(serviceId);
        setServices(
          services.map((s) =>
            s.id === serviceId ? { ...s, isActive: false } : s
          )
        );
        toast.success("Département désactivé avec succès");
      } else {
        // Si le service est inactif, on le réactive
        await serviceService.activateService(serviceId);
        setServices(
          services.map((s) =>
            s.id === serviceId ? { ...s, isActive: true } : s
          )
        );
        toast.success("Département activé avec succès");
      }
    } catch (error) {
      console.error("Erreur lors du changement de statut du service:", error);
      toast.error("Impossible de changer le statut du département");
    }
  };

  const handleSubmit = async (formData: ServiceFormData) => {
    try {
      setIsSubmitting(true);

      if (editingService) {
        const updatedService = await serviceService.updateService(
          editingService.id,
          formData
        );
        setServices(
          services.map((s) => (s.id === editingService.id ? updatedService : s))
        );
        toast.success("Département mis à jour avec succès");
      } else {
        const newService = await serviceService.createService(formData);
        setServices([...services, newService]);
        toast.success("Département créé avec succès");
      }

      setIsDialogOpen(false);
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du service:", error);
      toast.error(
        editingService
          ? "Impossible de mettre à jour le département"
          : "Impossible de créer le département"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeServices = services.filter((s) => s.isActive);
  const inactiveServices = services.filter((s) => !s.isActive);

  return (
    <div className="min-h-screen bg-app flex">
      <Sidebar />

      {/* Ajout de ml-64 et h-screen overflow-auto */}
      <div className="flex-1 ml-64 overflow-auto h-screen">
        <main className="container mx-auto px-4 py-8 animate-fade-in-up">
          <div className="space-y-6">
            {/* Header */}
            <PageHeader
              icon={Building2}
              title="Départements"
              description="Gérez les départements de votre entreprise"
              actions={
                <Button
                  onClick={handleCreate}
                  className="bg-primary hover:bg-primary/90"
                  disabled={isLoading}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Nouveau département
                </Button>
              }
            />

            {/* Stats */}
            <ServiceStats
              total={services.length}
              active={activeServices.length}
              inactive={inactiveServices.length}
            />

            {/* Active Services */}
            <ServiceGrid
              services={activeServices}
              title="Départements actifs"
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleActive={handleToggleActive}
            />

            {/* Inactive Services */}
            <ServiceGrid
              services={inactiveServices}
              title="Départements inactifs"
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleActive={handleToggleActive}
            />
          </div>
        </main>
      </div>

      {/* Dialog */}
      <ServiceDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        service={editingService}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={deactivateTarget !== null}
        onOpenChange={(open) => { if (!open) setDeactivateTarget(null); }}
        title="Désactiver ce département"
        description="Êtes-vous sûr de vouloir désactiver ce département ? Les employés associés ne seront plus liés à ce service."
        confirmLabel="Désactiver"
        variant="warning"
        onConfirm={confirmDeactivate}
      />
    </div>
  );
};

export default Services;
