import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Download,
  Eye,
  Search,
  Calendar,
  Pill,
  TestTube,
  DollarSign,
  Loader2,
  FileCheck,
  AlertCircle,
  User,
  Stethoscope,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Activity,
  Receipt,
  FlaskConical,
  ScrollText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface LabReport {
  id: string;
  patient_id: string;
  doctor_id: string;
  lab_technician_id: string | null;
  clinic_id: string;
  report_date: string;
  report_type: string;
  report_data: any;
  file_url: string | null;
  notes: string | null;
  is_abnormal: boolean;
  created_at: string;
  doctor_name: string;
  clinic_name: string;
  clinic_address: string;
}

interface TreatmentBill {
  id: string;
  patient_id: string;
  doctor_id?: string;
  clinic_id: string;
  bill_date?: string;
  bill_number?: string;
  total_amount: string | number;
  paid_amount?: string | number;
  payment_status?: "paid" | "pending" | "cancelled";
  status?: string;
  payment_method?: string | null;
  description?: string;
  notes?: string | null;
  created_at: string;
  doctor_name?: string;
  clinic_name?: string;
}

interface MedicineBill {
  id: string;
  patient_id: string;
  pharmacist_id: string | null;
  clinic_id: string;
  bill_date: string;
  prescription_id: string | null;
  subtotal: number;
  discount: number;
  tax: number;
  total_amount: number;
  payment_status: "paid" | "pending" | "cancelled";
  payment_method: string | null;
  notes: string | null;
  created_at: string;
  pharmacist_name: string | null;
  clinic_name: string;
}

