import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAttendanceSettings } from "@/contexts/AttendanceSettingsContext";
import {
  format,
  parse,
  parseISO,
  eachDayOfInterval,
  startOfDay,
  endOfMonth,
  startOfMonth,
  subDays,
  differenceInMinutes,
} from "date-fns";
import {
  RefreshCw,
  FileBarChart2,
  CalendarX,
  Clock,
  Users,
  UserX,
  FileText,
  FileSpreadsheet,
  FileDown,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import InternsList from "@/components/dashboard/InternsList";
import PresenceStatusList from "@/components/reports/PresenceStatusList";
import employeeService from "@/services/employee.service";
import serviceService from "@/services/service.service";
import apiService from "@/services/api.service";
import { downloadFile } from "@/utils/download";
import { toast } from "sonner";
import { Employee, EmployeeListResponse } from "@/types/employee.types";
import { cn } from "@/lib/utils";

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
  serviceId: string;
  employeeType: string;
  date: string;
}

interface LateRow {
  id: string;
  employeeId: string;
  fullName: string;
  serviceName: string;
  serviceId: string;
  employeeType: string;
  date: string;
  timeLabel: string;
  lateMinutes: number;
}

type SortDir = "asc" | "desc";

interface SortState {
  key: string;
  dir: SortDir;
}

const EMPLOYEE_FETCH_LIMIT = 500;
const SCAN_HISTORY_LIMIT = 500;
const PAGE_SIZE = 15;

const initialFilters: ReportFilters = {
  date: "",
  startDate: "",
  endDate: "",
  search: "",
};

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

const toKey = (value: Date) => format(value, "yyyy-MM-dd");
const todayKey = () => toKey(startOfDay(new Date()));

type PresetKey = "today" | "yesterday" | "7d" | "month";

const getPresetRange = (preset: PresetKey): { startDate: string; endDate: string } => {
  const today = startOfDay(new Date());
  switch (preset) {
    case "today":
      return { startDate: toKey(today), endDate: toKey(today) };
    case "yesterday": {
      const y = subDays(today, 1);
      return { startDate: toKey(y), endDate: toKey(y) };
    }
    case "7d":
      return { startDate: toKey(subDays(today, 6)), endDate: toKey(today) };
    case "month":
      return { startDate: toKey(startOfMonth(today)), endDate: toKey(endOfMonth(today)) };
  }
};

const detectPreset = (filters: ReportFilters): PresetKey | null => {
  if (filters.date) return null;
  const presets: PresetKey[] = ["today", "yesterday", "7d", "month"];
  return (
    presets.find((preset) => {
      const range = getPresetRange(preset);
      return filters.startDate === range.startDate && filters.endDate === range.endDate;
    }) ?? null
  );
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

const compareValues = (a: unknown, b: unknown) => {
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a ?? "").localeCompare(String(b ?? ""), "fr", { sensitivity: "base", numeric: true });
};

const sortRows = <T extends Record<string, unknown>>(rows: T[], sort: SortState): T[] =>
  [...rows].sort((a, b) => {
    const cmp = compareValues(a[sort.key], b[sort.key]);
    return sort.dir === "asc" ? cmp : -cmp;
  });

interface SortableThProps {
  label: string;
  sortKey: string;
  sort: SortState;
  onToggle: (key: string) => void;
  className?: string;
}

const SortableTh = ({ label, sortKey, sort, onToggle, className }: SortableThProps) => (
  <TableHead className={className}>
    <button
      type="button"
      onClick={() => onToggle(sortKey)}
      className="inline-flex items-center gap-1 hover:text-foreground"
      title={`Trier par ${label.toLowerCase()}`}
    >
      {label}
      {sort.key === sortKey ? (
        sort.dir === "asc" ? (
          <ArrowUp className="h-3.5 w-3.5 text-primary" />
        ) : (
          <ArrowDown className="h-3.5 w-3.5 text-primary" />
        )
      ) : (
        <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
      )}
    </button>
  </TableHead>
);

