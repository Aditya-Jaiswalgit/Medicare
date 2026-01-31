import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Calendar as CalendarIcon,
  Search,
  MoreVertical,
  Edit,
  Clock,
  User,
  Stethoscope,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  RefreshCw,
  Filter,
  Download,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parse, isValid, isToday, isFuture, isPast, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { toast } from '@/hooks/use-toast';

type AppointmentStatus = 'Scheduled' | 'Completed' | 'Cancelled' | 'No Show';

interface AllAppointment {
  id: string;
  patientName: string;
  patientPhone: string;
  patientCode: string;
  doctorName: string;
  department: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  type: string;
  bookingSource: string;
  createdAt: string;
}

const mockAllAppointments: AllAppointment[] = [
  { id: '1', patientName: 'John Smith', patientPhone: '+1 234 567 8901', patientCode: 'PAT001', doctorName: 'Dr. James Wilson', department: 'Cardiology', date: '2024-01-20', time: '09:00 AM', status: 'Scheduled', type: 'Consultation', bookingSource: 'Walk-in', createdAt: '2024-01-18' },
  { id: '2', patientName: 'Sarah Johnson', patientPhone: '+1 234 567 8902', patientCode: 'PAT002', doctorName: 'Dr. Emily Chen', department: 'Dermatology', date: '2024-01-20', time: '09:30 AM', status: 'Completed', type: 'Follow-up', bookingSource: 'Phone', createdAt: '2024-01-17' },
  { id: '3', patientName: 'Michael Brown', patientPhone: '+1 234 567 8903', patientCode: 'PAT003', doctorName: 'Dr. Sarah Johnson', department: 'Pediatrics', date: '2024-01-19', time: '10:00 AM', status: 'Completed', type: 'Check-up', bookingSource: 'Online', createdAt: '2024-01-16' },
  { id: '4', patientName: 'Emily Davis', patientPhone: '+1 234 567 8904', patientCode: 'PAT004', doctorName: 'Dr. Robert Taylor', department: 'Neurology', date: '2024-01-21', time: '10:30 AM', status: 'Scheduled', type: 'Consultation', bookingSource: 'Walk-in', createdAt: '2024-01-19' },
  { id: '5', patientName: 'Robert Wilson', patientPhone: '+1 234 567 8905', patientCode: 'PAT005', doctorName: 'Dr. James Wilson', department: 'Cardiology', date: '2024-01-18', time: '11:00 AM', status: 'Cancelled', type: 'Follow-up', bookingSource: 'Phone', createdAt: '2024-01-15' },
  { id: '6', patientName: 'Lisa Anderson', patientPhone: '+1 234 567 8906', patientCode: 'PAT006', doctorName: 'Dr. Michael Brown', department: 'Orthopedics', date: '2024-01-22', time: '11:30 AM', status: 'Scheduled', type: 'Consultation', bookingSource: 'Online', createdAt: '2024-01-20' },
  { id: '7', patientName: 'David Lee', patientPhone: '+1 234 567 8907', patientCode: 'PAT007', doctorName: 'Dr. Emily Chen', department: 'Dermatology', date: '2024-01-17', time: '02:00 PM', status: 'Completed', type: 'Follow-up', bookingSource: 'Walk-in', createdAt: '2024-01-14' },
  { id: '8', patientName: 'Jennifer White', patientPhone: '+1 234 567 8908', patientCode: 'PAT008', doctorName: 'Dr. Sarah Johnson', department: 'Pediatrics', date: '2024-01-23', time: '02:30 PM', status: 'Scheduled', type: 'Vaccination', bookingSource: 'Phone', createdAt: '2024-01-21' },
  { id: '9', patientName: 'James Miller', patientPhone: '+1 234 567 8909', patientCode: 'PAT009', doctorName: 'Dr. Robert Taylor', department: 'Neurology', date: '2024-01-16', time: '03:00 PM', status: 'No Show', type: 'Consultation', bookingSource: 'Online', createdAt: '2024-01-13' },
  { id: '10', patientName: 'Amanda Taylor', patientPhone: '+1 234 567 8910', patientCode: 'PAT010', doctorName: 'Dr. James Wilson', department: 'Cardiology', date: '2024-01-24', time: '03:30 PM', status: 'Scheduled', type: 'Follow-up', bookingSource: 'Walk-in', createdAt: '2024-01-22' },
];

