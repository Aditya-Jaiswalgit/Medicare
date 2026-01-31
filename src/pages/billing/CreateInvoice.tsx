import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Receipt,
  Plus,
  Trash2,
  Search,
  User,
  Stethoscope,
  Pill,
  FlaskConical,
  CreditCard,
  Banknote,
  Smartphone,
  Globe,
  Save,
  ArrowLeft,
  Check,
  ChevronsUpDown,
  FileText,
  Calculator,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type BillItemType = 'Consultation' | 'Medicine' | 'LabTest';
type PaymentMode = 'Cash' | 'Card' | 'UPI' | 'Online';
type PaymentStatus = 'Paid' | 'Unpaid' | 'Partial';

interface Patient {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

interface BillItem {
  id: string;
  item_type: BillItemType;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  consultation_fee: number;
}

interface Medicine {
  id: string;
  name: string;
  unit_price: number;
  stock: number;
}

interface LabTest {
  id: string;
  name: string;
  price: number;
}

// Mock data
const mockPatients: Patient[] = [
  { id: '1', name: 'John Smith', phone: '555-0101', email: 'john@example.com' },
  { id: '2', name: 'Sarah Johnson', phone: '555-0102', email: 'sarah@example.com' },
  { id: '3', name: 'Michael Brown', phone: '555-0103', email: 'michael@example.com' },
  { id: '4', name: 'Emily Davis', phone: '555-0104', email: 'emily@example.com' },
  { id: '5', name: 'Robert Wilson', phone: '555-0105', email: 'robert@example.com' },
];

const mockDoctors: Doctor[] = [
  { id: '1', name: 'Dr. Smith', specialization: 'General Medicine', consultation_fee: 100 },
  { id: '2', name: 'Dr. Johnson', specialization: 'Cardiology', consultation_fee: 150 },
  { id: '3', name: 'Dr. Williams', specialization: 'Orthopedics', consultation_fee: 120 },
];

const mockMedicines: Medicine[] = [
  { id: '1', name: 'Paracetamol 500mg', unit_price: 5, stock: 100 },
  { id: '2', name: 'Amoxicillin 250mg', unit_price: 15, stock: 50 },
  { id: '3', name: 'Omeprazole 20mg', unit_price: 10, stock: 75 },
  { id: '4', name: 'Metformin 500mg', unit_price: 8, stock: 60 },
  { id: '5', name: 'Aspirin 100mg', unit_price: 3, stock: 200 },
];

const mockLabTests: LabTest[] = [
  { id: '1', name: 'Complete Blood Count (CBC)', price: 50 },
  { id: '2', name: 'Lipid Profile', price: 80 },
  { id: '3', name: 'Liver Function Test', price: 120 },
  { id: '4', name: 'Kidney Function Test', price: 100 },
  { id: '5', name: 'Blood Sugar (Fasting)', price: 30 },
  { id: '6', name: 'Thyroid Profile', price: 150 },
];

const paymentModeIcons: Record<PaymentMode, React.ElementType> = {
  Cash: Banknote,
  Card: CreditCard,
  UPI: Smartphone,
  Online: Globe,
};

export default function CreateInvoicePage() {
  const navigate = useNavigate();
  
  // Patient selection
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientSearchOpen, setPatientSearchOpen] = useState(false);
  
  // Bill items
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [addItemDialogOpen, setAddItemDialogOpen] = useState(false);
  const [selectedItemType, setSelectedItemType] = useState<BillItemType>('Consultation');
  
  // Add item form state
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [selectedMedicine, setSelectedMedicine] = useState<string>('');
  const [medicineQuantity, setMedicineQuantity] = useState<number>(1);
  const [selectedLabTest, setSelectedLabTest] = useState<string>('');
  const [customDescription, setCustomDescription] = useState('');
  const [customPrice, setCustomPrice] = useState<number>(0);
  
  // Payment
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('Cash');
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [discount, setDiscount] = useState<number>(0);
  
