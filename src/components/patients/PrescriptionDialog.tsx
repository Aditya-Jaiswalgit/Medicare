import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Patient, Prescription } from '@/types/patient';
import { Pill, Plus, Edit, Trash2, CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface PrescriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient | null;
}

const mockDoctors = [
  { id: '1', name: 'Dr. Sarah Johnson' },
  { id: '2', name: 'Dr. Michael Chen' },
  { id: '3', name: 'Dr. Emily Williams' },
  { id: '4', name: 'Dr. Rajesh Patel' },
];

export function PrescriptionDialog({ open, onOpenChange, patient }: PrescriptionDialogProps) {
  const { toast } = useToast();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([
    {
      id: '1',
      patientId: patient?.id || '',
      doctorName: 'Dr. Sarah Johnson',
      date: '2024-01-10',
      medications: ['Paracetamol 500mg - 1 tablet twice daily', 'Vitamin C - 1 tablet daily'],
      instructions: 'Take after meals. Complete the full course.',
    },
    {
      id: '2',
      patientId: patient?.id || '',
      doctorName: 'Dr. Michael Chen',
      date: '2024-01-25',
      medications: ['Multivitamin - 1 tablet daily'],
      instructions: 'Continue for 30 days.',
    },
  ]);
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    doctorName: '',
    date: new Date(),
    medications: [] as string[],
    instructions: '',
  });
  const [dateInput, setDateInput] = useState(format(new Date(), 'dd/MM/yyyy'));
  const [newMedication, setNewMedication] = useState('');

  const resetForm = () => {
    setFormData({
      doctorName: '',
      date: new Date(),
      medications: [],
      instructions: '',
    });
    setDateInput(format(new Date(), 'dd/MM/yyyy'));
    setNewMedication('');
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (prescription: Prescription) => {
    setFormData({
      doctorName: prescription.doctorName,
      date: new Date(prescription.date),
      medications: [...prescription.medications],
      instructions: prescription.instructions,
    });
    setDateInput(format(new Date(prescription.date), 'dd/MM/yyyy'));
    setEditingId(prescription.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setPrescriptions(prescriptions.filter(p => p.id !== id));
    toast({ title: 'Prescription Deleted', description: 'Record has been removed.' });
  };

  const handleAddMedication = () => {
    if (newMedication.trim()) {
      setFormData({ ...formData, medications: [...formData.medications, newMedication.trim()] });
      setNewMedication('');
    }
  };

  const handleRemoveMedication = (index: number) => {
    setFormData({ 
      ...formData, 
      medications: formData.medications.filter((_, i) => i !== index) 
    });
  };

  const handleSave = () => {
    if (!formData.doctorName || formData.medications.length === 0) {
      toast({ title: 'Error', description: 'Please fill required fields and add at least one medication.', variant: 'destructive' });
      return;
    }

    if (editingId) {
      setPrescriptions(prescriptions.map(p => 
        p.id === editingId 
          ? { ...p, ...formData, date: format(formData.date, 'yyyy-MM-dd') }
          : p
      ));
      toast({ title: 'Prescription Updated' });
    } else {
      const newPrescription: Prescription = {
        id: String(Date.now()),
        patientId: patient?.id || '',
        doctorName: formData.doctorName,
        date: format(formData.date, 'yyyy-MM-dd'),
        medications: formData.medications,
        instructions: formData.instructions,
      };
      setPrescriptions([newPrescription, ...prescriptions]);
      toast({ title: 'Prescription Added' });
    }
    resetForm();
  };

  const handleDateInputChange = (value: string) => {
    setDateInput(value);
    const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = value.match(dateRegex);
    if (match) {
      const [, day, month, year] = match;
      const parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (!isNaN(parsedDate.getTime())) {
        setFormData({ ...formData, date: parsedDate });
      }
    }
  };

  if (!patient) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pill className="w-5 h-5 text-primary" />
            Prescriptions - {patient.firstName} {patient.lastName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!showForm && (
            <Button onClick={() => setShowForm(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Prescription
            </Button>
          )}

          {showForm && (
            <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
              <h4 className="font-medium">{editingId ? 'Edit Prescription' : 'New Prescription'}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Doctor *</Label>
                  <Select value={formData.doctorName} onValueChange={(v) => setFormData({ ...formData, doctorName: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockDoctors.map(doc => (
                        <SelectItem key={doc.id} value={doc.name}>{doc.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <div className="relative">
                        <Input
                          type="text"
                          placeholder="DD/MM/YYYY"
                          value={dateInput}
                          onChange={(e) => handleDateInputChange(e.target.value)}
                          className="pr-10"
                        />
                        <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50" />
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.date}
                        onSelect={(date) => {
                          if (date) {
                            setFormData({ ...formData, date });
                            setDateInput(format(date, 'dd/MM/yyyy'));
                          }
                        }}
                        numberOfMonths={1}
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Medications *</Label>
                <div className="flex gap-2">
                  <Input 
                    value={newMedication}
                    onChange={(e) => setNewMedication(e.target.value)}
                    placeholder="e.g., Paracetamol 500mg - 1 tablet twice daily"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddMedication())}
                  />
                  <Button type="button" onClick={handleAddMedication} variant="secondary">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {formData.medications.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.medications.map((med, index) => (
                      <Badge key={index} variant="secondary" className="gap-1 py-1.5">
                        {med}
                        <X 
                          className="w-3 h-3 cursor-pointer hover:text-destructive" 
                          onClick={() => handleRemoveMedication(index)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Instructions</Label>
                <Textarea 
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  placeholder="Special instructions for the patient..."
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave}>{editingId ? 'Update' : 'Save'}</Button>
                <Button variant="outline" onClick={resetForm}>Cancel</Button>
              </div>
            </div>
          )}

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Medications</TableHead>
                  <TableHead>Instructions</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prescriptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No prescriptions recorded
                    </TableCell>
                  </TableRow>
                ) : (
                  prescriptions.map((prescription) => (
                    <TableRow key={prescription.id}>
                      <TableCell>{format(new Date(prescription.date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{prescription.doctorName}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {prescription.medications.slice(0, 2).map((med, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {med.length > 30 ? med.substring(0, 30) + '...' : med}
                            </Badge>
                          ))}
                          {prescription.medications.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{prescription.medications.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">{prescription.instructions}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(prescription)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(prescription.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
