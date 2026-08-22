import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, parse, parseISO, eachDayOfInterval, startOfDay, differenceInMinutes } from "date-fns";
import { RefreshCw, FileBarChart2, CalendarX, Clock, Users, UserX, FileText, FileSpreadsheet, FileDown } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import InternsList from "@/components/dashboard/InternsList";
import { useAttendanceSettings } from "@/contexts/AttendanceSettingsContext";
import employeeService from "@/services/employee.service";
import apiService from "@/services/api.service";
import { downloadFile } from "@/utils/download";
import { toast } from "sonner";
import { Employee, EmployeeListResponse } from "@/types/employee.types";

type ScanType = "check_in" | "check_out";

interface ScanHistoryItem {
  id: string;
  badgeId: string;
  scanTime: string;
  scanType: ScanType;
  user: {
    id: string;
    firstName?: string;
    lastName?: string;
    employeeType?: string;
    service?: {
      name: string;
    } | null;
  } | null;
}

interface ReportFilters {
  date: string;
  startDate: string;
  endDate: string;
  search: string;
}

interface AbsenceRow {
  id: string;
  employeeId: string;
  fullName: string;
  serviceName: string;
  employeeType: string;
  date: string;
}

interface LateRow {
  id: string;
  employeeId: string;
  fullName: string;
  serviceName: string;
  employeeType: string;
  date: string;
  timeLabel: string;
  lateMinutes: number;
}

const EMPLOYEE_FETCH_LIMIT = 500;
const SCAN_HISTORY_LIMIT = 500;
const LATE_THRESHOLD_MINUTES = 15;

const initialFilters: ReportFilters = {
  date: "",
  startDate: "",
  endDate: "",
  search: "",
};

const parseFilterDate = (value?: string) => {
  if (!value) return null;
  const parsed = parse(value, "yyyy-MM-dd", new Date());
  return Number.isNaN(parsed.getTime()) ? null : startOfDay(parsed);
};

const formatDateLabel = (value: string) => {
  if (!value) return "—";
  const parsed = parseFilterDate(value);
  if (!parsed) return "—";
  return format(parsed, "dd/MM/yyyy");
};

const parseTimeForDate = (time: string, baseDate: Date) => {
  const [hour = "0", minute = "0"] = time.split(":");
  const result = new Date(baseDate);
  result.setHours(Number(hour), Number(minute), 0, 0);
  return result;
};

const isWithinRange = (value: Date, start: Date, end: Date) => value >= start && value <= end;

