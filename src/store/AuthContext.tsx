import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import authService, { User, LoginCredentials, RegisterData } from "../services/auth.service";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext doit être utilisé dans un AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Charger l'utilisateur au démarrage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = authService.getToken();
        if (token) {
          // Vérifier si le token est valide en récupérant le profil
          const currentUser = await authService.getProfile();
          setUser(currentUser);
        } else {
          // Pas de token, vérifier localStorage pour les données utilisateur
          const storedUser = authService.getCurrentUser();
          if (storedUser) {
            setUser(storedUser);
          }
        }
      } catch (error) {
        // Token invalide ou expiré
        console.error("Erreur lors de l'initialisation de l'authentification:", error);
        authService.logout();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authService.login(credentials);
      setUser(response.user);
      navigate("/dashboard");
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } }; message?: string })
          .response?.data?.message ||
        (error as { message?: string }).message ||
        "Erreur lors de la connexion";
      throw new Error(message);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      await authService.register(data);
      // Après l'inscription, l'utilisateur doit être validé par un admin
      // On ne le connecte pas automatiquement
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } }; message?: string })
          .response?.data?.message ||
        (error as { message?: string }).message ||
        "Erreur lors de l'inscription";
      throw new Error(message);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    } finally {
      setUser(null);
      navigate("/");
    }
  };

  const refreshUser = async () => {
    try {
      const currentUser = await authService.getProfile();
      setUser(currentUser);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      // Si le token est invalide, déconnecter l'utilisateur
      if (error instanceof Error && error.message.includes("401")) {
        await logout();
      }
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user && !!authService.getToken(),
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

