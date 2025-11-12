import React from 'react';
import { Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { BadgeFilters as BadgeFiltersType } from './types';

interface BadgeFiltersProps {
  filters: BadgeFiltersType;
  onFilterChange: (key: keyof BadgeFiltersType, value: string) => void;
  onSearch: (value: string) => void;
}

export const BadgeFilters: React.FC<BadgeFiltersProps> = ({ 
  filters, 
  onFilterChange, 
  onSearch 
}) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher un employé..."
              className="pl-10"
              value={filters.search}
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
          
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={filters.status}
            onChange={(e) => onFilterChange('status', e.target.value)}
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="inactive">Révoqués</option>
          </select>
          
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={filters.employeeType}
            onChange={(e) => onFilterChange('employeeType', e.target.value)}
          >
            <option value="all">Tous les types</option>
            <option value="permanent">Permanents</option>
            <option value="intern">Stagiaires</option>
          </select>
          
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={filters.service}
            onChange={(e) => onFilterChange('service', e.target.value)}
          >
            <option value="all">Tous les services</option>
            <option value="CM">Community Management</option>
            <option value="CV">Création Visuelle</option>
            <option value="IT">Informatique</option>
            <option value="GRC">Gestion Relation Client</option>
            <option value="ADM">Administration</option>
          </select>
        </div>
      </CardContent>
    </Card>
  );
};