const Reports = () => {
  const { settings } = useAttendanceSettings();
  const [formFilters, setFormFilters] = useState<ReportFilters>(initialFilters);
  const [queryFilters, setQueryFilters] = useState<ReportFilters>(initialFilters);

  const {
    data: employeesResponse,
    isLoading: isLoadingEmployees,
    isError: isEmployeeError,
    error: employeesError,
    refetch: refetchEmployees,
    isFetching: isFetchingEmployees,
  } = useQuery<EmployeeListResponse>({
    queryKey: ["reports-employees"],
    queryFn: () => employeeService.getAllEmployees(1, EMPLOYEE_FETCH_LIMIT, { status: "active" }),
  });

  const {
    data: scanLogs = [],
    isLoading: isLoadingScans,
    isError: isScanError,
    error: scanError,
    refetch: refetchScans,
    isFetching: isFetchingScans,
  } = useQuery<ScanHistoryItem[]>({
    queryKey: ["reports-scan-history"],
    queryFn: async () => {
      const response = await apiService.get<{ scanLogs?: ScanHistoryItem[] }>(
        `/scan/history?limit=${SCAN_HISTORY_LIMIT}`,
      );
      return response.data.scanLogs ?? [];
    },
    refetchInterval: 60_000,
  });

  const employees = employeesResponse?.employees ?? [];
  const trackedEmployees = useMemo(
    () => employees.filter((employee) => employee.isActive),
    [employees],
  );

  const employeeMap = useMemo(() => {
    const map = new Map<string, Employee>();
    trackedEmployees.forEach((employee) => {
      map.set(employee.id, employee);
    });
    return map;
  }, [trackedEmployees]);

  const selectedDates = useMemo(() => {
    const exactDate = parseFilterDate(queryFilters.date);
    if (exactDate) {
      return [exactDate];
    }

    const start = parseFilterDate(queryFilters.startDate);
    const end = parseFilterDate(queryFilters.endDate);

    if (start && end) {
      const interval = start <= end ? { start, end } : { start: end, end: start };
      return eachDayOfInterval(interval).map((day) => startOfDay(day));
    }

    if (start) return [start];
    if (end) return [end];

    return [startOfDay(new Date())];
  }, [queryFilters.date, queryFilters.startDate, queryFilters.endDate]);

  const selectedDateKeys = useMemo(
    () => selectedDates.map((date) => format(date, "yyyy-MM-dd")),
    [selectedDates],
  );
  const selectedDateSet = useMemo(() => new Set(selectedDateKeys), [selectedDateKeys]);

  const filteredScanLogs = useMemo(
    () =>
      scanLogs.filter((log) => {
        const dateKey = format(parseISO(log.scanTime), "yyyy-MM-dd");
        return selectedDateSet.has(dateKey);
      }),
    [scanLogs, selectedDateSet],
  );

  const filteredCheckIns = useMemo(
    () =>
      filteredScanLogs.filter(
        (log) => log.scanType === "check_in" && log.user?.employeeType !== "intern" && log.user?.id,
      ),
    [filteredScanLogs],
  );

  const presenceSet = useMemo(() => {
    const set = new Set<string>();
    filteredCheckIns.forEach((log) => {
      const userId = log.user?.id;
      if (!userId) return;
      const dateKey = format(parseISO(log.scanTime), "yyyy-MM-dd");
      set.add(`${userId}-${dateKey}`);
    });
    return set;
  }, [filteredCheckIns]);

  const absenceRows = useMemo<AbsenceRow[]>(() => {
    const rows: AbsenceRow[] = [];
    trackedEmployees.forEach((employee) => {
      const fullName = `${employee.firstName} ${employee.lastName}`.trim() || "Employé inconnu";
      const serviceName = employee.service?.name ?? "Service inconnu";

      selectedDateKeys.forEach((dateKey) => {
        const presenceKey = `${employee.id}-${dateKey}`;
        if (!presenceSet.has(presenceKey)) {
          rows.push({
            id: presenceKey,
            employeeId: employee.id,
            fullName,
            serviceName,
            employeeType: employee.employeeType ?? "permanent",
            date: dateKey,
          });
        }
      });
    });
    return rows;
  }, [trackedEmployees, selectedDateKeys, presenceSet]);

  const earliestCheckIns = useMemo(() => {
    const map = new Map<string, { log: ScanHistoryItem; scanDate: Date }>();
    filteredCheckIns.forEach((log) => {
      const userId = log.user?.id;
      if (!userId) return;
      const scanDate = parseISO(log.scanTime);
      const dateKey = format(scanDate, "yyyy-MM-dd");
      const key = `${userId}-${dateKey}`;
      const existing = map.get(key);
      if (!existing || scanDate < existing.scanDate) {
        map.set(key, { log, scanDate });
      }
    });
    return map;
  }, [filteredCheckIns]);

  const resolveReferenceStart = (date: Date) => {
    const morningStart = parseTimeForDate(settings.morningStart, date);
    const morningEnd = parseTimeForDate(settings.morningEnd, date);
    const afternoonStart = parseTimeForDate(settings.afternoonStart, date);
    const afternoonEnd = parseTimeForDate(settings.afternoonEnd, date);

    if (isWithinRange(date, morningStart, morningEnd)) return morningStart;
    if (isWithinRange(date, afternoonStart, afternoonEnd)) return afternoonStart;
    if (date < morningStart) return morningStart;
    if (date > morningEnd && date < afternoonStart) return afternoonStart;
    return afternoonStart;
  };

  const lateRows = useMemo<LateRow[]>(() => {
    const rows: LateRow[] = [];

    earliestCheckIns.forEach(({ log, scanDate }) => {
      const referenceStart = resolveReferenceStart(scanDate);
      const delay = Math.max(differenceInMinutes(scanDate, referenceStart), 0);

      if (delay > LATE_THRESHOLD_MINUTES) {
        const employee = log.user?.id ? employeeMap.get(log.user.id) : undefined;
        const fullName =
          employee?.firstName || employee?.lastName
            ? `${employee?.firstName ?? ""} ${employee?.lastName ?? ""}`.trim()
            : `${log.user?.firstName ?? ""} ${log.user?.lastName ?? ""}`.trim() || "Employé inconnu";

        const serviceName =
          employee?.service?.name ?? log.user?.service?.name ?? "Service inconnu";

        rows.push({
          id: log.id,
          employeeId: log.user?.id ?? log.badgeId,
          fullName,
          serviceName,
          employeeType: employee?.employeeType ?? log.user?.employeeType ?? "permanent",
          date: format(scanDate, "yyyy-MM-dd"),
          timeLabel: scanDate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
          lateMinutes: delay,
        });
      }
    });

    return rows.sort((a, b) => (a.date === b.date ? a.timeLabel.localeCompare(b.timeLabel) : a.date.localeCompare(b.date)));
  }, [earliestCheckIns, employeeMap, settings]);

  const searchTerm = (queryFilters.search ?? "").trim().toLowerCase();
  const matchesSearch = (fullName: string, serviceName: string, employeeType: string) => {
    if (!searchTerm) return true;
    return (
      fullName.toLowerCase().includes(searchTerm) ||
      serviceName.toLowerCase().includes(searchTerm) ||
      employeeType.toLowerCase().includes(searchTerm)
    );
  };

  const filteredAbsenceRows = useMemo(
    () => absenceRows.filter((row) => matchesSearch(row.fullName, row.serviceName, row.employeeType)),
    [absenceRows, searchTerm],
  );

  const filteredLateRows = useMemo(
    () => lateRows.filter((row) => matchesSearch(row.fullName, row.serviceName, row.employeeType)),
    [lateRows, searchTerm],
  );

  const absenceCount = filteredAbsenceRows.length;
  const lateCount = filteredLateRows.length;

  const uniqueAbsentEmployees = useMemo(() => {
    const ids = new Set(filteredAbsenceRows.map((row) => row.employeeId));
    return ids.size;
  }, [filteredAbsenceRows]);

  const uniqueLateEmployees = useMemo(() => {
    const ids = new Set(filteredLateRows.map((row) => row.employeeId));
    return ids.size;
  }, [filteredLateRows]);

  const handleChange = (field: keyof ReportFilters, value: string) => {
    setFormFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleApplyFilters = () => {
    setQueryFilters(formFilters);
  };

  const handleResetFilters = () => {
    setFormFilters(initialFilters);
    setQueryFilters(initialFilters);
  };

  const handleRefresh = () => {
    Promise.all([refetchEmployees(), refetchScans()]).then(() =>
      toast.success("Données actualisées")
    );
  };

  const handleExport = async (format: "pdf" | "xlsx" | "csv") => {
    try {
      const params = new URLSearchParams();
      params.append("format", format);
      if (queryFilters.date) params.append("date", queryFilters.date);
      if (queryFilters.startDate) params.append("startDate", queryFilters.startDate);
      if (queryFilters.endDate) params.append("endDate", queryFilters.endDate);
      await downloadFile(
        `/reports/attendance?${params.toString()}`,
        `rapport_pointage.${format}`,
      );
    } catch (error) {
      console.error("Erreur export:", error);
      toast.error((error as Error).message);
    }
  };

  const formatDateDisplay = (value: string) => {
    if (!value) return "—";
    const parsed = parseFilterDate(value);
    if (!parsed) return "—";
    return format(parsed, "dd/MM/yyyy");
  };

  const hasError = isEmployeeError || isScanError;
  const errorMessage = (employeesError as Error)?.message ?? (scanError as Error)?.message;
  const isLoading = isLoadingEmployees || isLoadingScans;
  const isFetching = isFetchingEmployees || isFetchingScans;

  return (
    <AppLayout>
      <PageHeader
        icon={FileBarChart2}
        title="Rapports de pointage"
        description="Visualisez les employés absents ou en retard selon les horaires configurés."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="sm:h-10"
              onClick={() => handleExport("pdf")}
              title="Exporter en PDF"
            >
              <FileText className="mr-2 h-4 w-4" />
              PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="sm:h-10"
              onClick={() => handleExport("xlsx")}
              title="Exporter en Excel"
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Excel
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="sm:h-10"
              onClick={() => handleExport("csv")}
              title="Exporter en CSV"
            >
              <FileDown className="mr-2 h-4 w-4" />
              CSV
            </Button>
            <Button variant="outline" size="sm" className="sm:h-10" onClick={handleRefresh} disabled={isLoading || isFetching}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
              Actualiser
            </Button>
          </div>
        }
      />

      <div className="space-y-6">
      <Card>
            <CardHeader>
              <CardTitle>Filtres</CardTitle>
              <CardDescription>Appliquez une date précise ou une période glissante</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Recherche</Label>
                  <Input
                    id="search"
                    placeholder="Nom ou service"
                    value={formFilters.search}
                    onChange={(event) => handleChange("search", event.currentTarget.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date précise</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formFilters.date}
                    onChange={(event) => handleChange("date", event.currentTarget.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startDate">Date de début</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formFilters.startDate}
                    onChange={(event) => handleChange("startDate", event.currentTarget.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Date de fin</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formFilters.endDate}
                    onChange={(event) => handleChange("endDate", event.currentTarget.value)}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button onClick={handleApplyFilters} disabled={isLoading && !employeesResponse}>
                  Appliquer
                </Button>
                <Button
                  variant="outline"
                  onClick={handleResetFilters}
                  disabled={isLoading && !employeesResponse}
                >
                  Réinitialiser
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
            <Card className="transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total d&apos;absences</CardTitle>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                  <CalendarX className="h-5 w-5 text-destructive" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold tracking-tight">{isLoading ? "—" : absenceCount}</p>
                <CardDescription className="mt-1">Selon les filtres actifs</CardDescription>
              </CardContent>
            </Card>
            <Card className="transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total de retards</CardTitle>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                  <Clock className="h-5 w-5 text-warning" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold tracking-tight">{isLoading ? "—" : lateCount}</p>
                <CardDescription className="mt-1">Entrées après +{LATE_THRESHOLD_MINUTES} min</CardDescription>
              </CardContent>
            </Card>
            <Card className="transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Employés absents</CardTitle>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <UserX className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold tracking-tight">{isLoading ? "—" : uniqueAbsentEmployees}</p>
                <CardDescription className="mt-1">Nombre unique</CardDescription>
              </CardContent>
            </Card>
            <Card className="transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Employés retardataires</CardTitle>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                  <Users className="h-5 w-5 text-success" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold tracking-tight">{isLoading ? "—" : uniqueLateEmployees}</p>
                <CardDescription className="mt-1">Nombre unique</CardDescription>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Période évaluée</CardTitle>
              <CardDescription>Résumé des filtres appliqués</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1 text-sm text-muted-foreground">
              <p>Date précise : {formatDateDisplay(queryFilters.date)}</p>
              <p>Date de début : {formatDateDisplay(queryFilters.startDate)}</p>
              <p>Date de fin : {formatDateDisplay(queryFilters.endDate)}</p>
              <p>Nombre de jours : {selectedDates.length}</p>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="flex-1">
              <CardHeader>
                <CardTitle>Absents</CardTitle>
                <CardDescription>Employés et stagiaires sans pointage</CardDescription>
              </CardHeader>
              <CardContent>
                {hasError ? (
                  <div className="p-4 rounded-lg border border-destructive/40 bg-destructive/10 text-sm text-destructive">
                    {errorMessage ?? "Impossible de charger les données de pointage."}
                  </div>
                ) : (
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Employé</TableHead>
                          <TableHead>Service</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoading ? (
                          Array.from({ length: 5 }).map((_, index) => (
                            <TableRow key={`absence-skeleton-${index}`}>
                              <TableCell colSpan={4}>
                                <div className="h-4 bg-muted animate-pulse rounded" />
                              </TableCell>
                            </TableRow>
                          ))
                        ) : filteredAbsenceRows.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground">
                              Aucun employé ou stagiaire absent pour ces critères.
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredAbsenceRows.map((row) => (
                            <TableRow key={row.id}>
                              <TableCell className="font-medium">{row.fullName}</TableCell>
                              <TableCell>{row.serviceName}</TableCell>
                              <TableCell>
                                <Badge variant={row.employeeType === "intern" ? "secondary" : "outline"}>
                                  {row.employeeType === "intern" ? "Stagiaire" : "Employé"}
                                </Badge>
                              </TableCell>
                              <TableCell>{formatDateLabel(row.date)}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="flex-1">
              <CardHeader>
                <CardTitle>Retards</CardTitle>
                <CardDescription>Entrées après la tolérance définie</CardDescription>
              </CardHeader>
              <CardContent>
                {hasError ? (
                  <div className="p-4 rounded-lg border border-destructive/40 bg-destructive/10 text-sm text-destructive">
                    {errorMessage ?? "Impossible de charger les données de pointage."}
                  </div>
                ) : (
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Employé</TableHead>
                          <TableHead>Service</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Heure</TableHead>
                          <TableHead>Retard</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoading ? (
                          Array.from({ length: 5 }).map((_, index) => (
                            <TableRow key={`late-skeleton-${index}`}>
                              <TableCell colSpan={6}>
                                <div className="h-4 bg-muted animate-pulse rounded" />
                              </TableCell>
                            </TableRow>
                          ))
                        ) : filteredLateRows.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center text-muted-foreground">
                              Aucun retard détecté pour ces critères.
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredLateRows.map((row) => (
                            <TableRow key={row.id}>
                              <TableCell className="font-medium">{row.fullName}</TableCell>
                              <TableCell>{row.serviceName}</TableCell>
                              <TableCell>
                                <Badge variant={row.employeeType === "intern" ? "secondary" : "outline"}>
                                  {row.employeeType === "intern" ? "Stagiaire" : "Employé"}
                                </Badge>
                              </TableCell>
                              <TableCell>{formatDateLabel(row.date)}</TableCell>
                              <TableCell>{row.timeLabel}</TableCell>
                              <TableCell>
                                <Badge className="bg-amber-500 text-white">
                                  +{row.lateMinutes}&nbsp;min
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6">
            <InternsList />
          </div>
      </div>
    </AppLayout>
  );
};

export default Reports;

