import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  CalendarDays, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  User,
  Stethoscope,
  Plus,
  Edit,
  XCircle,
  Eye
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CalendarAppointment {
  id: string;
  patientName: string;
  patientPhone: string;
  doctorName: string;
  doctorId: string;
  time: string;
  type: 'new' | 'follow_up' | 'emergency' | 'routine';
  status: 'scheduled' | 'completed' | 'cancelled';
}

const mockAppointmentsByDate: Record<string, CalendarAppointment[]> = {
  [new Date().toISOString().split('T')[0]]: [
    { id: '1', patientName: 'John Anderson', patientPhone: '+1234567890', doctorName: 'Dr. Sarah Johnson', doctorId: '1', time: '09:00 AM', type: 'follow_up', status: 'scheduled' },
    { id: '2', patientName: 'Emily Chen', patientPhone: '+1234567891', doctorName: 'Dr. Sarah Johnson', doctorId: '1', time: '09:30 AM', type: 'new', status: 'scheduled' },
    { id: '3', patientName: 'Michael Brown', patientPhone: '+1234567892', doctorName: 'Dr. James Wilson', doctorId: '2', time: '10:00 AM', type: 'routine', status: 'completed' },
    { id: '4', patientName: 'Sophie Martinez', patientPhone: '+1234567893', doctorName: 'Dr. Sarah Johnson', doctorId: '1', time: '10:30 AM', type: 'follow_up', status: 'cancelled' },
    { id: '5', patientName: 'David Lee', patientPhone: '+1234567894', doctorName: 'Dr. James Wilson', doctorId: '2', time: '11:00 AM', type: 'emergency', status: 'scheduled' },
    { id: '6', patientName: 'Lisa Wilson', patientPhone: '+1234567895', doctorName: 'Dr. Emily Brown', doctorId: '3', time: '11:30 AM', type: 'new', status: 'scheduled' },
    { id: '7', patientName: 'Robert Taylor', patientPhone: '+1234567896', doctorName: 'Dr. Sarah Johnson', doctorId: '1', time: '02:00 PM', type: 'routine', status: 'scheduled' },
    { id: '8', patientName: 'Anna White', patientPhone: '+1234567897', doctorName: 'Dr. James Wilson', doctorId: '2', time: '02:30 PM', type: 'follow_up', status: 'scheduled' },
  ],
};

const doctors = [
  { id: 'all', name: 'All Doctors' },
  { id: '1', name: 'Dr. Sarah Johnson' },
  { id: '2', name: 'Dr. James Wilson' },
  { id: '3', name: 'Dr. Emily Brown' },
];

const timeSlots = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
  '04:00 PM', '04:30 PM', '05:00 PM'
];

