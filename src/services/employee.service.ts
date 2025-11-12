import apiService from "./api.service";
import {
  Employee,
  EmployeeFormData,
  EmployeeListResponse,
  EmployeeUpdateData,
} from "../types/employee.types";

class EmployeeService {
  private endpoint = "/employees";

  async createEmployee(employeeData: EmployeeFormData): Promise<Employee> {
    try {
      const response = await apiService.post<{ employee: Employee }>(
        this.endpoint,
        employeeData
      );
      return response.data.employee;
    } catch (error) {
      console.error("Erreur lors de la création de l'employé:", error);
      throw error;
    }
  }

  // Mettre à jour un employé (si vous voulez aussi modifier)
  async updateEmployee(
    id: string,
    employeeData: Partial<EmployeeFormData>
  ): Promise<Employee> {
    try {
      const response = await apiService.put<{ employee: Employee }>(
        `${this.endpoint}/${id}`,
        employeeData
      );
      return response.data.employee;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'employé ${id}:`, error);
      throw error;
    }
  }

  // Récupérer tous les employés avec pagination et filtres
  async getAllEmployees(
    page = 1,
    limit = 10,
    filters?: {
      status?: string;
      search?: string;
      service?: string;
      employeeType?: string;
    }
  ): Promise<EmployeeListResponse> {
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      if (filters?.status && filters.status !== "all") {
        params.append("status", filters.status);
      }

      if (filters?.search) {
        params.append("search", filters.search);
      }

      if (filters?.service && filters.service !== "all") {
        params.append("service", filters.service);
      }

      if (filters?.employeeType && filters.employeeType !== "all") {
        params.append("employeeType", filters.employeeType);
      }

      const response = await apiService.get<EmployeeListResponse>(
        `${this.endpoint}?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des employés:", error);
      throw error;
    }
  }

  // Récupérer un employé par son ID
  async getEmployeeById(id: string): Promise<Employee> {
    try {
      const response = await apiService.get<{ employee: Employee }>(
        `${this.endpoint}/${id}`
      );
      return response.data.employee;
    } catch (error) {
      console.error(
        `Erreur lors de la récupération de l'employé ${id}:`,
        error
      );
      throw error;
    }
  }

  // Valider un employé (activer)
  async validateEmployee(id: string): Promise<Employee> {
    try {
      const response = await apiService.put<{ employee: Employee }>(
        `${this.endpoint}/${id}/validate`
      );
      return response.data.employee;
    } catch (error) {
      console.error(`Erreur lors de la validation de l'employé ${id}:`, error);
      throw error;
    }
  }

  // Désactiver un employé
  async deactivateEmployee(id: string): Promise<Employee> {
    try {
      const response = await apiService.put<{ employee: Employee }>(
        `${this.endpoint}/${id}/deactivate`
      );
      return response.data.employee;
    } catch (error) {
      console.error(
        `Erreur lors de la désactivation de l'employé ${id}:`,
        error
      );
      throw error;
    }
  }

  // Supprimer un employé
  async deleteEmployee(id: string): Promise<void> {
    try {
      await apiService.delete(`${this.endpoint}/${id}`);
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'employé ${id}:`, error);
      throw error;
    }
  }

  // Obtenir les employés en attente de validation
  async getPendingEmployees(): Promise<Employee[]> {
    try {
      const response = await apiService.get<{ pendingEmployees: Employee[] }>(
        `${this.endpoint}/pending`
      );
      return response.data.pendingEmployees;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des employés en attente:",
        error
      );
      throw error;
    }
  }
}

export default new EmployeeService();