const statusConfig: Record<AppointmentStatus, { icon: React.ElementType; color: string; bgColor: string }> = {
  Scheduled: {
    icon: Clock,
    color: 'text-blue-700 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
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

const timeSlots = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM'
];

const doctors = [
  { id: '1', name: 'Dr. James Wilson' },
  { id: '2', name: 'Dr. Emily Chen' },
  { id: '3', name: 'Dr. Sarah Johnson' },
  { id: '4', name: 'Dr. Robert Taylor' },
  { id: '5', name: 'Dr. Michael Brown' },
];

export default function AllAppointments() {
  const [appointments, setAppointments] = useState<AllAppointment[]>(mockAllAppointments);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDoctor, setSelectedDoctor] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [fromDateInput, setFromDateInput] = useState('');
  const [toDateInput, setToDateInput] = useState('');

  // Dialogs
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AllAppointment | null>(null);
  
  // Reschedule form
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newDoctor, setNewDoctor] = useState('');
  const [cancelReason, setCancelReason] = useState('');

  const handleFromDateChange = (value: string) => {
    setFromDateInput(value);
    const parsed = parse(value, 'dd/MM/yyyy', new Date());
    if (isValid(parsed)) {
      setFromDate(parsed);
    }
  };

  const handleToDateChange = (value: string) => {
    setToDateInput(value);
    const parsed = parse(value, 'dd/MM/yyyy', new Date());
    if (isValid(parsed)) {
      setToDate(parsed);
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch =
      apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.patientCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.patientPhone.includes(searchQuery);
    const matchesStatus = selectedStatus === 'all' || apt.status === selectedStatus;
    const matchesDoctor = selectedDoctor === 'all' || apt.doctorName === selectedDoctor;
    
    // Date filter
    const aptDate = new Date(apt.date);
    let matchesDate = true;
    
    if (dateFilter === 'today') {
      matchesDate = isToday(aptDate);
    } else if (dateFilter === 'upcoming') {
      matchesDate = isFuture(aptDate) || isToday(aptDate);
    } else if (dateFilter === 'past') {
      matchesDate = isPast(aptDate) && !isToday(aptDate);
    } else if (dateFilter === 'custom' && fromDate && toDate) {
      matchesDate = isWithinInterval(aptDate, { start: startOfDay(fromDate), end: endOfDay(toDate) });
    }
    
    return matchesSearch && matchesStatus && matchesDoctor && matchesDate;
  });

  const doctorNames = [...new Set(appointments.map((a) => a.doctorName))];

  const handleView = (appointment: AllAppointment) => {
    setSelectedAppointment(appointment);
    setViewDialogOpen(true);
  };

  const handleReschedule = (appointment: AllAppointment) => {
    setSelectedAppointment(appointment);
    setNewDate(appointment.date);
    setNewTime(appointment.time);
    const doctor = doctors.find(d => d.name === appointment.doctorName);
    setNewDoctor(doctor?.id || '');
    setRescheduleDialogOpen(true);
  };

  const handleCancelClick = (appointment: AllAppointment) => {
    setSelectedAppointment(appointment);
    setCancelReason('');
    setCancelDialogOpen(true);
  };

  const confirmReschedule = () => {
    if (!selectedAppointment || !newDate || !newTime) {
      toast({ title: 'Error', description: 'Please select date and time', variant: 'destructive' });
      return;
    }

    const doctor = doctors.find(d => d.id === newDoctor);
    setAppointments(appointments.map(apt =>
      apt.id === selectedAppointment.id
        ? { ...apt, date: newDate, time: newTime, doctorName: doctor?.name || apt.doctorName }
        : apt
    ));

    toast({
      title: 'Appointment Rescheduled',
      description: `Appointment for ${selectedAppointment.patientName} has been rescheduled.`,
    });

    setRescheduleDialogOpen(false);
    setSelectedAppointment(null);
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

  const getStats = () => ({
    total: appointments.length,
    scheduled: appointments.filter(a => a.status === 'Scheduled').length,
    completed: appointments.filter(a => a.status === 'Completed').length,
    cancelled: appointments.filter(a => a.status === 'Cancelled').length,
    noShow: appointments.filter(a => a.status === 'No Show').length,
  });

  const stats = getStats();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <CalendarIcon className="w-6 h-6" />
              All Appointments
            </h1>
            <p className="text-muted-foreground">View and manage all appointments</p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-600">{stats.noShow}</p>
                <p className="text-xs text-muted-foreground">No Show</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by patient name, code, phone, or doctor..."
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
                    {doctorNames.map((doc) => (
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
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                    <SelectItem value="No Show">No Show</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1">
                  <Label className="text-sm text-muted-foreground mb-2 block">Date Filter</Label>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select date range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Dates</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="past">Past</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {dateFilter === 'custom' && (
                  <>
                    <div className="flex-1">
                      <Label className="text-sm text-muted-foreground mb-2 block">From Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <div className="relative">
                            <Input
                              placeholder="DD/MM/YYYY"
                              value={fromDateInput}
                              onChange={(e) => handleFromDateChange(e.target.value)}
                              className="pr-10"
                            />
                            <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={fromDate}
                            onSelect={(date) => {
                              setFromDate(date);
                              if (date) setFromDateInput(format(date, 'dd/MM/yyyy'));
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="flex-1">
                      <Label className="text-sm text-muted-foreground mb-2 block">To Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <div className="relative">
                            <Input
                              placeholder="DD/MM/YYYY"
                              value={toDateInput}
                              onChange={(e) => handleToDateChange(e.target.value)}
                              className="pr-10"
                            />
                            <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={toDate}
                            onSelect={(date) => {
                              setToDate(date);
                              if (date) setToDateInput(format(date, 'dd/MM/yyyy'));
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appointments Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              Appointments ({filteredAppointments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead className="hidden md:table-cell">Doctor</TableHead>
                    <TableHead className="hidden lg:table-cell">Type</TableHead>
                    <TableHead className="hidden xl:table-cell">Source</TableHead>
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
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{format(new Date(apt.date), 'dd MMM yyyy')}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span>{apt.time}</span>
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
                        <TableCell className="hidden xl:table-cell">
                          <span className="text-sm text-muted-foreground">{apt.bookingSource}</span>
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
                              <DropdownMenuItem 
                                className="gap-2"
                                onClick={() => handleView(apt)}
                              >
                                <Eye className="w-4 h-4" />
                                View Details
                              </DropdownMenuItem>
                              {apt.status === 'Scheduled' && (
                                <>
                                  <DropdownMenuItem 
                                    className="gap-2"
                                    onClick={() => handleReschedule(apt)}
                                  >
                                    <RefreshCw className="w-4 h-4" />
                                    Reschedule
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="gap-2 text-destructive"
                                    onClick={() => handleCancelClick(apt)}
                                  >
                                    <XCircle className="w-4 h-4" />
                                    Cancel
                                  </DropdownMenuItem>
                                </>
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
                <CalendarIcon className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">No appointments found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Patient</span>
                  <span className="font-medium">{selectedAppointment.patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Patient Code</span>
                  <Badge variant="outline">{selectedAppointment.patientCode}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone</span>
                  <span>{selectedAppointment.patientPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Doctor</span>
                  <span className="font-medium">{selectedAppointment.doctorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Department</span>
                  <span>{selectedAppointment.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span>{format(new Date(selectedAppointment.date), 'dd MMM yyyy')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time</span>
                  <span>{selectedAppointment.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <Badge variant="outline">{selectedAppointment.type}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Booking Source</span>
                  <span>{selectedAppointment.bookingSource}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge className={cn('gap-1', statusConfig[selectedAppointment.status].bgColor, statusConfig[selectedAppointment.status].color)}>
                    {selectedAppointment.status}
                  </Badge>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog open={rescheduleDialogOpen} onOpenChange={setRescheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
            <DialogDescription>Change the date, time, or doctor for this appointment.</DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4 py-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="font-medium">{selectedAppointment.patientName}</p>
                <p className="text-sm text-muted-foreground">
                  Current: {format(new Date(selectedAppointment.date), 'dd MMM yyyy')} at {selectedAppointment.time}
                </p>
              </div>
              <div className="space-y-2">
                <Label>New Date</Label>
                <Input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
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
            <Button variant="outline" onClick={() => setRescheduleDialogOpen(false)}>Cancel</Button>
            <Button onClick={confirmReschedule}>Confirm Reschedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>Are you sure you want to cancel this appointment?</DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4 py-4">
              <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                <p className="font-medium">{selectedAppointment.patientName}</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(selectedAppointment.date), 'dd MMM yyyy')} at {selectedAppointment.time}
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
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>Keep Appointment</Button>
            <Button variant="destructive" onClick={confirmCancel}>Cancel Appointment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
