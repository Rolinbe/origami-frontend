import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

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
          <select
            value={filters.status}
            onChange={(e) => onFilterChange({ ...filters, status: e.target.value as 'all' | 'active' | 'inactive' })}
            className={selectClass}
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="inactive">Inactifs</option>
          </select>

          {/* Type d'employé */}
          <select
            value={filters.employeeType}
            onChange={(e) => onFilterChange({ ...filters, employeeType: e.target.value as 'all' | 'permanent' | 'intern' })}
            className={selectClass}
          >
            <option value="all">Tous les types</option>
            <option value="permanent">Permanents</option>
            <option value="intern">Stagiaires</option>
          </select>

          {/* Service */}
          <select
            value={filters.service}
            onChange={(e) => onFilterChange({ ...filters, service: e.target.value })}
            className={selectClass}
          >
            <option value="all">Tous les départements</option>
            {services.map(service => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
        </div>
      </CardContent>
    </Card>
  );
};