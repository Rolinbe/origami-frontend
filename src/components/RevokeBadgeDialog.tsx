import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Ban } from "lucide-react";

interface RevokeBadgeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  badgeLabel: string;
  onConfirm: (reason: string) => void;
  isLoading?: boolean;
}

export const RevokeBadgeDialog = ({
  open,
  onOpenChange,
  badgeLabel,
  onConfirm,
  isLoading = false,
}: RevokeBadgeDialogProps) => {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    if (!reason.trim()) return;
    onConfirm(reason.trim());
    setReason("");
  };

  const handleCancel = () => {
    setReason("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md gap-0 p-0 overflow-hidden">
        <div className="p-6 pb-4">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-red-100">
              <Ban className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1 pt-1">
              <DialogTitle className="text-base">
                Révoquer le badge
              </DialogTitle>
              <DialogDescription className="mt-2 text-sm leading-relaxed">
                Êtes-vous sûr de vouloir révoquer le badge{" "}
                <span className="font-medium text-foreground">{badgeLabel}</span> ?
                Veuillez indiquer la raison de la révocation.
              </DialogDescription>
            </div>
          </div>
        </div>
        <div className="px-6 pb-4">
          <Textarea
            placeholder="Raison de la révocation…"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className="resize-none"
          />
        </div>
        <DialogFooter className="px-6 py-4 bg-muted/30 border-t">
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading || !reason.trim()}
          >
            {isLoading ? "En cours…" : "Révoquer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
