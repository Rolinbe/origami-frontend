import { useState } from "react";
import { LogOut, ShieldCheck } from "lucide-react";
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
    <aside className="w-64 fixed left-0 top-0 z-30 flex h-screen flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      {/* Header */}
      <div className="flex h-20 shrink-0 items-center justify-center border-b border-sidebar-border px-4">
        <img
          src={logo}
          alt="Origami Tech"
          className="max-h-14 w-full max-w-[11rem] object-contain"
        />
      </div>

      {/* Navigation - Scrollable */}
      <nav className="scrollbar-thin flex-1 space-y-1 overflow-y-auto px-3 py-5 min-h-0">
        {navigationItems.map((item, index) => (
          <NavGroup key={index} item={item} />
        ))}
      </nav>

      {/* Footer - Fixed at bottom */}
      <div className="shrink-0 space-y-3 border-t border-sidebar-border p-3">
        <div className="flex items-center gap-2.5 rounded-lg bg-muted/50 px-3 py-2.5">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <p className="text-xs font-medium text-muted-foreground">
            Origami Tech · Espace admin
          </p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full"
              size="sm"
              disabled={isLoggingOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {isLoggingOut ? "Déconnexion..." : "Déconnexion"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer la déconnexion</AlertDialogTitle>
              <AlertDialogDescription>
                Vous allez être déconnecté de votre session. Voulez-vous
                continuer&nbsp;?
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