import React from "react";
import { Ban, CheckCircle, Printer } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge as BadgeUI } from "@/components/ui/badge";
import { Badge } from "@/types/badge.types";
import { formatDateFr } from "@/utils/dateFormat";

interface BadgeCardProps {
  badge: Badge;
  onView: (badge: Badge) => void;
  onRevoke: (badge: Badge) => void;
  onReactivate: (badge: Badge) => void;
  onPrint?: (badge: Badge) => void;
  isSubmitting?: boolean;
}

const FALLBACK_COLOR = "#6366f1";

const hexToRgba = (hex: string, alpha: number): string => {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const num = parseInt(full, 16);
  if (Number.isNaN(num)) return FALLBACK_COLOR + Math.round(alpha * 255).toString(16).padStart(2, "0");
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const getTypeLabel = (type: string): string => {
  return type === "intern" ? "Stagiaire" : "Permanent";
};

export const BadgeCard: React.FC<BadgeCardProps> = ({
  badge,
  onView,
  onRevoke,
  onReactivate,
  onPrint,
  isSubmitting = false,
}) => {
  const serviceColor = badge.user?.service?.color || FALLBACK_COLOR;
  const initials = `${badge.user?.firstName?.[0] ?? ""}${badge.user?.lastName?.[0] ?? ""}`;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Bande d'en-tête en dégradé (couleur du service) */}
      <div
        className="relative h-20"
        style={{
          background: `linear-gradient(135deg, ${serviceColor}, ${hexToRgba(serviceColor, 0.72)})`,
        }}
      >
        <div className="absolute -right-6 -top-8 h-24 w-24 rounded-full border-2 border-white/25" />
        <div className="absolute -left-4 bottom-0 h-16 w-16 rounded-full border-2 border-white/20" />
        <div className="absolute left-4 bottom-2 text-white/90">
          <p className="text-lg font-bold leading-none tracking-wide">ORIGAMI</p>
          <p className="text-[10px] uppercase tracking-[0.2em] opacity-85">
            Badge d&apos;accès
          </p>
        </div>
        <div className="absolute right-4 top-4">
          <BadgeUI
            className={
              badge.isActive
                ? "bg-white/20 text-white border-white/40 backdrop-blur-sm"
                : "bg-red-500/90 text-white border-red-600"
            }
          >
            <span className={`inline-block h-1.5 w-1.5 rounded-full mr-1 ${badge.isActive ? "bg-emerald-300" : "bg-white"}`} />
            {badge.isActive ? "Actif" : "Révoqué"}
          </BadgeUI>
        </div>
      </div>

      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          {/* Avatar avec anneau */}
          <div className="relative flex-shrink-0">
            <div
              className="h-16 w-16 rounded-full"
              style={{ boxShadow: `0 0 0 4px #fff, 0 0 0 5px ${hexToRgba(serviceColor, 0.35)}` }}
            >
              {badge.user?.profileImage ? (
                <img
                  src={badge.user.profileImage}
                  alt={`${badge.user.firstName} ${badge.user.lastName}`}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center rounded-full text-xl font-bold text-white"
                  style={{
                    background: `linear-gradient(135deg, ${serviceColor}, ${hexToRgba(serviceColor, 0.72)})`,
                  }}
                >
                  {initials}
                </div>
              )}
            </div>
            <span
              className={`absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-white ${
                badge.isActive ? "bg-emerald-500" : "bg-red-500"
              }`}
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg leading-tight">
              {badge.user?.firstName} {badge.user?.lastName}
            </h3>
            <p className="text-sm text-gray-500 truncate">
              {badge.user?.position || "N/A"}
            </p>

            <div className="mt-2 flex flex-wrap gap-2">
              <BadgeUI
                style={{ backgroundColor: serviceColor }}
                className="text-white border-transparent"
              >
                {badge.user?.service?.name || "N/A"}
              </BadgeUI>
              <BadgeUI
                className={
                  badge.user?.employeeType === "intern"
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : "bg-indigo-50 text-indigo-700 border-indigo-200"
                }
              >
                {getTypeLabel(badge.user?.employeeType || "")}
              </BadgeUI>
            </div>
          </div>
        </div>

        {/* QR + ID */}
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
          {badge.qrCodeImage ? (
            <img
              src={badge.qrCodeImage}
              alt="QR code"
              className="h-16 w-16 flex-shrink-0 rounded-lg bg-white p-0.5"
            />
          ) : (
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-white text-[9px] text-gray-400">
              QR
            </div>
          )}
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wide text-gray-400">
              Badge ID
            </p>
            <code className="block truncate rounded bg-white px-2 py-1 font-mono text-xs font-semibold text-slate-700">
              {badge.badgeId}
            </code>
            <p className="mt-1 text-xs text-gray-500">
              Créé le {formatDateFr(badge.issuedAt)}
              {badge.revokedAt && (
                <span>
                  {" • Révoqué le "}
                  {formatDateFr(badge.revokedAt)}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onView(badge)}
            disabled={isSubmitting}
          >
            Voir détails
          </Button>

          {onPrint && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onPrint(badge)}
              disabled={isSubmitting}
            >
              <Printer className="mr-1 h-3 w-3" />
              Imprimer
            </Button>
          )}

          {badge.isActive ? (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onRevoke(badge)}
              disabled={isSubmitting}
              className="ml-auto"
            >
              <Ban className="mr-1 h-3 w-3" />
              Révoquer
            </Button>
          ) : (
            <Button
              size="sm"
              className="bg-success hover:bg-success/90 text-white ml-auto"
              onClick={() => onReactivate(badge)}
              disabled={isSubmitting}
            >
              <CheckCircle className="mr-1 h-3 w-3" />
              Réactiver
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
