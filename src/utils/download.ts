// src/utils/download.ts
// Télécharge un fichier depuis le backend avec le token JWT (Authorization header).
const API_BASE_URL = "http://localhost:5000/api";

export const downloadFile = async (
  path: string,
  filename: string,
): Promise<void> => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: "Erreur lors du téléchargement" }));
    throw new Error(
      (errorData as { message?: string }).message ?? "Erreur lors du téléchargement",
    );
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};