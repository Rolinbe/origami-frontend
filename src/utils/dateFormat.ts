const isValidDate = (value: Date): boolean => !Number.isNaN(value.getTime());

const toDate = (value: string | Date | null | undefined): Date | null => {
  if (value === null || value === undefined) return null;
  const date = value instanceof Date ? value : new Date(value);
  return isValidDate(date) ? date : null;
};

export const formatDateFr = (value: string | Date | null | undefined): string => {
  const date = toDate(value);
  if (!date) return "—";
  return date.toLocaleDateString("fr-FR");
};

export const formatDateTimeFr = (value: string | Date | null | undefined): string => {
  const date = toDate(value);
  if (!date) return "—";
  return date.toLocaleString("fr-FR");
};

export const formatTimeFr = (value: string | Date | null | undefined): string => {
  const date = toDate(value);
  if (!date) return "—";
  return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
};