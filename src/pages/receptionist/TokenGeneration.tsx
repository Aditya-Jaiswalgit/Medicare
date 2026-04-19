import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Ticket, 
  Printer, 
  User,
  Stethoscope,
  Calendar,
  Clock
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const mockDoctors = [
  { id: '1', name: 'Dr. Sarah Johnson', specialization: 'General Medicine' },
  { id: '2', name: 'Dr. James Wilson', specialization: 'Cardiology' },
  { id: '3', name: 'Dr. Emily Brown', specialization: 'Pediatrics' },
];

export default function TokenGeneration() {
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [generatedToken, setGeneratedToken] = useState<number | null>(null);
  const [lastTokenNumber, setLastTokenNumber] = useState(5);

  const handleGenerateToken = () => {
    if (!patientName || !patientPhone || !selectedDoctor) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    const newToken = lastTokenNumber + 1;
    setLastTokenNumber(newToken);
    setGeneratedToken(newToken);
    
    toast({
      title: 'Token Generated',
      description: `Token #${newToken} has been generated for ${patientName}.`,
    });
  };

  const handlePrintToken = () => {
    if (!generatedToken) return;
    
    const doctor = mockDoctors.find(d => d.id === selectedDoctor);
    const printContent = `
      <html>
        <head>
          <title>Token #${generatedToken}</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 40px; }
            .token-number { font-size: 72px; font-weight: bold; color: #3b82f6; margin: 20px 0; }
            .clinic-name { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .info { margin: 10px 0; font-size: 14px; }
            .divider { border-top: 1px dashed #ccc; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="clinic-name">City Care Clinic</div>
          <div class="divider"></div>
          <div>TOKEN NUMBER</div>
          <div class="token-number">${generatedToken}</div>
          <div class="divider"></div>
          <div class="info"><strong>Patient:</strong> ${patientName}</div>
          <div class="info"><strong>Doctor:</strong> ${doctor?.name}</div>
          <div class="info"><strong>Date:</strong> ${new Date().toLocaleDateString()}</div>
          <div class="info"><strong>Time:</strong> ${new Date().toLocaleTimeString()}</div>
          <div class="divider"></div>
          <div style="font-size: 12px; color: #666;">Please wait for your number to be called</div>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
    
    toast({
      title: 'Printing Token',
      description: 'Token is being sent to printer.',
    });
  };

  const handleReset = () => {
    setPatientName('');
    setPatientPhone('');
    setSelectedDoctor('');
    setGeneratedToken(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Token Generation</h1>
          <p className="text-muted-foreground">Generate queue tokens for patients</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Token Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-primary" />
                Generate New Token
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="patientName">Patient Name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="patientName"
                    placeholder="Enter patient name"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="patientPhone">Phone Number *</Label>
                <Input
                  id="patientPhone"
                  placeholder="Enter phone number"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="doctor">Select Doctor *</Label>
                <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockDoctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        <div className="flex items-center gap-2">
                          <Stethoscope className="w-4 h-4" />
                          <span>{doctor.name}</span>
                          <span className="text-muted-foreground text-xs">({doctor.specialization})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={handleGenerateToken} className="flex-1 gap-2">
                  <Ticket className="w-4 h-4" />
                  Generate Token
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Token Display */}
          <Card className={generatedToken ? 'ring-2 ring-primary' : ''}>
            <CardHeader>
              <CardTitle>Generated Token</CardTitle>
            </CardHeader>
            <CardContent>
              {generatedToken ? (
                <div className="text-center space-y-6">
                  <div className="py-8">
                    <p className="text-sm text-muted-foreground mb-2">TOKEN NUMBER</p>
                    <div className="text-7xl font-bold text-primary">{generatedToken}</div>
                  </div>
                  
                  <div className="space-y-2 text-left border-t pt-4">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Patient:</span>
                      <span>{patientName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Stethoscope className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Doctor:</span>
                      <span>{mockDoctors.find(d => d.id === selectedDoctor)?.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Date:</span>
                      <span>{new Date().toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Time:</span>
                      <span>{new Date().toLocaleTimeString()}</span>
                    </div>
                  </div>

                  <Button onClick={handlePrintToken} className="w-full gap-2">
                    <Printer className="w-4 h-4" />
                    Print Token
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Ticket className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p>Generate a token to see it here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Today's Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Token Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-primary/5">
                <p className="text-3xl font-bold text-primary">{lastTokenNumber}</p>
                <p className="text-sm text-muted-foreground">Total Tokens</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-success/5">
                <p className="text-3xl font-bold text-success">3</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-warning/5">
                <p className="text-3xl font-bold text-warning">2</p>
                <p className="text-sm text-muted-foreground">In Queue</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted">
                <p className="text-3xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">No Show</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}