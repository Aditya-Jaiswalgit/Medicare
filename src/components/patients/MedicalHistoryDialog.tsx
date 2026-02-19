import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, X } from "lucide-react";
import { toast } from "sonner";

interface PatientForDialog {
  id: string;
  firstName: string;
  lastName: string;
  patientCode: string;
  allergies: string | null;
  medical_history: string | null;
  emergency_contact: string | null;
}

interface MedicalHistory {
  patientId: string;
  allergies: string;
  chronicConditions: string;
  pastSurgeries: string;
  familyHistory: string;
  currentMedications: string;
  immunizationRecords: string;
  smokingStatus: string;
  alcoholConsumption: string;
  exerciseHabits: string;
  dietaryPreferences: string;
}

interface MedicalHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: PatientForDialog | null;
  onSave: (patientId: string, data: MedicalHistory) => void;
}

export function MedicalHistoryDialog({
  open,
  onOpenChange,
  patient,
  onSave,
}: MedicalHistoryDialogProps) {
  if (!patient) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Medical History</h2>
              <p className="text-sm text-muted-foreground font-normal">
                {patient.firstName} {patient.lastName} ({patient.patientCode})
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Medical Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow
                label="Allergies"
                value={patient.allergies || "Not specified"}
              />
              <InfoRow
                label="Medical History"
                value={patient.medical_history || "Not specified"}
              />
              <InfoRow
                label="Emergency Contact"
                value={patient.emergency_contact || "Not specified"}
              />
            </CardContent>
          </Card>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Note:</strong> Detailed medical history editing will be
              available in the full patient profile. Current data is shown from
              the patient's basic information.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm">{value}</p>
    </div>
  );
}
