import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Bell, 
  Send, 
  MessageSquare,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  CheckCircle2,
  History
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface MessageHistory {
  id: string;
  patientName: string;
  patientPhone: string;
  message: string;
  type: 'reminder' | 'notification' | 'custom';
  status: 'sent' | 'delivered' | 'failed';
  sentAt: string;
}

const mockMessageHistory: MessageHistory[] = [
  {
    id: '1',
    patientName: 'John Anderson',
    patientPhone: '+1234567890',
    message: 'Reminder: Your appointment is scheduled for tomorrow at 09:00 AM with Dr. Sarah Johnson.',
    type: 'reminder',
    status: 'delivered',
    sentAt: '2024-01-15 08:00 AM',
  },
  {
    id: '2',
    patientName: 'Emily Chen',
    patientPhone: '+1234567891',
    message: 'Your lab results are ready. Please visit the clinic to collect them.',
    type: 'notification',
    status: 'delivered',
    sentAt: '2024-01-15 10:30 AM',
  },
  {
    id: '3',
    patientName: 'Michael Brown',
    patientPhone: '+1234567892',
    message: 'Reminder: Your appointment is scheduled for today at 02:00 PM.',
    type: 'reminder',
    status: 'sent',
    sentAt: '2024-01-15 09:00 AM',
  },
  {
    id: '4',
    patientName: 'Sophie Martinez',
    patientPhone: '+1234567893',
    message: 'Payment reminder: You have a pending balance of $150.',
    type: 'notification',
    status: 'failed',
    sentAt: '2024-01-15 11:00 AM',
  },
];

const upcomingAppointments = [
  { id: '1', patientName: 'David Lee', patientPhone: '+1234567894', appointmentTime: 'Tomorrow 09:00 AM', doctorName: 'Dr. Sarah Johnson' },
  { id: '2', patientName: 'Lisa Wilson', patientPhone: '+1234567895', appointmentTime: 'Tomorrow 10:30 AM', doctorName: 'Dr. James Wilson' },
  { id: '3', patientName: 'Robert Taylor', patientPhone: '+1234567896', appointmentTime: 'Tomorrow 11:00 AM', doctorName: 'Dr. Emily Brown' },
];

