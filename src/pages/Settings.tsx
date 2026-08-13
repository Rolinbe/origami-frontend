import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAttendanceSettings } from "@/contexts/AttendanceSettingsContext";
import { PageHeader } from "@/components/PageHeader";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { CalendarDays, Plus, Trash2, Settings } from "lucide-react";
import { toast } from "sonner";
import settingsService, { AttendanceSettings } from "@/services/settings.service";
import holidayService, { Holiday } from "@/services/holiday.service";

const DEFAULT_BACKEND_SETTINGS: AttendanceSettings = {
  workStartTime: "08:00",
  workEndTime: "17:00",
  morningStart: "08:00",
  morningEnd: "12:00",
  afternoonStart: "13:00",
  afternoonEnd: "17:00",
  lateToleranceMinutes: 15,
};

const SettingsPage = () => {
  const { updateSettings } = useAttendanceSettings();
  const [formState, setFormState] = useState<AttendanceSettings>(DEFAULT_BACKEND_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [newHoliday, setNewHoliday] = useState({ date: "", label: "" });
  const [isSavingHoliday, setIsSavingHoliday] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const backendSettings = await settingsService.getSettings();
        setFormState(backendSettings);
        updateSettings({
          morningStart: backendSettings.morningStart,
          morningEnd: backendSettings.morningEnd,
          afternoonStart: backendSettings.afternoonStart,
          afternoonEnd: backendSettings.afternoonEnd,
        });
      } catch (error) {
        console.error("Impossible de charger les paramètres:", error);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [updateSettings]);

  useEffect(() => {
    const loadHolidays = async () => {
      try {
        const data = await holidayService.getAllHolidays();
        setHolidays(data);
      } catch (error) {
        console.error("Impossible de charger les jours fériés:", error);
      }
    };
    loadHolidays();
  }, []);

  const handleChange = (field: keyof AttendanceSettings) => (value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      const saved = await settingsService.updateSettings(formState);
      setFormState(saved);
      updateSettings({
        morningStart: saved.morningStart,
        morningEnd: saved.morningEnd,
        afternoonStart: saved.afternoonStart,
        afternoonEnd: saved.afternoonEnd,
      });
      toast.success("Paramètres enregistrés");
    } catch (error) {
      console.error("Erreur enregistrement paramètres:", error);
      toast.error("Impossible d'enregistrer les paramètres");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      const saved = await settingsService.resetSettings();
      setFormState(saved);
      updateSettings({
        morningStart: saved.morningStart,
        morningEnd: saved.morningEnd,
        afternoonStart: saved.afternoonStart,
        afternoonEnd: saved.afternoonEnd,
      });
      toast.success("Paramètres réinitialisés");
    } catch (error) {
      console.error("Erreur réinitialisation:", error);
      toast.error("Impossible de réinitialiser les paramètres");
    }
  };

  const handleAddHoliday = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newHoliday.date || !newHoliday.label.trim()) return;
    setIsSavingHoliday(true);
    try {
      const holiday = await holidayService.createHoliday(newHoliday);
      setHolidays((prev) => [...prev, holiday].sort((a, b) => a.date.localeCompare(b.date)));
      setNewHoliday({ date: "", label: "" });
      toast.success("Jour férié ajouté");
    } catch (error) {
      console.error("Erreur ajout jour férié:", error);
      toast.error("Impossible d'ajouter ce jour férié");
    } finally {
      setIsSavingHoliday(false);
    }
  };

  const handleDeleteHoliday = async (id: string) => {
    if (!confirm("Supprimer ce jour férié ?")) return;
    try {
      await holidayService.deleteHoliday(id);
      setHolidays((prev) => prev.filter((h) => h.id !== id));
      toast.success("Jour férié supprimé");
    } catch (error) {
      console.error("Erreur suppression jour férié:", error);
      toast.error("Impossible de supprimer ce jour férié");
    }
  };

  const formatDate = (date: string) => {
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="min-h-screen bg-app flex">
      <Sidebar />
      <div className="flex-1 ml-64 overflow-auto h-screen">
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl space-y-6">
            <PageHeader
              icon={Settings}
              title="Paramètres"
              description="Configurez les horaires de travail, les seuils de retard et les jours fériés."
            />

            <Card>
              <CardHeader>
                <CardTitle>Horaires de référence</CardTitle>
                <CardDescription>
                  Ces valeurs sont utilisées pour calculer les retards et le pointage.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-8" onSubmit={handleSubmit}>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Début de travail</Label>
                      <Input
                        type="time"
                        value={formState.workStartTime}
                        onChange={(e) => handleChange("workStartTime")(e.currentTarget.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Fin de travail</Label>
                      <Input
                        type="time"
                        value={formState.workEndTime}
                        onChange={(e) => handleChange("workEndTime")(e.currentTarget.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Début matinée</Label>
                      <Input
                        type="time"
                        value={formState.morningStart}
                        onChange={(e) => handleChange("morningStart")(e.currentTarget.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Fin matinée</Label>
                      <Input
                        type="time"
                        value={formState.morningEnd}
                        onChange={(e) => handleChange("morningEnd")(e.currentTarget.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Début après-midi</Label>
                      <Input
                        type="time"
                        value={formState.afternoonStart}
                        onChange={(e) => handleChange("afternoonStart")(e.currentTarget.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Fin après-midi</Label>
                      <Input
                        type="time"
                        value={formState.afternoonEnd}
                        onChange={(e) => handleChange("afternoonEnd")(e.currentTarget.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Tolérance de retard (minutes)</Label>
                      <Input
                        type="number"
                        min={0}
                        value={formState.lateToleranceMinutes}
                        onChange={(e) =>
                          handleChange("lateToleranceMinutes")(e.currentTarget.value)
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Button type="submit" disabled={isSaving || isLoading}>
                      {isSaving ? "Enregistrement…" : "Enregistrer"}
                    </Button>
                    <Button type="button" variant="outline" onClick={handleReset}>
                      Réinitialiser par défaut
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5" />
                  Jours fériés
                </CardTitle>
                <CardDescription>
                  Les jours fériés configurés ne sont pas comptabilisés dans les absences.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleAddHoliday} className="flex flex-wrap gap-2">
                  <Input
                    type="date"
                    className="w-auto"
                    value={newHoliday.date}
                    onChange={(e) =>
                      setNewHoliday((prev) => ({ ...prev, date: e.currentTarget.value }))
                    }
                    required
                  />
                  <Input
                    placeholder="Libellé (ex: Fête de l'Indépendance)"
                    className="flex-1 min-w-[200px]"
                    value={newHoliday.label}
                    onChange={(e) =>
                      setNewHoliday((prev) => ({ ...prev, label: e.currentTarget.value }))
                    }
                    required
                  />
                  <Button type="submit" disabled={isSavingHoliday}>
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter
                  </Button>
                </form>

                {holidays.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucun jour férié configuré.</p>
                ) : (
                  <div className="rounded-md border divide-y">
                    {holidays.map((holiday) => (
                      <div
                        key={holiday.id}
                        className="flex items-center justify-between px-4 py-2.5"
                      >
                        <div>
                          <p className="font-medium text-sm">{holiday.label}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(holiday.date)}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteHoliday(holiday.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;