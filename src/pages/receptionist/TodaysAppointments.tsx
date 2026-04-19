import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  CalendarCheck,
  Search,
  MoreVertical,
  Edit,
  Clock,
  User,
  Stethoscope,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserCheck,
  Phone,
  PlayCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

type AppointmentStatus = 'Scheduled' | 'Checked-In' | 'In Progress' | 'Completed' | 'Cancelled' | 'No Show';

interface TodayAppointment {
  id: string;
  tokenNumber: number;
  patientName: string;
  patientPhone: string;
  patientCode: string;
  doctorName: string;
  department: string;
  time: string;
  status: AppointmentStatus;
  type: string;
  checkedInAt?: string;
}

const today = format(new Date(), 'yyyy-MM-dd');

const mockTodayAppointments: TodayAppointment[] = [
  { id: '1', tokenNumber: 1, patientName: 'John Smith', patientPhone: '+1 234 567 8901', patientCode: 'PAT001', doctorName: 'Dr. James Wilson', department: 'Cardiology', time: '09:00 AM', status: 'Completed', type: 'Consultation', checkedInAt: '08:45 AM' },
  { id: '2', tokenNumber: 2, patientName: 'Sarah Johnson', patientPhone: '+1 234 567 8902', patientCode: 'PAT002', doctorName: 'Dr. Emily Chen', department: 'Dermatology', time: '09:30 AM', status: 'In Progress', type: 'Follow-up', checkedInAt: '09:15 AM' },
  { id: '3', tokenNumber: 3, patientName: 'Michael Brown', patientPhone: '+1 234 567 8903', patientCode: 'PAT003', doctorName: 'Dr. Sarah Johnson', department: 'Pediatrics', time: '10:00 AM', status: 'Checked-In', type: 'Check-up', checkedInAt: '09:50 AM' },
  { id: '4', tokenNumber: 4, patientName: 'Emily Davis', patientPhone: '+1 234 567 8904', patientCode: 'PAT004', doctorName: 'Dr. Robert Taylor', department: 'Neurology', time: '10:30 AM', status: 'Scheduled', type: 'Consultation' },
  { id: '5', tokenNumber: 5, patientName: 'Robert Wilson', patientPhone: '+1 234 567 8905', patientCode: 'PAT005', doctorName: 'Dr. James Wilson', department: 'Cardiology', time: '11:00 AM', status: 'Scheduled', type: 'Follow-up' },
  { id: '6', tokenNumber: 6, patientName: 'Lisa Anderson', patientPhone: '+1 234 567 8906', patientCode: 'PAT006', doctorName: 'Dr. Michael Brown', department: 'Orthopedics', time: '11:30 AM', status: 'Scheduled', type: 'Consultation' },
  { id: '7', tokenNumber: 7, patientName: 'David Lee', patientPhone: '+1 234 567 8907', patientCode: 'PAT007', doctorName: 'Dr. Emily Chen', department: 'Dermatology', time: '02:00 PM', status: 'Cancelled', type: 'Follow-up' },
  { id: '8', tokenNumber: 8, patientName: 'Jennifer White', patientPhone: '+1 234 567 8908', patientCode: 'PAT008', doctorName: 'Dr. Sarah Johnson', department: 'Pediatrics', time: '02:30 PM', status: 'Scheduled', type: 'Vaccination' },
];

const statusConfig: Record<AppointmentStatus, { icon: React.ElementType; color: string; bgColor: string }> = {
  Scheduled: {
    icon: Clock,
    color: 'text-blue-700 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
  },
  'Checked-In': {
    icon: UserCheck,
    color: 'text-indigo-700 dark:text-indigo-400',
    bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
  },
  'In Progress': {
    icon: PlayCircle,
    color: 'text-amber-700 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
  },
  Completed: {
    icon: CheckCircle,
    color: 'text-green-700 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
  },
  Cancelled: {
    icon: XCircle,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
  },
  'No Show': {
    icon: AlertCircle,
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-900/30',
  },
};

