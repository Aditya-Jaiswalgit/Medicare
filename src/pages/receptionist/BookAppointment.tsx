import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  CalendarDays, 
  Clock, 
  User, 
  Stethoscope, 
  Phone,
  Search,
  Plus,
  CheckCircle
} from 'lucide-react';
import { format, parse, isValid } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Patient {
  id: string;
  name: string;
  phone: string;
  patientCode: string;
}

const mockPatients: Patient[] = [
  { id: '1', name: 'John Smith', phone: '+1 234 567 8901', patientCode: 'PAT001' },
  { id: '2', name: 'Sarah Johnson', phone: '+1 234 567 8902', patientCode: 'PAT002' },
  { id: '3', name: 'Michael Brown', phone: '+1 234 567 8903', patientCode: 'PAT003' },
  { id: '4', name: 'Emily Davis', phone: '+1 234 567 8904', patientCode: 'PAT004' },
  { id: '5', name: 'Robert Wilson', phone: '+1 234 567 8905', patientCode: 'PAT005' },
];

const doctors = [
  { id: '1', name: 'Dr. James Wilson', department: 'Cardiology' },
  { id: '2', name: 'Dr. Emily Chen', department: 'Dermatology' },
  { id: '3', name: 'Dr. Sarah Johnson', department: 'Pediatrics' },
  { id: '4', name: 'Dr. Robert Taylor', department: 'Neurology' },
  { id: '5', name: 'Dr. Michael Brown', department: 'Orthopedics' },
];

const timeSlots = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM'
];

const appointmentTypes = [
  'New Consultation',
  'Follow-up',
  'Routine Checkup',
  'Emergency',
  'Lab Review',
  'Vaccination',
];

const bookingSources = ['Walk-in', 'Phone', 'Online', 'Mobile App'];

