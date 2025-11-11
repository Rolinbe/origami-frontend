import { Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";
import { navigationItems } from "./navigationItems";
import { NavGroup } from "./NavGroup";

export const Sidebar = () => {
  return (
    <aside className="w-64 bg-card border-r min-h-screen p-3">
      <div className="flex flex-col h-full">
        {/* Logo */}
        {/* <div className="w-64 h-40 flex items-center justify-center">
          <img 
            src="./src/assets/icons/logo.png" 
            className="w-full h-full object-contain" 
            alt="Logo Origami Tech"
          />
        </div> */}

        {/* Navigation avec groupes */}
        <nav className="flex-1 space-y-4 overflow-y-auto">
          {navigationItems.map((item, index) => (
            <NavGroup key={index} item={item} />
          ))}
        </nav>

        {/* Paramètres et Déconnexion */}
        <div className="pt-4 border-t space-y-2">
          <NavLink
            to="/settings"
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
            activeClassName="bg-accent text-accent-foreground"
          >
            <Settings size={20} />
            <span>Paramètres</span>
          </NavLink>
          <Button variant="outline" className="w-full" size="sm">
            <LogOut className="mr-2 h-4 w-4" />
            Déconnexion
          </Button>
        </div>
      </div>
    </aside>
  );
};