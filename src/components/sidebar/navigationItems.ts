import {
  Users,
  LayoutDashboard,
  Building,
  UserCog,
  Badge,
  BookMarked,
  Settings,
  ScanBarcode,
  CalendarOff,
  Shield,
} from "lucide-react";
import { NavItem } from "./types";

export const navigationItems: NavItem[] = [
  {
    title: "Tableau de bord",
    icon: LayoutDashboard,
    path: "/dashboard"
  },
  {
    title: "Ressources humaines",
    icon: UserCog,
    submenu: [
      { title: "Départements", icon: Building, path: "/services" },
      { title: "Employés", icon: Users, path: "/employees" },
      { title: "Congés", icon: CalendarOff, path: "/leaves" },
    ]
  },
  {
    title: "Badges",
    icon: Badge,
    path: "/badges"
  },
  {
    title: "Poste de pointage",
    icon: ScanBarcode,
    path: "/scan"
  },
  {
    title: "Rapports",
    icon: BookMarked,
    path: "/reports"
  },
  {
    title: "Paramètres",
    icon: Settings,
    path: "/settings"
  },
  {
    title: "Journal d'audit",
    icon: Shield,
    path: "/audit-log"
  }
];