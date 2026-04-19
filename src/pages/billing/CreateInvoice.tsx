import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Receipt,
  Plus,
  Trash2,
  User,
  Pill,
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
  Loader2,
  Search,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface Patient {
  id: string;
  full_name: string;
  phone: string;
  email?: string;
}

interface Medicine {
  id: string;
  name: string;
  generic_name: string;
  unit_price: number;
  stock_quantity: number;
  category: string;
}

interface BillItem {
  id: string;
  medicine_id: string;
  medicine_name: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

type PaymentMode = "Cash" | "Card" | "UPI" | "Online";
type PaymentStatus = "Paid" | "Pending" | "Partial";

const paymentModeIcons: Record<PaymentMode, React.ElementType> = {
  Cash: Banknote,
  Card: CreditCard,
  UPI: Smartphone,
  Online: Globe,
};

export default function CreateInvoicePage() {
  const navigate = useNavigate();
  const role = sessionStorage.getItem("role");
  const { token, isLoading: authLoading } = useAuth();

  // Data from API
  const [patients, setPatients] = useState<Patient[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Patient selection
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientSearchOpen, setPatientSearchOpen] = useState(false);
  const [patientSearch, setPatientSearch] = useState("");

  // Bill items
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [addItemDialogOpen, setAddItemDialogOpen] = useState(false);

  // Add item form
  const [selectedMedicineId, setSelectedMedicineId] = useState("");
  const [medicineQuantity, setMedicineQuantity] = useState(1);
  const [medicineSearch, setMedicineSearch] = useState("");

  // Payment
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("Cash");
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [notes, setNotes] = useState("");
  const [discount, setDiscount] = useState<number>(0);

  useEffect(() => {
    if (!authLoading && token) {
      fetchPatients();
      fetchMedicines();
    }
  }, [authLoading, token]);

  const fetchPatients = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/${role}/patients`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!response.ok) throw new Error("Failed to fetch patients");
      const result: ApiResponse<Patient[]> = await response.json();
      if (result.success)
        setPatients(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      console.error("Error fetching patients:", error);
      toast({
        title: "Error",
        description: "Failed to load patients",
        variant: "destructive",
      });
    }
  };

  const fetchMedicines = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/${role}/medicines`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!response.ok) throw new Error("Failed to fetch medicines");
      const result: ApiResponse<Medicine[]> = await response.json();
      if (result.success) {
        setMedicines(Array.isArray(result.data) ? result.data : []);
      }
    } catch (error) {
      console.error("Error fetching medicines:", error);
      toast({
        title: "Error",
        description: "Failed to load medicines",
        variant: "destructive",
      });
    } finally {
      setLoadingData(false);
    }
  };

  // Calculations
  const subtotal = useMemo(
    () => billItems.reduce((sum, item) => sum + item.amount, 0),
    [billItems],
  );
  const discountAmount = useMemo(
    () => (subtotal * discount) / 100,
    [subtotal, discount],
  );
  const totalAmount = useMemo(
    () => subtotal - discountAmount,
    [subtotal, discountAmount],
  );
  const balanceAmount = useMemo(
    () => totalAmount - paidAmount,
    [totalAmount, paidAmount],
  );

  const paymentStatus: PaymentStatus = useMemo(() => {
    if (paidAmount >= totalAmount && totalAmount > 0) return "Paid";
    if (paidAmount > 0) return "Partial";
    return "Pending";
  }, [paidAmount, totalAmount]);

  const filteredPatients = patients.filter(
    (p) =>
      p.full_name?.toLowerCase().includes(patientSearch.toLowerCase()) ||
      p.phone?.includes(patientSearch),
  );

  const filteredMedicines = medicines.filter(
    (m) =>
      m.name?.toLowerCase().includes(medicineSearch.toLowerCase()) ||
      m.generic_name?.toLowerCase().includes(medicineSearch.toLowerCase()),
  );

  const selectedMedicine = medicines.find((m) => m.id === selectedMedicineId);

  const handleAddItem = () => {
    if (!selectedMedicine) {
      toast({
        title: "Error",
        description: "Please select a medicine",
        variant: "destructive",
      });
      return;
    }
    if (medicineQuantity < 1) {
      toast({
        title: "Error",
        description: "Quantity must be at least 1",
        variant: "destructive",
      });
      return;
    }
    if (medicineQuantity > selectedMedicine.stock_quantity) {
      toast({
        title: "Error",
        description: `Only ${selectedMedicine.stock_quantity} units in stock`,
        variant: "destructive",
      });
      return;
    }

    // Check if medicine already added
    const existing = billItems.find(
      (i) => i.medicine_id === selectedMedicineId,
    );
    if (existing) {
      setBillItems((prev) =>
        prev.map((i) =>
          i.medicine_id === selectedMedicineId
            ? {
                ...i,
                quantity: i.quantity + medicineQuantity,
                amount: i.unit_price * (i.quantity + medicineQuantity),
              }
            : i,
        ),
      );
    } else {
      const newItem: BillItem = {
        id: Date.now().toString(),
        medicine_id: selectedMedicine.id,
        medicine_name: selectedMedicine.name,
        quantity: medicineQuantity,
        unit_price: selectedMedicine.unit_price,
        amount: selectedMedicine.unit_price * medicineQuantity,
      };
      setBillItems((prev) => [...prev, newItem]);
    }

    // Reset form
    setSelectedMedicineId("");
    setMedicineQuantity(1);
    setMedicineSearch("");
    setAddItemDialogOpen(false);
    toast({ title: "Success", description: "Medicine added to bill" });
  };

  const handleRemoveItem = (itemId: string) => {
    setBillItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handleCreateBill = async () => {
    if (!selectedPatient) {
      toast({
        title: "Error",
        description: "Please select a patient",
        variant: "destructive",
      });
      return;
    }
    if (billItems.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one medicine",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        patient_id: selectedPatient.id,
        items: billItems.map((item) => ({
          medicine_id: item.medicine_id,
          quantity: item.quantity,
        })),
      };

      const response = await fetch(
        `http://localhost:5000/api/${role}/medicine-bills`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const result: ApiResponse<unknown> = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to create bill");
      }

      if (result.success) {
        toast({
          title: "Success!",
          description: "Medicine bill created successfully",
        });
        navigate("/billing/invoices");
      }
    } catch (error) {
      console.error("Error creating bill:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to create bill. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

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
                Create Medicine Bill
              </h1>
              <p className="text-muted-foreground">
                Add medicines and generate bill
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateBill}
              disabled={
                !selectedPatient || billItems.length === 0 || submitting
              }
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create Bill
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column */}
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
                <Popover
                  open={patientSearchOpen}
                  onOpenChange={setPatientSearchOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between h-auto py-3"
                    >
                      {selectedPatient ? (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <div className="text-left">
                            <p className="font-medium">
                              {selectedPatient.full_name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {selectedPatient.phone}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">
                          Search and select patient...
                        </span>
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput
                        placeholder="Search patient by name or phone..."
                        value={patientSearch}
                        onValueChange={setPatientSearch}
                      />
                      <CommandList>
                        <CommandEmpty>No patient found.</CommandEmpty>
                        <CommandGroup>
                          {filteredPatients.map((patient) => (
                            <CommandItem
                              key={patient.id}
                              value={`${patient.full_name} ${patient.phone}`}
                              onSelect={() => {
                                setSelectedPatient(patient);
                                setPatientSearchOpen(false);
                                setPatientSearch("");
                              }}
                            >
                              <div className="flex items-center gap-3 w-full">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                  <User className="w-4 h-4 text-primary" />
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium">
                                    {patient.full_name}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {patient.phone}
                                  </p>
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
                    <Pill className="w-5 h-5" />
                    Medicines
                  </CardTitle>
                  <Button size="sm" onClick={() => setAddItemDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Medicine
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {billItems.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <Pill className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      No medicines added yet
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setAddItemDialogOpen(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Medicine
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead>Medicine</TableHead>
                          <TableHead className="text-center">Qty</TableHead>
                          <TableHead className="text-right">
                            Unit Price
                          </TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead className="w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {billItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Pill className="w-4 h-4 text-green-600" />
                                <span className="font-medium">
                                  {item.medicine_name}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              {item.quantity}
                            </TableCell>
                            <TableCell className="text-right">
                              ₹{parseFloat(String(item.unit_price)).toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              ₹{item.amount.toFixed(2)}
                            </TableCell>
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
                        ))}
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
                  placeholder="Add any notes for this bill..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-6">
            <Card className="sticky top-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Bill Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Patient */}
                <div className="p-3 rounded-lg bg-muted/50 space-y-1">
                  <p className="text-xs text-muted-foreground">Patient</p>
                  <p className="font-medium">
                    {selectedPatient?.full_name || "-"}
                  </p>
                  {selectedPatient?.phone && (
                    <p className="text-sm text-muted-foreground">
                      {selectedPatient.phone}
                    </p>
                  )}
                </div>

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Label className="text-sm text-muted-foreground w-20 shrink-0">
                      Discount
                    </Label>
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
                    <span className="text-sm">
                      -₹{discountAmount.toFixed(2)}
                    </span>
                  </div>

                  <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span className="text-primary">
                      ₹{totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Items count */}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Items</span>
                  <span>{billItems.length} medicines</span>
                </div>

                <Button
                  className="w-full gap-2"
                  size="lg"
                  onClick={handleCreateBill}
                  disabled={
                    !selectedPatient || billItems.length === 0 || submitting
                  }
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Create Bill
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Add Medicine Dialog */}
      <Dialog open={addItemDialogOpen} onOpenChange={setAddItemDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Medicine</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Search Medicine</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or generic name..."
                  value={medicineSearch}
                  onChange={(e) => setMedicineSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Select Medicine</Label>
              <Select
                value={selectedMedicineId}
                onValueChange={(val) => {
                  setSelectedMedicineId(val);
                  setMedicineQuantity(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a medicine..." />
                </SelectTrigger>
                <SelectContent>
                  {filteredMedicines.length === 0 ? (
                    <div className="p-2 text-center text-sm text-muted-foreground">
                      No medicines found
                    </div>
                  ) : (
                    filteredMedicines.map((medicine) => (
                      <SelectItem
                        key={medicine.id}
                        value={medicine.id}
                        disabled={medicine.stock_quantity === 0}
                      >
                        <div className="flex justify-between items-center w-full gap-4">
                          <div>
                            <p>{medicine.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {medicine.generic_name} · Stock:{" "}
                              {medicine.stock_quantity}
                            </p>
                          </div>
                          <span className="text-sm font-medium shrink-0">
                            ₹
                            {parseFloat(String(medicine.unit_price)).toFixed(2)}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {selectedMedicine && (
              <div className="p-3 rounded-lg bg-muted/50 text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Unit Price</span>
                  <span>
                    ₹
                    {parseFloat(String(selectedMedicine.unit_price)).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">In Stock</span>
                  <span
                    className={cn(
                      selectedMedicine.stock_quantity <=
                        selectedMedicine.reorder_level
                        ? "text-red-600"
                        : "text-green-600",
                    )}
                  >
                    {selectedMedicine.stock_quantity} units
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category</span>
                  <span>{selectedMedicine.category || "-"}</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input
                type="number"
                min="1"
                max={selectedMedicine?.stock_quantity || 999}
                value={medicineQuantity}
                onChange={(e) => setMedicineQuantity(Number(e.target.value))}
              />
            </div>

            {selectedMedicine && medicineQuantity > 0 && (
              <div className="flex justify-between font-medium text-sm border-t pt-2">
                <span>Total</span>
                <span className="text-primary">
                  ₹
                  {(
                    parseFloat(String(selectedMedicine.unit_price)) *
                    medicineQuantity
                  ).toFixed(2)}
                </span>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAddItemDialogOpen(false);
                setSelectedMedicineId("");
                setMedicineQuantity(1);
                setMedicineSearch("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddItem}>
              <Plus className="w-4 h-4 mr-2" />
              Add Medicine
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
