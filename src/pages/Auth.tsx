import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";

const Auth = () => {
  const [currentImage, setCurrentImage] = useState(0);
  
  // Images de démonstration - remplacez par vos vraies images
  const images = [
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=1000&fit=crop"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex">
      {/* Section gauche - Carrousel d'images */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gray-900">
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
            <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-black/20" />
          </div>
        ))}
        
        {/* Indicateurs de pagination */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImage(index)}
              className={`h-1.5 rounded-full transition-all ${
                index === currentImage 
                  ? "w-8 bg-white" 
                  : "w-1.5 bg-white/50 hover:bg-white/75"
              }`}
              aria-label={`Aller à l'image ${index + 1}`}
            />
          ))}
        </div>

        {/* Citation ou texte d'accompagnement */}
        {/* <div className="absolute bottom-20 left-8 right-8 z-10">
          <p className="text-white text-lg font-light leading-relaxed">
            "Simplifiez la gestion des présences de votre entreprise avec notre système intuitif et moderne"
          </p>
        </div> */}
      </div>

      {/* Section droite - Formulaire */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Logo et titre */}
          <div className="flex flex-col items-center text-center">
            <div className="w-64 h-40 flex items-center justify-center">
              <img 
                src="./src/assets/icons/logo.png" 
                className="w-full h-full object-contain" 
                alt="Logo Origami Tech"
              />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900">Système de gestion Origami Tech</h1>
          </div>

          {/* Formulaire */}
          <Card className="border-0 shadow-none">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-2xl font-semibold">Connexion</CardTitle>
              <CardDescription>
                Connectez-vous pour accéder à votre espace
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-0">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Adresse email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre.email@entreprise.com"
                  className="h-11 border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Mot de passe
                  </Label>
                  <button 
                    type="button"
                    className="text-xs text-gray-600 hover:text-gray-900 font-medium"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  className="h-11 border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                />
              </div>
            </CardContent>
            <CardFooter className="px-0 pt-2 flex-col gap-4">
              <Button 
                onClick={(e) => e.preventDefault()}
                className="w-full h-11 bg-gray-900 hover:bg-gray-800 text-white font-medium"
              > 
                Se connecter
              </Button>
              <p className="text-xs text-center text-gray-500">
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