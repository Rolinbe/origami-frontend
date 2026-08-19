import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { differenceInMinutes, isSameDay, parseISO } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useAttendanceSettings } from "@/contexts/AttendanceSettingsContext";
import apiService from "@/services/api.service";
import { formatTimeFr } from "@/utils/dateFormat";

type ScanType = "check_in" | "check_out";

interface ScanHistoryItem {
  id: string;
  badgeId: string;
  scanTime: string;
  scanType: ScanType;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    role?: string;
    employeeType?: string;
    service?: {
      name: string;
    } | null;
  } | null;
}

interface LateEmployeeRow {
  id: string;
  fullName: string;
  service: string;
  scanTime: string;
  lateMinutes: number;
}

const fetchAttendanceHistory = async (): Promise<ScanHistoryItem[]> => {
  const response = await apiService.get<{ scanLogs?: ScanHistoryItem[] }>(
    "/scan/history?limit=200"
  );
  return response.data.scanLogs ?? [];
};

const parseTimeForDate = (time: string, baseDate: Date) => {
  const [hour = "0", minute = "0"] = time.split(":");
  const result = new Date(baseDate);
  result.setHours(Number(hour), Number(minute), 0, 0);
  return result;
};

const isWithinRange = (value: Date, start: Date, end: Date) => {
  return value >= start && value <= end;
};

const LateEmployees = () => {
  const { settings } = useAttendanceSettings();
  const {
    data: scanLogs = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["dashboard-late-employees"],
    queryFn: fetchAttendanceHistory,
    refetchInterval: 60_000,
  });

  const today = useMemo(() => new Date(), []);

  const lateEmployees: LateEmployeeRow[] = useMemo(() => {
    const morningStart = parseTimeForDate(settings.morningStart, today);
    const morningEnd = parseTimeForDate(settings.morningEnd, today);
    const afternoonStart = parseTimeForDate(settings.afternoonStart, today);
    const afternoonEnd = parseTimeForDate(settings.afternoonEnd, today);

    return scanLogs
      .filter((log) => isSameDay(parseISO(log.scanTime), today))
      .filter((log) => log.scanType === "check_in")
      .filter((log) => log.user?.employeeType !== "intern")
      .map((log) => {
        const date = parseISO(log.scanTime);

        let referenceStart = morningStart;
        if (isWithinRange(date, morningStart, morningEnd)) {
          referenceStart = morningStart;
        } else if (isWithinRange(date, afternoonStart, afternoonEnd)) {
          referenceStart = afternoonStart;
        } else if (date < morningStart) {
          referenceStart = morningStart;
        } else if (date > morningEnd && date < afternoonStart) {
          referenceStart = afternoonStart;
        } else if (date >= afternoonEnd) {
          referenceStart = afternoonStart;
        }

        const diffMinutes = Math.max(differenceInMinutes(date, referenceStart), 0);
        if (diffMinutes <= 15) return null;

        const fullName =
          log.user && (log.user.firstName || log.user.lastName)
            ? `${log.user.firstName ?? ""} ${log.user.lastName ?? ""}`.trim()
            : "Employé inconnu";
        const service = log.user?.service?.name ?? log.user?.role ?? "Service inconnu";

        return {
          id: log.id,
          fullName,
          service,
          scanTime: log.scanTime,
          lateMinutes: diffMinutes,
        };
      })
      .filter((row): row is LateEmployeeRow => row !== null)
      .sort((a, b) => b.lateMinutes - a.lateMinutes);
  }, [scanLogs, settings, today]);

  return (
    <Card className="transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-lift">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-warning" />
              Retardataires
            </CardTitle>
            <CardDescription>
              {isLoading
                ? "Chargement…"
                : isError
                  ? "Erreur de chargement"
                  : `${lateEmployees.length} retardataire(s) aujourd'hui`}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch().then(() => toast.success("Données actualisées"))}
            disabled={isLoading || isFetching}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {isError ? (
            <div className="p-4 rounded-lg border border-destructive/40 bg-destructive/10 text-sm text-destructive">
              {(error as Error)?.message ?? "Une erreur est survenue lors du chargement."}
              <div className="mt-3">
                <Button size="sm" variant="outline" onClick={() => refetch()}>
                  Réessayer
                </Button>
              </div>
            </div>
          ) : isLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`late-skeleton-${index}`}
                className="flex items-center justify-between p-3 rounded-lg border bg-card animate-pulse"
              >
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-2/3" />
                  <div className="h-3 bg-muted rounded w-1/3" />
                </div>
                <div className="h-6 bg-muted rounded w-20" />
              </div>
            ))
          ) : lateEmployees.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Aucun retard enregistré aujourd'hui.
            </div>
          ) : (
            lateEmployees.map((employee) => (
              <div
                key={employee.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{employee.fullName}</p>
                  <p className="text-sm text-muted-foreground truncate">{employee.service}</p>
                </div>
                <div className="text-right shrink-0">
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    +{employee.lateMinutes} min
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    Pointé à {formatTimeFr(employee.scanTime)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LateEmployees;