import React, { useState, useEffect } from "react";
import { Plus, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { toast } from "sonner";
import { BadgeStats } from "@/components/badges/BadgeStats";
import { BadgeFilters } from "@/components/badges/BadgeFilters";
import { BadgeCard } from "@/components/badges/BadgeCard";
import { BadgeDetailModal } from "@/components/badges/BadgeDetailModal";
import { CreateBadgeModal } from "@/components/badges/CreateBadgeModal";
import {
  Badge,
  BadgeFilters as BadgeFiltersType,
  BadgeStats as BadgeStatsType,
} from "@/types/badge.types";
import badgeService from "@/services/badge.service";
import serviceService from "@/services/service.service";
import { Service } from "@/types/service.types";

const BadgeManagement: React.FC = () => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [filters, setFilters] = useState<BadgeFiltersType>({
    search: "",
    status: "all",
    employeeType: "all",
    service: "all",
  });
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Charger les services au montage du composant
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const servicesData = await serviceService.getAllServices();
        setServices(servicesData);
      } catch (error) {
        console.error("Erreur lors du chargement des services:", error);
        toast.error("Impossible de charger les services");
      }
    };

    fetchServices();
  }, []);

  // Charger les badges avec les filtres actuels
  useEffect(() => {
    const fetchBadges = async () => {
      try {
        setIsLoading(true);
        const badgesData = await badgeService.getAllBadges(filters);
        setBadges(badgesData);
      } catch (error) {
        console.error("Erreur lors du chargement des badges:", error);
        toast.error("Impossible de charger les badges");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBadges();
  }, [filters]);

  // Calculer les statistiques
  const stats: BadgeStatsType = {
    total: badges.length,
    active: badges.filter((b) => b.isActive).length,
    revoked: badges.filter((b) => !b.isActive).length,
    interns: badges.filter(
      (b) => b.user?.employeeType === "intern" && b.isActive
    ).length,
  };

  // Filtrer les badges (côté client pour une meilleure expérience utilisateur)
  const filteredBadges = badges.filter((badge) => {
    const matchSearch =
      filters.search === "" ||
      badge.user?.firstName
        ?.toLowerCase()
        .includes(filters.search.toLowerCase()) ||
      badge.user?.lastName
        ?.toLowerCase()
        .includes(filters.search.toLowerCase()) ||
      badge.user?.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
      badge.badgeId.toLowerCase().includes(filters.search.toLowerCase());

    const matchStatus =
      filters.status === "all" ||
      (filters.status === "active" && badge.isActive) ||
      (filters.status === "inactive" && !badge.isActive);

    const matchType =
      filters.employeeType === "all" ||
      badge.user?.employeeType === filters.employeeType;

    const matchService =
      filters.service === "all" ||
      badge.user?.service?.code === filters.service;

    return matchSearch && matchStatus && matchType && matchService;
  });

  const handleFilterChange = (key: keyof BadgeFiltersType, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearch = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
  };

  const handleViewBadge = async (badge: Badge) => {
    try {
      // Récupérer les détails complets du badge
      const badgeDetails = await badgeService.getBadgeById(badge.badgeId);
      setSelectedBadge(badgeDetails);
      setShowDetailModal(true);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des détails du badge:",
        error
      );
      toast.error("Impossible de récupérer les détails du badge");
    }
  };

  const handleRevokeBadge = async (badge: Badge) => {
    const reason = prompt("Veuillez indiquer la raison de la révocation:");
    if (!reason) return;

    try {
      setIsSubmitting(true);
      const updatedBadge = await badgeService.revokeBadge(
        badge.badgeId,
        reason
      );

      // Mettre à jour le badge dans la liste
      setBadges(badges.map((b) => (b.id === badge.id ? updatedBadge : b)));

      toast.success("Badge révoqué avec succès");
    } catch (error) {
      console.error("Erreur lors de la révocation du badge:", error);
      toast.error("Impossible de révoquer ce badge");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReactivateBadge = async (badge: Badge) => {
    if (!confirm("Voulez-vous réactiver ce badge ?")) return;

    try {
      setIsSubmitting(true);
      const updatedBadge = await badgeService.reactivateBadge(badge.badgeId);

      // Mettre à jour le badge dans la liste
      setBadges(badges.map((b) => (b.id === badge.id ? updatedBadge : b)));

      toast.success("Badge réactivé avec succès");
    } catch (error) {
      console.error("Erreur lors de la réactivation du badge:", error);
      toast.error("Impossible de réactiver ce badge");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateBadge = async (userId: string) => {
    try {
      setIsSubmitting(true);
      const newBadge = await badgeService.createBadge(userId);

      // Ajouter le nouveau badge à la liste
      setBadges([newBadge, ...badges]);

      setShowCreateModal(false);
      toast.success("Badge créé avec succès");
    } catch (error) {
      console.error("Erreur lors de la création du badge:", error);
      toast.error("Impossible de créer ce badge");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-app">
      <Sidebar />
      <div className="flex-1 ml-64 px-4 py-8 overflow-x-hidden">
        <div className="space-y-6">
          {/* Header */}
          <PageHeader
            icon={BadgeCheck}
            title="Gestion des Badges"
            description="Gérez les badges d'identification des employés"
            actions={
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nouveau badge
              </Button>
            }
          />

          {/* Stats */}
          <BadgeStats stats={stats} />

          {/* Filters */}
          <BadgeFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onSearch={handleSearch}
            services={services}
          />

          {/* Badge List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                {filteredBadges.length} badge
                {filteredBadges.length > 1 ? "s" : ""} trouvé
                {filteredBadges.length > 1 ? "s" : ""}
              </h2>
            </div>

            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-full bg-gray-200"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredBadges.map((badge) => (
                  <BadgeCard
                    key={badge.id}
                    badge={badge}
                    onView={handleViewBadge}
                    onRevoke={handleRevokeBadge}
                    onReactivate={handleReactivateBadge}
                    isSubmitting={isSubmitting}
                  />
                ))}
              </div>
            )}

            {!isLoading && filteredBadges.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    Aucun badge trouvé avec ces critères
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showDetailModal && (
        <BadgeDetailModal
          badge={selectedBadge}
          onClose={() => setShowDetailModal(false)}
        />
      )}

      {showCreateModal && (
        <CreateBadgeModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateBadge}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};

export default BadgeManagement;