  // Calculations
  const subtotal = useMemo(() => 
    billItems.reduce((sum, item) => sum + item.amount, 0), 
    [billItems]
  );
  
  const discountAmount = useMemo(() => 
    (subtotal * discount) / 100, 
    [subtotal, discount]
  );
  
  const totalAmount = useMemo(() => 
    subtotal - discountAmount, 
    [subtotal, discountAmount]
  );
  
  const balanceAmount = useMemo(() => 
    totalAmount - paidAmount, 
    [totalAmount, paidAmount]
  );
  
  const paymentStatus: PaymentStatus = useMemo(() => {
    if (paidAmount >= totalAmount) return 'Paid';
    if (paidAmount > 0) return 'Partial';
    return 'Unpaid';
  }, [paidAmount, totalAmount]);
  
  // Generate invoice number
  const invoiceNumber = useMemo(() => {
    const date = new Date();
    const year = date.getFullYear();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `INV-${year}-${random}`;
  }, []);

  const handleAddItem = () => {
    let newItem: BillItem | null = null;
    
    if (selectedItemType === 'Consultation') {
      const doctor = mockDoctors.find(d => d.id === selectedDoctor);
      if (!doctor) {
        toast.error('Please select a doctor');
        return;
      }
      newItem = {
        id: Date.now().toString(),
        item_type: 'Consultation',
        description: `Consultation - ${doctor.name} (${doctor.specialization})`,
        quantity: 1,
        unit_price: doctor.consultation_fee,
        amount: doctor.consultation_fee,
      };
    } else if (selectedItemType === 'Medicine') {
      const medicine = mockMedicines.find(m => m.id === selectedMedicine);
      if (!medicine) {
        toast.error('Please select a medicine');
        return;
      }
      if (medicineQuantity < 1) {
        toast.error('Quantity must be at least 1');
        return;
      }
      newItem = {
        id: Date.now().toString(),
        item_type: 'Medicine',
        description: medicine.name,
        quantity: medicineQuantity,
        unit_price: medicine.unit_price,
        amount: medicine.unit_price * medicineQuantity,
      };
    } else if (selectedItemType === 'LabTest') {
      const test = mockLabTests.find(t => t.id === selectedLabTest);
      if (!test) {
        toast.error('Please select a lab test');
        return;
      }
      newItem = {
        id: Date.now().toString(),
        item_type: 'LabTest',
        description: test.name,
        quantity: 1,
        unit_price: test.price,
        amount: test.price,
      };
    }
    
    if (newItem) {
      setBillItems([...billItems, newItem]);
      resetAddItemForm();
      setAddItemDialogOpen(false);
      toast.success('Item added to invoice');
    }
  };

  const resetAddItemForm = () => {
    setSelectedDoctor('');
    setSelectedMedicine('');
    setMedicineQuantity(1);
    setSelectedLabTest('');
    setCustomDescription('');
    setCustomPrice(0);
  };

  const handleRemoveItem = (itemId: string) => {
    setBillItems(billItems.filter(item => item.id !== itemId));
    toast.success('Item removed');
  };

  const handleSaveInvoice = () => {
    if (!selectedPatient) {
      toast.error('Please select a patient');
      return;
    }
    if (billItems.length === 0) {
      toast.error('Please add at least one item');
      return;
    }
    
    // In real app, save to database
    toast.success('Invoice created successfully!');
    navigate('/billing/invoices');
  };

  const handleSaveAndPrint = () => {
    handleSaveInvoice();
    // In real app, trigger print dialog
  };

  const getItemTypeIcon = (type: BillItemType) => {
    switch (type) {
      case 'Consultation': return Stethoscope;
      case 'Medicine': return Pill;
      case 'LabTest': return FlaskConical;
    }
  };

