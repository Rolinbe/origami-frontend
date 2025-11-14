// Hook d'authentification utilisant le contexte AuthContext
import { useAuthContext } from "../store/AuthContext";
import { LoginCredentials, RegisterData } from "../services/auth.service";

export const useAuth = () => {
  const authContext = useAuthContext();

  const signIn = async (email: string, password: string) => {
    try {
      await authContext.login({ email, password });
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    position?: string,
    phone?: string,
    serviceId?: string,
    employeeType?: "permanent" | "intern"
  ) => {
    try {
      const registerData: RegisterData = {
        firstName,
        lastName,
        email,
        password,
        phone,
        position,
        serviceId,
        employeeType: employeeType || "permanent",
      };
      await authContext.register(registerData);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    try {
      await authContext.logout();
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  return {
    user: authContext.user,
    session: null, // Non utilisé avec notre backend
    loading: authContext.loading,
    signUp,
    signIn,
    signOut,
    isAuthenticated: authContext.isAuthenticated,
    refreshUser: authContext.refreshUser,
  };
};
