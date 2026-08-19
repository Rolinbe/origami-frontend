import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Users } from "lucide-react";
import { toast } from "sonner";
import apiService from "@/services/api.service";
import { LoadingBar } from "@/components/LoadingBar";

interface ServicePresenceStat {
  service: string;
  code: string | null;
  color: string | null;
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
}

interface OverviewResponse {
  serviceStats?: ServicePresenceStat[];
}

const fetchServiceStats = async (): Promise<ServicePresenceStat[]> => {
  const response = await apiService.get<OverviewResponse>("/dashboard/overview");
  return response.data.serviceStats ?? [];
};

const isHexColor = (value: string | null | undefined): value is string =>
  typeof value === "string" && /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test(value);

const ServicePresence = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const {
    data: serviceStats = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["dashboard-service-presence-stats"],
    queryFn: fetchServiceStats,
    refetchInterval: 60_000,
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
    toast.success("Données actualisées");
  };

  const totalPresent = serviceStats.reduce((sum, service) => sum + service.presentToday, 0);
  const totalEmployees = serviceStats.reduce((sum, service) => sum + service.totalEmployees, 0);

  return (
    <Card className="relative transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-lift">
      <LoadingBar isLoading={isRefreshing || isLoading} />
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <CardTitle>Présents par service</CardTitle>
            </div>
            <CardDescription>
              {isLoading
                ? "Chargement…"
                : isError
                  ? "Erreur de chargement"
                  : `${totalPresent}/${totalEmployees} employés présents`}
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

      <CardContent className="space-y-4">
        {isError ? (
          <div className="p-4 rounded-lg border border-destructive/40 bg-destructive/10 text-sm text-destructive">
            {(error as Error)?.message ?? "Une erreur est survenue lors du chargement."}
          </div>
        ) : isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div key={`service-skeleton-${index}`} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="h-4 bg-muted rounded w-1/3" />
                <div className="h-4 bg-muted rounded w-16" />
              </div>
              <div className="h-2 bg-secondary rounded-full">
                <div className="h-2 w-1/2 bg-muted rounded-full" />
              </div>
            </div>
          ))
        ) : serviceStats.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            Aucun service actif.
          </div>
        ) : (
          serviceStats.map((service, index) => {
            const percentage =
              service.totalEmployees > 0
                ? Math.round((service.presentToday / service.totalEmployees) * 100)
                : 0;
            const barColor =
              percentage >= 80 ? "bg-success" : percentage >= 60 ? "bg-warning" : "bg-destructive";

            return (
              <div key={service.service ?? index} className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 font-medium text-sm truncate">
                    {isHexColor(service.color) && (
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: service.color }}
                      />
                    )}
                    {service.service}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground">{percentage}%</span>
                    <Badge variant="outline" className="text-xs">
                      {service.presentToday}/{service.totalEmployees}
                    </Badge>
                  </div>
                </div>

                <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};

export default ServicePresence;