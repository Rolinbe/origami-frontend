import apiService from "./api.service";
import { Service, ServiceFormData, ServiceStats } from "../types/service.types";

class ServiceService {
  private endpoint = "/services";

  // Récupérer tous les services
  async getAllServices(includeStats = false): Promise<Service[]> {
    try {
      const response = await apiService.get<{ services: Service[] }>(
        `${this.endpoint}?includeStats=${includeStats}`
      );
      return response.data.services;
    } catch (error) {
      console.error("Erreur lors de la récupération des services:", error);
      throw error;
    }
  }

  // Récupérer un service par son ID
  async getServiceById(id: string): Promise<Service> {
    try {
      const response = await apiService.get<{ service: Service }>(
        `${this.endpoint}/${id}`
      );
      return response.data.service;
    } catch (error) {
      console.error(`Erreur lors de la récupération du service ${id}:`, error);
      throw error;
    }
  }

  // Créer un nouveau service
  async createService(serviceData: ServiceFormData): Promise<Service> {
    try {
      const response = await apiService.post<{ service: Service }>(
        this.endpoint,
        serviceData
      );
      return response.data.service;
    } catch (error) {
      console.error("Erreur lors de la création du service:", error);
      throw error;
    }
  }

  // Mettre à jour un service
  async updateService(
    id: string,
    serviceData: Partial<ServiceFormData>
  ): Promise<Service> {
    try {
      const response = await apiService.put<{ service: Service }>(
        `${this.endpoint}/${id}`,
        serviceData
      );
      return response.data.service;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du service ${id}:`, error);
      throw error;
    }
  }

  // Désactiver un service
  async deactivateService(id: string): Promise<Service> {
    try {
      const response = await apiService.delete<{ service: Service }>(
        `${this.endpoint}/${id}`
      );
      return response.data.service;
    } catch (error) {
      console.error(`Erreur lors de la désactivation du service ${id}:`, error);
      throw error;
    }
  }

  // Obtenir les statistiques d'un service
  async getServiceStats(
    id: string,
    month?: string,
    year?: string
  ): Promise<ServiceStats> {
    try {
      const params = new URLSearchParams();
      if (month) params.append("month", month);
      if (year) params.append("year", year);

      const response = await apiService.get<{ stats: ServiceStats }>(
        `${this.endpoint}/${id}/stats?${params.toString()}`
      );
      return response.data.stats;
    } catch (error) {
      console.error(
        `Erreur lors de la récupération des statistiques du service ${id}:`,
        error
      );
      throw error;
    }
  }
}

export default new ServiceService();