export default function AppointmentCalendar() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedDoctor, setSelectedDoctor] = useState('all');
  const [appointmentsData, setAppointmentsData] = useState(mockAppointmentsByDate);
  
  // Dialog states
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<CalendarAppointment | null>(null);
  
  // Reschedule form states
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newDoctor, setNewDoctor] = useState('');
  const [cancelReason, setCancelReason] = useState('');

  const dateKey = selectedDate.toISOString().split('T')[0];
  const dayAppointments = appointmentsData[dateKey] || [];
  
  const filteredAppointments = selectedDoctor === 'all' 
    ? dayAppointments 
    : dayAppointments.filter(apt => apt.doctorName === doctors.find(d => d.id === selectedDoctor)?.name);

  const handleView = (appointment: CalendarAppointment) => {
    setSelectedAppointment(appointment);
    setViewDialogOpen(true);
  };

  const handleReschedule = (appointment: CalendarAppointment) => {
    setSelectedAppointment(appointment);
    setNewDate(dateKey);
    setNewTime(appointment.time);
    setNewDoctor(appointment.doctorId);
    setRescheduleDialogOpen(true);
  };

  const handleCancel = (appointment: CalendarAppointment) => {
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
    const updatedAppointment = {
      ...selectedAppointment,
      doctorId: newDoctor,
      doctorName: doctor?.name || selectedAppointment.doctorName,
      time: newTime,
    };

    // Remove from old date
    const updatedData = { ...appointmentsData };
    updatedData[dateKey] = (updatedData[dateKey] || []).filter(apt => apt.id !== selectedAppointment.id);
    
    // Add to new date
    if (!updatedData[newDate]) {
      updatedData[newDate] = [];
    }
    updatedData[newDate].push(updatedAppointment);
    
    setAppointmentsData(updatedData);

    toast({
      title: 'Appointment Rescheduled',
      description: `Appointment for ${selectedAppointment.patientName} has been rescheduled to ${newDate} at ${newTime}.`,
    });

    setRescheduleDialogOpen(false);
    setSelectedAppointment(null);
  };

  const confirmCancel = () => {
    if (!selectedAppointment) return;

    const updatedData = { ...appointmentsData };
    updatedData[dateKey] = (updatedData[dateKey] || []).map(apt =>
      apt.id === selectedAppointment.id
        ? { ...apt, status: 'cancelled' as const }
        : apt
    );
    
    setAppointmentsData(updatedData);

    toast({
      title: 'Appointment Cancelled',
      description: `Appointment for ${selectedAppointment.patientName} has been cancelled.`,
    });

    setCancelDialogOpen(false);
    setSelectedAppointment(null);
  };

  const getTypeBadge = (type: CalendarAppointment['type']) => {
    const styles = {
      new: 'bg-primary/10 text-primary border-primary/20',
      follow_up: 'bg-accent text-accent-foreground',
      emergency: 'bg-destructive/10 text-destructive border-destructive/20',
      routine: 'bg-muted text-muted-foreground',
    };
    const labels = {
      new: 'New',
      follow_up: 'Follow-up',
      emergency: 'Emergency',
      routine: 'Routine',
    };
    return <Badge className={styles[type]} variant="outline">{labels[type]}</Badge>;
  };

  const getStatusColor = (status: CalendarAppointment['status']) => {
    switch (status) {
      case 'completed': return 'border-l-success';
      case 'cancelled': return 'border-l-destructive opacity-60';
      default: return 'border-l-primary';
    }
  };

  const getStatusBadge = (status: CalendarAppointment['status']) => {
    const styles = {
      scheduled: 'bg-primary/10 text-primary border-primary/20',
      completed: 'bg-success/10 text-success border-success/20',
      cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
    };
    const labels = {
      scheduled: 'Scheduled',
      completed: 'Completed',
      cancelled: 'Cancelled',
    };
    return <Badge className={styles[status]} variant="outline">{labels[status]}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Appointment Calendar</h1>
            <p className="text-muted-foreground">View and manage appointments in calendar view</p>
          </div>
          <Button className="gap-2" onClick={() => navigate('/appointments/book')}>
            <Plus className="w-4 h-4" />
            Book Appointment
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-primary" />
                Select Date
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border"
              />
              
              <div className="mt-4 space-y-2">
                <label className="text-sm font-medium">Filter by Doctor</label>
                <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        {doctor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Legend */}
              <div className="mt-4 pt-4 border-t space-y-2">
                <p className="text-sm font-medium">Status Legend</p>
                <div className="flex flex-wrap gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                    <span>Scheduled</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-success"></div>
                    <span>Completed</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-destructive"></div>
                    <span>Cancelled</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Day View */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {selectedDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() - 1)))}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedDate(new Date())}
                    >
                      Today
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() + 1)))}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredAppointments.length > 0 ? (
                  <div className="space-y-3">
                    {filteredAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className={`flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg border border-l-4 ${getStatusColor(appointment.status)} bg-card hover:shadow-md transition-shadow`}
                      >
                        <div className="flex-shrink-0 text-center">
                          <Clock className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                          <p className="text-sm font-medium">{appointment.time}</p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <p className="font-medium truncate">{appointment.patientName}</p>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Stethoscope className="w-3 h-3" />
                            <span>{appointment.doctorName}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {getTypeBadge(appointment.type)}
                          {getStatusBadge(appointment.status)}
                        </div>
                        {appointment.status === 'scheduled' && (
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleView(appointment)}
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleReschedule(appointment)}
                              title="Reschedule"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleCancel(appointment)}
                              title="Cancel"
                              className="text-destructive hover:text-destructive"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <CalendarDays className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>No appointments scheduled for this date</p>
                    <Button variant="outline" className="mt-4 gap-2" onClick={() => navigate('/appointments/book')}>
                      <Plus className="w-4 h-4" />
                      Book Appointment
                    </Button>
                  </div>
                )}

                {/* Available Time Slots */}
                {filteredAppointments.length > 0 && (
                  <div className="mt-6 pt-6 border-t">
                    <h3 className="text-sm font-medium mb-3">Available Time Slots</h3>
                    <div className="flex flex-wrap gap-2">
                      {timeSlots
                        .filter(slot => !filteredAppointments.some(apt => apt.time === slot))
                        .map((slot) => (
                          <Button 
                            key={slot} 
                            variant="outline" 
                            size="sm" 
                            className="text-xs"
                            onClick={() => navigate('/appointments/book')}
                          >
                            {slot}
                          </Button>
                        ))
                      }
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* View Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogDescription>
              View complete appointment information
            </DialogDescription>
          </DialogHeader>
          
          {selectedAppointment && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Patient Name</Label>
                  <p className="font-medium">{selectedAppointment.patientName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Phone</Label>
                  <p className="font-medium">{selectedAppointment.patientPhone}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Doctor</Label>
                  <p className="font-medium">{selectedAppointment.doctorName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Time</Label>
                  <p className="font-medium">{selectedAppointment.time}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Type</Label>
                  <div className="mt-1">{getTypeBadge(selectedAppointment.type)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedAppointment.status)}</div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
            {selectedAppointment?.status === 'scheduled' && (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setViewDialogOpen(false);
                    handleReschedule(selectedAppointment);
                  }}
                >
                  Reschedule
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    setViewDialogOpen(false);
                    handleCancel(selectedAppointment);
                  }}
                >
                  Cancel Appointment
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                  Current: {dateKey} at {selectedAppointment.time} with {selectedAppointment.doctorName}
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
                    {doctors.filter(d => d.id !== 'all').map((doctor) => (
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
                  {dateKey} at {selectedAppointment.time} with {selectedAppointment.doctorName}
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