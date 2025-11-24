import { useState } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuthContext } from "@/store/AuthContext";
import { navigationItems } from "./navigationItems";
import { NavGroup } from "./NavGroup";
import logo from "@/assets/icons/logo.png";

export const Sidebar = () => {
  const { logout } = useAuthContext();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <aside className="w-64 bg-card border-r h-screen flex flex-col p-3 fixed left-0 top-0">
      {/* Header */}
      <div className="mb-8 mt-4 flex-shrink-0 flex items-center justify-center w-full">
        <img src={logo} alt="Origami Tech" className="max-h-16 w-48 object-contain" />
      </div>

      {/* Navigation - Scrollable */}
      <nav className="flex-1 space-y-4 overflow-y-auto pr-2 min-h-0">
        {navigationItems.map((item, index) => (
          <NavGroup key={index} item={item} />
        ))}
      </nav>

      {/* Footer - Fixed at bottom */}
      <div className="pt-4 border-t space-y-2 flex-shrink-0">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="w-full" size="sm" disabled={isLoggingOut}>
              <LogOut className="mr-2 h-4 w-4" />
              {isLoggingOut ? "Déconnexion..." : "Déconnexion"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer la déconnexion</AlertDialogTitle>
              <AlertDialogDescription>
                Vous allez être déconnecté de votre session. Voulez-vous continuer&nbsp;?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleLogout} disabled={isLoggingOut}>
                Oui, me déconnecter
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </aside>
  );
};