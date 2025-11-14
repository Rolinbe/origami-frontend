import apiService from "./api.service";
import { Badge, BadgeFilters, UserWithoutBadge } from "../types/badge.types";

class BadgeService {
  private endpoint = "/badges";

  // Créer un badge pour un utilisateur
  async createBadge(userId: string): Promise<Badge> {
    try {
      const response = await apiService.post<{ badge: Badge }>(
        `${this.endpoint}/create`,
        { userId }
      );
      return response.data.badge;
    } catch (error) {
      console.error("Erreur lors de la création du badge:", error);
      throw error;
    }
  }

  // Obtenir tous les badges avec filtres
  async getAllBadges(filters?: BadgeFilters): Promise<Badge[]> {
    try {
      const params = new URLSearchParams();

      if (filters?.status && filters.status !== "all") {
        params.append("status", filters.status);
      }

      if (filters?.search) {
        params.append("search", filters.search);
      }

      if (filters?.employeeType && filters.employeeType !== "all") {
        params.append("employeeType", filters.employeeType);
      }

      if (filters?.service && filters.service !== "all") {
        params.append("service", filters.service);
      }

      const response = await apiService.get<{ badges: Badge[] }>(
        `${this.endpoint}?${params.toString()}`
      );
      return response.data.badges;
    } catch (error) {
      console.error("Erreur lors de la récupération des badges:", error);
      throw error;
    }
  }

  // Obtenir un badge par son ID
  async getBadgeById(badgeId: string): Promise<Badge> {
    try {
      const response = await apiService.get<{ badge: Badge }>(
        `${this.endpoint}/${badgeId}`
      );
      return response.data.badge;
    } catch (error) {
      console.error(
        `Erreur lors de la récupération du badge ${badgeId}:`,
        error
      );
      throw error;
    }
  }

  // Révoquer un badge
  async revokeBadge(badgeId: string, reason?: string): Promise<Badge> {
    try {
      const response = await apiService.put<{ badge: Badge }>(
        `${this.endpoint}/${badgeId}/revoke`,
        { reason }
      );
      return response.data.badge;
    } catch (error) {
      console.error(`Erreur lors de la révocation du badge ${badgeId}:`, error);
      throw error;
    }
  }

  // Réactiver un badge
  async reactivateBadge(badgeId: string): Promise<Badge> {
    try {
      const response = await apiService.put<{ badge: Badge }>(
        `${this.endpoint}/${badgeId}/reactivate`
      );
      return response.data.badge;
    } catch (error) {
      console.error(
        `Erreur lors de la réactivation du badge ${badgeId}:`,
        error
      );
      throw error;
    }
  }

  // Obtenir les utilisateurs sans badge actif
  async getUsersWithoutBadge(): Promise<UserWithoutBadge[]> {
    try {
      const response = await apiService.get<{ users: UserWithoutBadge[] }>(
        `${this.endpoint}/users/without-badge`
      );
      return response.data.users;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des utilisateurs sans badge:",
        error
      );
      throw error;
    }
  }
}

export default new BadgeService();
