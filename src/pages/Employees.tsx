import { useState, useEffect } from "react";
import { Users, UserCheck, UserX, UserPlus, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { toast } from "sonner";

// Import des composants
import { EmployeeStatsCard } from "@/components/employees/EmployeeStatsCard";
import {
  EmployeeFiltersComponent,
  EmployeeFilters as FilterType,
} from "@/components/employees/EmployeeFilters";
import { EmployeeTable } from "@/components/employees/EmployeeTable";
import { EmployeeDetailsDialog } from "@/components/employees/EmployeeDetailsDialog";
import { PendingEmployeesCard } from "@/components/employees/PendingEmployeesCard";
import { Pagination } from "@/components/employees/Pagination";

// Import des services et types
import employeeService from "@/services/employee.service";
import serviceService from "@/services/service.service";
import {
  Employee,
  Service,
  EmployeeFilters,
  EmployeeFormData,
} from "@/types/employee.types";
import { EmployeeDialog } from "@/components/employees/EmployeeDialog";

const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [filters, setFilters] = useState<EmployeeFilters>({
    search: "",
    status: "all",
    employeeType: "all",
    service: "all",
  });
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalEmployees, setTotalEmployees] = useState<number>(0);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );

  const [isEmployeeDialogOpen, setIsEmployeeDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const itemsPerPage = 10;

  // Fonction principale de soumission (CRÉATION ET MODIFICATION)
  const handleEmployeeSubmit = async (data: EmployeeFormData) => {
    try {
      setIsSubmitting(true);

      if (editingEmployee) {
        // MODE MODIFICATION
        const updatedEmployee = await employeeService.updateEmployee(
          editingEmployee.id,
          data
        );

        // Mettre à jour l'employé dans la liste locale
        setEmployees(
          employees.map((e) =>
            e.id === editingEmployee.id ? updatedEmployee : e
          )
        );

        toast.success("Employé mis à jour avec succès");
      } else {
        // MODE CRÉATION
        const newEmployee = await employeeService.createEmployee(data);

        // Ajouter le nouvel employé à la liste locale
        setEmployees([...employees, newEmployee]);
        setTotalEmployees(totalEmployees + 1);

        toast.success("Employé créé avec succès");
      }

      // Fermer le dialogue et réinitialiser l'état d'édition
      setIsEmployeeDialogOpen(false);
      setEditingEmployee(null);
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de l'employé:", error);
      toast.error(
        editingEmployee
          ? "Impossible de mettre à jour l'employé"
          : "Impossible de créer l'employé"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateEmployee = () => {
    setEditingEmployee(null);
    setIsEmployeeDialogOpen(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsEmployeeDialogOpen(true);
  };

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

  // Charger les employés lorsque les filtres ou la page changent
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setIsLoading(true);
        const response = await employeeService.getAllEmployees(
          currentPage,
          itemsPerPage,
          filters
        );

        setEmployees(response.employees);
        setTotalPages(response.totalPages);
        setTotalEmployees(response.totalEmployees);
      } catch (error) {
        console.error("Erreur lors du chargement des employés:", error);
        toast.error("Impossible de charger les employés");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployees();
  }, [currentPage, filters]);

  // Statistiques
  const stats = {
    total: totalEmployees,
    active: employees.filter((e) => e.isActive).length,
    inactive: employees.filter((e) => !e.isActive).length,
    interns: employees.filter((e) => e.employeeType === "intern").length,
  };

  // Actions
  const handleValidate = async (id: string): Promise<void> => {
    try {
      setIsSubmitting(true);
      const updatedEmployee = await employeeService.validateEmployee(id);

      // Mettre à jour l'employé dans la liste
      setEmployees(employees.map((e) => (e.id === id ? updatedEmployee : e)));

      toast.success("Employé validé avec succès");
    } catch (error) {
      console.error("Erreur lors de la validation de l'employé:", error);
      toast.error("Impossible de valider cet employé");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivate = async (id: string): Promise<void> => {
    if (!confirm("Êtes-vous sûr de vouloir désactiver cet employé ?")) return;

    try {
      setIsSubmitting(true);
      const updatedEmployee = await employeeService.deactivateEmployee(id);

      // Mettre à jour l'employé dans la liste
      setEmployees(employees.map((e) => (e.id === id ? updatedEmployee : e)));

      toast.success("Employé désactivé avec succès");
    } catch (error) {
      console.error("Erreur lors de la désactivation de l'employé:", error);
      toast.error("Impossible de désactiver cet employé");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (
      !confirm(
        "Êtes-vous sûr de vouloir supprimer cet employé ? Cette action est irréversible."
      )
    )
      return;

    try {
      setIsSubmitting(true);
      await employeeService.deleteEmployee(id);

      // Mettre à jour la liste
      setEmployees(employees.filter((e) => e.id !== id));
      setTotalEmployees(totalEmployees - 1);

      toast.success("Employé supprimé avec succès");
    } catch (error) {
      console.error("Erreur lors de la suppression de l'employé:", error);
      toast.error("Impossible de supprimer cet employé");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewDetails = async (employee: Employee): Promise<void> => {
    try {
      // Récupérer les détails complets de l'employé
      const employeeDetails = await employeeService.getEmployeeById(
        employee.id
      );
      setSelectedEmployee(employeeDetails);
      setIsDetailsOpen(true);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des détails de l'employé:",
        error
      );
      toast.error("Impossible de récupérer les détails de l'employé");
    }
  };

  const handleFilterChange = (newFilters: EmployeeFilters): void => {
    setFilters(newFilters);
    setCurrentPage(1); // Réinitialiser à la première page lors du changement de filtres
  };

  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-app flex">
      <Sidebar />

      <div className="flex-1 ml-64 overflow-auto h-screen">
        <main className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            {/* Header */}
            <PageHeader
              icon={Building2}
              title="Gestion des employés"
              description="Gérez et suivez tous vos employés"
              actions={
                <Button className="bg-primary hover:bg-primary/90" onClick={handleCreateEmployee}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Nouvel employé
                </Button>
              }
            />

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

            {/* Filtres */}
            <EmployeeFiltersComponent
              filters={filters}
              onFilterChange={handleFilterChange}
              services={services}
            />

            {/* Table */}
            <EmployeeTable
              employees={employees}
              services={services}
              onViewDetails={handleViewDetails}
              onValidate={handleValidate}
              onDeactivate={handleDeactivate}
              onEdit={handleEditEmployee}
              onDelete={handleDelete}
              isLoading={isLoading}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </main>
      </div>
      <EmployeeDialog
        open={isEmployeeDialogOpen}
        onOpenChange={setIsEmployeeDialogOpen}
        employee={editingEmployee}
        onSubmit={handleEmployeeSubmit}
        services={services}
        isLoading={isSubmitting}
      />

      {/* Dialog détails */}
      <EmployeeDetailsDialog
        employee={selectedEmployee}
        services={services}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />
    </div>
  );
};

export default Employees;
