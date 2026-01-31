import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  UserCheck, 
  Search, 
  Clock,
  Calendar,
  User,
  Phone,
  Stethoscope,
  CheckCircle2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ScheduledAppointment {
  id: string;
  patientName: string;
  patientPhone: string;
  patientId: string;
  doctorName: string;
  appointmentTime: string;
  appointmentType: string;
  isCheckedIn: boolean;
}

const mockAppointments: ScheduledAppointment[] = [
  {
    id: '1',
    patientName: 'John Anderson',
    patientPhone: '+1234567890',
    patientId: 'PAT-001',
    doctorName: 'Dr. Sarah Johnson',
    appointmentTime: '09:00 AM',
    appointmentType: 'Follow-up',
    isCheckedIn: true,
  },
  {
    id: '2',
    patientName: 'Emily Chen',
    patientPhone: '+1234567891',
    patientId: 'PAT-002',
    doctorName: 'Dr. Sarah Johnson',
    appointmentTime: '09:30 AM',
    appointmentType: 'New Consultation',
    isCheckedIn: true,
  },
  {
    id: '3',
    patientName: 'Michael Brown',
    patientPhone: '+1234567892',
    patientId: 'PAT-003',
    doctorName: 'Dr. James Wilson',
    appointmentTime: '10:00 AM',
    appointmentType: 'Routine Checkup',
    isCheckedIn: false,
  },
  {
    id: '4',
    patientName: 'Sophie Martinez',
    patientPhone: '+1234567893',
    patientId: 'PAT-004',
    doctorName: 'Dr. Sarah Johnson',
    appointmentTime: '10:30 AM',
    appointmentType: 'Follow-up',
    isCheckedIn: false,
  },
  {
    id: '5',
    patientName: 'David Lee',
    patientPhone: '+1234567894',
    patientId: 'PAT-005',
    doctorName: 'Dr. James Wilson',
    appointmentTime: '11:00 AM',
    appointmentType: 'Emergency',
    isCheckedIn: false,
  },
  {
    id: '6',
    patientName: 'Lisa Wilson',
    patientPhone: '+1234567895',
    patientId: 'PAT-006',
    doctorName: 'Dr. Emily Brown',
    appointmentTime: '11:30 AM',
    appointmentType: 'New Consultation',
    isCheckedIn: false,
  },
];

export default function CheckIn() {
  const [appointments, setAppointments] = useState<ScheduledAppointment[]>(mockAppointments);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCheckIn = (appointmentId: string) => {
    setAppointments(appointments.map(apt => 
      apt.id === appointmentId ? { ...apt, isCheckedIn: true } : apt
    ));
    const apt = appointments.find(a => a.id === appointmentId);
    toast({
      title: 'Patient Checked In',
      description: `${apt?.patientName} has been checked in successfully.`,
    });
  };

  const filteredAppointments = appointments.filter(apt =>
    apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    apt.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    apt.patientPhone.includes(searchQuery)
  );

  const pendingCheckIns = appointments.filter(apt => !apt.isCheckedIn).length;
  const completedCheckIns = appointments.filter(apt => apt.isCheckedIn).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Patient Check-In</h1>
          <p className="text-muted-foreground">Check in patients for their scheduled appointments</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{appointments.length}</p>
                  <p className="text-sm text-muted-foreground">Total Appointments</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-warning/10">
                  <Clock className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingCheckIns}</p>
                  <p className="text-sm text-muted-foreground">Pending Check-In</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/10">
                  <UserCheck className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{completedCheckIns}</p>
                  <p className="text-sm text-muted-foreground">Checked In</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Stethoscope className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">3</p>
                  <p className="text-sm text-muted-foreground">Doctors Available</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Appointments List */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle>Today's Appointments</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, ID, or phone..."
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
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border transition-all ${
                    appointment.isCheckedIn 
                      ? 'bg-success/5 border-success/20' 
                      : 'bg-card hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      appointment.isCheckedIn 
                        ? 'bg-success/10 text-success' 
                        : 'bg-primary/10 text-primary'
                    }`}>
                      {appointment.isCheckedIn ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : (
                        <User className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{appointment.patientName}</p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>{appointment.patientId}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {appointment.patientPhone}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:items-end gap-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {appointment.appointmentType}
                      </Badge>
                      <span className="text-sm font-medium">{appointment.appointmentTime}</span>
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Stethoscope className="w-3 h-3" />
                      {appointment.doctorName}
                    </p>
                  </div>
                  
                  <div>
                    {appointment.isCheckedIn ? (
                      <Badge className="bg-success/10 text-success border-success/20" variant="outline">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Checked In
                      </Badge>
                    ) : (
                      <Button 
                        onClick={() => handleCheckIn(appointment.id)}
                        className="gap-2"
                      >
                        <UserCheck className="w-4 h-4" />
                        Check In
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {filteredAppointments.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No appointments found
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}