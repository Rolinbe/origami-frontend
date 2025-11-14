import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAttendanceSettings } from "@/contexts/AttendanceSettingsContext";
import { Sidebar } from "@/components/sidebar/Sidebar";

const SettingsPage = () => {
  const { settings, updateSettings, resetSettings } = useAttendanceSettings();
  const [formState, setFormState] = useState(settings);

  useEffect(() => {
    setFormState(settings);
  }, [settings]);

  const handleChange = (field: keyof typeof formState) => (value: string) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateSettings(formState);
  };

  const handleReset = () => {
    resetSettings();
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 ml-64 overflow-auto h-screen">
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-3xl space-y-6">
            <div>
              <h1 className="text-2xl font-semibold">Paramètres</h1>
              <p className="text-muted-foreground">
                Configurez les horaires de référence utilisés pour calculer les retards du matin et
                de l’après-midi.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Horaires de référence</CardTitle>
                <CardDescription>
                  Ces valeurs sont appliquées au tableau de bord et s’appliquent à tous les
                  utilisateurs qui consultent le pointage du jour.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-8" onSubmit={handleSubmit}>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Début matinée</label>
                      <Input
                        type="time"
                        value={formState.morningStart}
                        onChange={(event) =>
                          handleChange("morningStart")(event.currentTarget.value)
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Fin matinée</label>
                      <Input
                        type="time"
                        value={formState.morningEnd}
                        onChange={(event) =>
                          handleChange("morningEnd")(event.currentTarget.value)
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Début après-midi</label>
                      <Input
                        type="time"
                        value={formState.afternoonStart}
                        onChange={(event) =>
                          handleChange("afternoonStart")(event.currentTarget.value)
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Fin après-midi</label>
                      <Input
                        type="time"
                        value={formState.afternoonEnd}
                        onChange={(event) =>
                          handleChange("afternoonEnd")(event.currentTarget.value)
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Button type="submit">Enregistrer</Button>
                    <Button type="button" variant="outline" onClick={handleReset}>
                      Réinitialiser par défaut
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;

