import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
import { Patient, LabReport } from '@/types/patient';
import { FlaskConical, Plus, Edit, Trash2, CalendarIcon, Eye, Upload, Download, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface LabReportsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient | null;
}

const labTestTypes = [
  'Complete Blood Count (CBC)',
  'Blood Sugar (Fasting)',
  'Blood Sugar (PP)',
  'HbA1c',
  'Lipid Profile',
  'Liver Function Test (LFT)',
  'Kidney Function Test (KFT)',
  'Thyroid Profile (T3, T4, TSH)',
  'Urine Routine',
  'Chest X-Ray',
  'ECG',
  'Ultrasound',
  'MRI',
  'CT Scan',
  'Other',
];

interface ExtendedLabReport extends LabReport {
  fileName?: string;
  fileData?: string;
}

export function LabReportsDialog({ open, onOpenChange, patient }: LabReportsDialogProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [reports, setReports] = useState<ExtendedLabReport[]>([
    {
      id: '1',
      patientId: patient?.id || '',
      testName: 'Complete Blood Count (CBC)',
      date: '2024-01-10',
      status: 'Completed',
      result: 'All values within normal range. Hemoglobin: 14.2 g/dL, WBC: 7500/mcL, Platelets: 250000/mcL',
    },
    {
      id: '2',
      patientId: patient?.id || '',
      testName: 'Blood Sugar (Fasting)',
      date: '2024-01-15',
      status: 'Completed',
      result: 'Fasting glucose: 95 mg/dL (Normal: 70-100 mg/dL)',
    },
    {
      id: '3',
      patientId: patient?.id || '',
      testName: 'Lipid Profile',
      date: '2024-01-20',
      status: 'Processing',
      result: '',
    },
  ]);
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingReport, setViewingReport] = useState<ExtendedLabReport | null>(null);
  const [formData, setFormData] = useState({
    testName: '',
    date: new Date(),
    status: 'Pending' as 'Pending' | 'Processing' | 'Completed',
    result: '',
    fileName: '',
    fileData: '',
  });
  const [dateInput, setDateInput] = useState(format(new Date(), 'dd/MM/yyyy'));

  const resetForm = () => {
    setFormData({
      testName: '',
      date: new Date(),
      status: 'Pending',
      result: '',
      fileName: '',
      fileData: '',
    });
    setDateInput(format(new Date(), 'dd/MM/yyyy'));
    setEditingId(null);
    setShowForm(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleEdit = (report: ExtendedLabReport) => {
    setFormData({
      testName: report.testName,
      date: new Date(report.date),
      status: report.status,
      result: report.result,
      fileName: report.fileName || '',
      fileData: report.fileData || '',
    });
    setDateInput(format(new Date(report.date), 'dd/MM/yyyy'));
    setEditingId(report.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setReports(reports.filter(r => r.id !== id));
    toast({ title: 'Lab Report Deleted', description: 'Record has been removed.' });
  };

  const handleSave = () => {
    if (!formData.testName) {
      toast({ title: 'Error', description: 'Please select a test.', variant: 'destructive' });
      return;
    }

    if (editingId) {
      setReports(reports.map(r => 
        r.id === editingId 
          ? { ...r, ...formData, date: format(formData.date, 'yyyy-MM-dd') }
          : r
      ));
      toast({ title: 'Lab Report Updated' });
    } else {
      const newReport: ExtendedLabReport = {
        id: String(Date.now()),
        patientId: patient?.id || '',
        testName: formData.testName,
        date: format(formData.date, 'yyyy-MM-dd'),
        status: formData.status,
        result: formData.result,
        fileName: formData.fileName,
        fileData: formData.fileData,
      };
      setReports([newReport, ...reports]);
      toast({ title: 'Lab Report Added' });
    }
    resetForm();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: 'Error', description: 'File size must be less than 5MB.', variant: 'destructive' });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setFormData({ ...formData, fileName: file.name, fileData: base64 });
        toast({ title: 'File Uploaded', description: `${file.name} attached successfully.` });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = (report: ExtendedLabReport) => {
    if (report.fileData) {
      const link = document.createElement('a');
      link.href = report.fileData;
      link.download = report.fileName || `${report.testName.replace(/\s+/g, '_')}_Report.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({ title: 'Downloaded', description: 'Lab report downloaded successfully.' });
    } else {
      // Generate a text-based report if no file attached
      const reportContent = `
Lab Report
====================
Test: ${report.testName}
Date: ${format(new Date(report.date), 'MMMM dd, yyyy')}
Status: ${report.status}

Results:
${report.result || 'Results pending...'}
      `;
      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${report.testName.replace(/\s+/g, '_')}_Report.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({ title: 'Downloaded', description: 'Lab report downloaded as text file.' });
    }
  };

  const removeFile = () => {
    setFormData({ ...formData, fileName: '', fileData: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast({ title: 'File Removed' });
  };

  const handleDateInputChange = (value: string) => {
    setDateInput(value);
    const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = value.match(dateRegex);
    if (match) {
      const [, day, month, year] = match;
      const parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (!isNaN(parsedDate.getTime())) {
        setFormData({ ...formData, date: parsedDate });
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'default';
      case 'Processing': return 'secondary';
      case 'Pending': return 'outline';
      default: return 'outline';
    }
  };

  if (!patient) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-primary" />
            Lab Reports - {patient.firstName} {patient.lastName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!showForm && !viewingReport && (
            <Button onClick={() => setShowForm(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Lab Report
            </Button>
          )}

          {viewingReport && (
            <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{viewingReport.testName}</h4>
                <Button variant="outline" size="sm" onClick={() => setViewingReport(null)}>Close</Button>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Date:</span>
                  <p className="font-medium">{format(new Date(viewingReport.date), 'MMMM dd, yyyy')}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <p><Badge variant={getStatusColor(viewingReport.status)}>{viewingReport.status}</Badge></p>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground text-sm">Result:</span>
                <p className="mt-1 p-3 bg-background rounded border whitespace-pre-wrap">
                  {viewingReport.result || 'Results pending...'}
                </p>
              </div>
            </div>
          )}

          {showForm && (
            <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
              <h4 className="font-medium">{editingId ? 'Edit Lab Report' : 'New Lab Report'}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Test Name *</Label>
                  <Select value={formData.testName} onValueChange={(v) => setFormData({ ...formData, testName: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select test" />
                    </SelectTrigger>
                    <SelectContent>
                      {labTestTypes.map(test => (
                        <SelectItem key={test} value={test}>{test}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <div className="relative">
                        <Input
                          type="text"
                          placeholder="DD/MM/YYYY"
                          value={dateInput}
                          onChange={(e) => handleDateInputChange(e.target.value)}
                          className="pr-10"
                        />
                        <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50" />
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.date}
                        onSelect={(date) => {
                          if (date) {
                            setFormData({ ...formData, date });
                            setDateInput(format(date, 'dd/MM/yyyy'));
                          }
                        }}
                        numberOfMonths={1}
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(v: 'Pending' | 'Processing' | 'Completed') => setFormData({ ...formData, status: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Processing">Processing</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Result</Label>
                <Textarea 
                  value={formData.result}
                  onChange={(e) => setFormData({ ...formData, result: e.target.value })}
                  placeholder="Enter test results..."
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label>Upload Report File (PDF, Image - Max 5MB)</Label>
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Choose File
                  </Button>
                  {formData.fileName && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-md">
                      <FileText className="w-4 h-4 text-primary" />
                      <span className="text-sm truncate max-w-[200px]">{formData.fileName}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-5 w-5"
                        onClick={removeFile}
                      >
                        <Trash2 className="w-3 h-3 text-destructive" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave}>{editingId ? 'Update' : 'Save'}</Button>
                <Button variant="outline" onClick={resetForm}>Cancel</Button>
              </div>
            </div>
          )}

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Test Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>File</TableHead>
                  <TableHead className="w-[150px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No lab reports recorded
                    </TableCell>
                  </TableRow>
                ) : (
                  reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>{format(new Date(report.date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{report.testName}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(report.status)}>
                          {report.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {report.fileName ? (
                          <div className="flex items-center gap-1">
                            <FileText className="w-4 h-4 text-primary" />
                            <span className="text-sm truncate max-w-[100px]">{report.fileName}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">No file</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => setViewingReport(report)} title="View">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDownload(report)} title="Download">
                            <Download className="w-4 h-4 text-primary" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(report)} title="Edit">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(report.id)} title="Delete">
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
