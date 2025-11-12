import { useState } from "react";
import { Users, UserCheck, UserX, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/sidebar/Sidebar";

// Import des composants
import { EmployeeStatsCard } from "@/components/employees/EmployeeStatsCard";
import { EmployeeFiltersComponent, EmployeeFilters as FilterType } from "@/components/employees/EmployeeFilters";
import { EmployeeTable } from "@/components/employees/EmployeeTable";
import { EmployeeDetailsDialog } from "@/components/employees/EmployeeDetailsDialog";
import { PendingEmployeesCard } from "@/components/employees/PendingEmployeesCard";
import { Pagination } from "@/components/employees/Pagination";

// Import des données mockées et types
import { mockServices, mockEmployees, Employee } from "@/data/mockData";

const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [filters, setFilters] = useState<FilterType>({
    search: '',
    status: 'all',
    employeeType: 'all',
    service: 'all'
  });
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const itemsPerPage = 5;

  // Filtrage
  const filteredEmployees = employees.filter(emp => {
    const matchSearch = filters.search === '' || 
      emp.firstName.toLowerCase().includes(filters.search.toLowerCase()) ||
      emp.lastName.toLowerCase().includes(filters.search.toLowerCase()) ||
      emp.email.toLowerCase().includes(filters.search.toLowerCase()) ||
      emp.position.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchStatus = filters.status === 'all' || 
      (filters.status === 'active' && emp.isActive) ||
      (filters.status === 'inactive' && !emp.isActive);
    
    const matchType = filters.employeeType === 'all' || emp.employeeType === filters.employeeType;
    const matchService = filters.service === 'all' || emp.serviceId === filters.service;

    return matchSearch && matchStatus && matchType && matchService;
  });

  // Pagination
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEmployees = filteredEmployees.slice(startIndex, startIndex + itemsPerPage);

  // Statistiques
  const stats = {
    total: employees.length,
    active: employees.filter(e => e.isActive).length,
    inactive: employees.filter(e => !e.isActive).length,
    interns: employees.filter(e => e.employeeType === 'intern').length
  };

  const pendingEmployees = employees.filter(e => !e.isActive);

  // Actions
  const handleValidate = (id: string): void => {
    setEmployees(employees.map(e => 
      e.id === id ? { ...e, isActive: true } : e
    ));
  };

  const handleDeactivate = (id: string): void => {
    if (confirm("Êtes-vous sûr de vouloir désactiver cet employé ?")) {
      setEmployees(employees.map(e => 
        e.id === id ? { ...e, isActive: false } : e
      ));
    }
  };

  const handleDelete = (id: string): void => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet employé ? Cette action est irréversible.")) {
      setEmployees(employees.filter(e => e.id !== id));
    }
  };

  const handleViewDetails = (employee: Employee): void => {
    setSelectedEmployee(employee);
    setIsDetailsOpen(true);
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      
      <div className="flex-1 ml-64 overflow-auto h-screen">
        <main className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Gestion des employés</h1>
                <p className="text-muted-foreground mt-1">
                  Gérez et suivez tous vos employés
                </p>
              </div>
              <Button className="bg-primary hover:bg-primary/90">
                <UserPlus className="mr-2 h-4 w-4" />
                Nouvel employé
              </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <EmployeeStatsCard
                title="Total Employés"
                value={stats.total}
                icon={Users}
                description="Tous les employés"
              />
              <EmployeeStatsCard
                title="Actifs"
                value={stats.active}
                icon={UserCheck}
                variant="success"
                description="Employés actifs"
              />
              <EmployeeStatsCard
                title="Inactifs"
                value={stats.inactive}
                icon={UserX}
                variant="destructive"
                description="En attente de validation"
              />
              <EmployeeStatsCard
                title="Stagiaires"
                value={stats.interns}
                icon={Users}
                variant="warning"
                description="Contrats temporaires"
              />
            </div>

            {/* En attente + Filtres */}
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="lg:col-span-2">
                <EmployeeFiltersComponent 
                  filters={filters} 
                  onFilterChange={setFilters}
                  services={mockServices}
                />
              </div>
              {/* <div>
                <PendingEmployeesCard 
                  employees={pendingEmployees} 
                  onValidate={handleValidate}
                />
              </div> */}
            </div>

            {/* Table */}
            <EmployeeTable
              employees={paginatedEmployees}
              services={mockServices}
              onViewDetails={handleViewDetails}
              onValidate={handleValidate}
              onDeactivate={handleDeactivate}
              onDelete={handleDelete}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        </main>
      </div>

      {/* Dialog détails */}
      <EmployeeDetailsDialog
        employee={selectedEmployee}
        services={mockServices}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />
    </div>
  );
};

export default Employees;