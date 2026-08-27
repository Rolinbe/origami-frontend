import { useCallback, useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import {
  CalendarOff,
  Plus,
  Trash2,
  Briefcase,
  FileCheck,
  CalendarDays,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import leaveService, { LeaveRecord } from "@/services/leave.service";
import employeeService from "@/services/employee.service";
import { LoadingBar } from "@/components/LoadingBar";

const Leaves = () => {
  const queryClient = useQueryClient();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [leaveType, setLeaveType] = useState<"leave" | "justified">("leave");
  const [reason, setReason] = useState("");

  const { data: employees = [] } = useQuery({
    queryKey: ["leaves-employees"],
    queryFn: () =>
      employeeService.getAllEmployees(1, 200, { status: "active" }).then((r) => r.employees ?? []),
  });

  const { data: leaves = [], isLoading } = useQuery({
    queryKey: ["leaves"],
    queryFn: () => leaveService.getAllLeaves(),
  });

  const createMutation = useMutation({
    mutationFn: leaveService.createLeave.bind(leaveService),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaves"] });
      toast.success("Congé/absence enregistré");
      resetForm();
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message ?? "Erreur lors de la création");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => leaveService.deleteLeave(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaves"] });
      toast.success("Supprimé");
    },
  });

  const resetForm = () => {
    setSelectedEmployee("");
    setStartDate("");
    setEndDate("");
    setLeaveType("leave");
    setReason("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee || !startDate || !endDate) {
      toast.error("Remplissez tous les champs obligatoires");
      return;
    }
    createMutation.mutate({
      userId: selectedEmployee,
      startDate,
      endDate,
      type: leaveType,
      reason: reason.trim() || undefined,
    });
  };

  const formatDate = (d: string) =>
    format(new Date(d + "T00:00:00"), "dd MMM yyyy", { locale: fr });

  const now = format(new Date(), "yyyy-MM-dd");

  return (
    <AppLayout>
      <PageHeader
        icon={CalendarOff}
        title="Congés & Absences justifiées"
        description="Gérez les absences planifiées des employés pour ne pas fausser les statistiques."
      />

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Formulaire */}
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Plus className="h-4 w-4" />
              Nouveau congé / absence
            </CardTitle>
            <CardDescription>
              Sélectionnez un employé et les dates concernées.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Employé *</Label>
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Choisir un employé" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Type *</Label>
                <div className="mt-1 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setLeaveType("leave")}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                      leaveType === "leave"
                        ? "border-primary bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <Briefcase className="h-4 w-4" />
                    Congé
                  </button>
                  <button
                    type="button"
                    onClick={() => setLeaveType("justified")}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                      leaveType === "justified"
                        ? "border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <FileCheck className="h-4 w-4" />
                    Absence justifiée
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Du *</Label>
                  <Input
                    type="date"
                    value={startDate}
                    min={now}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Au *</Label>
                  <Input
                    type="date"
                    value={endDate}
                    min={startDate || now}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label>Motif</Label>
                <Input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Motif (optionnel)"
                  className="mt-1"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Enregistrement…" : "Enregistrer"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Liste des congés */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarDays className="h-4 w-4" />
              Congés enregistrés ({leaves.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LoadingBar isLoading={isLoading} />
            {leaves.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">
                Aucun congé ou absence enregistré.
              </p>
            ) : (
              <div className="space-y-3">
                {leaves.map((leave) => (
                  <LeaveRow
                    key={leave.id}
                    leave={leave}
                    onDelete={() => deleteMutation.mutate(leave.id)}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

const LeaveRow = ({
  leave,
  onDelete,
  formatDate,
}: {
  leave: LeaveRecord;
  onDelete: () => void;
  formatDate: (d: string) => string;
}) => {
  const isJustified = leave.type === "justified";
  const isActive =
    leave.endDate >= format(new Date(), "yyyy-MM-dd");

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-accent/50">
      {/* Photo ou initiales */}
      {leave.user?.profileImage ? (
        <img
          src={leave.user.profileImage}
          alt=""
          className="h-9 w-9 shrink-0 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
          {`${leave.user?.firstName?.[0] ?? "?"}${leave.user?.lastName?.[0] ?? ""}`}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {leave.user?.firstName} {leave.user?.lastName}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatDate(leave.startDate)} — {formatDate(leave.endDate)}
          {leave.reason ? ` · ${leave.reason}` : ""}
        </p>
      </div>

      <span
        className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
          isJustified
            ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
            : "bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300"
        }`}
      >
        {isJustified ? "Absence justifiée" : "Congé"}
      </span>

      {isActive && (
        <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
          En cours
        </span>
      )}

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-destructive hover:bg-destructive/10">
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce congé ?</AlertDialogTitle>
            <AlertDialogDescription>
              L'employé{" "}
              <strong>
                {leave.user?.firstName} {leave.user?.lastName}
              </strong>{" "}
              sera de nouveau considéré comme absent pour cette période.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Leaves;
