import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const AttendanceCharts = () => {
  return (
    <Card className="col-span-2 transition-all duration-300 ease-in-out hover:scale-105 hover:bg-card/90 hover:shadow-xl cursor-pointer">
      <CardHeader>
        <CardTitle>Graphiques de présence</CardTitle>
        <CardDescription>Statistiques hebdomadaires et mensuelles</CardDescription>
      </CardHeader>
      <CardContent className="h-64">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Graphique hebdomadaire simplifié */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Présence cette semaine</h4>
            <div className="space-y-1">
              {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'].map((day, index) => (
                <div key={day} className="flex items-center justify-between">
                  <span className="text-xs w-8">{day}</span>
                  <div className="flex-1 mx-2 bg-secondary h-3 rounded-full">
                    <div 
                      className="bg-blue-500 h-3 rounded-full"
                      style={{ width: `${70 + (index * 5)}%` }}
                    />
                  </div>
                  <span className="text-xs w-8 text-right">{70 + (index * 5)}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Graphique de répartition */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm">Répartition aujourd'hui</h4>
            <div className="flex items-center justify-center">
              <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                <div className="absolute inset-2 bg-card rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold">85%</span>
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Présents</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>Absents</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AttendanceCharts;