import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { navigationItems } from "./navigationItems";
import { NavGroup } from "./NavGroup";

export const Sidebar = () => {
  return (
    <aside className="w-64 bg-card border-r h-screen flex flex-col p-3 fixed left-0 top-0">
      {/* Header */}
      <div className="mb-6 flex-shrink-0">
        {/* Logo optionnel */}
        {/* <img 
          src="./src/assets/icons/logo.png" 
          className="w-full h-auto object-contain" 
          alt="Logo Origami Tech"
        /> */}
        {/* <h1 className="text-xl font-bold text-foreground">Système de Pointage</h1> */}
      </div>

      {/* Navigation - Scrollable */}
      <nav className="flex-1 space-y-4 overflow-y-auto pr-2 min-h-0">
        {navigationItems.map((item, index) => (
          <NavGroup key={index} item={item} />
        ))}
      </nav>

      {/* Footer - Fixed at bottom */}
      <div className="pt-4 border-t space-y-2 flex-shrink-0">
        <Button variant="outline" className="w-full" size="sm">
          <LogOut className="mr-2 h-4 w-4" />
          Déconnexion
        </Button>
      </div>
    </aside>
  );
};