  const getItemTypeBadgeColor = (type: BillItemType) => {
    switch (type) {
      case 'Consultation': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Medicine': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'LabTest': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Receipt className="w-6 h-6" />
                Create Invoice
              </h1>
              <p className="text-muted-foreground">Invoice #{invoiceNumber}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button variant="outline" onClick={handleSaveAndPrint} disabled={!selectedPatient || billItems.length === 0}>
              <FileText className="w-4 h-4 mr-2" />
              Save & Print
            </Button>
            <Button onClick={handleSaveInvoice} disabled={!selectedPatient || billItems.length === 0}>
              <Save className="w-4 h-4 mr-2" />
              Save Invoice
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Invoice Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Patient Selection */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Popover open={patientSearchOpen} onOpenChange={setPatientSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={patientSearchOpen}
                      className="w-full justify-between h-auto py-3"
                    >
                      {selectedPatient ? (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <div className="text-left">
                            <p className="font-medium">{selectedPatient.name}</p>
                            <p className="text-sm text-muted-foreground">{selectedPatient.phone}</p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Search and select patient...</span>
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search patient by name or phone..." />
                      <CommandList>
                        <CommandEmpty>No patient found.</CommandEmpty>
                        <CommandGroup>
                          {mockPatients.map((patient) => (
                            <CommandItem
                              key={patient.id}
                              value={`${patient.name} ${patient.phone}`}
                              onSelect={() => {
                                setSelectedPatient(patient);
                                setPatientSearchOpen(false);
                              }}
                            >
                              <div className="flex items-center gap-3 w-full">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                  <User className="w-4 h-4 text-primary" />
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium">{patient.name}</p>
                                  <p className="text-sm text-muted-foreground">{patient.phone}</p>
                                </div>
                                {selectedPatient?.id === patient.id && (
                                  <Check className="w-4 h-4 text-primary" />
                                )}
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </CardContent>
            </Card>

            {/* Bill Items */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Receipt className="w-5 h-5" />
                    Bill Items
                  </CardTitle>
                  <Button size="sm" onClick={() => setAddItemDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {billItems.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <Receipt className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No items added yet</p>
                    <Button variant="outline" onClick={() => setAddItemDialogOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Item
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead>Type</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead className="text-center">Qty</TableHead>
                          <TableHead className="text-right">Unit Price</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead className="w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {billItems.map((item) => {
                          const ItemIcon = getItemTypeIcon(item.item_type);
                          return (
                            <TableRow key={item.id}>
                              <TableCell>
                                <Badge className={cn('gap-1', getItemTypeBadgeColor(item.item_type))}>
                                  <ItemIcon className="w-3 h-3" />
                                  {item.item_type}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-medium">{item.description}</TableCell>
                              <TableCell className="text-center">{item.quantity}</TableCell>
                              <TableCell className="text-right">${item.unit_price.toFixed(2)}</TableCell>
                              <TableCell className="text-right font-medium">${item.amount.toFixed(2)}</TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={() => handleRemoveItem(item.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Additional Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Add any notes or comments for this invoice..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Summary & Payment */}
          <div className="space-y-6">
            {/* Invoice Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Invoice Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Label className="text-sm text-muted-foreground w-20">Discount</Label>
                    <div className="flex items-center gap-1 flex-1">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={discount}
                        onChange={(e) => setDiscount(Number(e.target.value))}
                        className="h-8 w-16 text-right"
                      />
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                    <span className="text-sm">-${discountAmount.toFixed(2)}</span>
                  </div>
                  
                  <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span className="text-primary">${totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Payment Mode</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['Cash', 'Card', 'UPI', 'Online'] as PaymentMode[]).map((mode) => {
                      const ModeIcon = paymentModeIcons[mode];
                      return (
                        <Button
                          key={mode}
                          variant={paymentMode === mode ? 'default' : 'outline'}
                          className="gap-2 justify-start"
                          onClick={() => setPaymentMode(mode)}
                        >
                          <ModeIcon className="w-4 h-4" />
                          {mode}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Amount Paid</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min="0"
                      max={totalAmount}
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(Number(e.target.value))}
                      placeholder="0.00"
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => setPaidAmount(totalAmount)}
                      disabled={totalAmount === 0}
                    >
                      Full
                    </Button>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Paid Amount</span>
                    <span className="text-green-600 font-medium">${paidAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Balance</span>
                    <span className={cn(
                      "font-medium",
                      balanceAmount > 0 ? "text-destructive" : "text-green-600"
                    )}>
                      ${balanceAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge className={cn(
                      paymentStatus === 'Paid' && 'bg-green-100 text-green-700',
                      paymentStatus === 'Partial' && 'bg-amber-100 text-amber-700',
                      paymentStatus === 'Unpaid' && 'bg-red-100 text-red-600',
                    )}>
                      {paymentStatus}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Add Item Dialog */}
      <Dialog open={addItemDialogOpen} onOpenChange={setAddItemDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Bill Item</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Item Type Selection */}
            <div className="space-y-2">
              <Label>Item Type</Label>
              <div className="grid grid-cols-3 gap-2">
                {(['Consultation', 'Medicine', 'LabTest'] as BillItemType[]).map((type) => {
                  const TypeIcon = getItemTypeIcon(type);
                  return (
                    <Button
                      key={type}
                      variant={selectedItemType === type ? 'default' : 'outline'}
                      className="gap-2 flex-col h-auto py-3"
                      onClick={() => {
                        setSelectedItemType(type);
                        resetAddItemForm();
                      }}
                    >
                      <TypeIcon className="w-5 h-5" />
                      <span className="text-xs">{type === 'LabTest' ? 'Lab Test' : type}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Form based on Item Type */}
            {selectedItemType === 'Consultation' && (
              <div className="space-y-2">
                <Label>Select Doctor</Label>
                <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a doctor..." />
                  </SelectTrigger>
                  <SelectContent>
                    {mockDoctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        <div className="flex justify-between items-center w-full">
                          <div>
                            <p>{doctor.name}</p>
                            <p className="text-xs text-muted-foreground">{doctor.specialization}</p>
                          </div>
                          <span className="text-sm font-medium">${doctor.consultation_fee}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedDoctor && (
                  <p className="text-sm text-muted-foreground">
                    Fee: ${mockDoctors.find(d => d.id === selectedDoctor)?.consultation_fee}
                  </p>
                )}
              </div>
            )}

            {selectedItemType === 'Medicine' && (
              <>
                <div className="space-y-2">
                  <Label>Select Medicine</Label>
                  <Select value={selectedMedicine} onValueChange={setSelectedMedicine}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a medicine..." />
                    </SelectTrigger>
                    <SelectContent>
                      {mockMedicines.map((medicine) => (
                        <SelectItem key={medicine.id} value={medicine.id}>
                          <div className="flex justify-between items-center w-full">
                            <div>
                              <p>{medicine.name}</p>
                              <p className="text-xs text-muted-foreground">Stock: {medicine.stock}</p>
                            </div>
                            <span className="text-sm font-medium">${medicine.unit_price}/unit</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    min="1"
                    value={medicineQuantity}
                    onChange={(e) => setMedicineQuantity(Number(e.target.value))}
                  />
                </div>
                {selectedMedicine && medicineQuantity > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Total: ${(mockMedicines.find(m => m.id === selectedMedicine)?.unit_price || 0) * medicineQuantity}
                  </p>
                )}
              </>
            )}

            {selectedItemType === 'LabTest' && (
              <div className="space-y-2">
                <Label>Select Lab Test</Label>
                <Select value={selectedLabTest} onValueChange={setSelectedLabTest}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a lab test..." />
                  </SelectTrigger>
                  <SelectContent>
                    {mockLabTests.map((test) => (
                      <SelectItem key={test.id} value={test.id}>
                        <div className="flex justify-between items-center w-full">
                          <p>{test.name}</p>
                          <span className="text-sm font-medium">${test.price}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedLabTest && (
                  <p className="text-sm text-muted-foreground">
                    Price: ${mockLabTests.find(t => t.id === selectedLabTest)?.price}
                  </p>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddItemDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddItem}>
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
