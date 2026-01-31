import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Patient, AppointmentType, BookingSource } from '@/types/patient';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Stethoscope,
  FileText,
  X,
  Check,
} from 'lucide-react';

interface BookAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient | null;
  onBook: (appointmentData: AppointmentFormData) => void;
}

export interface AppointmentFormData {
  patientId: string;
  doctorId: string;
  appointmentDate: Date;
  appointmentTime: string;
  appointmentType: AppointmentType;
  bookingSource: BookingSource;
  reasonForVisit: string;
  symptoms: string;
  notes: string;
}

const mockDoctors = [
  { id: '1', name: 'Dr. Suresh Kumar', department: 'General Medicine' },
  { id: '2', name: 'Dr. Meena Sharma', department: 'Cardiology' },
  { id: '3', name: 'Dr. Ramesh Patel', department: 'Orthopedics' },
  { id: '4', name: 'Dr. Anand Rao', department: 'Neurology' },
  { id: '5', name: 'Dr. Priya Singh', department: 'Dermatology' },
];

const timeSlots = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
  '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
];

const appointmentTypes: { value: AppointmentType; label: string }[] = [
  { value: 'NEW', label: 'New Consultation' },
  { value: 'FOLLOW_UP', label: 'Follow-up' },
  { value: 'EMERGENCY', label: 'Emergency' },
  { value: 'ROUTINE_CHECKUP', label: 'Routine Checkup' },
];

const bookingSources: { value: BookingSource; label: string }[] = [
  { value: 'WALK_IN', label: 'Walk-in' },
  { value: 'PHONE', label: 'Phone' },
  { value: 'ONLINE', label: 'Online' },
  { value: 'MOBILE_APP', label: 'Mobile App' },
];

export function BookAppointmentDialog({ open, onOpenChange, patient, onBook }: BookAppointmentDialogProps) {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [appointmentType, setAppointmentType] = useState<AppointmentType>('NEW');
  const [bookingSource, setBookingSource] = useState<BookingSource>('WALK_IN');
  const [reasonForVisit, setReasonForVisit] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [notes, setNotes] = useState('');

  if (!patient) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime || !selectedDoctor) {
      toast({
        title: 'Missing Information',
        description: 'Please select date, time, and doctor.',
        variant: 'destructive',
      });
      return;
    }

    const appointmentData: AppointmentFormData = {
      patientId: patient.id,
      doctorId: selectedDoctor,
      appointmentDate: selectedDate,
      appointmentTime: selectedTime,
      appointmentType,
      bookingSource,
      reasonForVisit,
      symptoms,
      notes,
    };

    onBook(appointmentData);
    
    toast({
      title: 'Appointment Booked',
      description: `Appointment scheduled for ${patient.firstName} ${patient.lastName} on ${format(selectedDate, 'PPP')} at ${selectedTime}.`,
    });

    // Reset form
    setSelectedDate(new Date());
    setSelectedTime('');
    setSelectedDoctor('');
    setAppointmentType('NEW');
    setBookingSource('WALK_IN');
    setReasonForVisit('');
    setSymptoms('');
    setNotes('');
    onOpenChange(false);
  };

  const selectedDoctorInfo = mockDoctors.find(d => d.id === selectedDoctor);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <CalendarIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Book Appointment</h2>
              <p className="text-sm text-muted-foreground font-normal">
                {patient.firstName} {patient.lastName} ({patient.patientCode})
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 pr-2">
          {/* Patient Info Card */}
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">{patient.firstName} {patient.lastName}</p>
              <p className="text-xs text-muted-foreground">{patient.phone} • {patient.bloodGroup}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Doctor Selection */}
            <div className="space-y-1.5">
              <Label className="text-sm flex items-center gap-1.5">
                <Stethoscope className="w-4 h-4" />
                Select Doctor *
              </Label>
              <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a doctor" />
                </SelectTrigger>
                <SelectContent>
                  {mockDoctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      <div className="flex flex-col">
                        <span>{doctor.name}</span>
                        <span className="text-xs text-muted-foreground">{doctor.department}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedDoctorInfo && (
                <p className="text-xs text-muted-foreground">
                  Department: {selectedDoctorInfo.department}
                </p>
              )}
            </div>

            {/* Appointment Type */}
            <div className="space-y-1.5">
              <Label className="text-sm">Appointment Type *</Label>
              <Select value={appointmentType} onValueChange={(v: AppointmentType) => setAppointmentType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {appointmentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Selection */}
            <div className="space-y-1.5">
              <Label className="text-sm flex items-center gap-1.5">
                <CalendarIcon className="w-4 h-4" />
                Appointment Date *
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !selectedDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time Selection */}
            <div className="space-y-1.5">
              <Label className="text-sm flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                Appointment Time *
              </Label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time slot" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Booking Source */}
            <div className="space-y-1.5">
              <Label className="text-sm">Booking Source</Label>
              <Select value={bookingSource} onValueChange={(v: BookingSource) => setBookingSource(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {bookingSources.map((source) => (
                    <SelectItem key={source.value} value={source.value}>
                      {source.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Reason for Visit */}
          <div className="space-y-1.5">
            <Label className="text-sm flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              Reason for Visit
            </Label>
            <Input
              value={reasonForVisit}
              onChange={(e) => setReasonForVisit(e.target.value)}
              placeholder="e.g., Regular checkup, Follow-up for diabetes"
            />
          </div>

          {/* Symptoms */}
          <div className="space-y-1.5">
            <Label className="text-sm">Symptoms</Label>
            <Textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="Describe symptoms if any..."
              className="min-h-[60px] resize-none"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label className="text-sm">Additional Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special requests or notes..."
              className="min-h-[60px] resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit">
              <Check className="w-4 h-4 mr-2" />
              Book Appointment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
