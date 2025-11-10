import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const mockInterns = [
  { name: "Alexandre Roy", service: "Développement", present: true, checkIn: "08:05" },
  { name: "Camille Lefebvre", service: "Design", present: false },
  { name: "Hugo Simon", service: "Marketing", present: true, checkIn: "08:15" }
];

const InternsList = () => {
  return (
    <Card className="transition-all duration-300 ease-in-out hover:scale-105 hover:bg-card/90 hover:shadow-xl cursor-pointer">
      <CardHeader>
        <CardTitle>Stagiaires</CardTitle>
        <CardDescription>Statut des stagiaires aujourd'hui</CardDescription>
      </CardHeader>
      <CardContent className="h-64" >
        <div className="space-y-3 h-[33vh] overflow-y-auto">
          {mockInterns.map((intern, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg border bg-card"
            >
              <div className="flex-1 ">
                <p className="font-medium">{intern.name}</p>
                <p className="text-sm text-muted-foreground">{intern.service}</p>
              </div>
              {intern.present ? (
                <div className="text-right">
                  <Badge className="bg-green-500">Présent</Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    Depuis {intern.checkIn}
                  </p>
                </div>
              ) : (
                <Badge variant="outline">En attente</Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default InternsList;