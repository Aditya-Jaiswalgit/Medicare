import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Users, 
  CreditCard,
  Download,
  Printer,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  DollarSign
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AppointmentReport {
  id: string;
  patientName: string;
  doctorName: string;
  time: string;
  type: string;
  status: 'completed' | 'cancelled' | 'no_show' | 'scheduled';
}

interface RegistrationReport {
  id: string;
  patientName: string;
  phone: string;
  registeredAt: string;
  registeredBy: string;
}

interface PaymentReport {
  id: string;
  invoiceNo: string;
  patientName: string;
  amount: number;
  method: string;
  time: string;
  status: 'paid' | 'partial' | 'pending';
}

const appointmentData: AppointmentReport[] = [
  { id: '1', patientName: 'John Anderson', doctorName: 'Dr. Sarah Johnson', time: '09:00 AM', type: 'Follow-up', status: 'completed' },
  { id: '2', patientName: 'Emily Chen', doctorName: 'Dr. Sarah Johnson', time: '09:30 AM', type: 'New', status: 'completed' },
  { id: '3', patientName: 'Michael Brown', doctorName: 'Dr. James Wilson', time: '10:00 AM', type: 'Checkup', status: 'completed' },
  { id: '4', patientName: 'Sophie Martinez', doctorName: 'Dr. Sarah Johnson', time: '10:30 AM', type: 'Follow-up', status: 'cancelled' },
  { id: '5', patientName: 'David Lee', doctorName: 'Dr. James Wilson', time: '11:00 AM', type: 'Emergency', status: 'no_show' },
  { id: '6', patientName: 'Lisa Wilson', doctorName: 'Dr. Emily Brown', time: '11:30 AM', type: 'New', status: 'scheduled' },
  { id: '7', patientName: 'Robert Taylor', doctorName: 'Dr. Sarah Johnson', time: '02:00 PM', type: 'Checkup', status: 'scheduled' },
];

const registrationData: RegistrationReport[] = [
  { id: '1', patientName: 'Alice Johnson', phone: '+1234567897', registeredAt: '08:30 AM', registeredBy: 'Emily Davis' },
  { id: '2', patientName: 'Bob Williams', phone: '+1234567898', registeredAt: '09:15 AM', registeredBy: 'Emily Davis' },
  { id: '3', patientName: 'Carol Davis', phone: '+1234567899', registeredAt: '10:45 AM', registeredBy: 'Emily Davis' },
  { id: '4', patientName: 'Dan Miller', phone: '+1234567800', registeredAt: '11:30 AM', registeredBy: 'Emily Davis' },
];

const paymentData: PaymentReport[] = [
  { id: '1', invoiceNo: 'INV-001', patientName: 'John Anderson', amount: 150, method: 'Card', time: '09:45 AM', status: 'paid' },
  { id: '2', invoiceNo: 'INV-002', patientName: 'Emily Chen', amount: 200, method: 'Cash', time: '10:15 AM', status: 'paid' },
  { id: '3', invoiceNo: 'INV-003', patientName: 'Michael Brown', amount: 175, method: 'Card', time: '10:45 AM', status: 'paid' },
  { id: '4', invoiceNo: 'INV-004', patientName: 'Lisa Wilson', amount: 250, method: 'Cash', time: '11:00 AM', status: 'partial' },
  { id: '5', invoiceNo: 'INV-005', patientName: 'Robert Taylor', amount: 100, method: '-', time: '-', status: 'pending' },
];

