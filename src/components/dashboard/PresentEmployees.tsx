import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, UserCheck } from "lucide-react";
import { toast } from "sonner";
import apiService from "@/services/api.service";
import { LoadingBar } from "@/components/LoadingBar";

interface PresentEmployee {
  id: string;
  checkInTime: string;
  checkOutTime: string | null;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    position: string | null;
    profileImage: string | null;
  } | null;
}

interface PresentResponse {
  presentEmployees: PresentEmployee[];
  count: number;
}

const fetchPresentEmployees = async (): Promise<PresentEmployee[]> => {
  const response = await apiService.get<PresentResponse>("/dashboard/present-employees");
  return response.data.presentEmployees ?? [];
};

const PresentEmployees = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const {
    data: presentEmployees = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["dashboard-present-employees"],
    queryFn: fetchPresentEmployees,
    refetchInterval: 60_000,
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
    toast.success("Données actualisées");
  };

  return (
    <Card className="relative transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-lift">
      <LoadingBar isLoading={isRefreshing || isLoading} />
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-success" />
              Présents en ce moment
            </CardTitle>
            <CardDescription>
              {isLoading
                ? "Chargement…"
                : isError
                  ? "Erreur de chargement"
                  : `${presentEmployees.length} employé(s) actuellement sur site`}
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
                key={`present-skeleton-${index}`}
                className="flex items-center justify-between p-3 rounded-lg border bg-card animate-pulse"
              >
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-2/3" />
                  <div className="h-3 bg-muted rounded w-1/3" />
                </div>
                <div className="h-6 bg-muted rounded w-20" />
              </div>
            ))
          ) : presentEmployees.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Personne n&apos;est actuellement présent sur site.
            </div>
          ) : (
            presentEmployees.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {record.user?.profileImage ? (
                    <img
                      src={record.user.profileImage}
                      alt=""
                      className="h-9 w-9 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 font-medium text-primary">
                      {`${record.user?.firstName?.[0] ?? "?"}${record.user?.lastName?.[0] ?? ""}`}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {record.user
                        ? `${record.user.firstName ?? ""} ${record.user.lastName ?? ""}`.trim()
                        : "Employé inconnu"}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                      {record.user?.position ?? record.user?.email ?? "Sans poste"}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <Badge className="bg-success/10 text-success hover:bg-success/10">Présent</Badge>
                  {record.checkInTime && (
                    <p className="mt-1 text-xs text-muted-foreground">Entrée {record.checkInTime}</p>
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

export default PresentEmployees;
