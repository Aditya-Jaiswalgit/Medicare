import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Calendar, 
  Search,
  Clock,
  User,
  Stethoscope,
  Edit,
  XCircle,
  CalendarX,
  RefreshCw
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AppointmentToManage {
  id: string;
  patientName: string;
  patientPhone: string;
  doctorName: string;
  doctorId: string;
  date: string;
  time: string;
  type: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  reason?: string;
}

const mockAppointments: AppointmentToManage[] = [
  { id: '1', patientName: 'John Anderson', patientPhone: '+1234567890', doctorName: 'Dr. Sarah Johnson', doctorId: '1', date: '2024-01-16', time: '09:00 AM', type: 'Follow-up', status: 'scheduled' },
  { id: '2', patientName: 'Emily Chen', patientPhone: '+1234567891', doctorName: 'Dr. Sarah Johnson', doctorId: '1', date: '2024-01-16', time: '09:30 AM', type: 'New Consultation', status: 'scheduled' },
  { id: '3', patientName: 'Michael Brown', patientPhone: '+1234567892', doctorName: 'Dr. James Wilson', doctorId: '2', date: '2024-01-16', time: '10:00 AM', type: 'Routine Checkup', status: 'scheduled' },
  { id: '4', patientName: 'Sophie Martinez', patientPhone: '+1234567893', doctorName: 'Dr. Sarah Johnson', doctorId: '1', date: '2024-01-17', time: '10:30 AM', type: 'Follow-up', status: 'scheduled' },
  { id: '5', patientName: 'David Lee', patientPhone: '+1234567894', doctorName: 'Dr. James Wilson', doctorId: '2', date: '2024-01-17', time: '11:00 AM', type: 'Emergency', status: 'scheduled' },
  { id: '6', patientName: 'Lisa Wilson', patientPhone: '+1234567895', doctorName: 'Dr. Emily Brown', doctorId: '3', date: '2024-01-18', time: '11:30 AM', type: 'New Consultation', status: 'scheduled' },
];

const timeSlots = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM'
];

const doctors = [
  { id: '1', name: 'Dr. Sarah Johnson' },
  { id: '2', name: 'Dr. James Wilson' },
  { id: '3', name: 'Dr. Emily Brown' },
];

export default function ManageAppointments() {
  const [appointments, setAppointments] = useState<AppointmentToManage[]>(mockAppointments);
  const [searchQuery, setSearchQuery] = useState('');
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentToManage | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newDoctor, setNewDoctor] = useState('');
  const [cancelReason, setCancelReason] = useState('');

  const filteredAppointments = appointments.filter(apt =>
    apt.status === 'scheduled' && (
      apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.patientPhone.includes(searchQuery)
    )
  );

  const handleReschedule = (appointment: AppointmentToManage) => {
    setSelectedAppointment(appointment);
    setNewDate(appointment.date);
    setNewTime(appointment.time);
    setNewDoctor(appointment.doctorId);
    setRescheduleDialogOpen(true);
  };

  const handleCancel = (appointment: AppointmentToManage) => {
    setSelectedAppointment(appointment);
    setCancelReason('');
    setCancelDialogOpen(true);
  };

  const confirmReschedule = () => {
    if (!selectedAppointment || !newDate || !newTime) {
      toast({
        title: 'Missing Information',
        description: 'Please select a new date and time.',
        variant: 'destructive',
      });
      return;
    }

    const doctor = doctors.find(d => d.id === newDoctor);
    setAppointments(appointments.map(apt =>
      apt.id === selectedAppointment.id
        ? { ...apt, date: newDate, time: newTime, doctorId: newDoctor, doctorName: doctor?.name || apt.doctorName }
        : apt
    ));

    toast({
      title: 'Appointment Rescheduled',
      description: `Appointment for ${selectedAppointment.patientName} has been rescheduled to ${newDate} at ${newTime}.`,
    });

    setRescheduleDialogOpen(false);
    setSelectedAppointment(null);
  };

  const confirmCancel = () => {
    if (!selectedAppointment) return;

    setAppointments(appointments.map(apt =>
      apt.id === selectedAppointment.id
        ? { ...apt, status: 'cancelled' as const, reason: cancelReason }
        : apt
    ));

    toast({
      title: 'Appointment Cancelled',
      description: `Appointment for ${selectedAppointment.patientName} has been cancelled.`,
    });

    setCancelDialogOpen(false);
    setSelectedAppointment(null);
  };

  const getStatusBadge = (status: AppointmentToManage['status']) => {
    const styles = {
      scheduled: 'bg-primary/10 text-primary border-primary/20',
      completed: 'bg-success/10 text-success border-success/20',
      cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
    };
    return <Badge className={styles[status]} variant="outline">{status}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Manage Appointments</h1>
          <p className="text-muted-foreground">Reschedule or cancel existing appointments</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{filteredAppointments.length}</p>
                  <p className="text-sm text-muted-foreground">Upcoming</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-warning/10">
                  <RefreshCw className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">2</p>
                  <p className="text-sm text-muted-foreground">Rescheduled Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-destructive/10">
                  <CalendarX className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{appointments.filter(a => a.status === 'cancelled').length}</p>
                  <p className="text-sm text-muted-foreground">Cancelled Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Appointments List */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle>Scheduled Appointments</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by patient or doctor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full sm:w-72"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{appointment.patientName}</p>
                      <p className="text-sm text-muted-foreground">{appointment.patientPhone}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:items-center gap-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{appointment.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{appointment.time}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end gap-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Stethoscope className="w-4 h-4 text-muted-foreground" />
                      <span>{appointment.doctorName}</span>
                    </div>
                    <Badge variant="outline" className="text-xs w-fit">{appointment.type}</Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleReschedule(appointment)}
                      className="gap-1"
                    >
                      <Edit className="w-3 h-3" />
                      Reschedule
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleCancel(appointment)}
                      className="gap-1 text-destructive hover:text-destructive"
                    >
                      <XCircle className="w-3 h-3" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ))}
              {filteredAppointments.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No scheduled appointments found
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reschedule Dialog */}
      <Dialog open={rescheduleDialogOpen} onOpenChange={setRescheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
            <DialogDescription>
              Change the date, time, or doctor for this appointment.
            </DialogDescription>
          </DialogHeader>
          
          {selectedAppointment && (
            <div className="space-y-4 py-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="font-medium">{selectedAppointment.patientName}</p>
                <p className="text-sm text-muted-foreground">
                  Current: {selectedAppointment.date} at {selectedAppointment.time} with {selectedAppointment.doctorName}
                </p>
              </div>

              <div className="space-y-2">
                <Label>New Date</Label>
                <Input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>New Time</Label>
                <Select value={newTime} onValueChange={setNewTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((slot) => (
                      <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Doctor</Label>
                <Select value={newDoctor} onValueChange={setNewDoctor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>{doctor.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setRescheduleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmReschedule}>
              Confirm Reschedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedAppointment && (
            <div className="space-y-4 py-4">
              <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                <p className="font-medium">{selectedAppointment.patientName}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedAppointment.date} at {selectedAppointment.time} with {selectedAppointment.doctorName}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Reason for Cancellation (Optional)</Label>
                <Textarea
                  placeholder="Enter reason..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Keep Appointment
            </Button>
            <Button variant="destructive" onClick={confirmCancel}>
              Cancel Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}