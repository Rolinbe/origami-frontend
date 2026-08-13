import React from "react";
import { RefreshCw, Ban, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge as BadgeUI } from "@/components/ui/badge";
import { Badge } from "@/types/badge.types";

interface BadgeCardProps {
  badge: Badge;
  onView: (badge: Badge) => void;
  onRevoke: (badge: Badge) => void;
  onReactivate: (badge: Badge) => void;
  isSubmitting?: boolean;
}

export const BadgeCard: React.FC<BadgeCardProps> = ({
  badge,
  onView,
  onRevoke,
  onReactivate,
  isSubmitting = false,
}) => {
  const getStatusColor = (isActive: boolean): string => {
    return isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
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
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {badge.user?.profileImage ? (
              <img
                src={badge.user.profileImage}
                alt={`${badge.user.firstName} ${badge.user.lastName}`}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                {badge.user?.firstName?.[0]}
                {badge.user?.lastName?.[0]}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-lg">
                  {badge.user?.firstName} {badge.user?.lastName}
                </h3>
                <p className="text-sm text-gray-500">
                  {badge.user?.position || "N/A"}
                </p>
              </div>
              <BadgeUI className={getStatusColor(badge.isActive)}>
                {badge.isActive ? "Actif" : "Révoqué"}
              </BadgeUI>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">Badge ID:</span>
                <code className="px-2 py-1 bg-gray-100 rounded text-xs">
                  {badge.badgeId}
                </code>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">Service:</span>
                {badge.user?.service ? (
                  <BadgeUI
                    style={{
                      backgroundColor: badge.user.service.color,
                    }}
                    className="text-white"
                  >
                    {badge.user.service.name}
                  </BadgeUI>
                ) : (
                  <span className="text-gray-500">N/A</span>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">Type:</span>
                <BadgeUI
                  className={getTypeColor(badge.user?.employeeType || "")}
                >
                  {getTypeLabel(badge.user?.employeeType || "")}
                </BadgeUI>
              </div>

              <div className="text-xs text-gray-500">
                Créé le {new Date(badge.issuedAt).toLocaleDateString("fr-FR")}
                {badge.revokedAt && (
                  <span>
                    {" • Révoqué le "}
                    {new Date(badge.revokedAt).toLocaleDateString("fr-FR")}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onView(badge)}
                disabled={isSubmitting}
              >
                Voir détails
              </Button>

              {badge.isActive ? (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onRevoke(badge)}
                  disabled={isSubmitting}
                >
                  <Ban className="mr-1 h-3 w-3" />
                  Révoquer
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="bg-success hover:bg-success/90 text-white"
                  onClick={() => onReactivate(badge)}
                  disabled={isSubmitting}
                >
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Réactiver
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
