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
  Calendar,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Clock,
  User,
  Stethoscope,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type AppointmentStatus = 'Scheduled' | 'Completed' | 'Cancelled' | 'In Progress';

interface Appointment {
  id: string;
  patient_name: string;
  patient_phone: string;
  doctor_name: string;
  department: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  type: string;
}

const mockAppointments: Appointment[] = [
  {
    id: '1',
    patient_name: 'John Smith',
    patient_phone: '+1 234 567 8901',
    doctor_name: 'Dr. James Wilson',
    department: 'Cardiology',
    date: '2024-01-20',
    time: '09:00 AM',
    status: 'Scheduled',
    type: 'Consultation',
  },
  {
    id: '2',
    patient_name: 'Sarah Johnson',
    patient_phone: '+1 234 567 8902',
    doctor_name: 'Dr. Emily Chen',
    department: 'Dermatology',
    date: '2024-01-20',
    time: '09:30 AM',
    status: 'In Progress',
    type: 'Follow-up',
  },
  {
    id: '3',
    patient_name: 'Michael Brown',
    patient_phone: '+1 234 567 8903',
    doctor_name: 'Dr. Sarah Johnson',
    department: 'Pediatrics',
    date: '2024-01-20',
    time: '10:00 AM',
    status: 'Completed',
    type: 'Check-up',
  },
  {
    id: '4',
    patient_name: 'Emily Davis',
    patient_phone: '+1 234 567 8904',
    doctor_name: 'Dr. Robert Taylor',
    department: 'Neurology',
    date: '2024-01-20',
    time: '10:30 AM',
    status: 'Scheduled',
    type: 'Consultation',
  },
  {
    id: '5',
    patient_name: 'Robert Wilson',
    patient_phone: '+1 234 567 8905',
    doctor_name: 'Dr. James Wilson',
    department: 'Cardiology',
    date: '2024-01-20',
    time: '11:00 AM',
    status: 'Cancelled',
    type: 'Follow-up',
  },
  {
    id: '6',
    patient_name: 'Lisa Anderson',
    patient_phone: '+1 234 567 8906',
    doctor_name: 'Dr. Michael Brown',
    department: 'Orthopedics',
    date: '2024-01-20',
    time: '11:30 AM',
    status: 'Scheduled',
    type: 'Consultation',
  },
];

const statusConfig: Record<AppointmentStatus, { icon: React.ElementType; color: string }> = {
  Scheduled: {
    icon: Clock,
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  },
  'In Progress': {
    icon: AlertCircle,
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  },
  Completed: {
    icon: CheckCircle,
    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  },
  Cancelled: {
    icon: XCircle,
    color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  },
};

export default function AppointmentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDoctor, setSelectedDoctor] = useState<string>('all');

  const filteredAppointments = mockAppointments.filter((apt) => {
    const matchesSearch =
      apt.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.doctor_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || apt.status === selectedStatus;
    const matchesDoctor = selectedDoctor === 'all' || apt.doctor_name === selectedDoctor;
    return matchesSearch && matchesStatus && matchesDoctor;
  });

  const doctors = [...new Set(mockAppointments.map((a) => a.doctor_name))];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              Appointments
            </h1>
            <p className="text-muted-foreground">Manage patient appointments and schedules</p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Book Appointment
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{mockAppointments.length}</p>
                  <p className="text-xs text-muted-foreground">Total Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {mockAppointments.filter((a) => a.status === 'Scheduled').length}
                  </p>
                  <p className="text-xs text-muted-foreground">Scheduled</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {mockAppointments.filter((a) => a.status === 'Completed').length}
                  </p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {mockAppointments.filter((a) => a.status === 'Cancelled').length}
                  </p>
                  <p className="text-xs text-muted-foreground">Cancelled</p>
                </div>
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
                  placeholder="Search by patient or doctor name..."
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
                    <SelectItem key={doc} value={doc}>
                      {doc}
                    </SelectItem>
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
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Appointments Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Today's Appointments ({filteredAppointments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
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
                              <p className="font-medium text-foreground">{apt.patient_name}</p>
                              <p className="text-xs text-muted-foreground">{apt.patient_phone}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-2">
                            <Stethoscope className="w-4 h-4 text-emerald-600" />
                            <div>
                              <p className="text-sm font-medium">{apt.doctor_name}</p>
                              <p className="text-xs text-muted-foreground">{apt.department}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <Badge variant="outline">{apt.type}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn('gap-1', statusConfig[apt.status].color)}>
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
                              <DropdownMenuItem className="gap-2">
                                <Edit className="w-4 h-4" />
                                Edit Appointment
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2">
                                <CheckCircle className="w-4 h-4" />
                                Mark Complete
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="gap-2 text-destructive">
                                <Trash2 className="w-4 h-4" />
                                Cancel Appointment
                              </DropdownMenuItem>
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
                <Calendar className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">No appointments found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
