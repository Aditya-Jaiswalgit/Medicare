import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Patient, MedicalHistory } from '@/types/patient';
import { mockMedicalHistory, smokingStatuses, alcoholOptions } from '@/data/mockPatientData';
import { useToast } from '@/hooks/use-toast';
import {
  Heart,
  Pill,
  Save,
  X,
  Activity,
} from 'lucide-react';

interface MedicalHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient | null;
  onSave: (patientId: string, data: MedicalHistory) => void;
}

const defaultMedicalHistory: Omit<MedicalHistory, 'patientId'> = {
  allergies: '',
  chronicConditions: '',
  pastSurgeries: '',
  familyHistory: '',
  currentMedications: '',
  immunizationRecords: '',
  smokingStatus: 'Never',
  alcoholConsumption: 'Never',
  exerciseHabits: '',
  dietaryPreferences: '',
};

export function MedicalHistoryDialog({ open, onOpenChange, patient, onSave }: MedicalHistoryDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Omit<MedicalHistory, 'patientId'>>(defaultMedicalHistory);

  useEffect(() => {
    if (patient) {
      const existingHistory = mockMedicalHistory[patient.id];
      if (existingHistory) {
        setFormData({
          allergies: existingHistory.allergies,
          chronicConditions: existingHistory.chronicConditions,
          pastSurgeries: existingHistory.pastSurgeries,
          familyHistory: existingHistory.familyHistory,
          currentMedications: existingHistory.currentMedications,
          immunizationRecords: existingHistory.immunizationRecords,
          smokingStatus: existingHistory.smokingStatus,
          alcoholConsumption: existingHistory.alcoholConsumption,
          exerciseHabits: existingHistory.exerciseHabits,
          dietaryPreferences: existingHistory.dietaryPreferences,
        });
      } else {
        setFormData(defaultMedicalHistory);
      }
    }
  }, [patient]);

  if (!patient) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(patient.id, { patientId: patient.id, ...formData });
    toast({
      title: 'Medical History Saved',
      description: `Medical history for ${patient.firstName} ${patient.lastName} has been updated.`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
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

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Heart className="w-4 h-4 text-destructive" />
                  Medical Conditions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Allergies (Medicine, Food, etc.)</Label>
                  <Textarea
                    value={formData.allergies}
                    onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                    placeholder="e.g., Penicillin, Peanuts, Dust mites"
                    className="min-h-[80px] resize-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Chronic Conditions</Label>
                  <Textarea
                    value={formData.chronicConditions}
                    onChange={(e) => setFormData({ ...formData, chronicConditions: e.target.value })}
                    placeholder="e.g., Diabetes, Hypertension, Asthma"
                    className="min-h-[80px] resize-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Past Surgeries</Label>
                  <Textarea
                    value={formData.pastSurgeries}
                    onChange={(e) => setFormData({ ...formData, pastSurgeries: e.target.value })}
                    placeholder="e.g., Appendectomy (2015)"
                    className="min-h-[60px] resize-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Family History (Hereditary conditions)</Label>
                  <Textarea
                    value={formData.familyHistory}
                    onChange={(e) => setFormData({ ...formData, familyHistory: e.target.value })}
                    placeholder="e.g., Father: Diabetes, Mother: Hypertension"
                    className="min-h-[60px] resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Pill className="w-4 h-4 text-primary" />
                  Medications & Immunizations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Current Medications</Label>
                  <Textarea
                    value={formData.currentMedications}
                    onChange={(e) => setFormData({ ...formData, currentMedications: e.target.value })}
                    placeholder="e.g., Metformin 500mg twice daily"
                    className="min-h-[80px] resize-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Immunization Records</Label>
                  <Textarea
                    value={formData.immunizationRecords}
                    onChange={(e) => setFormData({ ...formData, immunizationRecords: e.target.value })}
                    placeholder="e.g., COVID-19 (3 doses), Flu shot (2023)"
                    className="min-h-[80px] resize-none"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-success" />
                Lifestyle
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Smoking Status</Label>
                  <Select
                    value={formData.smokingStatus}
                    onValueChange={(value: 'Never' | 'Former' | 'Current') => 
                      setFormData({ ...formData, smokingStatus: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {smokingStatuses.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Alcohol Consumption</Label>
                  <Select
                    value={formData.alcoholConsumption}
                    onValueChange={(value: 'Never' | 'Occasional' | 'Regular' | 'Heavy') => 
                      setFormData({ ...formData, alcoholConsumption: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {alcoholOptions.map((a) => (
                        <SelectItem key={a} value={a}>{a}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Exercise Habits</Label>
                  <Input
                    value={formData.exerciseHabits}
                    onChange={(e) => setFormData({ ...formData, exerciseHabits: e.target.value })}
                    placeholder="e.g., Walking 30 min daily"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Dietary Preferences</Label>
                  <Input
                    value={formData.dietaryPreferences}
                    onChange={(e) => setFormData({ ...formData, dietaryPreferences: e.target.value })}
                    placeholder="e.g., Vegetarian"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit">
              <Save className="w-4 h-4 mr-2" />
              Save Medical History
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