export default function TodaysAppointments() {
  const [appointments, setAppointments] = useState<TodayAppointment[]>(mockTodayAppointments);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDoctor, setSelectedDoctor] = useState<string>('all');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<TodayAppointment | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch =
      apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.patientCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || apt.status === selectedStatus;
    const matchesDoctor = selectedDoctor === 'all' || apt.doctorName === selectedDoctor;
    return matchesSearch && matchesStatus && matchesDoctor;
  });

  const doctors = [...new Set(appointments.map((a) => a.doctorName))];

  const handleCheckIn = (appointment: TodayAppointment) => {
    setAppointments(appointments.map(apt =>
      apt.id === appointment.id
        ? { ...apt, status: 'Checked-In' as const, checkedInAt: format(new Date(), 'hh:mm a') }
        : apt
    ));
    toast({
      title: 'Patient Checked In',
      description: `${appointment.patientName} has been checked in successfully.`,
    });
  };

  const handleStartConsultation = (appointment: TodayAppointment) => {
    setAppointments(appointments.map(apt =>
      apt.id === appointment.id
        ? { ...apt, status: 'In Progress' as const }
        : apt
    ));
    toast({
      title: 'Consultation Started',
      description: `Consultation started for ${appointment.patientName}.`,
    });
  };

  const handleMarkComplete = (appointment: TodayAppointment) => {
    setAppointments(appointments.map(apt =>
      apt.id === appointment.id
        ? { ...apt, status: 'Completed' as const }
        : apt
    ));
    toast({
      title: 'Appointment Completed',
      description: `Appointment for ${appointment.patientName} has been marked as complete.`,
    });
  };

  const handleCancelClick = (appointment: TodayAppointment) => {
    setSelectedAppointment(appointment);
    setCancelReason('');
    setCancelDialogOpen(true);
  };

  const confirmCancel = () => {
    if (!selectedAppointment) return;
    
    setAppointments(appointments.map(apt =>
      apt.id === selectedAppointment.id
        ? { ...apt, status: 'Cancelled' as const }
        : apt
    ));
    
    toast({
      title: 'Appointment Cancelled',
      description: `Appointment for ${selectedAppointment.patientName} has been cancelled.`,
    });
    
    setCancelDialogOpen(false);
    setSelectedAppointment(null);
  };

  const handleNoShow = (appointment: TodayAppointment) => {
    setAppointments(appointments.map(apt =>
      apt.id === appointment.id
        ? { ...apt, status: 'No Show' as const }
        : apt
    ));
    toast({
      title: 'Marked as No Show',
      description: `${appointment.patientName} has been marked as no show.`,
    });
  };

  const getStats = () => {
    return {
      total: appointments.length,
      scheduled: appointments.filter(a => a.status === 'Scheduled').length,
      checkedIn: appointments.filter(a => a.status === 'Checked-In').length,
      inProgress: appointments.filter(a => a.status === 'In Progress').length,
      completed: appointments.filter(a => a.status === 'Completed').length,
      cancelled: appointments.filter(a => a.status === 'Cancelled').length,
    };
  };

  const stats = getStats();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <CalendarCheck className="w-6 h-6" />
              Today's Appointments
            </h1>
            <p className="text-muted-foreground">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{stats.scheduled}</p>
                <p className="text-xs text-muted-foreground">Scheduled</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-indigo-600">{stats.checkedIn}</p>
                <p className="text-xs text-muted-foreground">Checked-In</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-600">{stats.inProgress}</p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
                <p className="text-xs text-muted-foreground">Cancelled</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by patient name, code, or doctor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Doctor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Doctors</SelectItem>
                  {doctors.map((doc) => (
                    <SelectItem key={doc} value={doc}>{doc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="Checked-In">Checked-In</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                  <SelectItem value="No Show">No Show</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Appointments Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarCheck className="w-5 h-5" />
              Appointments ({filteredAppointments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-16">Token</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead className="hidden md:table-cell">Doctor</TableHead>
                    <TableHead className="hidden lg:table-cell">Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments.map((apt) => {
                    const StatusIcon = statusConfig[apt.status].icon;
                    return (
                      <TableRow key={apt.id} className="hover:bg-muted/50">
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            #{apt.tokenNumber}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{apt.time}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{apt.patientName}</p>
                              <p className="text-xs text-muted-foreground">{apt.patientCode}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-2">
                            <Stethoscope className="w-4 h-4 text-emerald-600" />
                            <div>
                              <p className="text-sm font-medium">{apt.doctorName}</p>
                              <p className="text-xs text-muted-foreground">{apt.department}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <Badge variant="outline">{apt.type}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn('gap-1', statusConfig[apt.status].bgColor, statusConfig[apt.status].color)}>
                            <StatusIcon className="w-3 h-3" />
                            {apt.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {apt.status === 'Scheduled' && (
                                <DropdownMenuItem 
                                  className="gap-2"
                                  onClick={() => handleCheckIn(apt)}
                                >
                                  <UserCheck className="w-4 h-4" />
                                  Check-In Patient
                                </DropdownMenuItem>
                              )}
                              {apt.status === 'Checked-In' && (
                                <DropdownMenuItem 
                                  className="gap-2"
                                  onClick={() => handleStartConsultation(apt)}
                                >
                                  <PlayCircle className="w-4 h-4" />
                                  Start Consultation
                                </DropdownMenuItem>
                              )}
                              {apt.status === 'In Progress' && (
                                <DropdownMenuItem 
                                  className="gap-2"
                                  onClick={() => handleMarkComplete(apt)}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  Mark Complete
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem className="gap-2">
                                <Phone className="w-4 h-4" />
                                Call Patient
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2">
                                <Edit className="w-4 h-4" />
                                Edit Appointment
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {apt.status === 'Scheduled' && (
                                <DropdownMenuItem 
                                  className="gap-2 text-orange-600"
                                  onClick={() => handleNoShow(apt)}
                                >
                                  <AlertCircle className="w-4 h-4" />
                                  Mark No Show
                                </DropdownMenuItem>
                              )}
                              {(apt.status === 'Scheduled' || apt.status === 'Checked-In') && (
                                <DropdownMenuItem 
                                  className="gap-2 text-destructive"
                                  onClick={() => handleCancelClick(apt)}
                                >
                                  <XCircle className="w-4 h-4" />
                                  Cancel Appointment
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {filteredAppointments.length === 0 && (
              <div className="text-center py-12">
                <CalendarCheck className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">No appointments found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this appointment?
            </DialogDescription>
          </DialogHeader>
          
          {selectedAppointment && (
            <div className="space-y-4 py-4">
              <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                <p className="font-medium">{selectedAppointment.patientName}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedAppointment.time} with {selectedAppointment.doctorName}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Reason for Cancellation</Label>
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
