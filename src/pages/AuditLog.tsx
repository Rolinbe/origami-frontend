import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Shield,
  Search,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  UserMinus,
  Pencil,
  Trash2,
  LogIn,
  LogOut,
  KeyRound,
  QrCode,
  Download,
  Upload,
  RefreshCcw,
  BadgeCheck,
  BadgeX,
  Badge,
  PartyPopper,
  CalendarOff,
  Settings,
  Clock,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import auditLogService, { AuditLogEntry } from "@/services/audit.service";
import { LoadingBar } from "@/components/LoadingBar";

const ACTION_CONFIG: Record<
  string,
  { label: string; icon: React.ElementType; color: string; bgColor: string }
> = {
  create: {
    label: "Création",
    icon: UserPlus,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/40",
  },
  update: {
    label: "Modification",
    icon: Pencil,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/40",
  },
  delete: {
    label: "Suppression",
    icon: Trash2,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-950/40",
  },
  login: {
    label: "Connexion",
    icon: LogIn,
    color: "text-violet-600 dark:text-violet-400",
    bgColor: "bg-violet-50 dark:bg-violet-950/40",
  },
  logout: {
    label: "Déconnexion",
    icon: LogOut,
    color: "text-slate-600 dark:text-slate-400",
    bgColor: "bg-slate-50 dark:bg-slate-800/40",
  },
  activate: {
    label: "Activation",
    icon: UserPlus,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/40",
  },
  deactivate: {
    label: "Désactivation",
    icon: UserMinus,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950/40",
  },
  revoke: {
    label: "Révocation",
    icon: BadgeX,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-950/40",
  },
  restore: {
    label: "Restauration",
    icon: BadgeCheck,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/40",
  },
  import: {
    label: "Import",
    icon: Upload,
    color: "text-cyan-600 dark:text-cyan-400",
    bgColor: "bg-cyan-50 dark:bg-cyan-950/40",
  },
  export: {
    label: "Export",
    icon: Download,
    color: "text-cyan-600 dark:text-cyan-400",
    bgColor: "bg-cyan-50 dark:bg-cyan-950/40",
  },
  reset: {
    label: "Réinitialisation",
    icon: RefreshCcw,
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-950/40",
  },
  correct: {
    label: "Correction",
    icon: Pencil,
    color: "text-pink-600 dark:text-pink-400",
    bgColor: "bg-pink-50 dark:bg-pink-950/40",
  },
};

const ENTITY_LABELS: Record<string, string> = {
  employee: "Employé",
  badge: "Badge",
  service: "Département",
  holiday: "Jour férié",
  leave: "Congé",
  setting: "Paramètres",
  attendance: "Pointage",
  auth: "Authentification",
  scan: "Scan",
  report: "Rapport",
};

const AuditLogPage = () => {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState<string>("");
  const [entityFilter, setEntityFilter] = useState<string>("");
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const limit = 30;

  const { data, isLoading } = useQuery({
    queryKey: ["audit-logs", page, actionFilter, entityFilter, search, startDate, endDate],
    queryFn: () =>
      auditLogService.getAuditLogs({
        page,
        limit,
        action: actionFilter || undefined,
        entity: entityFilter || undefined,
        search: search.trim() || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      }),
  });

  const logs = data?.logs ?? [];
  const pagination = data?.pagination;

  const formatDateTime = (d: string) => {
    try {
      return format(new Date(d), "dd MMM yyyy à HH:mm", { locale: fr });
    } catch {
      return d;
    }
  };

  const describeDetails = (entry: AuditLogEntry): string | null => {
    const d = entry.details;
    if (!d || typeof d !== "object") return null;

    if (entry.action === "login" && d.email) return `Email : ${d.email}`;
    if (entry.action === "update" && d.field) return `Champ : ${d.field}`;
    if (entry.action === "import" && d.imported != null)
      return `${d.imported} importé(s), ${d.failed ?? 0} échec(s)`;
    if (entry.action === "revoke" && d.reason) return `Motif : ${d.reason}`;
    if (entry.action === "create" && d.firstName && d.lastName)
      return `${d.firstName} ${d.lastName}`;
    if (entry.entity === "setting" && entry.action === "update") {
      const keys = Object.keys(d).filter((k) => k !== "field");
      if (keys.length > 0) return keys.join(", ");
    }
    return null;
  };

  return (
    <AppLayout>
      <PageHeader
        icon={Shield}
        title="Journal d'audit"
        description="Traçabilité de toutes les actions effectuées par les administrateurs."
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label className="text-xs">Action</Label>
              <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v === "_all" ? "" : v); setPage(1); }}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Toutes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">Toutes les actions</SelectItem>
                  {Object.entries(ACTION_CONFIG).map(([key, cfg]) => (
                    <SelectItem key={key} value={key}>
                      {cfg.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Entité</Label>
              <Select value={entityFilter} onValueChange={(v) => { setEntityFilter(v === "_all" ? "" : v); setPage(1); }}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Toutes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">Toutes les entités</SelectItem>
                  {Object.entries(ENTITY_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Du</Label>
              <Input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(1); }} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Au</Label>
              <Input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(1); }} className="mt-1" />
            </div>
          </div>
          <div className="mt-3">
            <div className="relative max-w-xs">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Rechercher..."
                className="pl-8"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base">
            <span>Actions enregistrées</span>
            {pagination && (
              <span className="text-xs font-normal text-muted-foreground">
                {pagination.total} au total
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingBar isLoading={isLoading} />

          {logs.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Aucune action enregistrée.
            </p>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => {
                const cfg = ACTION_CONFIG[log.action] ?? {
                  label: log.action,
                  icon: Pencil,
                  color: "text-muted-foreground",
                  bgColor: "bg-muted",
                };
                const Icon = cfg.icon;
                const detail = describeDetails(log);
                const entityLabel = ENTITY_LABELS[log.entity] ?? log.entity;

                return (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-accent/50"
                  >
                    <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${cfg.bgColor}`}>
                      <Icon className={`h-4 w-4 ${cfg.color}`} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm">
                        <span className={`font-medium ${cfg.color}`}>{cfg.label}</span>
                        <span className="mx-1 text-muted-foreground">·</span>
                        <span className="font-medium">{entityLabel}</span>
                        {log.entityId && (
                          <span className="ml-1 font-mono text-xs text-muted-foreground">
                            {log.entityId.length > 12
                              ? log.entityId.slice(0, 12) + "…"
                              : log.entityId}
                          </span>
                        )}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatDateTime(log.createdAt)}
                        {log.user && (
                          <>
                            {" "}
                            par{" "}
                            <span className="font-medium text-foreground">
                              {log.user.firstName} {log.user.lastName}
                            </span>
                          </>
                        )}
                        {!log.user && (
                          <> · <span className="italic">système</span></>
                        )}
                        {log.ipAddress && (
                          <> · <span className="font-mono text-[10px]">{log.ipAddress}</span></>
                        )}
                      </p>
                      {detail && (
                        <p className="mt-1 rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                          {detail}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {pagination && pagination.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Page {pagination.page} / {pagination.totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default AuditLogPage;
