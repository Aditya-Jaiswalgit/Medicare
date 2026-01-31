import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Patient, MedicalHistory, Consultation, Prescription, LabReport } from '@/types/patient';
import { mockMedicalHistory, mockConsultations, mockPrescriptions, mockLabReports, smokingStatuses, alcoholOptions } from '@/data/mockPatientData';
import { useToast } from '@/hooks/use-toast';
import { differenceInYears, format } from 'date-fns';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Edit,
  Heart,
  Stethoscope,
  Pill,
  FileText,
  Save,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PatientDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient | null;
  onEdit: (patient: Patient) => void;
}

export function PatientDetailsDialog({ open, onOpenChange, patient, onEdit }: PatientDetailsDialogProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('basic');
  const [isEditingMedical, setIsEditingMedical] = useState(false);
  const [medicalData, setMedicalData] = useState<MedicalHistory | null>(null);

  if (!patient) return null;

  const age = differenceInYears(new Date(), new Date(patient.dateOfBirth));
  const patientMedicalHistory = mockMedicalHistory[patient.id] || {
    patientId: patient.id,
    allergies: '',
    chronicConditions: '',
    pastSurgeries: '',
    familyHistory: '',
    currentMedications: '',
    immunizationRecords: '',
    smokingStatus: 'Never' as const,
    alcoholConsumption: 'Never' as const,
    exerciseHabits: '',
    dietaryPreferences: '',
  };
  const patientConsultations = mockConsultations.filter(c => c.patientId === patient.id);
  const patientPrescriptions = mockPrescriptions.filter(p => p.patientId === patient.id);
  const patientLabReports = mockLabReports.filter(l => l.patientId === patient.id);

  const handleSaveMedicalHistory = () => {
    toast({
      title: 'Medical History Saved',
      description: 'Patient medical history has been updated successfully.',
    });
    setIsEditingMedical(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                {patient.photo ? (
                  <img src={patient.photo} alt={patient.firstName} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-lg font-semibold text-primary">
                    {patient.firstName.charAt(0)}{patient.lastName?.charAt(0) || ''}
                  </span>
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold">{patient.firstName} {patient.lastName}</h2>
                <p className="text-sm text-muted-foreground">{patient.patientCode}</p>
              </div>
            </div>
            <Badge className={cn(
              patient.status === 'Active'
                ? 'bg-success/10 text-success hover:bg-success/20'
                : 'bg-muted text-muted-foreground'
            )}>
              {patient.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="basic" className="text-xs sm:text-sm">
              <User className="w-4 h-4 mr-1.5 hidden sm:inline" />
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="medical" className="text-xs sm:text-sm">
              <Heart className="w-4 h-4 mr-1.5 hidden sm:inline" />
              Medical
            </TabsTrigger>
            <TabsTrigger value="consultations" className="text-xs sm:text-sm">
              <Stethoscope className="w-4 h-4 mr-1.5 hidden sm:inline" />
              Consultations
            </TabsTrigger>
            <TabsTrigger value="prescriptions" className="text-xs sm:text-sm">
              <Pill className="w-4 h-4 mr-1.5 hidden sm:inline" />
              Prescriptions
            </TabsTrigger>
            <TabsTrigger value="reports" className="text-xs sm:text-sm">
              <FileText className="w-4 h-4 mr-1.5 hidden sm:inline" />
              Lab Reports
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4">
            <TabsContent value="basic" className="m-0 space-y-4">
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={() => onEdit(patient)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Information
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <User className="w-4 h-4 text-primary" />
                      Personal Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <InfoRow label="Full Name" value={`${patient.firstName} ${patient.lastName || ''}`} />
                    <InfoRow label="Date of Birth" value={format(new Date(patient.dateOfBirth), 'PPP')} />
                    <InfoRow label="Age" value={`${age} years`} />
                    <InfoRow label="Gender" value={patient.gender} />
                    <InfoRow label="Blood Group" value={patient.bloodGroup || '-'} />
                    <InfoRow label="Marital Status" value={patient.maritalStatus || '-'} />
                    <InfoRow label="Occupation" value={patient.occupation || '-'} />
                    <InfoRow label="Aadhar Number" value={patient.aadharNumber || '-'} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Phone className="w-4 h-4 text-primary" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <InfoRow label="Phone" value={patient.phone} icon={<Phone className="w-3.5 h-3.5" />} />
                    <InfoRow label="Alternate Phone" value={patient.alternatePhone || '-'} />
                    <InfoRow label="Email" value={patient.email || '-'} icon={<Mail className="w-3.5 h-3.5" />} />
                    <InfoRow label="Address" value={patient.address || '-'} icon={<MapPin className="w-3.5 h-3.5" />} />
                    <InfoRow label="City" value={patient.city || '-'} />
                    <InfoRow label="State" value={patient.state || '-'} />
                    <InfoRow label="Pincode" value={patient.pincode || '-'} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-destructive" />
                      Emergency Contact
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <InfoRow label="Name" value={patient.emergencyContactName || '-'} />
                    <InfoRow label="Phone" value={patient.emergencyContactPhone || '-'} />
                    <InfoRow label="Relationship" value={patient.emergencyContactRelation || '-'} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      Visit Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <InfoRow label="Registration Date" value={format(new Date(patient.registrationDate), 'PPP')} />
                    <InfoRow label="Last Visit" value={patient.lastVisit ? format(new Date(patient.lastVisit), 'PPP') : '-'} />
                    <InfoRow label="Total Visits" value={patient.totalVisits.toString()} />
                    {patient.notes && <InfoRow label="Notes" value={patient.notes} />}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="medical" className="m-0 space-y-4">
              <div className="flex justify-end">
                {isEditingMedical ? (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsEditingMedical(false)}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSaveMedicalHistory}>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => setIsEditingMedical(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Medical History
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Medical Conditions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <MedicalField
                      label="Allergies"
                      value={patientMedicalHistory.allergies}
                      editing={isEditingMedical}
                    />
                    <MedicalField
                      label="Chronic Conditions"
                      value={patientMedicalHistory.chronicConditions}
                      editing={isEditingMedical}
                    />
                    <MedicalField
                      label="Past Surgeries"
                      value={patientMedicalHistory.pastSurgeries}
                      editing={isEditingMedical}
                    />
                    <MedicalField
                      label="Family History"
                      value={patientMedicalHistory.familyHistory}
                      editing={isEditingMedical}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Medications & Immunizations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <MedicalField
                      label="Current Medications"
                      value={patientMedicalHistory.currentMedications}
                      editing={isEditingMedical}
                    />
                    <MedicalField
                      label="Immunization Records"
                      value={patientMedicalHistory.immunizationRecords}
                      editing={isEditingMedical}
                    />
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Lifestyle</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">Smoking Status</label>
                        {isEditingMedical ? (
                          <Select defaultValue={patientMedicalHistory.smokingStatus}>
                            <SelectTrigger className="h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {smokingStatuses.map(s => (
                                <SelectItem key={s} value={s}>{s}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="text-sm font-medium">{patientMedicalHistory.smokingStatus || '-'}</p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">Alcohol Consumption</label>
                        {isEditingMedical ? (
                          <Select defaultValue={patientMedicalHistory.alcoholConsumption}>
                            <SelectTrigger className="h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {alcoholOptions.map(a => (
                                <SelectItem key={a} value={a}>{a}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="text-sm font-medium">{patientMedicalHistory.alcoholConsumption || '-'}</p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">Exercise Habits</label>
                        {isEditingMedical ? (
                          <Input defaultValue={patientMedicalHistory.exerciseHabits} className="h-9" />
                        ) : (
                          <p className="text-sm font-medium">{patientMedicalHistory.exerciseHabits || '-'}</p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">Dietary Preferences</label>
                        {isEditingMedical ? (
                          <Input defaultValue={patientMedicalHistory.dietaryPreferences} className="h-9" />
                        ) : (
                          <p className="text-sm font-medium">{patientMedicalHistory.dietaryPreferences || '-'}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="consultations" className="m-0">
              {patientConsultations.length === 0 ? (
                <EmptyState icon={Stethoscope} message="No consultations recorded" />
              ) : (
                <div className="space-y-3">
                  {patientConsultations.map((consultation) => (
                    <Card key={consultation.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm font-medium">{format(new Date(consultation.date), 'PPP')}</span>
                              <Badge variant="outline" className={cn(
                                consultation.status === 'Follow-up Required' 
                                  ? 'border-warning text-warning'
                                  : 'border-success text-success'
                              )}>
                                {consultation.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{consultation.doctorName}</p>
                          </div>
                          <Button variant="ghost" size="sm">View Details</Button>
                        </div>
                        <div className="mt-3 space-y-2">
                          <div>
                            <span className="text-xs font-medium text-muted-foreground">Diagnosis:</span>
                            <p className="text-sm">{consultation.diagnosis}</p>
                          </div>
                          {consultation.notes && (
                            <div>
                              <span className="text-xs font-medium text-muted-foreground">Notes:</span>
                              <p className="text-sm">{consultation.notes}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="prescriptions" className="m-0">
              {patientPrescriptions.length === 0 ? (
                <EmptyState icon={Pill} message="No prescriptions recorded" />
              ) : (
                <div className="space-y-3">
                  {patientPrescriptions.map((prescription) => (
                    <Card key={prescription.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm font-medium">{format(new Date(prescription.date), 'PPP')}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{prescription.doctorName}</p>
                          </div>
                          <Button variant="ghost" size="sm">View Prescription</Button>
                        </div>
                        <div className="mt-3">
                          <span className="text-xs font-medium text-muted-foreground">Medications:</span>
                          <ul className="mt-1 space-y-1">
                            {prescription.medications.map((med, idx) => (
                              <li key={idx} className="text-sm flex items-center gap-2">
                                <Pill className="w-3 h-3 text-primary" />
                                {med}
                              </li>
                            ))}
                          </ul>
                          {prescription.instructions && (
                            <p className="text-xs text-muted-foreground mt-2 italic">
                              {prescription.instructions}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="reports" className="m-0">
              {patientLabReports.length === 0 ? (
                <EmptyState icon={FileText} message="No lab reports found" />
              ) : (
                <div className="space-y-3">
                  {patientLabReports.map((report) => (
                    <Card key={report.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{report.testName}</span>
                              <StatusBadge status={report.status} />
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="w-3.5 h-3.5" />
                              {format(new Date(report.date), 'PPP')}
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" disabled={report.status !== 'Completed'}>
                            View Report
                          </Button>
                        </div>
                        {report.result && report.status === 'Completed' && (
                          <div className="mt-3 p-2 bg-muted rounded-md">
                            <span className="text-xs font-medium text-muted-foreground">Result:</span>
                            <p className="text-sm">{report.result}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function InfoRow({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-muted-foreground flex items-center gap-1.5">
        {icon}
        {label}
      </span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}

function MedicalField({ label, value, editing }: { label: string; value: string; editing: boolean }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {editing ? (
        <Textarea defaultValue={value} rows={2} className="text-sm" />
      ) : (
        <p className="text-sm">{value || <span className="text-muted-foreground italic">Not specified</span>}</p>
      )}
    </div>
  );
}

function EmptyState({ icon: Icon, message }: { icon: React.ElementType; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
      <Icon className="w-12 h-12 mb-4 opacity-50" />
      <p>{message}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: 'Pending' | 'Completed' | 'Processing' }) {
  const config = {
    Pending: { icon: Clock, className: 'bg-warning/10 text-warning border-warning' },
    Processing: { icon: Clock, className: 'bg-primary/10 text-primary border-primary' },
    Completed: { icon: CheckCircle, className: 'bg-success/10 text-success border-success' },
  };

  const { icon: Icon, className } = config[status];

  return (
    <Badge variant="outline" className={cn('gap-1', className)}>
      <Icon className="w-3 h-3" />
      {status}
    </Badge>
  );
}
