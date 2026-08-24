import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import apiService from "@/services/api.service";
import { formatTimeFr } from "@/utils/dateFormat";
import { LoadingBar } from "@/components/LoadingBar";

interface LateEmployeeRow {
  attendanceId: string;
  userId: string;
  firstName?: string | null;
  lastName?: string | null;
  position?: string | null;
  profileImage?: string | null;
  employeeType?: string | null;
  service?: string | null;
  serviceColor?: string | null;
  checkInTime: string;
  scanTime: string;
  lateMinutes: number;
}

const fetchLateEmployees = async (): Promise<LateEmployeeRow[]> => {
  const response = await apiService.get<{ lateEmployees?: LateEmployeeRow[] }>(
    "/dashboard/late-employees",
  );
  return response.data.lateEmployees ?? [];
};

const LateEmployees = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const {
    data: lateEmployees = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["dashboard-late-employees"],
    queryFn: fetchLateEmployees,
    refetchInterval: 60_000,
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
    toast.success("Données actualisées");
  };

  const totalCount = lateEmployees.length;

  return (
    <Card className="relative transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-lift">
      <LoadingBar isLoading={isRefreshing || isLoading} />
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
                  : `${totalCount} retardataire(s) aujourd'hui`}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading || isRefreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
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
                <div className="h-6 w-20 bg-muted rounded" />
              </div>
            ))
          ) : totalCount === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Aucun retard enregistré aujourd'hui.
            </div>
          ) : (
            lateEmployees.map((employee) => (
              <div
                key={employee.attendanceId}
                className="flex items-center justify-between p-3 rounded-lg border bg-card"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {`${employee.firstName ?? ""} ${employee.lastName ?? ""}`.trim() ||
                      "Employé inconnu"}
                    {employee.employeeType === "intern" && (
                      <span className="ml-2 text-xs text-muted-foreground">(Stagiaire)</span>
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {employee.service ?? "Service inconnu"}
                  </p>
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
