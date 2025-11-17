import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { differenceInMinutes } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAttendanceSettings } from "@/contexts/AttendanceSettingsContext";
import apiService from "@/services/api.service";

interface Intern {
  id: string;
  firstName: string;
  lastName: string;
  service: string | null;
  present: boolean;
  checkIn: string | null;
  checkOut: string | null;
  lastStatus: "check_in" | "check_out" | null;
  lastTime: string | null;
}

interface EnhancedIntern extends Intern {
  isLate: boolean;
  lateMinutes: number;
}

const fetchInterns = async (): Promise<Intern[]> => {
  const response = await apiService.get<{ interns?: Intern[] }>("/scan/interns");
  return response.data.interns ?? [];
};

const parseTimeForDate = (time: string, baseDate: Date) => {
  const [hour = "0", minute = "0"] = time.split(":");
  const result = new Date(baseDate);
  result.setHours(Number(hour), Number(minute), 0, 0);
  return result;
};

const InternsList = () => {
  const { settings } = useAttendanceSettings();
  const {
    data: interns = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["dashboard-interns"],
    queryFn: fetchInterns,
    refetchInterval: 60_000,
  });

  const today = useMemo(() => new Date(), []);

  const processedInterns: EnhancedIntern[] = useMemo(
    () =>
      interns.map((intern) => {
        if (!intern.checkIn) {
          return { ...intern, isLate: false, lateMinutes: 0 };
        }

        const checkInDate = parseTimeForDate(intern.checkIn, today);
        const morningStart = parseTimeForDate(settings.morningStart, today);
        const morningEnd = parseTimeForDate(settings.morningEnd, today);
        const afternoonStart = parseTimeForDate(settings.afternoonStart, today);
        const afternoonEnd = parseTimeForDate(settings.afternoonEnd, today);

        let referenceStart = morningStart;
        if (checkInDate >= morningStart && checkInDate <= morningEnd) {
          referenceStart = morningStart;
        } else if (checkInDate >= afternoonStart && checkInDate <= afternoonEnd) {
          referenceStart = afternoonStart;
        } else if (checkInDate < morningStart) {
          referenceStart = morningStart;
        } else if (checkInDate > morningEnd && checkInDate < afternoonStart) {
          referenceStart = afternoonStart;
        } else if (checkInDate >= afternoonEnd) {
          referenceStart = afternoonStart;
        }

        const diffMinutes = Math.max(differenceInMinutes(checkInDate, referenceStart), 0);
        const isLate = diffMinutes > 15;
        const lateMinutes = isLate ? diffMinutes : 0;

        return {
          ...intern,
          isLate,
          lateMinutes,
        };
      }),
    [interns, settings, today],
  );

  return (
    <Card className="transition-all duration-300 ease-in-out hover:scale-105 hover:bg-card/90 hover:shadow-xl cursor-pointer">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>Stagiaires</CardTitle>
            <CardDescription>Statut des stagiaires aujourd&apos;hui</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading || isFetching}
          >
            Actualiser
          </Button>
        </div>
      </CardHeader>
      <CardContent className="h-64">
        <div className="space-y-3 h-[33vh] overflow-y-auto">
          {isError ? (
            <div className="p-4 rounded-lg border border-destructive/40 bg-destructive/10 text-sm text-destructive">
              {(error as Error)?.message ?? "Une erreur est survenue lors du chargement."}
            </div>
          ) : isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`intern-skeleton-${index}`}
                className="flex items-center justify-between p-3 rounded-lg border bg-card animate-pulse"
              >
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-2/3" />
                  <div className="h-3 bg-muted rounded w-1/3" />
                </div>
                <div className="h-6 bg-muted rounded w-20" />
              </div>
            ))
          ) : processedInterns.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Aucun stagiaire actif aujourd&apos;hui.
            </div>
          ) : (
            processedInterns.map((intern) => (
              <div
                key={intern.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card"
              >
                <div className="flex-1">
                  <p className="font-medium">
                    {intern.firstName} {intern.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {intern.service ?? "Service non défini"}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  {intern.present ? (
                    <Badge
                      className={
                        intern.isLate ? "bg-red-500 text-white" : "bg-green-500 text-white"
                      }
                    >
                      {intern.isLate ? "En retard" : "Présent"}
                    </Badge>
                  ) : intern.checkOut ? (
                    <Badge variant="outline" className="border-blue-500 text-blue-500">
                      Sorti
                    </Badge>
                  ) : (
                    <Badge variant="outline">En attente</Badge>
                  )}

                  {intern.checkIn && (
                    <p className="text-xs text-muted-foreground">Entrée&nbsp;{intern.checkIn}</p>
                  )}
                  {intern.checkOut && (
                    <p className="text-xs text-muted-foreground">Sortie&nbsp;{intern.checkOut}</p>
                  )}
                  {intern.isLate && (
                    <p className="text-xs text-destructive">Retard&nbsp;+{intern.lateMinutes} min</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default InternsList;