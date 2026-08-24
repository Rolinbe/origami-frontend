import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { differenceInMinutes } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useAttendanceSettings } from "@/contexts/AttendanceSettingsContext";
import apiService from "@/services/api.service";
import { LoadingBar } from "@/components/LoadingBar";

interface PresenceStatusItem {
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

interface EnhancedStatus extends PresenceStatusItem {
  isLate: boolean;
  lateMinutes: number;
}

interface PresenceStatusListProps {
  title: string;
  description?: string;
  employeeType?: "permanent" | "intern";
  queryKey: string[];
}

const parseTimeForDate = (time: string, baseDate: Date) => {
  const [hour = "0", minute = "0"] = time.split(":");
  const result = new Date(baseDate);
  result.setHours(Number(hour), Number(minute), 0, 0);
  return result;
};

const PresenceStatusList = ({
  title,
  description,
  employeeType = "permanent",
  queryKey,
}: PresenceStatusListProps) => {
  const { settings } = useAttendanceSettings();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const {
    data: items = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await apiService.get<{ status?: PresenceStatusItem[] }>(
        `/scan/presence?employeeType=${employeeType}`,
      );
      return response.data.status ?? [];
    },
    refetchInterval: 60_000,
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
    toast.success("Données actualisées");
  };

  const today = useMemo(() => new Date(), []);

  const processedItems: EnhancedStatus[] = useMemo(
    () =>
      items.map((item) => {
        if (!item.checkIn) {
          return { ...item, isLate: false, lateMinutes: 0 };
        }

        const checkInDate = parseTimeForDate(item.checkIn, today);
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
          ...item,
          isLate,
          lateMinutes,
        };
      }),
    [items, settings, today],
  );

  return (
    <Card className="relative min-w-0 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-lift">
      <LoadingBar isLoading={isRefreshing || isLoading} />
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle>{title}</CardTitle>
            <CardDescription>
              {description ?? "Statut de présence aujourd'hui"}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading || isRefreshing}
            className="shrink-0"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-[26rem] space-y-3 overflow-y-auto pr-1 lg:max-h-[33vh]">
          {isError ? (
            <div className="p-4 rounded-lg border border-destructive/40 bg-destructive/10 text-sm text-destructive">
              {(error as Error)?.message ?? "Une erreur est survenue lors du chargement."}
            </div>
          ) : isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`${employeeType}-skeleton-${index}`}
                className="flex items-center justify-between p-3 rounded-lg border bg-card animate-pulse"
              >
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-2/3" />
                  <div className="h-3 bg-muted rounded w-1/3" />
                </div>
                <div className="h-6 bg-muted rounded w-20" />
              </div>
            ))
          ) : processedItems.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Aucun employé dans cette catégorie.
            </div>
          ) : (
            processedItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 p-3 rounded-lg border bg-card"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">
                    {item.firstName} {item.lastName}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {item.service ?? "Service non défini"}
                  </p>
                </div>
                <div className="shrink-0 space-y-1 text-right">
                  {item.present ? (
                    <Badge
                      className={
                        item.isLate
                          ? "bg-destructive/10 text-destructive hover:bg-destructive/10"
                          : "bg-success/10 text-success hover:bg-success/10"
                      }
                    >
                      {item.isLate ? "En retard" : "Présent"}
                    </Badge>
                  ) : item.checkOut ? (
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      Sorti
                    </Badge>
                  ) : (
                    <Badge variant="outline">Absent</Badge>
                  )}

                  {item.checkIn && (
                    <p className="text-xs text-muted-foreground">Entrée&nbsp;{item.checkIn}</p>
                  )}
                  {item.checkOut && (
                    <p className="text-xs text-muted-foreground">Sortie&nbsp;{item.checkOut}</p>
                  )}
                  {item.isLate && (
                    <p className="text-xs text-destructive">Retard&nbsp;+{item.lateMinutes} min</p>
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

export default PresenceStatusList;