export default function Communication() {
  const [messageHistory, setMessageHistory] = useState<MessageHistory[]>(mockMessageHistory);
  const [customMessage, setCustomMessage] = useState('');
  const [selectedPatient, setSelectedPatient] = useState('');
  const [reminderType, setReminderType] = useState('appointment');

  const handleSendReminder = (patientId: string) => {
    const patient = upcomingAppointments.find(p => p.id === patientId);
    if (!patient) return;

    const newMessage: MessageHistory = {
      id: Date.now().toString(),
      patientName: patient.patientName,
      patientPhone: patient.patientPhone,
      message: `Reminder: Your appointment is scheduled for ${patient.appointmentTime} with ${patient.doctorName}.`,
      type: 'reminder',
      status: 'sent',
      sentAt: new Date().toLocaleString(),
    };

    setMessageHistory([newMessage, ...messageHistory]);
    toast({
      title: 'Reminder Sent',
      description: `Appointment reminder sent to ${patient.patientName}.`,
    });
  };

  const handleSendBulkReminders = () => {
    const newMessages = upcomingAppointments.map(patient => ({
      id: Date.now().toString() + patient.id,
      patientName: patient.patientName,
      patientPhone: patient.patientPhone,
      message: `Reminder: Your appointment is scheduled for ${patient.appointmentTime} with ${patient.doctorName}.`,
      type: 'reminder' as const,
      status: 'sent' as const,
      sentAt: new Date().toLocaleString(),
    }));

    setMessageHistory([...newMessages, ...messageHistory]);
    toast({
      title: 'Bulk Reminders Sent',
      description: `Reminders sent to ${upcomingAppointments.length} patients.`,
    });
  };

  const handleSendCustomMessage = () => {
    if (!selectedPatient || !customMessage) {
      toast({
        title: 'Missing Information',
        description: 'Please select a patient and enter a message.',
        variant: 'destructive',
      });
      return;
    }

    const patient = upcomingAppointments.find(p => p.id === selectedPatient);
    if (!patient) return;

    const newMessage: MessageHistory = {
      id: Date.now().toString(),
      patientName: patient.patientName,
      patientPhone: patient.patientPhone,
      message: customMessage,
      type: 'custom',
      status: 'sent',
      sentAt: new Date().toLocaleString(),
    };

    setMessageHistory([newMessage, ...messageHistory]);
    setCustomMessage('');
    setSelectedPatient('');
    
    toast({
      title: 'Message Sent',
      description: `Message sent to ${patient.patientName}.`,
    });
  };

  const getStatusBadge = (status: MessageHistory['status']) => {
    const styles = {
      sent: 'bg-warning/10 text-warning border-warning/20',
      delivered: 'bg-success/10 text-success border-success/20',
      failed: 'bg-destructive/10 text-destructive border-destructive/20',
    };
    return <Badge className={styles[status]} variant="outline">{status}</Badge>;
  };

  const getTypeBadge = (type: MessageHistory['type']) => {
    const styles = {
      reminder: 'bg-primary/10 text-primary border-primary/20',
      notification: 'bg-accent text-accent-foreground',
      custom: 'bg-muted text-muted-foreground',
    };
    return <Badge className={styles[type]} variant="outline">{type}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Communication</h1>
          <p className="text-muted-foreground">Send reminders and notifications to patients</p>
        </div>

        <Tabs defaultValue="reminders" className="space-y-4">
          <TabsList>
            <TabsTrigger value="reminders" className="gap-2">
              <Bell className="w-4 h-4" />
              Send Reminders
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Send className="w-4 h-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="w-4 h-4" />
              Message History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reminders" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Upcoming Appointments - Tomorrow
                </CardTitle>
                <Button onClick={handleSendBulkReminders} className="gap-2">
                  <Send className="w-4 h-4" />
                  Send All Reminders
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border bg-card"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{appointment.patientName}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="w-3 h-3" />
                            {appointment.patientPhone}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {appointment.appointmentTime}
                          </p>
                          <p className="text-xs text-muted-foreground">{appointment.doctorName}</p>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => handleSendReminder(appointment.id)}
                          className="gap-1"
                        >
                          <Send className="w-3 h-3" />
                          Send Reminder
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  Send Custom Notification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Patient</Label>
                  <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {upcomingAppointments.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.patientName} - {patient.patientPhone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Message</Label>
                  <Textarea
                    placeholder="Enter your message here..."
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="flex gap-3">
                  <Button onClick={handleSendCustomMessage} className="gap-2">
                    <Send className="w-4 h-4" />
                    Send Message
                  </Button>
                  <Button variant="outline" onClick={() => { setCustomMessage(''); setSelectedPatient(''); }}>
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Templates */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Message Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    'Your lab results are ready for collection.',
                    'Please remember to bring your insurance card.',
                    'Your prescription is ready for pickup.',
                    'Payment reminder: You have a pending balance.',
                  ].map((template, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="h-auto py-3 px-4 text-left justify-start"
                      onClick={() => setCustomMessage(template)}
                    >
                      <MessageSquare className="w-4 h-4 mr-2 shrink-0" />
                      <span className="text-sm">{template}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5 text-primary" />
                  Message History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {messageHistory.map((message) => (
                    <div
                      key={message.id}
                      className="p-4 rounded-lg border bg-card"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{message.patientName}</span>
                          <span className="text-sm text-muted-foreground">({message.patientPhone})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getTypeBadge(message.type)}
                          {getStatusBadge(message.status)}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{message.message}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Sent: {message.sentAt}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}