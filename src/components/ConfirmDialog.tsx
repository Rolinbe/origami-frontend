import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Info, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ConfirmVariant = "danger" | "warning" | "info";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
  onConfirm: () => void;
  isLoading?: boolean;
}

const variantConfig: Record<
  ConfirmVariant,
  { icon: React.ElementType; iconBg: string; iconColor: string; buttonVariant: "destructive" | "default" | "outline" }
> = {
  danger: {
    icon: Trash2,
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    buttonVariant: "destructive",
  },
  warning: {
    icon: AlertTriangle,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    buttonVariant: "destructive",
  },
  info: {
    icon: Info,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    buttonVariant: "default",
  },
};

export const ConfirmDialog = ({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  variant = "danger",
  onConfirm,
  isLoading = false,
}: ConfirmDialogProps) => {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md gap-0 p-0 overflow-hidden">
        <div className="p-6 pb-4">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full",
                config.iconBg
              )}
            >
              <Icon className={cn("w-6 h-6", config.iconColor)} />
            </div>
            <div className="flex-1 pt-1">
              <DialogTitle className="text-base">{title}</DialogTitle>
              <DialogDescription className="mt-2 text-sm leading-relaxed">
                {description}
              </DialogDescription>
            </div>
          </div>
        </div>
        <DialogFooter className="px-6 py-4 bg-muted/30 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={config.buttonVariant}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "En cours…" : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
