import { 
  Users, LayoutDashboard, 
  Building, UserCog, Badge,
  Book,
  BookMarked
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
    ]
  },
  {
    title: "Badges",
    icon: Badge,
    path: "/badges"
  },
  {
    title: "Rapports",
    icon: BookMarked,
    path: "/reports"
  }
];