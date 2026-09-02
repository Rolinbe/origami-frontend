import { useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Camera, ImagePlus, KeyRound, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuthContext } from "@/store/AuthContext";
import authService from "@/services/auth.service";

const readAndCompressPhoto = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 360;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas indisponible"));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const ProfileSettings = () => {
  const { user, refreshUser } = useAuthContext();
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    position: user?.position || "",
    profileImage: user?.profileImage || "",
  });
  const [photoError, setPhotoError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("Image trop lourde (max 5 Mo)");
      return;
    }
    try {
      const dataUrl = await readAndCompressPhoto(file);
      setFormData((prev) => ({ ...prev, profileImage: dataUrl }));
      setPhotoError("");
    } catch {
      setPhotoError("Impossible de lire cette image");
    }
  };

  const removePhoto = () => {
    setFormData((prev) => ({ ...prev, profileImage: "" }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPhotoError("");

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error("Le prénom et le nom sont obligatoires");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("L'email est obligatoire");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
      toast.error("Adresse email invalide");
      return;
    }

    setIsSaving(true);
    try {
      await authService.updateProfile({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        position: formData.position.trim() || undefined,
        profileImage: formData.profileImage || undefined,
      });
      await refreshUser();
      toast.success("Profil mis à jour");
    } catch (error) {
      console.error("Erreur mise à jour profil:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!passwordData.oldPassword || !passwordData.newPassword) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error("Le nouveau mot de passe doit contenir au moins 6 caractères");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Les nouveaux mots de passe ne correspondent pas");
      return;
    }

    setIsChangingPassword(true);
    try {
      await authService.changePassword(passwordData.oldPassword, passwordData.newPassword);
      toast.success("Mot de passe modifié avec succès");
      setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      console.error("Erreur changement mot de passe:", error);
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Informations personnelles</CardTitle>
          <CardDescription>
            Ces informations sont affichées sur votre badge et lors du pointage.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-muted bg-muted">
                  {formData.profileImage ? (
                    <img
                      src={formData.profileImage}
                      alt="Photo de profil"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary to-purple-500 text-xl font-bold text-white">
                      {formData.firstName?.[0]}
                      {formData.lastName?.[0]}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  title="Changer la photo"
                  className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white shadow-md transition-colors hover:bg-primary/90"
                >
                  <Camera className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => photoInputRef.current?.click()}
                  >
                    <ImagePlus className="mr-2 h-4 w-4" />
                    {formData.profileImage ? "Changer la photo" : "Ajouter une photo"}
                  </Button>
                  {formData.profileImage && (
                    <Button type="button" variant="ghost" size="sm" onClick={removePhoto}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                      Retirer
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Format JPG/PNG · max 5 Mo</p>
                {photoError && <p className="text-sm text-red-500">{photoError}</p>}
              </div>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Prénom</Label>
                <Input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Votre prénom"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Nom</Label>
                <Input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Votre nom"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Votre adresse email"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  C'est votre identifiant de connexion. Après modification, utilisez le nouvel
                  email pour vous connecter.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Téléphone</Label>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Votre téléphone"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Poste</Label>
                <Input
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  placeholder="Votre poste / fonction"
                />
              </div>
            </div>

            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Enregistrement…" : "Enregistrer les modifications"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            Changer le mot de passe
          </CardTitle>
          <CardDescription>
            Vous pouvez réinitialiser votre mot de passe à tout moment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handlePasswordChange}>
            <div className="space-y-2">
              <Label>Mot de passe actuel</Label>
              <Input
                type="password"
                autoComplete="new-password"
                value={passwordData.oldPassword}
                onChange={(e) => {
                  const value = e.currentTarget.value;
                  setPasswordData((prev) => ({ ...prev, oldPassword: value }));
                }}
                placeholder="Votre mot de passe actuel"
                required
              />
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Nouveau mot de passe</Label>
                <Input
                  type="password"
                  autoComplete="new-password"
                  value={passwordData.newPassword}
                  onChange={(e) => {
                    const value = e.currentTarget.value;
                    setPasswordData((prev) => ({ ...prev, newPassword: value }));
                  }}
                  placeholder="Au moins 6 caractères"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Confirmer le nouveau mot de passe</Label>
                <Input
                  type="password"
                  autoComplete="new-password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => {
                    const value = e.currentTarget.value;
                    setPasswordData((prev) => ({ ...prev, confirmPassword: value }));
                  }}
                  placeholder="Confirmez le nouveau mot de passe"
                  required
                />
              </div>
            </div>
            <Button type="submit" variant="outline" disabled={isChangingPassword}>
              {isChangingPassword ? "Modification…" : "Réinitialiser mon mot de passe"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
};