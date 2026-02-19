import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Stethoscope, X } from "lucide-react";

interface PatientForDialog {
  id: string;
  firstName: string;
  lastName: string;
  patientCode: string;
}

interface ConsultationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: PatientForDialog | null;
}

export function ConsultationDialog({
  open,
  onOpenChange,
  patient,
}: ConsultationDialogProps) {
  if (!patient) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-primary" />
            Consultations - {patient.firstName} {patient.lastName}
          </DialogTitle>
        </DialogHeader>

        <div className="py-12 text-center text-muted-foreground">
          <Stethoscope className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium mb-2">Consultation History</p>
          <p className="text-sm">
            This feature will be available once consultations are created
            through appointments.
          </p>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
