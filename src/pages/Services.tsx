import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { ServiceStats } from "../components/services/ServiceStats";
import { ServiceGrid } from "../components/services/ServiceGrid";
import { ServiceDialog } from "../components/services/ServiceDialog";

const Services = () => {
  const [services, setServices] = useState([
    {
      id: "1",
      name: "Community Management",
      code: "CM",
      description: "Gestion des réseaux sociaux et de la communauté en ligne",
      color: "#10B981",
      isActive: true
    },
    {
      id: "2",
      name: "Création Visuelle",
      code: "CV",
      description: "Design graphique, création de contenus visuels",
      color: "#F59E0B",
      isActive: true
    },
    {
      id: "3",
      name: "Informatique",
      code: "IT",
      description: "Développement, infrastructure et support technique",
      color: "#3B82F6",
      isActive: true
    },
    {
      id: "4",
      name: "Gestion Relation Client",
      code: "GRC",
      description: "Support client, service après-vente",
      color: "#EF4444",
      isActive: true
    },
    {
      id: "5",
      name: "Administration",
      code: "ADM",
      description: "Gestion administrative et ressources humaines",
      color: "#8B5CF6",
      isActive: false
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);

  const handleCreate = () => {
    setEditingService(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setIsDialogOpen(true);
  };

  const handleDelete = (serviceId) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce département ?")) {
      setServices(services.filter(s => s.id !== serviceId));
    }
  };

  const handleToggleActive = (serviceId) => {
    setServices(services.map(s => 
      s.id === serviceId ? { ...s, isActive: !s.isActive } : s
    ));
  };

  const handleSubmit = (formData) => {
    if (editingService) {
      // Update
      setServices(services.map(s => 
        s.id === editingService.id 
          ? { ...s, ...formData }
          : s
      ));
    } else {
      // Create
      const newService = {
        id: Date.now().toString(),
        ...formData,
        isActive: true
      };
      setServices([...services, newService]);
    }
    
    setIsDialogOpen(false);
  };

  const activeServices = services.filter(s => s.isActive);
  const inactiveServices = services.filter(s => !s.isActive);

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      
      {/* Ajout de ml-64 et h-screen overflow-auto */}
      <div className="flex-1 ml-64 overflow-auto h-screen">
        <main className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Départements</h1>
                <p className="text-muted-foreground mt-1">
                  Gérez les départements de votre entreprise
                </p>
              </div>
              <Button 
                onClick={handleCreate}
                className="bg-[rgb(101,193,255)] hover:bg-[rgb(81,173,235)] text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nouveau département
              </Button>
            </div>

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
    </div>
  );
};

export default Services;