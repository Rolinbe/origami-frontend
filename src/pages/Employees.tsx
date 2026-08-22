import { useState, useEffect, useRef } from "react";
import { Users, UserCheck, UserX, UserPlus, Building2, Upload, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { AppLayout } from "@/components/layout/AppLayout";
import { toast } from "sonner";
import apiService from "@/services/api.service";
import { ConfirmDialog } from "@/components/ConfirmDialog";

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

  const [deactivateTarget, setDeactivateTarget] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const itemsPerPage = 10;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await apiService.get<unknown>("/employees/import-template");
      const blob = new Blob([response.data as unknown as BlobPart], {
        type: "text/csv;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "modele_import_employes.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erreur téléchargement modèle:", error);
      toast.error("Impossible de télécharger le modèle");
    }
  };

  const handleImportFile = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await apiService.post<{
        message: string;
        imported: number;
        failed: number;
        errors?: { line: number; email: string; error: string }[];
      }>("/employees/import", formData);
      const data = response.data;
      toast.success(`${data.message}`);
      if (data.errors && data.errors.length > 0) {
        console.warn("Erreurs d'import:", data.errors);
        toast.error(`Lignes en erreur: ${data.failed}`);
      }
      const refreshed = await employeeService.getAllEmployees(
        currentPage,
        itemsPerPage,
        filters
      );
      setEmployees(refreshed.employees);
      setTotalPages(refreshed.totalPages);
      setTotalEmployees(refreshed.totalEmployees);
    } catch (error) {
      console.error("Erreur import CSV:", error);
      toast.error("Impossible d'importer le fichier CSV");
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

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
    setDeactivateTarget(id);
  };

  const confirmDeactivate = async () => {
    if (!deactivateTarget) return;
    try {
      setIsSubmitting(true);
      const updatedEmployee = await employeeService.deactivateEmployee(deactivateTarget);
      setEmployees(employees.map((e) => (e.id === deactivateTarget ? updatedEmployee : e)));
      toast.success("Employé désactivé avec succès");
    } catch (error) {
      console.error("Erreur lors de la désactivation de l'employé:", error);
      toast.error("Impossible de désactiver cet employé");
    } finally {
      setIsSubmitting(false);
      setDeactivateTarget(null);
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    setDeleteTarget(id);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsSubmitting(true);
      await employeeService.deleteEmployee(deleteTarget);
      setEmployees(employees.filter((e) => e.id !== deleteTarget));
      setTotalEmployees(totalEmployees - 1);
      toast.success("Employé supprimé avec succès");
    } catch (error) {
      console.error("Erreur lors de la suppression de l'employé:", error);
      toast.error("Impossible de supprimer cet employé");
    } finally {
      setIsSubmitting(false);
      setDeleteTarget(null);
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
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          icon={Building2}
          title="Gestion des employés"
          description="Gérez et suivez tous vos employés"
          actions={
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="sm:h-10" onClick={handleDownloadTemplate}>
                <Download className="mr-2 h-4 w-4" />
                Modèle CSV
              </Button>
              <Button variant="outline" size="sm" className="sm:h-10" onClick={handleImportClick}>
                <Upload className="mr-2 h-4 w-4" />
                Importer CSV
              </Button>
              <Button size="sm" className="h-10 bg-primary hover:bg-primary/90" onClick={handleCreateEmployee}>
                <UserPlus className="mr-2 h-4 w-4" />
                Nouvel employé
              </Button>
            </div>
          }
        />
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={handleImportFile}
        />

        {/* Stats */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 stagger">
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

      <ConfirmDialog
        open={deactivateTarget !== null}
        onOpenChange={(open) => { if (!open) setDeactivateTarget(null); }}
        title="Désactiver cet employé"
        description="Êtes-vous sûr de vouloir désactiver cet employé ? Il n'aura plus accès au système."
        confirmLabel="Désactiver"
        variant="warning"
        onConfirm={confirmDeactivate}
        isLoading={isSubmitting}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Supprimer cet employé"
        description="Êtes-vous sûr de vouloir supprimer cet employé ? Cette action est irréversible et toutes les données associées seront perdues."
        confirmLabel="Supprimer"
        variant="danger"
        onConfirm={confirmDelete}
        isLoading={isSubmitting}
      />
    </AppLayout>
  );
};

export default Employees;
