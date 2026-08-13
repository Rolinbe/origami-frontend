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
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const config = error?.config;
        if (!config || error?.response) {
          return handleApiError(error);
        }

        // Erreur réseau / aucune réponse : nouvelle tentative avant d'échouer
        config.__retryCount = (config.__retryCount ?? 0) + 1;
        if (config.__retryCount <= 3) {
          await new Promise((resolve) => setTimeout(resolve, 400 * config.__retryCount));
          return this.api.request(config);
        }
        return handleApiError(error);
      }
    );
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
