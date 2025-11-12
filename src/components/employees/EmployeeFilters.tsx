import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Service } from "@/data/mockData";

export interface EmployeeFilters {
  search: string;
  status: 'all' | 'active' | 'inactive';
  employeeType: 'all' | 'permanent' | 'intern';
  service: string;
}

interface EmployeeFiltersProps {
  filters: EmployeeFilters;
  onFilterChange: (filters: EmployeeFilters) => void;
  services: Service[];
}

export const EmployeeFiltersComponent: React.FC<EmployeeFiltersProps> = ({ 
  filters, 
  onFilterChange, 
  services 
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-lg">Filtres</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={filters.search}
              onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
              className="pl-9"
            />
          </div>

          {/* Statut */}
          <Select value={filters.status} onValueChange={(value: 'all' | 'active' | 'inactive') => onFilterChange({ ...filters, status: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="active">Actifs</SelectItem>
              <SelectItem value="inactive">Inactifs</SelectItem>
            </SelectContent>
          </Select>

          {/* Type d'employé */}
          <Select value={filters.employeeType} onValueChange={(value: 'all' | 'permanent' | 'intern') => onFilterChange({ ...filters, employeeType: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              <SelectItem value="permanent">Permanents</SelectItem>
              <SelectItem value="intern">Stagiaires</SelectItem>
            </SelectContent>
          </Select>

          {/* Service */}
          <Select value={filters.service} onValueChange={(value) => onFilterChange({ ...filters, service: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Département" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les départements</SelectItem>
              {services.map(service => (
                <SelectItem key={service.id} value={service.id}>
                  {service.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};