const Reports = () => {
  const { settings } = useAttendanceSettings();
  const lateToleranceMinutes = useMemo(() => settings.lateToleranceMinutes ?? 5, [settings]);
  const [formFilters, setFormFilters] = useState<ReportFilters>(initialFilters);
  const [queryFilters, setQueryFilters] = useState<ReportFilters>(initialFilters);
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [absenceSort, setAbsenceSort] = useState<SortState>({ key: "fullName", dir: "asc" });
  const [lateSort, setLateSort] = useState<SortState>({ key: "lateMinutes", dir: "desc" });
  const [absenceVisible, setAbsenceVisible] = useState<number>(PAGE_SIZE);
  const [lateVisible, setLateVisible] = useState<number>(PAGE_SIZE);

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
    data: services = [],
    isLoading: isLoadingServices,
  } = useQuery({
    queryKey: ["reports-services"],
    queryFn: () => serviceService.getAllServices(true),
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

  const employees = useMemo(() => employeesResponse?.employees ?? [], [employeesResponse]);
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

  // Tous les check-ins identifiés (stagiaires INCLUS) → sert à la détection de présence
  const allCheckIns = useMemo(
    () => filteredScanLogs.filter((log) => log.scanType === "check_in" && log.user?.id),
    [filteredScanLogs],
  );

  // Check-ins hors stagiaires → sert uniquement au calcul des retards
  // (les stagiaires n'ont pas d'horaire strict, on ne compte pas leurs retards)
  const filteredCheckIns = useMemo(
    () => allCheckIns.filter((log) => log.user?.employeeType !== "intern"),
    [allCheckIns],
  );

  const presenceSet = useMemo(() => {
    const set = new Set<string>();
    allCheckIns.forEach((log) => {
      const userId = log.user?.id;
      if (!userId) return;
      const dateKey = format(parseISO(log.scanTime), "yyyy-MM-dd");
      set.add(`${userId}-${dateKey}`);
    });
    return set;
  }, [allCheckIns]);

  // Filtres secondaires appliqués en direct (service / type / recherche)
  const searchTerm = formFilters.search.trim().toLowerCase();
  const matchesSecondaryFilters = (row: { fullName: string; serviceName: string; serviceId: string; employeeType: string }) => {
    if (serviceFilter !== "all" && row.serviceId !== serviceFilter) return false;
    if (typeFilter !== "all" && row.employeeType !== typeFilter) return false;
    if (!searchTerm) return true;
    return (
      row.fullName.toLowerCase().includes(searchTerm) ||
      row.serviceName.toLowerCase().includes(searchTerm) ||
      row.employeeType.toLowerCase().includes(searchTerm)
    );
  };

  const absenceRows = useMemo<AbsenceRow[]>(() => {
    const rows: AbsenceRow[] = [];
    trackedEmployees.forEach((employee) => {
      const fullName = `${employee.firstName} ${employee.lastName}`.trim() || "Employé inconnu";
      const serviceName = employee.service?.name ?? "Service inconnu";
      const serviceId = employee.service?.id ?? employee.serviceId ?? "";

      selectedDateKeys.forEach((dateKey) => {
        const presenceKey = `${employee.id}-${dateKey}`;
        if (!presenceSet.has(presenceKey)) {
          rows.push({
            id: presenceKey,
            employeeId: employee.id,
            fullName,
            serviceName,
            serviceId,
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

      if (delay > lateToleranceMinutes) {
        const employee = log.user?.id ? employeeMap.get(log.user.id) : undefined;
        const fullName =
          employee?.firstName || employee?.lastName
            ? `${employee?.firstName ?? ""} ${employee?.lastName ?? ""}`.trim()
            : `${log.user?.firstName ?? ""} ${log.user?.lastName ?? ""}`.trim() || "Employé inconnu";

        const serviceName =
          employee?.service?.name ?? log.user?.service?.name ?? "Service inconnu";
        const serviceId = employee?.service?.id ?? employee?.serviceId ?? "";

        rows.push({
          id: log.id,
          employeeId: log.user?.id ?? log.badgeId,
          fullName,
          serviceName,
          serviceId,
          employeeType: employee?.employeeType ?? log.user?.employeeType ?? "permanent",
          date: format(scanDate, "yyyy-MM-dd"),
          timeLabel: scanDate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
          lateMinutes: delay,
        });
      }
    });

    return rows.sort((a, b) => (a.date === b.date ? a.timeLabel.localeCompare(b.timeLabel) : a.date.localeCompare(b.date)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [earliestCheckIns, employeeMap, settings]);

  const filteredAbsenceRowsAll = useMemo(
    () => absenceRows.filter(matchesSecondaryFilters),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [absenceRows, serviceFilter, typeFilter, searchTerm],
  );

  const filteredLateRowsAll = useMemo(
    () => lateRows.filter(matchesSecondaryFilters),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lateRows, serviceFilter, typeFilter, searchTerm],
  );

  const sortedAbsenceRows = useMemo(
    () => sortRows(filteredAbsenceRowsAll, absenceSort),
    [filteredAbsenceRowsAll, absenceSort],
  );
  const sortedLateRows = useMemo(
    () => sortRows(filteredLateRowsAll, lateSort),
    [filteredLateRowsAll, lateSort],
  );

  const visibleAbsenceRows = useMemo(
    () => sortedAbsenceRows.slice(0, absenceVisible),
    [sortedAbsenceRows, absenceVisible],
  );
  const visibleLateRows = useMemo(
    () => sortedLateRows.slice(0, lateVisible),
    [sortedLateRows, lateVisible],
  );

  // Réinitialiser la pagination quand les données ou filtres changent
  useEffect(() => {
    setAbsenceVisible(PAGE_SIZE);
    setLateVisible(PAGE_SIZE);
  }, [
    queryFilters.date,
    queryFilters.startDate,
    queryFilters.endDate,
    searchTerm,
    serviceFilter,
    typeFilter,
    absenceSort.key,
    absenceSort.dir,
    lateSort.key,
    lateSort.dir,
  ]);

  const absenceCount = filteredAbsenceRowsAll.length;
  const lateCount = filteredLateRowsAll.length;

  const uniqueAbsentEmployees = useMemo(() => {
    const ids = new Set(filteredAbsenceRowsAll.map((row) => row.employeeId));
    return ids.size;
  }, [filteredAbsenceRowsAll]);

  const uniqueLateEmployees = useMemo(() => {
    const ids = new Set(filteredLateRowsAll.map((row) => row.employeeId));
    return ids.size;
  }, [filteredLateRowsAll]);

  const activePreset = useMemo(() => detectPreset(queryFilters), [queryFilters]);

  const handleChange = (field: keyof ReportFilters, value: string) => {
    setFormFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const applyDateFilters = (next: { date?: string; startDate?: string; endDate?: string }) => {
    setFormFilters((prev) => ({ ...prev, ...next }));
    setQueryFilters((prev) => ({ ...prev, ...next }));
  };

  const handleApplyFilters = () => {
    setQueryFilters((prev) => ({
      ...prev,
      date: formFilters.date,
      startDate: formFilters.startDate,
      endDate: formFilters.endDate,
    }));
    toast.success("Filtres appliqués");
  };

  const handleResetFilters = () => {
    setFormFilters(initialFilters);
    setQueryFilters(initialFilters);
    setServiceFilter("all");
    setTypeFilter("all");
    toast.success("Filtres réinitialisés");
  };

  const handlePreset = (preset: PresetKey) => {
    applyDateFilters(getPresetRange(preset));
  };

  const toggleAbsenceSort = (key: string) =>
    setAbsenceSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" },
    );

  const toggleLateSort = (key: string) =>
    setLateSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" },
    );

  const handleRefresh = () => {
    Promise.all([refetchEmployees(), refetchScans()]).then(() =>
      toast.success("Données actualisées")
    );
  };

  const handleExport = async (exportFormat: "pdf" | "xlsx" | "csv") => {
    try {
      const params = new URLSearchParams();
      params.append("format", exportFormat);
      if (queryFilters.date) params.append("date", queryFilters.date);
      if (queryFilters.startDate) params.append("startDate", queryFilters.startDate);
      if (queryFilters.endDate) params.append("endDate", queryFilters.endDate);
      if (serviceFilter !== "all") params.append("serviceId", serviceFilter);
      if (typeFilter !== "all") params.append("employeeType", typeFilter);
      const suffix = queryFilters.startDate
        ? `_${queryFilters.startDate}${queryFilters.endDate ? `_au_${queryFilters.endDate}` : ""}`
        : queryFilters.date
          ? `_${queryFilters.date}`
          : `_${todayKey()}`;
      await downloadFile(
        `/reports/attendance?${params.toString()}`,
        `rapport_pointage${suffix}.${exportFormat}`,
      );
      toast.success("Rapport exporté");
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
  const isLoading = isLoadingEmployees || isLoadingScans || isLoadingServices;
  const isFetching = isFetchingEmployees || isFetchingScans;

  const presets: { key: PresetKey; label: string }[] = [
    { key: "today", label: "Aujourd'hui" },
    { key: "yesterday", label: "Hier" },
    { key: "7d", label: "7 derniers jours" },
    { key: "month", label: "Ce mois-ci" },
  ];

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
              <CardDescription>Recherche instantanée, périodes rapides et filtres détaillés</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Périodes rapides */}
              <div className="flex flex-wrap items-center gap-2">
                {presets.map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handlePreset(key)}
                    className={cn(
                      "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all",
                      activePreset === key && !queryFilters.date
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
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
                <div className="space-y-2">
                  <Label htmlFor="serviceFilter">Département</Label>
                  <select
                    id="serviceFilter"
                    className={selectClass}
                    value={serviceFilter}
                    onChange={(event) => setServiceFilter(event.target.value)}
                  >
                    <option value="all">Tous les départements</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="typeFilter">Type</Label>
                  <select
                    id="typeFilter"
                    className={selectClass}
                    value={typeFilter}
                    onChange={(event) => setTypeFilter(event.target.value)}
                  >
                    <option value="all">Tous les types</option>
                    <option value="permanent">Permanents</option>
                    <option value="intern">Stagiaires</option>
                  </select>
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
                <CardDescription className="mt-1">Entrées après +{lateToleranceMinutes} min</CardDescription>
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
              <p>
                Département :{" "}
                {serviceFilter === "all"
                  ? "Tous"
                  : services.find((service) => service.id === serviceFilter)?.name ?? "Inconnu"}
              </p>
              <p>
                Type :{" "}
                {typeFilter === "all"
                  ? "Tous"
                  : typeFilter === "intern"
                    ? "Stagiaires"
                    : "Permanents"}
              </p>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="min-w-0">
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
                  <>
                    <div className="w-full rounded-md border overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <SortableTh
                              label="Employé"
                              sortKey="fullName"
                              sort={absenceSort}
                              onToggle={toggleAbsenceSort}
                            />
                            <SortableTh
                              label="Service"
                              sortKey="serviceName"
                              sort={absenceSort}
                              onToggle={toggleAbsenceSort}
                              className="hidden md:table-cell"
                            />
                            <SortableTh
                              label="Type"
                              sortKey="employeeType"
                              sort={absenceSort}
                              onToggle={toggleAbsenceSort}
                              className="hidden md:table-cell"
                            />
                            <SortableTh
                              label="Date"
                              sortKey="date"
                              sort={absenceSort}
                              onToggle={toggleAbsenceSort}
                            />
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
                          ) : visibleAbsenceRows.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center text-muted-foreground">
                                Aucun employé ou stagiaire absent pour ces critères.
                              </TableCell>
                            </TableRow>
                          ) : (
                            visibleAbsenceRows.map((row) => (
                              <TableRow key={row.id}>
                                <TableCell className="max-w-[10rem] truncate font-medium">{row.fullName}</TableCell>
                                <TableCell className="hidden md:table-cell">{row.serviceName}</TableCell>
                                <TableCell className="hidden md:table-cell">
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
                    {sortedAbsenceRows.length > absenceVisible && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 w-full"
                        onClick={() => setAbsenceVisible((count) => count + PAGE_SIZE)}
                      >
                        Afficher plus ({sortedAbsenceRows.length - absenceVisible} restant
                        {sortedAbsenceRows.length - absenceVisible > 1 ? "s" : ""})
                      </Button>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="min-w-0">
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
                  <>
                    <div className="w-full rounded-md border overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <SortableTh
                              label="Employé"
                              sortKey="fullName"
                              sort={lateSort}
                              onToggle={toggleLateSort}
                            />
                            <SortableTh
                              label="Service"
                              sortKey="serviceName"
                              sort={lateSort}
                              onToggle={toggleLateSort}
                              className="hidden lg:table-cell"
                            />
                            <SortableTh
                              label="Type"
                              sortKey="employeeType"
                              sort={lateSort}
                              onToggle={toggleLateSort}
                              className="hidden md:table-cell"
                            />
                            <SortableTh
                              label="Date"
                              sortKey="date"
                              sort={lateSort}
                              onToggle={toggleLateSort}
                              className="hidden xl:table-cell"
                            />
                            <SortableTh
                              label="Heure"
                              sortKey="timeLabel"
                              sort={lateSort}
                              onToggle={toggleLateSort}
                            />
                            <SortableTh
                              label="Retard"
                              sortKey="lateMinutes"
                              sort={lateSort}
                              onToggle={toggleLateSort}
                            />
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
                          ) : visibleLateRows.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center text-muted-foreground">
                                Aucun retard détecté pour ces critères.
                              </TableCell>
                            </TableRow>
                          ) : (
                            visibleLateRows.map((row) => (
                              <TableRow key={row.id}>
                                <TableCell className="max-w-[9rem] truncate font-medium">{row.fullName}</TableCell>
                                <TableCell className="hidden lg:table-cell">{row.serviceName}</TableCell>
                                <TableCell className="hidden md:table-cell">
                                  <Badge variant={row.employeeType === "intern" ? "secondary" : "outline"}>
                                    {row.employeeType === "intern" ? "Stagiaire" : "Employé"}
                                  </Badge>
                                </TableCell>
                                <TableCell className="hidden xl:table-cell">{formatDateLabel(row.date)}</TableCell>
                                <TableCell>{row.timeLabel}</TableCell>
                                <TableCell>
                                  <Badge className="whitespace-nowrap bg-amber-500 text-white">
                                    +{row.lateMinutes}&nbsp;min
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                    {sortedLateRows.length > lateVisible && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 w-full"
                        onClick={() => setLateVisible((count) => count + PAGE_SIZE)}
                      >
                        Afficher plus ({sortedLateRows.length - lateVisible} restant
                        {sortedLateRows.length - lateVisible > 1 ? "s" : ""})
                      </Button>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-2">
            <PresenceStatusList
              title="Employés permanents"
              employeeType="permanent"
              queryKey={['reports-permanent-presence']}
            />
            <InternsList />
          </div>
      </div>
    </AppLayout>
  );
};

export default Reports;
