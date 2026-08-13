import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

const mockServiceData = [
  { service: "Développement", present: 8, total: 10 },
  { service: "Design", present: 4, total: 5 },
  { service: "Management", present: 2, total: 3 },
  { service: "Marketing", present: 1, total: 2 }
];

const ServicePresence = () => {
  const totalPresent = mockServiceData.reduce((sum, service) => sum + service.present, 0);
  const totalEmployees = mockServiceData.reduce((sum, service) => sum + service.total, 0);

  return (
    <Card className="transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-lift">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <CardTitle>Présents par service</CardTitle>
        </div>
        <CardDescription>
          {totalPresent}/{totalEmployees} employés présents
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {mockServiceData.map((service, index) => {
          const percentage = Math.round((service.present / service.total) * 100);
          const barColor = percentage >= 80 ? "bg-success" : 
                          percentage >= 60 ? "bg-warning" : "bg-destructive";
          
          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{service.service}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{percentage}%</span>
                  <Badge variant="outline" className="text-xs">
                    {service.present}/{service.total}
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
        })}
      </CardContent>
    </Card>
  );
};

export default ServicePresence;