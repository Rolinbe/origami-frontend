import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  differenceInMinutes,
  differenceInCalendarDays,
  format,
  isSameDay,
  parse,
  parseISO,
} from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useAttendanceSettings } from "@/contexts/AttendanceSettingsContext";
import apiService from "@/services/api.service";

const ITEMS_PER_PAGE = 5;

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

interface AttendanceRow {
  id: string;
  scanTime: string;
  scanType: ScanType;
  isLate: boolean;
  lateMinutes: number;
  fullName: string;
  service: string;
}

const parseTimeForDate = (time: string, baseDate: Date) => {
  const [hour = "0", minute = "0"] = time.split(":");
  const result = new Date(baseDate);
  result.setHours(Number(hour), Number(minute), 0, 0);
  return result;
};

const isWithinRange = (value: Date, start: Date, end: Date) => {
  return value >= start && value <= end;
};

const fetchAttendanceHistory = async (): Promise<ScanHistoryItem[]> => {
  const response = await apiService.get<{ scanLogs?: ScanHistoryItem[] }>(
    "/scan/history?limit=200"
  );
  return response.data.scanLogs ?? [];
};

const AttendanceList = () => {
  const { settings } = useAttendanceSettings();
  const [currentPage, setCurrentPage] = useState(1);
  const {
    data: scanLogs = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["dashboard-attendance-history"],
    queryFn: fetchAttendanceHistory,
    refetchInterval: 60_000,
  });

  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());

  const processedRows: AttendanceRow[] = useMemo(() => {
    return scanLogs
      .filter((log) => isSameDay(parseISO(log.scanTime), selectedDate))
      .filter((log) => log.user?.employeeType !== "intern")
      .map((log) => {
        const date = parseISO(log.scanTime);

        const morningStart = parseTimeForDate(settings.morningStart, date);
        const morningEnd = parseTimeForDate(settings.morningEnd, date);
        const afternoonStart = parseTimeForDate(settings.afternoonStart, date);
        const afternoonEnd = parseTimeForDate(settings.afternoonEnd, date);

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
        const isLate = log.scanType === "check_in" && diffMinutes > 15;
        const lateMinutes = isLate ? diffMinutes : 0;

        const fullName =
          log.user && (log.user.firstName || log.user.lastName)
            ? `${log.user.firstName ?? ""} ${log.user.lastName ?? ""}`.trim()
            : "Employé inconnu";
        const service = log.user?.service?.name ?? log.user?.role ?? "Service inconnu";

        return {
          id: log.id,
          scanTime: log.scanTime,
          scanType: log.scanType,
          isLate,
          lateMinutes,
          fullName,
          service,
        };
      });
  }, [scanLogs, selectedDate, settings]);

  const totalPages = Math.max(1, Math.ceil(processedRows.length / ITEMS_PER_PAGE));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedDate,
    settings.morningStart,
    settings.morningEnd,
    settings.afternoonStart,
    settings.afternoonEnd,
  ]);

  const formattedSelectedDate = useMemo(
    () => format(selectedDate, "yyyy-MM-dd"),
    [selectedDate]
  );

  const handleDateChange = (value: string) => {
    if (!value) return;
    const parsedDate = parse(value, "yyyy-MM-dd", new Date());
    if (!Number.isNaN(parsedDate.getTime())) {
      setSelectedDate(parsedDate);
    }
  };

  const dayLabel = useMemo(() => {
    const diff = differenceInCalendarDays(selectedDate, new Date());
    if (diff === 0) return "aujourd'hui";
    if (diff === -1) return "hier";
    if (diff === -2) return "avant-hier";
    if (diff === 1) return "demain";
    return `du ${format(selectedDate, "dd/MM/yyyy")}`;
  }, [selectedDate]);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentRows = processedRows.slice(startIndex, endIndex);

  const getStatusBadge = (row: AttendanceRow) => {
    if (row.scanType === "check_out") {
      return <Badge className="bg-primary/10 text-primary hover:bg-primary/10">Sortie</Badge>;
    }
    if (row.isLate) {
      return <Badge variant="destructive">En retard</Badge>;
    }
    return <Badge className="bg-success/10 text-success hover:bg-success/10">Entrée</Badge>;
  };

  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <Card className="h-full flex flex-col transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-lift">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <CardTitle>Pointages {dayLabel}</CardTitle>
            <CardDescription>
              {processedRows.length} pointage(s) enregistré(s) • Page {currentPage}/{totalPages}
            </CardDescription>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="date"
                value={formattedSelectedDate}
                onChange={(event) => handleDateChange(event.currentTarget.value)}
                className="pl-9"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading || isFetching}
              className="flex items-center gap-2"
            >
              Actualiser
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <div className="flex-1 overflow-y-auto max-h-80 px-6 pb-4">
          <div className="space-y-3">
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
              Array.from({ length: ITEMS_PER_PAGE }).map((_, idx) => (
                <div
                  key={`skeleton-${idx}`}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card animate-pulse"
                >
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-2/3" />
                    <div className="h-3 bg-muted rounded w-1/3" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-4 bg-muted rounded w-16" />
                    <div className="h-6 bg-muted rounded w-20" />
                  </div>
                </div>
              ))
            ) : currentRows.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Aucun pointage pour aujourd'hui.
              </div>
            ) : (
              currentRows.map((row) => (
                <div
                  key={row.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div className="flex-1">
                    <p className="font-medium">{row.fullName}</p>
                    <p className="text-sm text-muted-foreground">{row.service}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {new Date(row.scanTime).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      {row.isLate && (
                        <p className="text-xs text-destructive">+{row.lateMinutes} min</p>
                      )}
                    </div>
                    {getStatusBadge(row)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t bg-muted/20 px-6 py-3">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={currentPage === 1 || isLoading || isFetching}
                className="flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Précédent
              </Button>
              
              <span className="text-sm text-muted-foreground">
                Page {currentPage} sur {totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                disabled={currentPage === totalPages || isLoading || isFetching}
                className="flex items-center gap-1"
              >
                Suivant
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AttendanceList;