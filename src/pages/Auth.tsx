import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { useState, useEffect } from "react";
import {
  Eye,
  EyeOff,
  Loader2,
  Clock,
  Fingerprint,
  UserRound,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Icons } from "@/utils/icon";

const Auth = () => {
  const [currentImage, setCurrentImage] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Rediriger si déjà connecté
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  // Images de démonstration - remplacez par vos vraies images
  const images = [
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=1000&fit=crop",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images.length]);

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    setLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error(error.message || "Erreur lors de la connexion");
      } else {
        toast.success("Connexion réussie");
        // La navigation se fait automatiquement dans le hook useAuth
      }
    } catch (error) {
      const errorMessage =
        (error as { message?: string }).message || "Erreur lors de la connexion";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: Fingerprint, label: "Pointage par badge" },
    { icon: Clock, label: "Suivi des présences" },
    { icon: UserRound, label: "Gestion des équipes" },
  ];

  return (
    <div className="min-h-screen flex bg-app">
      {/* Section gauche - Carrousel d'images */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-950">
        {images.map((img, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentImage ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={img}
              alt={`Slide ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/70 via-slate-950/60 to-slate-950/80" />

        {/* Contenu de marque */}
        <div className="relative z-10 flex w-full flex-col justify-between p-12">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md ring-1 ring-white/20">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-lg font-semibold text-white">Origami Tech</p>
              <p className="text-xs font-medium uppercase tracking-widest text-white/60">
                Gestion des pointages
              </p>
            </div>
          </div>

          <div className="space-y-8">
            <h2 className="text-4xl font-bold leading-tight text-white">
              Simplifiez la gestion des
              <span className="block text-primary-foreground/90">présences de votre entreprise</span>
            </h2>
            <p className="max-w-md text-base leading-relaxed text-white/70">
              Un système intuitif et moderne pour suivre les pointages, gérer
              les employés et générer des rapports en temps réel.
            </p>

            <div className="flex flex-wrap gap-3">
              {features.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-md ring-1 ring-white/15"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Indicateurs de pagination */}
        <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImage(index)}
              className={`h-1.5 rounded-full transition-all ${
                index === currentImage
                  ? "w-8 bg-white"
                  : "w-1.5 bg-white/40 hover:bg-white/70"
              }`}
              aria-label={`Aller à l'image ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Section droite - Formulaire */}
      <div className="flex w-full items-center justify-center p-6 lg:w-1/2 lg:p-8">
        <div className="w-full max-w-md space-y-8 animate-fade-in-up">
          {/* Logo et titre */}
          <div className="flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
              <img
                src={Icons.logo}
                className="h-12 w-12 object-contain"
                alt="Logo Origami Tech"
              />
            </div>
            <h1 className="mt-5 text-2xl font-bold text-foreground">
              Bienvenue chez Origami Tech
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Connectez-vous pour accéder à votre espace
            </p>
          </div>

          {/* Formulaire */}
          <Card className="border-0 bg-card/80 shadow-soft backdrop-blur-sm">
            <CardContent className="space-y-5 px-6 py-8">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">
                  Adresse email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="origami@tech.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="h-11 focus-visible:ring-primary focus-visible:ring-offset-0"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !loading) {
                      handleLogin();
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium text-foreground"
                  >
                    Mot de passe
                  </Label>
                  <button
                    type="button"
                    className="text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="h-11 pr-11 focus-visible:ring-primary focus-visible:ring-offset-0"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !loading) {
                        handleLogin();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    disabled={loading}
                    className="absolute inset-y-0 right-3 flex items-center text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-4 px-6 pb-8 pt-0">
              <Button
                onClick={handleLogin}
                disabled={loading || !email || !password}
                className="h-11 w-full bg-primary text-primary-foreground font-medium transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connexion...
                  </>
                ) : (
                  "Se connecter"
                )}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                En vous connectant, vous acceptez nos conditions d'utilisation
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;