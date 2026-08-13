import React from "react";
import { Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge as BadgeUI } from "@/components/ui/badge";
import { Badge } from "@/types/badge.types";
import { formatDateFr } from "@/utils/dateFormat";

interface BadgeDetailModalProps {
  badge: Badge | null;
  onClose: () => void;
}

export const BadgeDetailModal: React.FC<BadgeDetailModalProps> = ({
  badge,
  onClose,
}) => {
  if (!badge) return null;

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = badge.qrCodeImage;
    link.download = `badge-${badge.badgeId}.png`;
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Détails du Badge</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* QR Code */}
          <div className="flex flex-col items-center p-6 bg-gray-50 rounded-lg">
            <img
              src={badge.qrCodeImage}
              alt="QR Code"
              className="w-64 h-64 border-4 border-white shadow-lg"
            />
            <p className="mt-4 text-sm text-gray-600">
              Scannez ce code pour vérifier l'identité
            </p>
          </div>

          {/* Informations Badge */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Informations du Badge</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Badge ID</p>
                <p className="font-medium">{badge.badgeId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Statut</p>
                <BadgeUI
                  className={
                    badge.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }
                >
                  {badge.isActive ? "Actif" : "Révoqué"}
                </BadgeUI>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date d'émission</p>
                <p className="font-medium">
                  {formatDateFr(badge.issuedAt)}
                </p>
              </div>
              {!badge.isActive && badge.revokedAt && (
                <div>
                  <p className="text-sm text-gray-500">Date de révocation</p>
                  <p className="font-medium">
                    {formatDateFr(badge.revokedAt)}
                  </p>
                </div>
              )}
            </div>

            {!badge.isActive && badge.revokedReason && (
              <div>
                <p className="text-sm text-gray-500">Raison de révocation</p>
                <p className="font-medium text-red-600">
                  {badge.revokedReason}
                </p>
              </div>
            )}
          </div>

          {/* Informations Employé */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Informations de l'Employé</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Nom complet</p>
                <p className="font-medium">
                  {badge.user.firstName} {badge.user.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{badge.user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Téléphone</p>
                <p className="font-medium">{badge.user.phone || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Poste</p>
                <p className="font-medium">{badge.user.position || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Service</p>
                <BadgeUI
                  style={{
                    backgroundColor: badge.user.service?.color || "#3B82F6",
                  }}
                  className="text-white"
                >
                  {badge.user.service?.name || "N/A"}
                </BadgeUI>
              </div>
              <div>
                <p className="text-sm text-gray-500">Type d'employé</p>
                <BadgeUI
                  className={
                    badge.user.employeeType === "intern"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-purple-100 text-purple-800"
                  }
                >
                  {badge.user.employeeType === "intern"
                    ? "Stagiaire"
                    : "Permanent"}
                </BadgeUI>
              </div>
              {badge.user.contractStartDate && (
                <div>
                  <p className="text-sm text-gray-500">Début de contrat</p>
                  <p className="font-medium">
                    {formatDateFr(badge.user.contractStartDate)}
                  </p>
                </div>
              )}
              {badge.user.contractEndDate && (
                <div>
                  <p className="text-sm text-gray-500">Fin de contrat</p>
                  <p className="font-medium">
                    {formatDateFr(badge.user.contractEndDate)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Button
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4 mr-2" />
              Télécharger le QR Code
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
