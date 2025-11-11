import { LucideIcon } from "lucide-react";

export type NavItem = {
  title: string;
  icon: LucideIcon;
  path?: string;
  submenu?: NavItem[];
};