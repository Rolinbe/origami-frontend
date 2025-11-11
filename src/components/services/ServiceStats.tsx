import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ServiceStatsProps {
  total: number;
  active: number;
  inactive: number;
}

export const ServiceStats = ({ total, active, inactive }: ServiceStatsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="pb-3">
          <CardDescription>Total</CardDescription>
          <CardTitle className="text-3xl">{total}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardDescription>Actifs</CardDescription>
          <CardTitle className="text-3xl text-green-600">{active}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardDescription>Inactifs</CardDescription>
          <CardTitle className="text-3xl text-gray-400">{inactive}</CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
};