import axios, { AxiosInstance, AxiosResponse } from "axios";
import { handleApiError } from "../utils/errorHandler";

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      // baseURL: "https://api.origami.mg/api",
      baseURL: "http://localhost:5000/api",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Intercepteur pour ajouter le token d'authentification
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Intercepteur pour gérer les erreurs
    this.api.interceptors.response.use((response) => response, handleApiError);
  }

  // Méthodes génériques pour les requêtes HTTP
  public get<T = unknown>(url: string): Promise<AxiosResponse<T>> {
    return this.api.get<T>(url);
  }

  public post<T = unknown>(url: string, data?: unknown): Promise<AxiosResponse<T>> {
    return this.api.post<T>(url, data);
  }

  public put<T = unknown>(url: string, data?: unknown): Promise<AxiosResponse<T>> {
    return this.api.put<T>(url, data);
  }

  public delete<T = unknown>(url: string): Promise<AxiosResponse<T>> {
    return this.api.delete<T>(url);
  }
}

export default new ApiService();