export default function BookAppointment() {
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [appointmentDate, setAppointmentDate] = useState<Date | undefined>(undefined);
  const [dateInputValue, setDateInputValue] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [appointmentType, setAppointmentType] = useState('');
  const [bookingSource, setBookingSource] = useState('');
  const [reason, setReason] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [notes, setNotes] = useState('');
  const [showPatientResults, setShowPatientResults] = useState(false);

  const filteredPatients = mockPatients.filter(
    (p) =>
      p.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
      p.phone.includes(patientSearch) ||
      p.patientCode.toLowerCase().includes(patientSearch.toLowerCase())
  );

  const handleDateInputChange = (value: string) => {
    setDateInputValue(value);
    const parsed = parse(value, 'dd/MM/yyyy', new Date());
    if (isValid(parsed)) {
      setAppointmentDate(parsed);
    }
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    setAppointmentDate(date);
    if (date) {
      setDateInputValue(format(date, 'dd/MM/yyyy'));
    }
  };

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setPatientSearch(patient.name);
    setShowPatientResults(false);
  };

  const handleBookAppointment = () => {
    if (!selectedPatient) {
      toast({ title: 'Error', description: 'Please select a patient', variant: 'destructive' });
      return;
    }
    if (!selectedDoctor) {
      toast({ title: 'Error', description: 'Please select a doctor', variant: 'destructive' });
      return;
    }
    if (!appointmentDate) {
      toast({ title: 'Error', description: 'Please select appointment date', variant: 'destructive' });
      return;
    }
    if (!selectedTime) {
      toast({ title: 'Error', description: 'Please select appointment time', variant: 'destructive' });
      return;
    }
    if (!appointmentType) {
      toast({ title: 'Error', description: 'Please select appointment type', variant: 'destructive' });
      return;
    }

    const doctor = doctors.find(d => d.id === selectedDoctor);

    toast({
      title: 'Appointment Booked Successfully!',
      description: `Appointment for ${selectedPatient.name} with ${doctor?.name} on ${format(appointmentDate, 'dd MMM yyyy')} at ${selectedTime}`,
    });

    // Reset form
    setSelectedPatient(null);
    setPatientSearch('');
    setSelectedDoctor('');
    setAppointmentDate(undefined);
    setDateInputValue('');
    setSelectedTime('');
    setAppointmentType('');
    setBookingSource('');
    setReason('');
    setSymptoms('');
    setNotes('');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <CalendarDays className="w-6 h-6" />
            Book Appointment
          </h1>
          <p className="text-muted-foreground">Schedule a new appointment for a patient</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Patient Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Patient Details
                </CardTitle>
                <CardDescription>Search and select a patient</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, phone, or patient code..."
                    value={patientSearch}
                    onChange={(e) => {
                      setPatientSearch(e.target.value);
                      setShowPatientResults(true);
                      if (selectedPatient && e.target.value !== selectedPatient.name) {
                        setSelectedPatient(null);
                      }
                    }}
                    onFocus={() => setShowPatientResults(true)}
                    className="pl-10"
                  />
                  {showPatientResults && patientSearch && (
                    <div className="absolute z-10 w-full mt-1 bg-background border rounded-lg shadow-lg max-h-60 overflow-auto">
                      {filteredPatients.length > 0 ? (
                        filteredPatients.map((patient) => (
                          <div
                            key={patient.id}
                            className="p-3 hover:bg-muted cursor-pointer border-b last:border-0"
                            onClick={() => handleSelectPatient(patient)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{patient.name}</p>
                                <p className="text-sm text-muted-foreground">{patient.phone}</p>
                              </div>
                              <Badge variant="outline">{patient.patientCode}</Badge>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-center text-muted-foreground">
                          No patients found
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {selectedPatient && (
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-lg">{selectedPatient.name}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {selectedPatient.phone}
                          </span>
                          <Badge variant="outline">{selectedPatient.patientCode}</Badge>
                        </div>
                      </div>
                      <CheckCircle className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Appointment Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Stethoscope className="w-5 h-5" />
                  Appointment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Select Doctor *</Label>
                    <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        {doctors.map((doctor) => (
                          <SelectItem key={doctor.id} value={doctor.id}>
                            <div className="flex items-center gap-2">
                              <span>{doctor.name}</span>
                              <span className="text-muted-foreground">({doctor.department})</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Appointment Type *</Label>
                    <Select value={appointmentType} onValueChange={setAppointmentType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {appointmentTypes.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Appointment Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <div className="relative">
                          <Input
                            placeholder="DD/MM/YYYY"
                            value={dateInputValue}
                            onChange={(e) => handleDateInputChange(e.target.value)}
                            className="pr-10"
                          />
                          <CalendarDays className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground cursor-pointer" />
                        </div>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={appointmentDate}
                          onSelect={handleCalendarSelect}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>Appointment Time *</Label>
                    <Select value={selectedTime} onValueChange={setSelectedTime}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time slot" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((slot) => (
                          <SelectItem key={slot} value={slot}>
                            <div className="flex items-center gap-2">
                              <Clock className="w-3 h-3" />
                              {slot}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Booking Source</Label>
                    <Select value={bookingSource} onValueChange={setBookingSource}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                      <SelectContent>
                        {bookingSources.map((source) => (
                          <SelectItem key={source} value={source}>{source}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Reason for Visit</Label>
                    <Input
                      placeholder="Brief reason..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Symptoms</Label>
                  <Textarea
                    placeholder="Describe patient symptoms..."
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Additional Notes</Label>
                  <Textarea
                    placeholder="Any additional notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Summary */}
          <div className="space-y-6">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Appointment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Patient</span>
                    <span className="font-medium">{selectedPatient?.name || '-'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Doctor</span>
                    <span className="font-medium">
                      {doctors.find(d => d.id === selectedDoctor)?.name || '-'}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium">
                      {appointmentDate ? format(appointmentDate, 'dd MMM yyyy') : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Time</span>
                    <span className="font-medium">{selectedTime || '-'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Type</span>
                    <span className="font-medium">{appointmentType || '-'}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Source</span>
                    <span className="font-medium">{bookingSource || '-'}</span>
                  </div>
                </div>

                <Button 
                  className="w-full gap-2" 
                  size="lg"
                  onClick={handleBookAppointment}
                >
                  <Plus className="w-4 h-4" />
                  Book Appointment
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
