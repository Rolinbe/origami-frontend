import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { UserWithoutBadge } from "@/types/badge.types";
import badgeService from "@/services/badge.service";
import { Skeleton } from "@/components/ui/skeleton";

interface CreateBadgeModalProps {
  onClose: () => void;
  onSubmit: (userId: string) => void;
  isSubmitting?: boolean;
}

export const CreateBadgeModal: React.FC<CreateBadgeModalProps> = ({
  onClose,
  onSubmit,
  isSubmitting = false,
}) => {
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [users, setUsers] = useState<UserWithoutBadge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const usersData = await badgeService.getUsersWithoutBadge();
        setUsers(usersData);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des utilisateurs:",
          error
        );
        setError("Impossible de charger la liste des utilisateurs");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleSubmit = () => {
    if (selectedUser) {
      onSubmit(selectedUser);
    }
  };

  const getTypeColor = (type: string): string => {
    return type === "intern"
      ? "bg-blue-100 text-blue-800"
      : "bg-purple-100 text-purple-800";
  };

  const getTypeLabel = (type: string): string => {
    return type === "intern" ? "Stagiaire" : "Permanent";
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[80vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Créer un nouveau badge</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : error ? (
            <div className="text-center py-4">
              <p className="text-red-500 mb-4">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
              >
                Réessayer
              </Button>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500 mb-4">
                Tous les employés ont déjà un badge actif
              </p>
              <Button onClick={onClose} variant="outline">
                Fermer
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Sélectionner un employé
                </label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un employé..." />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center gap-2">
                          <span>
                            {user.firstName} {user.lastName}
                          </span>
                          {user.service && (
                            <Badge
                              style={{
                                backgroundColor: user.service.color,
                              }}
                              className="text-white text-xs"
                            >
                              {user.service.code}
                            </Badge>
                          )}
                          <Badge className={getTypeColor(user.employeeType)}>
                            {getTypeLabel(user.employeeType)}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  Seuls les employés sans badge actif sont affichés
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Annuler
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!selectedUser || isSubmitting}
                  className="flex-1 bg-[rgb(101,193,255)] hover:bg-[rgb(81,173,235)] text-white disabled:opacity-50"
                >
                  {isSubmitting ? "Création..." : "Créer le badge"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