interface MedicineBillItem {
  id: string;
  medicine_bill_id: string;
  medicine_name: string;
  dosage: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

// Matches the actual API response — uses treatment_bills not bills
interface MedicalHistory {
  appointments: Array<{
    id: string;
    appointment_date: string;
    reason: string;
    status: string;
    doctor_name: string;
    specialization: string;
    clinic_name: string;
  }>;
  lab_reports: Array<{
    id: string;
    report_date: string;
    report_type: string;
    is_abnormal: boolean;
    doctor_name: string;
    clinic_name: string;
  }>;
  treatment_bills: Array<{
    id: string;
    bill_number: string;
    total_amount: string | number;
    paid_amount: string | number;
    status: string;
    description: string;
    created_at: string;
  }>;
}

// ─── Component ────────────────────────────────────────────────────────────────

const YourBills: React.FC = () => {
  const { token, isLoading: authLoading } = useAuth();

  const [labReports, setLabReports] = useState<LabReport[]>([]);
  const [treatmentBills, setTreatmentBills] = useState<TreatmentBill[]>([]);
  const [medicineBills, setMedicineBills] = useState<MedicineBill[]>([]);
  const [medicineBillItems, setMedicineBillItems] = useState<
    MedicineBillItem[]
  >([]);
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistory | null>(
    null,
  );

  const [loading, setLoading] = useState({
    labReports: false,
    treatmentBills: false,
    medicineBills: false,
    medicalHistory: false,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("treatment-bills");

  const [isViewItemsOpen, setIsViewItemsOpen] = useState(false);
  const [isViewReportOpen, setIsViewReportOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<MedicineBill | null>(null);
  const [selectedReport, setSelectedReport] = useState<LabReport | null>(null);

  const [pagination, setPagination] = useState({
    labReports: { page: 1, limit: 10, total: 0, pages: 1 },
    treatmentBills: { page: 1, limit: 10, total: 0, pages: 1 },
    medicineBills: { page: 1, limit: 10, total: 0, pages: 1 },
  });

  // ─── Effects ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!authLoading && token) {
      switch (activeTab) {
        case "lab-reports":
          fetchLabReports();
          break;
        case "treatment-bills":
          fetchTreatmentBills();
          break;
        case "medicine-bills":
          fetchMedicineBills();
          break;
        case "medical-history":
          fetchMedicalHistory();
          break;
      }
    }
  }, [
    authLoading,
    token,
    activeTab,
    pagination.labReports.page,
    pagination.treatmentBills.page,
    pagination.medicineBills.page,
  ]);

  // ─── Fetch helpers ────────────────────────────────────────────────────────────

  const authHeader = { Authorization: `Bearer ${token}` };

  const fetchLabReports = async () => {
    setLoading((p) => ({ ...p, labReports: true }));
    try {
      const res = await fetch(
        `http://localhost:5000/api/patient/lab-reports?page=${pagination.labReports.page}&limit=${pagination.labReports.limit}`,
        { headers: authHeader },
      );
      if (!res.ok) throw new Error();
      const result = await res.json();
      if (result.success) {
        setLabReports(Array.isArray(result.data) ? result.data : []);
        if (result.pagination)
          setPagination((p) => ({
            ...p,
            labReports: { ...p.labReports, ...result.pagination },
          }));
      }
    } catch {
      toast.error("Failed to load lab reports");
    } finally {
      setLoading((p) => ({ ...p, labReports: false }));
    }
  };

  const fetchTreatmentBills = async () => {
    setLoading((p) => ({ ...p, treatmentBills: true }));
    try {
      const res = await fetch(
        `http://localhost:5000/api/patient/treatment-bills?page=${pagination.treatmentBills.page}&limit=${pagination.treatmentBills.limit}`,
        { headers: authHeader },
      );
      if (!res.ok) throw new Error();
      const result = await res.json();
      if (result.success) {
        setTreatmentBills(Array.isArray(result.data) ? result.data : []);
        if (result.pagination)
          setPagination((p) => ({
            ...p,
            treatmentBills: { ...p.treatmentBills, ...result.pagination },
          }));
      }
    } catch {
      toast.error("Failed to load treatment bills");
    } finally {
      setLoading((p) => ({ ...p, treatmentBills: false }));
    }
  };

  const fetchMedicineBills = async () => {
    setLoading((p) => ({ ...p, medicineBills: true }));
    try {
      const res = await fetch(
        `http://localhost:5000/api/patient/medicine-bills?page=${pagination.medicineBills.page}&limit=${pagination.medicineBills.limit}`,
        { headers: authHeader },
      );
      if (!res.ok) throw new Error();
      const result = await res.json();
      if (result.success) {
        setMedicineBills(Array.isArray(result.data) ? result.data : []);
        if (result.pagination)
          setPagination((p) => ({
            ...p,
            medicineBills: { ...p.medicineBills, ...result.pagination },
          }));
      }
    } catch {
      toast.error("Failed to load medicine bills");
    } finally {
      setLoading((p) => ({ ...p, medicineBills: false }));
    }
  };

  const fetchMedicineBillItems = async (billId: string) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/patient/medicine-bills/${billId}/items`,
        { headers: authHeader },
      );
      if (!res.ok) throw new Error();
      const result = await res.json();
      setMedicineBillItems(
        result.success && Array.isArray(result.data) ? result.data : [],
      );
    } catch {
      toast.error("Failed to load bill items");
      setMedicineBillItems([]);
    }
  };

  const fetchMedicalHistory = async () => {
    setLoading((p) => ({ ...p, medicalHistory: true }));
    try {
      const res = await fetch(
        "http://localhost:5000/api/patient/medical-history",
        { headers: authHeader },
      );
      if (!res.ok) throw new Error();
      const result = await res.json();
      if (result.success && result.data) {
        // Normalise — guarantee arrays even if backend omits a key
        setMedicalHistory({
          appointments: Array.isArray(result.data.appointments)
            ? result.data.appointments
            : [],
          lab_reports: Array.isArray(result.data.lab_reports)
            ? result.data.lab_reports
            : [],
          treatment_bills: Array.isArray(result.data.treatment_bills)
            ? result.data.treatment_bills
            : [],
        });
      } else {
        setMedicalHistory({
          appointments: [],
          lab_reports: [],
          treatment_bills: [],
        });
      }
    } catch {
      toast.error("Failed to load medical history");
      setMedicalHistory({
        appointments: [],
        lab_reports: [],
        treatment_bills: [],
      });
    } finally {
      setLoading((p) => ({ ...p, medicalHistory: false }));
    }
  };

  // ─── Handlers ─────────────────────────────────────────────────────────────────

  const handleViewBillItems = (bill: MedicineBill) => {
    setSelectedBill(bill);
    fetchMedicineBillItems(bill.id);
    setIsViewItemsOpen(true);
  };

  const handleViewReport = (report: LabReport) => {
    setSelectedReport(report);
    setIsViewReportOpen(true);
  };

  const handleDownload = (url: string | null, fileName: string) => {
    if (!url) {
      toast.error("No file available for download");
      return;
    }
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.target = "_blank";
    a.click();
  };

  // ─── UI helpers ───────────────────────────────────────────────────────────────

  const formatDate = (d?: string) => {
    if (!d) return "—";
    try {
      return format(new Date(d), "MMM dd, yyyy");
    } catch {
      return "—";
    }
  };

  const formatCurrency = (amount?: string | number) => {
    try {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
      }).format(Number(amount ?? 0));
    } catch {
      return `₹${Number(amount ?? 0).toFixed(2)}`;
    }
  };

  // Handles both "payment_status" and "status" field names from different endpoints
  const resolveStatus = (bill: any): string =>
    bill.payment_status ?? bill.status ?? "pending";

  const getPaymentStatusBadge = (status: string) => {
    const map: Record<string, { label: string; color: string }> = {
      paid: {
        label: "Paid",
        color:
          "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      },
      pending: {
        label: "Pending",
        color:
          "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
      },
      cancelled: {
        label: "Cancelled",
        color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      },
    };
    const s = map[status] ?? map.pending;
    return <Badge className={cn("border-0", s.color)}>{s.label}</Badge>;
  };

  const getAbnormalBadge = (isAbnormal: boolean) =>
    isAbnormal ? (
      <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 gap-1 border-0">
        <AlertCircle className="w-3 h-3" /> Abnormal
      </Badge>
    ) : (
      <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 gap-1 border-0">
        <FileCheck className="w-3 h-3" /> Normal
      </Badge>
    );

  // ─── Filtered lists ───────────────────────────────────────────────────────────

  const filteredTreatmentBills = treatmentBills.filter((b) => {
    const q = searchQuery.toLowerCase();
    const match =
      (b.clinic_name ?? "").toLowerCase().includes(q) ||
      (b.doctor_name ?? "").toLowerCase().includes(q) ||
      (b.bill_number ?? "").toLowerCase().includes(q);
    return (
      match && (statusFilter === "all" || resolveStatus(b) === statusFilter)
    );
  });

  const filteredMedicineBills = medicineBills.filter((b) => {
    const q = searchQuery.toLowerCase();
    const match =
      (b.clinic_name ?? "").toLowerCase().includes(q) ||
      (b.pharmacist_name ?? "").toLowerCase().includes(q);
    return (
      match && (statusFilter === "all" || b.payment_status === statusFilter)
    );
  });

  const filteredLabReports = labReports.filter((r) => {
    const q = searchQuery.toLowerCase();
    return (
      (r.clinic_name ?? "").toLowerCase().includes(q) ||
      (r.doctor_name ?? "").toLowerCase().includes(q) ||
      (r.report_type ?? "").toLowerCase().includes(q)
    );
  });

  // ─── Auth loading ─────────────────────────────────────────────────────────────

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Receipt className="w-6 h-6" />
            My Bills & Reports
          </h1>
          <p className="text-muted-foreground">
            View all your medical bills, lab reports, and complete medical
            history
          </p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid grid-cols-2 lg:grid-cols-4 w-full">
            <TabsTrigger value="treatment-bills" className="gap-2">
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Treatment Bills</span>
            </TabsTrigger>
            <TabsTrigger value="medicine-bills" className="gap-2">
              <Pill className="w-4 h-4" />
              <span className="hidden sm:inline">Medicine Bills</span>
            </TabsTrigger>
            <TabsTrigger value="lab-reports" className="gap-2">
              <FlaskConical className="w-4 h-4" />
              <span className="hidden sm:inline">Lab Reports</span>
            </TabsTrigger>
            <TabsTrigger value="medical-history" className="gap-2">
              <ScrollText className="w-4 h-4" />
              <span className="hidden sm:inline">Medical History</span>
            </TabsTrigger>
          </TabsList>

          {/* Filters */}
          {activeTab !== "medical-history" && (
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder={`Search ${activeTab === "lab-reports" ? "reports" : "bills"}...`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  {activeTab !== "lab-reports" && (
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="w-full sm:w-40">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Treatment Bills ──────────────────────────────────────────────── */}
          <TabsContent value="treatment-bills" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Treatment Bills ({filteredTreatmentBills.length} of{" "}
                  {pagination.treatmentBills.total})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading.treatmentBills ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredTreatmentBills.length === 0 ? (
                  <div className="text-center py-12">
                    <Receipt className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No treatment bills found
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="rounded-lg border overflow-hidden overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead>Date</TableHead>
                            <TableHead className="hidden md:table-cell">
                              Bill No.
                            </TableHead>
                            <TableHead className="hidden md:table-cell">
                              Doctor
                            </TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-12"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredTreatmentBills.map((bill) => (
                            <TableRow
                              key={bill.id}
                              className="hover:bg-muted/50"
                            >
                              <TableCell>
                                <div className="flex items-center gap-1.5">
                                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                                  <span>
                                    {formatDate(
                                      bill.bill_date ?? bill.created_at,
                                    )}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                                {bill.bill_number ?? "—"}
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                {bill.doctor_name ? (
                                  <div className="flex items-center gap-2">
                                    <Stethoscope className="w-4 h-4 text-primary" />
                                    <span>{bill.doctor_name}</span>
                                  </div>
                                ) : (
                                  "—"
                                )}
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {formatCurrency(bill.total_amount)}
                              </TableCell>
                              <TableCell>
                                {getPaymentStatusBadge(resolveStatus(bill))}
                              </TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                    >
                                      <MoreVertical className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem className="gap-2">
                                      <Download className="w-4 h-4" /> Download
                                      PDF
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    {pagination.treatmentBills.pages > 1 && (
                      <div className="flex items-center justify-between pt-4">
                        <p className="text-sm text-muted-foreground">
                          Page {pagination.treatmentBills.page} of{" "}
                          {pagination.treatmentBills.pages}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setPagination((p) => ({
                                ...p,
                                treatmentBills: {
                                  ...p.treatmentBills,
                                  page: p.treatmentBills.page - 1,
                                },
                              }))
                            }
                            disabled={pagination.treatmentBills.page === 1}
                          >
                            <ChevronLeft className="w-4 h-4" /> Previous
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setPagination((p) => ({
                                ...p,
                                treatmentBills: {
                                  ...p.treatmentBills,
                                  page: p.treatmentBills.page + 1,
                                },
                              }))
                            }
                            disabled={
                              pagination.treatmentBills.page ===
                              pagination.treatmentBills.pages
                            }
                          >
                            Next <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Medicine Bills ───────────────────────────────────────────────── */}
          <TabsContent value="medicine-bills" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Pill className="w-5 h-5" />
                  Medicine Bills ({filteredMedicineBills.length} of{" "}
                  {pagination.medicineBills.total})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading.medicineBills ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredMedicineBills.length === 0 ? (
                  <div className="text-center py-12">
                    <Pill className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No medicine bills found
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="rounded-lg border overflow-hidden overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead>Date</TableHead>
                            <TableHead>Pharmacist</TableHead>
                            <TableHead className="hidden md:table-cell">
                              Clinic
                            </TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-16">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredMedicineBills.map((bill) => (
                            <TableRow
                              key={bill.id}
                              className="hover:bg-muted/50"
                            >
                              <TableCell>
                                <div className="flex items-center gap-1.5">
                                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                                  <span>
                                    {formatDate(
                                      bill.bill_date ?? bill.created_at,
                                    )}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4 text-primary" />
                                  <span>{bill.pharmacist_name ?? "N/A"}</span>
                                </div>
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                {bill.clinic_name}
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {formatCurrency(bill.total_amount)}
                              </TableCell>
                              <TableCell>
                                {getPaymentStatusBadge(bill.payment_status)}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleViewBillItems(bill)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    {pagination.medicineBills.pages > 1 && (
                      <div className="flex items-center justify-between pt-4">
                        <p className="text-sm text-muted-foreground">
                          Page {pagination.medicineBills.page} of{" "}
                          {pagination.medicineBills.pages}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setPagination((p) => ({
                                ...p,
                                medicineBills: {
                                  ...p.medicineBills,
                                  page: p.medicineBills.page - 1,
                                },
                              }))
                            }
                            disabled={pagination.medicineBills.page === 1}
                          >
                            <ChevronLeft className="w-4 h-4" /> Previous
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setPagination((p) => ({
                                ...p,
                                medicineBills: {
                                  ...p.medicineBills,
                                  page: p.medicineBills.page + 1,
                                },
                              }))
                            }
                            disabled={
                              pagination.medicineBills.page ===
                              pagination.medicineBills.pages
                            }
                          >
                            Next <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Lab Reports ──────────────────────────────────────────────────── */}
          <TabsContent value="lab-reports" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FlaskConical className="w-5 h-5" />
                  Lab Reports ({filteredLabReports.length} of{" "}
                  {pagination.labReports.total})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading.labReports ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredLabReports.length === 0 ? (
                  <div className="text-center py-12">
                    <TestTube className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No lab reports found
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="rounded-lg border overflow-hidden overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead>Date</TableHead>
                            <TableHead>Report Type</TableHead>
                            <TableHead className="hidden md:table-cell">
                              Doctor
                            </TableHead>
                            <TableHead className="hidden lg:table-cell">
                              Clinic
                            </TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-12"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredLabReports.map((report) => (
                            <TableRow
                              key={report.id}
                              className="hover:bg-muted/50"
                            >
                              <TableCell>
                                <div className="flex items-center gap-1.5">
                                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                                  <span>{formatDate(report.report_date)}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <TestTube className="w-4 h-4 text-primary" />
                                  <span>{report.report_type}</span>
                                </div>
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                {report.doctor_name}
                              </TableCell>
                              <TableCell className="hidden lg:table-cell">
                                {report.clinic_name}
                              </TableCell>
                              <TableCell>
                                {getAbnormalBadge(report.is_abnormal)}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleViewReport(report)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    {pagination.labReports.pages > 1 && (
                      <div className="flex items-center justify-between pt-4">
                        <p className="text-sm text-muted-foreground">
                          Page {pagination.labReports.page} of{" "}
                          {pagination.labReports.pages}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setPagination((p) => ({
                                ...p,
                                labReports: {
                                  ...p.labReports,
                                  page: p.labReports.page - 1,
                                },
                              }))
                            }
                            disabled={pagination.labReports.page === 1}
                          >
                            <ChevronLeft className="w-4 h-4" /> Previous
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setPagination((p) => ({
                                ...p,
                                labReports: {
                                  ...p.labReports,
                                  page: p.labReports.page + 1,
                                },
                              }))
                            }
                            disabled={
                              pagination.labReports.page ===
                              pagination.labReports.pages
                            }
                          >
                            Next <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Medical History ──────────────────────────────────────────────── */}
          <TabsContent value="medical-history" className="space-y-4">
            {loading.medicalHistory ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : medicalHistory ? (
              <div className="space-y-6">
                {/* Summary cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {(
                    [
                      {
                        label: "Appointments",
                        value: medicalHistory.appointments.length,
                        icon: Calendar,
                        bg: "bg-primary/10",
                        ic: "text-primary",
                      },
                      {
                        label: "Lab Reports",
                        value: medicalHistory.lab_reports.length,
                        icon: FlaskConical,
                        bg: "bg-blue-100",
                        ic: "text-blue-600",
                      },
                      {
                        label: "Treatment Bills",
                        value: medicalHistory.treatment_bills.length,
                        icon: Receipt,
                        bg: "bg-green-100",
                        ic: "text-green-600",
                      },
                    ] as const
                  ).map(({ label, value, icon: Icon, bg, ic }) => (
                    <Card key={label}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${bg}`}>
                            <Icon className={`w-5 h-5 ${ic}`} />
                          </div>
                          <div>
                            <p className="text-2xl font-bold">{value}</p>
                            <p className="text-sm text-muted-foreground">
                              {label}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Recent Appointments */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="w-5 h-5" /> Recent Appointments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {medicalHistory.appointments.length === 0 ? (
                      <p className="text-center text-muted-foreground py-6">
                        No appointments found
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {medicalHistory.appointments.slice(0, 5).map((apt) => (
                          <div
                            key={apt.id}
                            className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <Stethoscope className="w-4 h-4 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">{apt.doctor_name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {apt.specialization}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">
                                {formatDate(apt.appointment_date)}
                              </p>
                              <Badge variant="outline" className="mt-1">
                                {apt.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Lab Reports */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FlaskConical className="w-5 h-5" /> Recent Lab Reports
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {medicalHistory.lab_reports.length === 0 ? (
                      <p className="text-center text-muted-foreground py-6">
                        No lab reports found
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {medicalHistory.lab_reports
                          .slice(0, 5)
                          .map((report) => (
                            <div
                              key={report.id}
                              className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                  <TestTube className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                  <p className="font-medium">
                                    {report.report_type}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {report.doctor_name}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium">
                                  {formatDate(report.report_date)}
                                </p>
                                {getAbnormalBadge(report.is_abnormal)}
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Treatment Bills */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Receipt className="w-5 h-5" /> Recent Treatment Bills
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {medicalHistory.treatment_bills.length === 0 ? (
                      <p className="text-center text-muted-foreground py-6">
                        No treatment bills found
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {medicalHistory.treatment_bills
                          .slice(0, 5)
                          .map((bill) => (
                            <div
                              key={bill.id}
                              className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                  <Receipt className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                  <p className="font-medium">
                                    {bill.bill_number}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {bill.description || "—"}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium">
                                  {formatCurrency(bill.total_amount)}
                                </p>
                                {getPaymentStatusBadge(bill.status)}
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-12">
                <Activity className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No medical history found
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Medicine Bill Items Dialog ─────────────────────────────────────── */}
      <Dialog open={isViewItemsOpen} onOpenChange={setIsViewItemsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Pill className="w-5 h-5" />
              Bill Items —{" "}
              {selectedBill &&
                formatDate(selectedBill.bill_date ?? selectedBill.created_at)}
            </DialogTitle>
            <DialogDescription>
              Medicine bill details from {selectedBill?.clinic_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedBill && (
              <div className="bg-muted/30 p-4 rounded-lg grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Subtotal</p>
                  <p className="font-medium">
                    {formatCurrency(selectedBill.subtotal)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Discount</p>
                  <p className="font-medium">
                    -{formatCurrency(selectedBill.discount)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Tax</p>
                  <p className="font-medium">
                    {formatCurrency(selectedBill.tax)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total</p>
                  <p className="font-bold text-base">
                    {formatCurrency(selectedBill.total_amount)}
                  </p>
                </div>
              </div>
            )}
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Medicine</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Dosage
                    </TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {medicineBillItems.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-6 text-muted-foreground"
                      >
                        No items found
                      </TableCell>
                    </TableRow>
                  ) : (
                    medicineBillItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.medicine_name}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {item.dosage}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.unit_price)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(item.total_price)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            {selectedBill?.notes && (
              <div className="bg-muted/30 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Notes</p>
                <p className="text-sm">{selectedBill.notes}</p>
              </div>
            )}
            <div className="flex justify-end pt-2">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" /> Download
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Lab Report Dialog ─────────────────────────────────────────────── */}
      <Dialog open={isViewReportOpen} onOpenChange={setIsViewReportOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <FlaskConical className="w-5 h-5" />
              Lab Report — {selectedReport?.report_type}
            </DialogTitle>
            <DialogDescription>
              Generated on{" "}
              {selectedReport && formatDate(selectedReport.report_date)}
            </DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Doctor</p>
                  <p className="font-medium">{selectedReport.doctor_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Clinic</p>
                  <p className="font-medium">{selectedReport.clinic_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Report Date</p>
                  <p className="font-medium">
                    {formatDate(selectedReport.report_date)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  {getAbnormalBadge(selectedReport.is_abnormal)}
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Report Details</h3>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap font-sans text-sm">
                    {JSON.stringify(selectedReport.report_data, null, 2)}
                  </pre>
                </div>
              </div>
              {selectedReport.notes && (
                <div>
                  <h3 className="font-semibold mb-2">Additional Notes</h3>
                  <div className="bg-muted/30 p-3 rounded-lg">
                    <p className="text-sm">{selectedReport.notes}</p>
                  </div>
                </div>
              )}
              <div className="flex justify-end pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() =>
                    handleDownload(
                      selectedReport.file_url,
                      `${selectedReport.report_type}.pdf`,
                    )
                  }
                  disabled={!selectedReport.file_url}
                >
                  <Download className="w-4 h-4 mr-2" /> Download Report
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default YourBills;
