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
import { ThemeToggle } from "@/components/ThemeToggle";
import logo from "@/assets/icons/logo.png";

/** Contenu de la sidebar, réutilisé sur desktop (aside fixe) et mobile (drawer) */
export const SidebarContent = () => {
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
    <>
      {/* Décor : halo indigo + trame de fond */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-28 right-[-5rem] h-72 w-72 rounded-full bg-indigo-600/30 blur-3xl" />
        <div className="absolute -bottom-24 left-[-4rem] h-64 w-64 rounded-full bg-fuchsia-600/20 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      {/* Header */}
      <div className="relative shrink-0 border-b border-white/10 px-5 py-5">
        <div className="flex h-14 items-center justify-center rounded-xl bg-white/95 shadow-lg shadow-black/20">
          <img
            src={logo}
            alt="Origami Tech"
            className="max-h-11 w-full max-w-[9.5rem] object-contain"
          />
        </div>
        <p className="mt-2.5 text-center text-[10px] font-medium uppercase tracking-[0.22em] text-slate-400">
          Système de présence
        </p>
      </div>

      {/* Navigation - Scrollable */}
      <nav className="scrollbar-hide relative flex-1 space-y-1 overflow-y-auto px-3 py-5 min-h-0">
        {navigationItems.map((item, index) => (
          <NavGroup key={index} item={item} />
        ))}
      </nav>

      {/* Footer - Fixed at bottom */}
      <div className="relative shrink-0 space-y-3 border-t border-white/10 p-3 pb-safe">
        <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping-slow rounded-full bg-emerald-400" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-white">Espace admin</p>
            <p className="truncate text-[10px] text-slate-400">
              Origami Tech · En ligne
            </p>
          </div>
          <ShieldCheck className="ml-auto h-4 w-4 shrink-0 text-indigo-300" />
        </div>
        <div className="flex gap-2">
          <ThemeToggle />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                className="flex-1 border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white"
                size="sm"
                disabled={isLoggingOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                {isLoggingOut ? "Déconnexion..." : "Déconnexion"}
              </Button>
            </AlertDialogTrigger>
          <AlertDialogContent className="w-[calc(100vw-2rem)] max-w-md">
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
      </div>
    </>
  );
};

export const Sidebar = () => {
  return (
    <aside className="fixed left-0 top-0 z-30 hidden h-screen w-64 flex-col overflow-hidden bg-[#0b1220] text-slate-100 lg:flex">
      <SidebarContent />
    </aside>
  );
};
