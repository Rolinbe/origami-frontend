import apiService from "./api.service";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  position?: string;
  serviceId?: string;
  employeeType?: "permanent" | "intern";
  contractStartDate?: string;
  contractEndDate?: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: "admin" | "employee";
  position?: string;
  department?: string;
  serviceId?: string;
  employeeType?: "permanent" | "intern";
  isActive: boolean;
  profileImage?: string;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

class AuthService {
  // Connexion
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>("/auth/login", credentials);
    
    // Stocker le token dans localStorage
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    
    return response.data;
  }

  // Inscription
  async register(data: RegisterData): Promise<{ message: string; user: User }> {
    const response = await apiService.post<{ message: string; user: User }>(
      "/auth/register",
      data
    );
    return response.data;
  }

  // Déconnexion
  async logout(): Promise<void> {
    try {
      await apiService.post("/auth/logout");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    } finally {
      // Supprimer le token et les données utilisateur
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  }

  // Obtenir le profil de l'utilisateur connecté
  async getProfile(): Promise<User> {
    const response = await apiService.get<{ user: User }>("/auth/profile");
    // Mettre à jour les données utilisateur dans localStorage
    localStorage.setItem("user", JSON.stringify(response.data.user));
    return response.data.user;
  }

  // Mettre à jour le profil
  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await apiService.put<{ message: string; user: User }>(
      "/auth/profile",
      data
    );
    // Mettre à jour les données utilisateur dans localStorage
    localStorage.setItem("user", JSON.stringify(response.data.user));
    return response.data.user;
  }

  // Changer le mot de passe
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await apiService.put("/auth/change-password", {
      oldPassword,
      newPassword,
    });
  }

  // Rafraîchir le token
  async refreshToken(token: string): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>("/auth/refresh", { token });
    
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    
    return response.data;
  }

  // Vérifier si l'utilisateur est connecté
  isAuthenticated(): boolean {
    return !!localStorage.getItem("token");
  }

  // Obtenir l'utilisateur depuis localStorage
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  // Obtenir le token
  getToken(): string | null {
    return localStorage.getItem("token");
  }
}

export default new AuthService();

