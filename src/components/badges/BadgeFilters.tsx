import React from "react";
import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BadgeFilters as BadgeFiltersType, Service } from "@/types/badge.types";
import { Card, CardContent } from "../ui/card";

interface BadgeFiltersProps {
  filters: BadgeFiltersType;
  onFilterChange: (key: keyof BadgeFiltersType, value: string) => void;
  onSearch: (value: string) => void;
  services: Service[];
}

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export const BadgeFilters: React.FC<BadgeFiltersProps> = ({
  filters,
  onFilterChange,
  onSearch,
  services,
}) => {
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters.search);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Rechercher un badge..."
                className="pl-10"
                value={filters.search}
                onChange={(e) => onFilterChange("search", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <select
                value={filters.status}
                onChange={(e) => onFilterChange("status", e.target.value)}
                className={selectClass}
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actifs</option>
                <option value="inactive">Inactifs</option>
              </select>

              <select
                value={filters.employeeType}
                onChange={(e) => onFilterChange("employeeType", e.target.value)}
                className={selectClass}
              >
                <option value="all">Tous les types</option>
                <option value="permanent">Permanents</option>
                <option value="intern">Stagiaires</option>
              </select>

              <select
                value={filters.service}
                onChange={(e) => onFilterChange("service", e.target.value)}
                className={selectClass}
              >
                <option value="all">Tous les services</option>
                {services.map((service) => (
                  <option key={service.id} value={service.code}>
                    {service.name}
                  </option>
                ))}
              </select>

              <Button type="submit" className="w-full">
                <Filter className="mr-2 h-4 w-4" />
                Filtrer
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
