import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  ListTodo, 
  UserCheck, 
  Megaphone, 
  Clock, 
  User,
  Phone,
  Search,
  Plus,
  ChevronRight
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface QueuePatient {
  id: string;
  tokenNumber: number;
  patientName: string;
  patientPhone: string;
  doctorName: string;
  appointmentTime: string;
  status: 'waiting' | 'in_consultation' | 'completed' | 'called';
  checkedInAt: string;
}

const mockQueueData: QueuePatient[] = [
  {
    id: '1',
    tokenNumber: 1,
    patientName: 'John Anderson',
    patientPhone: '+1234567890',
    doctorName: 'Dr. Sarah Johnson',
    appointmentTime: '09:00 AM',
    status: 'completed',
    checkedInAt: '08:45 AM',
  },
  {
    id: '2',
    tokenNumber: 2,
    patientName: 'Emily Chen',
    patientPhone: '+1234567891',
    doctorName: 'Dr. Sarah Johnson',
    appointmentTime: '09:30 AM',
    status: 'in_consultation',
    checkedInAt: '09:15 AM',
  },
  {
    id: '3',
    tokenNumber: 3,
    patientName: 'Michael Brown',
    patientPhone: '+1234567892',
    doctorName: 'Dr. James Wilson',
    appointmentTime: '10:00 AM',
    status: 'called',
    checkedInAt: '09:45 AM',
  },
  {
    id: '4',
    tokenNumber: 4,
    patientName: 'Sophie Martinez',
    patientPhone: '+1234567893',
    doctorName: 'Dr. Sarah Johnson',
    appointmentTime: '10:30 AM',
    status: 'waiting',
    checkedInAt: '10:15 AM',
  },
  {
    id: '5',
    tokenNumber: 5,
    patientName: 'David Lee',
    patientPhone: '+1234567894',
    doctorName: 'Dr. James Wilson',
    appointmentTime: '11:00 AM',
    status: 'waiting',
    checkedInAt: '10:45 AM',
  },
];

export default function Queue() {
  const [queue, setQueue] = useState<QueuePatient[]>(mockQueueData);
  const [searchQuery, setSearchQuery] = useState('');

  const getStatusBadge = (status: QueuePatient['status']) => {
    const styles = {
      waiting: 'bg-warning/10 text-warning border-warning/20',
      called: 'bg-primary/10 text-primary border-primary/20',
      in_consultation: 'bg-success/10 text-success border-success/20',
      completed: 'bg-muted text-muted-foreground border-muted',
    };
    const labels = {
      waiting: 'Waiting',
      called: 'Called',
      in_consultation: 'In Consultation',
      completed: 'Completed',
    };
    return <Badge className={styles[status]} variant="outline">{labels[status]}</Badge>;
  };

  const handleCallNext = () => {
    const nextWaiting = queue.find(p => p.status === 'waiting');
    if (nextWaiting) {
      setQueue(queue.map(p => 
        p.id === nextWaiting.id ? { ...p, status: 'called' as const } : p
      ));
      toast({
        title: 'Patient Called',
        description: `Token #${nextWaiting.tokenNumber} - ${nextWaiting.patientName} has been called.`,
      });
    } else {
      toast({
        title: 'No Waiting Patients',
        description: 'There are no patients waiting in the queue.',
        variant: 'destructive',
      });
    }
  };

  const handleCheckIn = (patientId: string) => {
    setQueue(queue.map(p => 
      p.id === patientId ? { ...p, status: 'waiting' as const } : p
    ));
    toast({
      title: 'Patient Checked In',
      description: 'Patient has been added to the waiting queue.',
    });
  };

  const handleStartConsultation = (patientId: string) => {
    setQueue(queue.map(p => 
      p.id === patientId ? { ...p, status: 'in_consultation' as const } : p
    ));
    toast({
      title: 'Consultation Started',
      description: 'Patient consultation has started.',
    });
  };

  const filteredQueue = queue.filter(p => 
    p.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.tokenNumber.toString().includes(searchQuery)
  );

  const waitingCount = queue.filter(p => p.status === 'waiting').length;
  const inConsultationCount = queue.filter(p => p.status === 'in_consultation').length;
  const completedCount = queue.filter(p => p.status === 'completed').length;
  const currentToken = queue.find(p => p.status === 'in_consultation')?.tokenNumber || 
                       queue.find(p => p.status === 'called')?.tokenNumber || 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Queue Management</h1>
            <p className="text-muted-foreground">Manage patient queue and tokens</p>
          </div>
          <Button onClick={handleCallNext} className="gap-2">
            <Megaphone className="w-4 h-4" />
            Call Next Patient
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <ListTodo className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{currentToken}</p>
                  <p className="text-sm text-muted-foreground">Current Token</p>
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
                  <p className="text-2xl font-bold">{waitingCount}</p>
                  <p className="text-sm text-muted-foreground">Waiting</p>
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
                  <p className="text-2xl font-bold">{inConsultationCount}</p>
                  <p className="text-sm text-muted-foreground">In Consultation</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <User className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{completedCount}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Queue List */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle>Today's Queue</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or token..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full sm:w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredQueue.map((patient) => (
                <div
                  key={patient.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                      {patient.tokenNumber}
                    </div>
                    <div>
                      <p className="font-medium">{patient.patientName}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="w-3 h-3" />
                        {patient.patientPhone}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:items-end gap-1">
                    <p className="text-sm font-medium">{patient.doctorName}</p>
                    <p className="text-xs text-muted-foreground">
                      Appointment: {patient.appointmentTime} | Check-in: {patient.checkedInAt}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(patient.status)}
                    {patient.status === 'waiting' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStartConsultation(patient.id)}
                        className="gap-1"
                      >
                        <ChevronRight className="w-4 h-4" />
                        Start
                      </Button>
                    )}
                    {patient.status === 'called' && (
                      <Button
                        size="sm"
                        onClick={() => handleStartConsultation(patient.id)}
                        className="gap-1"
                      >
                        <UserCheck className="w-4 h-4" />
                        Begin
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {filteredQueue.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No patients in queue
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}