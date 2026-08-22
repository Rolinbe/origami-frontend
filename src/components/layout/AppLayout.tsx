import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Sidebar, SidebarContent } from "@/components/sidebar/Sidebar";
import logo from "@/assets/icons/logo.png";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Layout responsive de l'application :
 * - Desktop (lg+) : sidebar fixe à gauche
 * - Mobile / tablette (< lg) : topbar sticky avec menu burger + drawer latéral
 */
export const AppLayout = ({ children, className }: AppLayoutProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();

  // Fermer le drawer automatiquement lors d'un changement de page
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-app">
      {/* Sidebar desktop */}
      <Sidebar />

      {/* Topbar mobile */}
      <header className="pt-safe sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-white/10 bg-[#0b1220] px-4 text-slate-100 shadow-md lg:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Ouvrir le menu"
              className="text-slate-200 hover:bg-white/10 hover:text-white"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-[17rem] border-white/10 bg-[#0b1220] p-0 text-slate-100 sm:w-[18rem] [&>button]:text-slate-300 [&>button]:hover:text-white [&>button]:focus:ring-0"
          >
            <SheetHeader className="sr-only">
              <SheetTitle>Menu de navigation</SheetTitle>
            </SheetHeader>
            <div className="flex h-full flex-col overflow-hidden">
              <SidebarContent />
            </div>
          </SheetContent>
        </Sheet>

        <img src={logo} alt="Origami Tech" className="h-8 w-auto object-contain" />
        <span className="truncate text-sm font-semibold uppercase tracking-widest text-slate-300">
          Système de présence
        </span>
      </header>

      {/* Contenu principal */}
      <div className="px-safe flex-1 lg:ml-64">
        <main
          className={cn(
            "mx-auto w-full max-w-screen-2xl px-4 py-6 sm:px-6 sm:py-8 animate-fade-in-up",
            className
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
};