export default function DailyReports() {
  const handleExport = (reportType: string) => {
    toast({
      title: 'Exporting Report',
      description: `${reportType} report is being exported as CSV.`,
    });
  };

  const handlePrint = (reportType: string) => {
    toast({
      title: 'Printing Report',
      description: `${reportType} report is being sent to printer.`,
    });
  };

  const getStatusBadge = (status: AppointmentReport['status']) => {
    const styles = {
      completed: 'bg-success/10 text-success border-success/20',
      cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
      no_show: 'bg-warning/10 text-warning border-warning/20',
      scheduled: 'bg-primary/10 text-primary border-primary/20',
    };
    const labels = {
      completed: 'Completed',
      cancelled: 'Cancelled',
      no_show: 'No Show',
      scheduled: 'Scheduled',
    };
    return <Badge className={styles[status]} variant="outline">{labels[status]}</Badge>;
  };

  const getPaymentStatusBadge = (status: PaymentReport['status']) => {
    const styles = {
      paid: 'bg-success/10 text-success border-success/20',
      partial: 'bg-warning/10 text-warning border-warning/20',
      pending: 'bg-destructive/10 text-destructive border-destructive/20',
    };
    return <Badge className={styles[status]} variant="outline">{status}</Badge>;
  };

  // Stats calculations
  const completedAppointments = appointmentData.filter(a => a.status === 'completed').length;
  const cancelledAppointments = appointmentData.filter(a => a.status === 'cancelled').length;
  const noShowAppointments = appointmentData.filter(a => a.status === 'no_show').length;
  const totalRegistrations = registrationData.length;
  const totalPayments = paymentData.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const pendingPayments = paymentData.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Daily Reports</h1>
            <p className="text-muted-foreground">View and export daily operational reports</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Report Date</p>
            <p className="font-semibold">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>

        <Tabs defaultValue="appointments" className="space-y-4">
          <TabsList>
            <TabsTrigger value="appointments" className="gap-2">
              <Calendar className="w-4 h-4" />
              Appointments
            </TabsTrigger>
            <TabsTrigger value="registrations" className="gap-2">
              <Users className="w-4 h-4" />
              Registrations
            </TabsTrigger>
            <TabsTrigger value="payments" className="gap-2">
              <CreditCard className="w-4 h-4" />
              Payments
            </TabsTrigger>
          </TabsList>

          {/* Appointments Report */}
          <TabsContent value="appointments" className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{appointmentData.length}</p>
                      <p className="text-sm text-muted-foreground">Total</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-success/10">
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{completedAppointments}</p>
                      <p className="text-sm text-muted-foreground">Completed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-destructive/10">
                      <XCircle className="w-5 h-5 text-destructive" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{cancelledAppointments}</p>
                      <p className="text-sm text-muted-foreground">Cancelled</p>
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
                      <p className="text-2xl font-bold">{noShowAppointments}</p>
                      <p className="text-sm text-muted-foreground">No Show</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Report Table */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Appointment Report</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleExport('Appointment')}>
                    <Download className="w-4 h-4 mr-1" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handlePrint('Appointment')}>
                    <Printer className="w-4 h-4 mr-1" />
                    Print
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Time</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Patient</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Doctor</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Type</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointmentData.map((apt) => (
                        <tr key={apt.id} className="border-b last:border-0">
                          <td className="py-3 px-2 text-sm">{apt.time}</td>
                          <td className="py-3 px-2 text-sm font-medium">{apt.patientName}</td>
                          <td className="py-3 px-2 text-sm">{apt.doctorName}</td>
                          <td className="py-3 px-2 text-sm">{apt.type}</td>
                          <td className="py-3 px-2">{getStatusBadge(apt.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Registrations Report */}
          <TabsContent value="registrations" className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalRegistrations}</p>
                    <p className="text-sm text-muted-foreground">New Registrations Today</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Registration Report</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleExport('Registration')}>
                    <Download className="w-4 h-4 mr-1" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handlePrint('Registration')}>
                    <Printer className="w-4 h-4 mr-1" />
                    Print
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">#</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Patient Name</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Phone</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Registered At</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Registered By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {registrationData.map((reg, index) => (
                        <tr key={reg.id} className="border-b last:border-0">
                          <td className="py-3 px-2 text-sm">{index + 1}</td>
                          <td className="py-3 px-2 text-sm font-medium">{reg.patientName}</td>
                          <td className="py-3 px-2 text-sm">{reg.phone}</td>
                          <td className="py-3 px-2 text-sm">{reg.registeredAt}</td>
                          <td className="py-3 px-2 text-sm">{reg.registeredBy}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Report */}
          <TabsContent value="payments" className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-success/10">
                      <DollarSign className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">${totalPayments}</p>
                      <p className="text-sm text-muted-foreground">Collected Today</p>
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
                      <p className="text-2xl font-bold">${pendingPayments}</p>
                      <p className="text-sm text-muted-foreground">Pending</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <TrendingUp className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{paymentData.length}</p>
                      <p className="text-sm text-muted-foreground">Transactions</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Payment Report</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleExport('Payment')}>
                    <Download className="w-4 h-4 mr-1" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handlePrint('Payment')}>
                    <Printer className="w-4 h-4 mr-1" />
                    Print
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Invoice #</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Patient</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Amount</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Method</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Time</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentData.map((payment) => (
                        <tr key={payment.id} className="border-b last:border-0">
                          <td className="py-3 px-2 text-sm font-medium">{payment.invoiceNo}</td>
                          <td className="py-3 px-2 text-sm">{payment.patientName}</td>
                          <td className="py-3 px-2 text-sm font-medium">${payment.amount}</td>
                          <td className="py-3 px-2 text-sm">{payment.method}</td>
                          <td className="py-3 px-2 text-sm">{payment.time}</td>
                          <td className="py-3 px-2">{getPaymentStatusBadge(payment.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}