import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-app p-6">
      <div className="w-full max-w-md text-center animate-fade-in-up">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
          <Compass className="h-10 w-10 text-primary" />
        </div>
        <h1 className="mb-3 text-6xl font-extrabold tracking-tight text-foreground">404</h1>
        <p className="mb-2 text-xl font-semibold text-foreground">Page introuvable</p>
        <p className="mb-8 text-sm text-muted-foreground">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link to="/dashboard">Retour au tableau de bord</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;