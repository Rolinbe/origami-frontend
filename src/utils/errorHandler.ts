import { toast } from "sonner";

export const handleApiError = (error: any) => {
  const message =
    error.response?.data?.message || error.message || "Une erreur est survenue";

  if (error.response?.status === 401) {
    toast.error("Session expirée. Veuillez vous reconnecter.");
    window.location.href = "/login";
  } else if (error.response?.status === 403) {
    toast.error("Vous n'avez pas les permissions pour effectuer cette action.");
  } else if (error.response?.status === 404) {
    toast.error("Ressource non trouvée.");
  } else if (error.response?.status >= 500) {
    toast.error("Erreur serveur. Veuillez réessayer plus tard.");
  } else {
    toast.error(message);
  }

  return Promise.reject(error);
};
