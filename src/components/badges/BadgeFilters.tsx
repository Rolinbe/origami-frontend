import React from "react";
import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BadgeFilters as BadgeFiltersType, Service } from "@/types/badge.types";
import { Card, CardContent } from "../ui/card";

interface BadgeFiltersProps {
  filters: BadgeFiltersType;
  onFilterChange: (key: keyof BadgeFiltersType, value: string) => void;
  onSearch: (value: string) => void;
  services: Service[];
}

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
              <Select
                value={filters.status}
                onValueChange={(value) => onFilterChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="active">Actifs</SelectItem>
                  <SelectItem value="inactive">Inactifs</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.employeeType}
                onValueChange={(value) => onFilterChange("employeeType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="permanent">Permanents</SelectItem>
                  <SelectItem value="intern">Stagiaires</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.service}
                onValueChange={(value) => onFilterChange("service", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les services</SelectItem>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.code}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

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
