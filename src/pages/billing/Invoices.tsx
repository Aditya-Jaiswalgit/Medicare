import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Receipt,
  Plus,
  Search,
  MoreVertical,
  Printer,
  Eye,
  DollarSign,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

type PaymentStatus = "paid" | "pending" | "partial";

interface MedicineBill {
  id: string;
  bill_number: string;
  patient_id: string;
  patient_name: string;
  patient_phone: string;
  total_amount: number;
  status: PaymentStatus;
  created_at: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

const statusConfig: Record<
  string,
  { icon: React.ElementType; color: string; label: string }
> = {
  paid: {
    icon: CheckCircle,
    color:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    label: "Paid",
  },
  pending: {
    icon: XCircle,
    color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
    label: "Pending",
  },
  partial: {
    icon: Clock,
    color:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    label: "Partial",
  },
};

export default function InvoicesPage() {
  const navigate = useNavigate();
  const { token, isLoading: authLoading } = useAuth();

  const [bills, setBills] = useState<MedicineBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  useEffect(() => {
    if (!authLoading && token) {
      fetchBills();
    }
  }, [authLoading, token]);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "http://localhost:5000/api/pharmacist/medicine-bills",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) throw new Error("Failed to fetch bills");

      const result: ApiResponse<MedicineBill[]> = await response.json();
      if (result.success) {
        setBills(Array.isArray(result.data) ? result.data : []);
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to load bills",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching bills:", error);
      toast({
        title: "Error",
        description: "Failed to load medicine bills",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredBills = bills.filter((bill) => {
    const matchesSearch =
      bill.bill_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.patient_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.patient_phone?.includes(searchQuery);
    const matchesStatus =
      selectedStatus === "all" || bill.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const totalCollected = bills.reduce(
    (sum, b) =>
      sum + (b.status === "paid" ? parseFloat(String(b.total_amount)) : 0),
    0,
  );
  const totalPending = bills.reduce(
    (sum, b) =>
      sum + (b.status !== "paid" ? parseFloat(String(b.total_amount)) : 0),
    0,
  );
  const paidCount = bills.filter((b) => b.status === "paid").length;

  const getStatusConfig = (status: string) =>
    statusConfig[status] ?? {
      icon: Clock,
      color: "bg-gray-100 text-gray-600",
      label: status,
    };

  if (loading) {
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
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Receipt className="w-6 h-6" />
              Medicine Bills
            </h1>
            <p className="text-muted-foreground">
              Manage medicine billing and invoices
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchBills} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Button
              className="gap-2"
              onClick={() => navigate("/billing/create")}
            >
              <Plus className="w-4 h-4" />
              Create Bill
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Receipt className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{bills.length}</p>
                  <p className="text-xs text-muted-foreground">Total Bills</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    ₹{totalCollected.toFixed(0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Collected</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    ₹{totalPending.toFixed(0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{paidCount}</p>
                  <p className="text-xs text-muted-foreground">Paid Bills</p>
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
                  placeholder="Search by bill number or patient name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Bills Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              All Bills ({filteredBills.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Bill No.</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Amount
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBills.map((bill) => {
                    const config = getStatusConfig(bill.status);
                    const StatusIcon = config.icon;
                    return (
                      <TableRow key={bill.id} className="hover:bg-muted/50">
                        <TableCell>
                          <p className="font-medium text-foreground">
                            {bill.bill_number}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{bill.patient_name}</p>
                              <p className="text-xs text-muted-foreground">
                                {bill.patient_phone}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {bill.created_at
                            ? format(new Date(bill.created_at), "dd MMM yyyy")
                            : "-"}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <p className="font-medium">
                            ₹{parseFloat(String(bill.total_amount)).toFixed(2)}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn("gap-1 border-0", config.color)}>
                            <StatusIcon className="w-3 h-3" />
                            {config.label}
                          </Badge>
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
                                <Eye className="w-4 h-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2">
                                <Printer className="w-4 h-4" />
                                Print Bill
                              </DropdownMenuItem>
                              {bill.status !== "paid" && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="gap-2 text-green-600">
                                    <CreditCard className="w-4 h-4" />
                                    Mark as Paid
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {filteredBills.length === 0 && (
              <div className="text-center py-12">
                <Receipt className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">No bills found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
