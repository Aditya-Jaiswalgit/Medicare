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
import { Patient, Consultation } from '@/types/patient';
import { Stethoscope, Plus, Edit, Trash2, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface ConsultationDialogProps {
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

export function ConsultationDialog({ open, onOpenChange, patient }: ConsultationDialogProps) {
  const { toast } = useToast();
  const [consultations, setConsultations] = useState<Consultation[]>([
    {
      id: '1',
      patientId: patient?.id || '',
      doctorName: 'Dr. Sarah Johnson',
      date: '2024-01-10',
      diagnosis: 'Viral Fever',
      notes: 'Patient presented with fever and body ache. Prescribed rest and medication.',
      status: 'Completed',
    },
    {
      id: '2',
      patientId: patient?.id || '',
      doctorName: 'Dr. Michael Chen',
      date: '2024-01-25',
      diagnosis: 'Follow-up checkup',
      notes: 'Patient recovered well. No further treatment needed.',
      status: 'Completed',
    },
  ]);
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    doctorName: '',
    date: new Date(),
    diagnosis: '',
    notes: '',
    status: 'Completed' as 'Completed' | 'Follow-up Required',
  });
  const [dateInput, setDateInput] = useState(format(new Date(), 'dd/MM/yyyy'));

  const resetForm = () => {
    setFormData({
      doctorName: '',
      date: new Date(),
      diagnosis: '',
      notes: '',
      status: 'Completed',
    });
    setDateInput(format(new Date(), 'dd/MM/yyyy'));
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (consultation: Consultation) => {
    setFormData({
      doctorName: consultation.doctorName,
      date: new Date(consultation.date),
      diagnosis: consultation.diagnosis,
      notes: consultation.notes,
      status: consultation.status,
    });
    setDateInput(format(new Date(consultation.date), 'dd/MM/yyyy'));
    setEditingId(consultation.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setConsultations(consultations.filter(c => c.id !== id));
    toast({ title: 'Consultation Deleted', description: 'Record has been removed.' });
  };

  const handleSave = () => {
    if (!formData.doctorName || !formData.diagnosis) {
      toast({ title: 'Error', description: 'Please fill required fields.', variant: 'destructive' });
      return;
    }

    if (editingId) {
      setConsultations(consultations.map(c => 
        c.id === editingId 
          ? { ...c, ...formData, date: format(formData.date, 'yyyy-MM-dd') }
          : c
      ));
      toast({ title: 'Consultation Updated' });
    } else {
      const newConsultation: Consultation = {
        id: String(Date.now()),
        patientId: patient?.id || '',
        doctorName: formData.doctorName,
        date: format(formData.date, 'yyyy-MM-dd'),
        diagnosis: formData.diagnosis,
        notes: formData.notes,
        status: formData.status,
      };
      setConsultations([newConsultation, ...consultations]);
      toast({ title: 'Consultation Added' });
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
            <Stethoscope className="w-5 h-5 text-primary" />
            Consultations - {patient.firstName} {patient.lastName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!showForm && (
            <Button onClick={() => setShowForm(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Consultation
            </Button>
          )}

          {showForm && (
            <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
              <h4 className="font-medium">{editingId ? 'Edit Consultation' : 'New Consultation'}</h4>
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
                <div className="space-y-2">
                  <Label>Diagnosis *</Label>
                  <Input 
                    value={formData.diagnosis} 
                    onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                    placeholder="Enter diagnosis"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(v: 'Completed' | 'Follow-up Required') => setFormData({ ...formData, status: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Follow-up Required">Follow-up Required</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea 
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Consultation notes..."
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
                  <TableHead>Diagnosis</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {consultations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No consultations recorded
                    </TableCell>
                  </TableRow>
                ) : (
                  consultations.map((consultation) => (
                    <TableRow key={consultation.id}>
                      <TableCell>{format(new Date(consultation.date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{consultation.doctorName}</TableCell>
                      <TableCell>{consultation.diagnosis}</TableCell>
                      <TableCell>
                        <Badge variant={consultation.status === 'Completed' ? 'default' : 'secondary'}>
                          {consultation.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">{consultation.notes}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(consultation)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(consultation.id)}>
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
