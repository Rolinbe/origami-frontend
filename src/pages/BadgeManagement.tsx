import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { BadgeStats } from '@/components/badges/BadgeStats';
import { BadgeFilters } from '@/components/badges/BadgeFilters';
import { BadgeCard } from '@/components/badges/BadgeCard';
import { BadgeDetailModal } from '@/components/badges/BadgeDetailModal';
import { CreateBadgeModal } from '@/components/badges/CreateBadgeModal';
import { Badge, BadgeFilters as BadgeFiltersType } from '@/components/badges/types';

const BadgeManagement: React.FC = () => {
  // Données de démonstration
  const [badges, setBadges] = useState<Badge[]>([
    {
      id: '1',
      badgeId: 'EMP-IT-2025-A1B2C3',
      userId: '1',
      qrCodeData: '{"badgeId":"EMP-IT-2025-A1B2C3"}',
      isActive: true,
      issuedAt: '2025-01-15T10:00:00',
      qrCodeImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      user: {
        id: '1',
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean.dupont@origami.mg',
        phone: '+261 34 12 345 67',
        position: 'Développeur Full Stack',
        employeeType: 'permanent',
        contractStartDate: '2024-01-01',
        service: {
          id: '1',
          name: 'Informatique',
          code: 'IT',
          color: '#3B82F6'
        }
      }
    },
    {
      id: '2',
      badgeId: 'STG-CM-2025-D4E5F6',
      userId: '2',
      qrCodeData: '{"badgeId":"STG-CM-2025-D4E5F6"}',
      isActive: true,
      issuedAt: '2025-02-01T09:00:00',
      qrCodeImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      user: {
        id: '2',
        firstName: 'Marie',
        lastName: 'Martin',
        email: 'marie.martin@origami.mg',
        phone: '+261 34 23 456 78',
        position: 'Community Manager',
        employeeType: 'intern',
        contractStartDate: '2025-02-01',
        contractEndDate: '2025-07-31',
        service: {
          id: '2',
          name: 'Community Management',
          code: 'CM',
          color: '#10B981'
        }
      }
    },
    {
      id: '3',
      badgeId: 'EMP-CV-2024-G7H8I9',
      userId: '3',
      qrCodeData: '{"badgeId":"EMP-CV-2024-G7H8I9"}',
      isActive: false,
      issuedAt: '2024-06-10T11:00:00',
      revokedAt: '2025-01-20T14:30:00',
      revokedReason: 'Fin de contrat',
      qrCodeImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      user: {
        id: '3',
        firstName: 'Pierre',
        lastName: 'Durand',
        email: 'pierre.durand@origami.mg',
        position: 'Designer Graphique',
        employeeType: 'permanent',
        service: {
          id: '3',
          name: 'Création Visuelle',
          code: 'CV',
          color: '#F59E0B'
        }
      }
    }
  ]);

  const [filters, setFilters] = useState<BadgeFiltersType>({
    search: '',
    status: 'all',
    employeeType: 'all',
    service: 'all'
  });

  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Calculer les statistiques
  const stats = {
    total: badges.length,
    active: badges.filter(b => b.isActive).length,
    revoked: badges.filter(b => !b.isActive).length,
    interns: badges.filter(b => b.user.employeeType === 'intern' && b.isActive).length
  };

  // Filtrer les badges
  const filteredBadges = badges.filter(badge => {
    const matchSearch = filters.search === '' || 
      badge.user.firstName.toLowerCase().includes(filters.search.toLowerCase()) ||
      badge.user.lastName.toLowerCase().includes(filters.search.toLowerCase()) ||
      badge.user.email.toLowerCase().includes(filters.search.toLowerCase()) ||
      badge.badgeId.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchStatus = filters.status === 'all' ||
      (filters.status === 'active' && badge.isActive) ||
      (filters.status === 'inactive' && !badge.isActive);
    
    const matchType = filters.employeeType === 'all' ||
      badge.user.employeeType === filters.employeeType;
    
    const matchService = filters.service === 'all' ||
      badge.user.service?.code === filters.service;
    
    return matchSearch && matchStatus && matchType && matchService;
  });

  const handleFilterChange = (key: keyof BadgeFiltersType, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
  };

  const handleViewBadge = (badge: Badge) => {
    setSelectedBadge(badge);
    setShowDetailModal(true);
  };

  const handleRevokeBadge = (badge: Badge) => {
    const reason = prompt('Raison de la révocation:');
    if (reason) {
      setBadges(prev => prev.map(b => 
        b.id === badge.id 
          ? { ...b, isActive: false, revokedAt: new Date().toISOString(), revokedReason: reason }
          : b
      ));
    }
  };

  const handleReactivateBadge = (badge: Badge) => {
    if (confirm('Voulez-vous réactiver ce badge ?')) {
      setBadges(prev => prev.map(b => 
        b.id === badge.id 
          ? { ...b, isActive: true, revokedAt: undefined, revokedReason: undefined }
          : b
      ));
    }
  };

  const handleRegenerateBadge = (badge) => {
    if (confirm('Voulez-vous régénérer ce badge ? L\'ancien badge sera révoqué.')) {
      // Révoquer l'ancien
      const updatedBadges = badges.map(b => 
        b.id === badge.id 
          ? { ...b, isActive: false, revokedAt: new Date().toISOString(), revokedReason: 'Régénération du badge' }
          : b
      );
      
      // Créer un nouveau
      const newBadge = {
        ...badge,
        id: Date.now().toString(),
        badgeId: `${badge.user.employeeType === 'intern' ? 'STG' : 'EMP'}-${badge.user.service?.code || 'GEN'}-2025-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        isActive: true,
        issuedAt: new Date().toISOString(),
        revokedAt: null,
        revokedReason: null
      };
      
      setBadges([...updatedBadges, newBadge]);
    }
  };

  const handleCreateBadge = (userId) => {
    // Simuler la création d'un badge
    console.log('Créer un badge pour l\'utilisateur:', userId);
    setShowCreateModal(false);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 ml-64 px-4 py-8 overflow-x-hidden">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Gestion des Badges</h1>
              <p className="text-muted-foreground mt-1">
                Gérez les badges d'identification des employés
              </p>
            </div>
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="bg-[rgb(101,193,255)] hover:bg-[rgb(81,173,235)] text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nouveau badge
            </Button>
          </div>

          {/* Stats */}
          <BadgeStats stats={stats} />

          {/* Filters */}
          <BadgeFilters 
            filters={filters}
            onFilterChange={handleFilterChange}
            onSearch={handleSearch}
          />

          {/* Badge List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                {filteredBadges.length} badge{filteredBadges.length > 1 ? 's' : ''} trouvé{filteredBadges.length > 1 ? 's' : ''}
              </h2>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredBadges.map(badge => (
                <BadgeCard
                  key={badge.id}
                  badge={badge}
                  onView={handleViewBadge}
                  onRevoke={handleRevokeBadge}
                  onReactivate={handleReactivateBadge}
                  onRegenerate={handleRegenerateBadge}
                />
              ))}
            </div>

            {filteredBadges.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">Aucun badge trouvé avec ces critères</p>
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
        />
      )}
    </div>
  );
};

export default BadgeManagement;