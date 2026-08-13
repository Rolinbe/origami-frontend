import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserX } from "lucide-react";
import apiService from "@/services/api.service";

interface AbsentEmployee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  position: string | null;
  profileImage: string | null;
}

interface AbsentResponse {
  absentEmployees: AbsentEmployee[];
  count: number;
}

const fetchAbsentEmployees = async (): Promise<AbsentEmployee[]> => {
  const response = await apiService.get<AbsentResponse>("/dashboard/absent-employees");
  return response.data.absentEmployees ?? [];
};

const AbsentList = () => {
  const {
    data: absentEmployees = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["dashboard-absent-employees"],
    queryFn: fetchAbsentEmployees,
    refetchInterval: 60_000,
  });

  const sorted = [...absentEmployees].sort((a, b) =>
    `${a.lastName ?? ""} ${a.firstName ?? ""}`.localeCompare(`${b.lastName ?? ""} ${b.firstName ?? ""}`)
  );

  return (
    <Card className="transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-lift">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <UserX className="h-5 w-5 text-destructive" />
              Absents du jour
            </CardTitle>
            <CardDescription>
              {isLoading
                ? "Chargement des absents…"
                : isError
                  ? "Erreur de chargement"
                  : `${absentEmployees.length} employé(s) non pointé(s) aujourd'hui`}
            </CardDescription>
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
                key={`absent-skeleton-${index}`}
                className="flex items-center justify-between p-3 rounded-lg border bg-card animate-pulse"
              >
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-2/3" />
                  <div className="h-3 bg-muted rounded w-1/3" />
                </div>
                <div className="h-6 bg-muted rounded w-20" />
              </div>
            ))
          ) : sorted.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Aucun absent aujourd'hui. Tout le monde est présent !
            </div>
          ) : (
            sorted.map((employee) => (
              <div
                key={employee.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {employee.firstName} {employee.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {employee.position ?? employee.email ?? "Sans poste"}
                  </p>
                </div>
                <Badge variant="outline" className="shrink-0">
                  Absent
                </Badge>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AbsentList;