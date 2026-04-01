import { useState, useEffect, useCallback } from "react";
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
import { Label } from "@/components/ui/label";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Pill,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Package,
  AlertTriangle,
  DollarSign,
  Calendar,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";

// ✅ FIX 5: Use env variable instead of hardcoded localhost
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface Medicine {
  id: string;
  name: string;
  generic_name: string;
  category: string;
  manufacturer: string;
  stock_quantity: number;
  unit_price: number;
  expiry_date: string;
  batch_number: string;
  reorder_level: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  created_at: string;
  updated_at: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

interface DashboardStats {
  today_revenue: number;
  week_revenue: number;
  month_revenue: number;
  low_stock_count: number;
  total_medicines: number;
  recent_sales: Array<{
    name: string;
    total_sold: string;
  }>;
}

const defaultFormData = {
  name: "",
  generic_name: "",
  manufacturer: "",
  category: "",
  unit_price: "",
  stock_quantity: "",
  reorder_level: "",
  expiry_date: "",
  batch_number: "",
};

export default function PharmacyMedicinesPage() {
  const { token, isLoading: authLoading } = useAuth();

  // State
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState({
    medicines: false,
    stats: false,
    action: false,
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [showLowStock, setShowLowStock] = useState(false);

  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isStockDialogOpen, setIsStockDialogOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(
    null,
  );

  // Form state
  const [formData, setFormData] = useState(defaultFormData);

  // Stock update form
  const [stockUpdate, setStockUpdate] = useState({
    quantity: "",
    type: "add",
  });

  // Helper: stock status
  const getStockStatus = (
    quantity: number,
    reorderLevel: number,
  ): Medicine["status"] => {
    if (quantity <= 0) return "Out of Stock";
    if (quantity <= reorderLevel) return "Low Stock";
    return "In Stock";
  };

  // ✅ FIX 1: Wrap fetchMedicines in useCallback so it's stable across renders
  const fetchMedicines = useCallback(async () => {
    if (!token) return;
    setLoading((prev) => ({ ...prev, medicines: true }));
    try {
      const url = new URL(`${API_BASE}/api/pharmacist/medicines`);
      if (searchQuery) url.searchParams.append("search", searchQuery);
      if (showLowStock) url.searchParams.append("low_stock", "true");

      const response = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch medicines");

      const result: ApiResponse<Medicine[]> = await response.json();

      if (result.success) {
        const medicinesWithStatus = result.data.map((med) => {
          // ✅ Coerce numeric fields — API may return them as strings
          const stock_quantity = Number(med.stock_quantity);
          const reorder_level = Number(med.reorder_level);
          const unit_price = Number(med.unit_price);
          return {
            ...med,
            stock_quantity,
            reorder_level,
            unit_price,
            status: getStockStatus(stock_quantity, reorder_level),
          };
        });
        setMedicines(medicinesWithStatus);
      }
    } catch (error) {
      console.error("Error fetching medicines:", error);
      toast.error("Failed to load medicines");
    } finally {
      setLoading((prev) => ({ ...prev, medicines: false }));
    }
  }, [token, searchQuery, showLowStock]);

  // ✅ FIX 1: Wrap fetchDashboardStats in useCallback
  const fetchDashboardStats = useCallback(async () => {
    if (!token) return;
    setLoading((prev) => ({ ...prev, stats: true }));
    try {
      const response = await fetch(`${API_BASE}/api/pharmacist/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch dashboard stats");

      const result: ApiResponse<DashboardStats> = await response.json();

      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading((prev) => ({ ...prev, stats: false }));
    }
  }, [token]);

  // ✅ FIX 2: Separate effects — stats only on auth, medicines on filter change
  useEffect(() => {
    if (!authLoading && token) {
      fetchDashboardStats();
    }
  }, [authLoading, token, fetchDashboardStats]);

  useEffect(() => {
    if (!authLoading && token) {
      fetchMedicines();
    }
  }, [authLoading, token, fetchMedicines, searchQuery, showLowStock]);

  // ✅ FIX 3: Validate form before submitting
  const validateForm = (): boolean => {
    if (
      !formData.name.trim() ||
      !formData.manufacturer.trim() ||
      !formData.category.trim() ||
      !formData.unit_price ||
      !formData.stock_quantity ||
      !formData.reorder_level ||
      !formData.batch_number.trim() ||
      !formData.expiry_date
    ) {
      toast.error("Please fill in all required fields");
      return false;
    }
    if (
      isNaN(parseFloat(formData.unit_price)) ||
      parseFloat(formData.unit_price) < 0
    ) {
      toast.error("Please enter a valid unit price");
      return false;
    }
    if (
      isNaN(parseInt(formData.stock_quantity)) ||
      parseInt(formData.stock_quantity) < 0
    ) {
      toast.error("Please enter a valid stock quantity");
      return false;
    }
    if (
      isNaN(parseInt(formData.reorder_level)) ||
      parseInt(formData.reorder_level) < 0
    ) {
      toast.error("Please enter a valid reorder level");
      return false;
    }
    return true;
  };

  // Add medicine
  const handleAddMedicine = async () => {
    // ✅ FIX 3: Validate before sending
    if (!validateForm()) return;

    try {
      setLoading((prev) => ({ ...prev, action: true }));

      const medicineData = {
        name: formData.name,
        generic_name: formData.generic_name,
        manufacturer: formData.manufacturer,
        category: formData.category,
        unit_price: parseFloat(formData.unit_price),
        stock_quantity: parseInt(formData.stock_quantity),
        reorder_level: parseInt(formData.reorder_level),
        expiry_date: formData.expiry_date,
        batch_number: formData.batch_number,
      };

      const response = await fetch(`${API_BASE}/api/pharmacist/medicines`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(medicineData),
      });

      if (!response.ok) throw new Error("Failed to add medicine");

      const result: ApiResponse<Medicine> = await response.json();

      if (result.success) {
        toast.success("Medicine added successfully");
        setIsAddDialogOpen(false);
        resetForm();
        fetchMedicines();
        fetchDashboardStats();
      }
    } catch (error) {
      console.error("Error adding medicine:", error);
      toast.error("Failed to add medicine");
    } finally {
      setLoading((prev) => ({ ...prev, action: false }));
    }
  };

  // Update medicine
  const handleUpdateMedicine = async () => {
    if (!selectedMedicine) return;

    // ✅ FIX 3: Validate before sending
    if (!validateForm()) return;

    try {
      setLoading((prev) => ({ ...prev, action: true }));

      const medicineData = {
        name: formData.name,
        generic_name: formData.generic_name,
        manufacturer: formData.manufacturer,
        category: formData.category,
        unit_price: parseFloat(formData.unit_price),
        stock_quantity: parseInt(formData.stock_quantity),
        reorder_level: parseInt(formData.reorder_level),
        expiry_date: formData.expiry_date,
        batch_number: formData.batch_number,
      };

      const response = await fetch(
        `${API_BASE}/api/pharmacist/medicines/${selectedMedicine.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(medicineData),
        },
      );

      if (!response.ok) throw new Error("Failed to update medicine");

      const result: ApiResponse<Medicine> = await response.json();

      if (result.success) {
        toast.success("Medicine updated successfully");
        setIsEditDialogOpen(false);
        resetForm();
        fetchMedicines();
      }
    } catch (error) {
      console.error("Error updating medicine:", error);
      toast.error("Failed to update medicine");
    } finally {
      setLoading((prev) => ({ ...prev, action: false }));
    }
  };

  // Update stock
  const handleUpdateStock = async () => {
    if (!selectedMedicine) return;

    // ✅ FIX 4: Set loading false before early return so button doesn't get stuck
    if (!stockUpdate.quantity || isNaN(parseInt(stockUpdate.quantity))) {
      toast.error("Please enter a valid quantity");
      return;
    }

    const quantity = parseInt(stockUpdate.quantity);
    const newQuantity =
      stockUpdate.type === "add"
        ? selectedMedicine.stock_quantity + quantity
        : selectedMedicine.stock_quantity - quantity;

    if (newQuantity < 0) {
      toast.error("Insufficient stock");
      return; // safe to return here — loading.action hasn't been set yet
    }

    try {
      setLoading((prev) => ({ ...prev, action: true }));

      const response = await fetch(
        `${API_BASE}/api/pharmacist/medicines/${selectedMedicine.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ stock_quantity: newQuantity }),
        },
      );

      if (!response.ok) throw new Error("Failed to update stock");

      const result: ApiResponse<Medicine> = await response.json();

      if (result.success) {
        toast.success("Stock updated successfully");
        setIsStockDialogOpen(false);
        setStockUpdate({ quantity: "", type: "add" });
        fetchMedicines();
        fetchDashboardStats();
      }
    } catch (error) {
      console.error("Error updating stock:", error);
      toast.error("Failed to update stock");
    } finally {
      setLoading((prev) => ({ ...prev, action: false }));
    }
  };

  const resetForm = () => {
    setFormData(defaultFormData);
    setSelectedMedicine(null);
  };

  const handleEdit = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setFormData({
      name: medicine.name,
      generic_name: medicine.generic_name,
      manufacturer: medicine.manufacturer,
      category: medicine.category,
      unit_price: medicine.unit_price.toString(),
      stock_quantity: medicine.stock_quantity.toString(),
      reorder_level: medicine.reorder_level.toString(),
      expiry_date: medicine.expiry_date,
      batch_number: medicine.batch_number,
    });
    setIsEditDialogOpen(true);
  };

  const handleStockUpdate = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setStockUpdate({ quantity: "", type: "add" });
    setIsStockDialogOpen(true);
  };

  // Filter medicines client-side
  const categories = [...new Set(medicines.map((m) => m.category))];

  const filteredMedicines = medicines.filter((med) => {
    const matchesSearch =
      med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.generic_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || med.category === selectedCategory;
    const matchesStatus =
      selectedStatus === "all" || med.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalValue = medicines.reduce(
    (sum, m) => sum + Number(m.stock_quantity) * Number(m.unit_price),
    0,
  );

  const statusConfig = {
    "In Stock":
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    "Low Stock":
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    "Out of Stock":
      "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  };

  // Shared form fields renderer to avoid duplication
  const renderFormFields = () => (
    <div className="grid grid-cols-2 gap-4 py-4">
      <div className="space-y-2">
        <Label>Medicine Name *</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Paracetamol 500mg"
        />
      </div>
      <div className="space-y-2">
        <Label>Generic Name</Label>
        <Input
          value={formData.generic_name}
          onChange={(e) =>
            setFormData({ ...formData, generic_name: e.target.value })
          }
          placeholder="e.g., Paracetamol"
        />
      </div>
      <div className="space-y-2">
        <Label>Manufacturer *</Label>
        <Input
          value={formData.manufacturer}
          onChange={(e) =>
            setFormData({ ...formData, manufacturer: e.target.value })
          }
          placeholder="e.g., Sun Pharma"
        />
      </div>
      <div className="space-y-2">
        <Label>Category *</Label>
        <Input
          value={formData.category}
          onChange={(e) =>
            setFormData({ ...formData, category: e.target.value })
          }
          placeholder="e.g., Analgesic"
        />
      </div>
      <div className="space-y-2">
        <Label>Unit Price (₹) *</Label>
        <Input
          type="number"
          step="0.01"
          min="0"
          value={formData.unit_price}
          onChange={(e) =>
            setFormData({ ...formData, unit_price: e.target.value })
          }
          placeholder="0.00"
        />
      </div>
      <div className="space-y-2">
        <Label>Stock Quantity *</Label>
        <Input
          type="number"
          min="0"
          value={formData.stock_quantity}
          onChange={(e) =>
            setFormData({ ...formData, stock_quantity: e.target.value })
          }
          placeholder="0"
        />
      </div>
      <div className="space-y-2">
        <Label>Reorder Level *</Label>
        <Input
          type="number"
          min="0"
          value={formData.reorder_level}
          onChange={(e) =>
            setFormData({ ...formData, reorder_level: e.target.value })
          }
          placeholder="10"
        />
      </div>
      <div className="space-y-2">
        <Label>Batch Number *</Label>
        <Input
          value={formData.batch_number}
          onChange={(e) =>
            setFormData({ ...formData, batch_number: e.target.value })
          }
          placeholder="e.g., BTH001"
        />
      </div>
      <div className="space-y-2">
        <Label>Expiry Date *</Label>
        <Input
          type="date"
          value={formData.expiry_date}
          onChange={(e) =>
            setFormData({ ...formData, expiry_date: e.target.value })
          }
        />
      </div>
    </div>
  );

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
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
              <Pill className="w-6 h-6" />
              Medicine Inventory
            </h1>
            <p className="text-muted-foreground">
              Manage pharmacy medicines and stock
            </p>
          </div>
          <Button className="gap-2" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="w-4 h-4" />
            Add Medicine
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              {loading.stats ? (
                <div className="flex items-center justify-center h-16">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Pill className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {stats?.total_medicines || medicines.length}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Total Medicines
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              {loading.stats ? (
                <div className="flex items-center justify-center h-16">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Package className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {medicines.filter((m) => m.status === "In Stock").length}
                    </p>
                    <p className="text-xs text-muted-foreground">In Stock</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              {loading.stats ? (
                <div className="flex items-center justify-center h-16">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {stats?.low_stock_count ||
                        medicines.filter((m) => m.status === "Low Stock")
                          .length}
                    </p>
                    <p className="text-xs text-muted-foreground">Low Stock</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              {loading.stats ? (
                <div className="flex items-center justify-center h-16">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      ₹{(totalValue || 0).toFixed(0)}
                    </p>
                    <p className="text-xs text-muted-foreground">Stock Value</p>
                  </div>
                </div>
              )}
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
                  placeholder="Search medicines..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="In Stock">In Stock</SelectItem>
                  <SelectItem value="Low Stock">Low Stock</SelectItem>
                  <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant={showLowStock ? "default" : "outline"}
                className="gap-2"
                onClick={() => setShowLowStock(!showLowStock)}
              >
                <AlertTriangle className="w-4 h-4" />
                Low Stock
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Medicines Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Pill className="w-5 h-5" />
              All Medicines ({filteredMedicines.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading.medicines ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Medicine</TableHead>
                        <TableHead className="hidden md:table-cell">
                          Category
                        </TableHead>
                        <TableHead className="hidden lg:table-cell">
                          Stock
                        </TableHead>
                        <TableHead className="hidden lg:table-cell">
                          Price
                        </TableHead>
                        <TableHead className="hidden xl:table-cell">
                          Expiry
                        </TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMedicines.map((med) => (
                        <TableRow key={med.id} className="hover:bg-muted/50">
                          <TableCell>
                            <div>
                              <p className="font-medium text-foreground">
                                {med.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {med.manufacturer}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Badge variant="outline">{med.category}</Badge>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <div className="flex items-center gap-1">
                              <Package className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">
                                {med.stock_quantity}
                              </span>
                              {med.stock_quantity <= med.reorder_level && (
                                <AlertTriangle className="w-3 h-3 text-amber-500 ml-1" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <span className="font-medium">
                              ₹{Number(med.unit_price).toFixed(2)}
                            </span>
                          </TableCell>
                          <TableCell className="hidden xl:table-cell">
                            {/* ✅ FIX 6: Guard against invalid expiry_date */}
                            <div className="flex items-center gap-1 text-sm">
                              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                              {med.expiry_date
                                ? (() => {
                                    const d = new Date(med.expiry_date);
                                    return isNaN(d.getTime())
                                      ? "Invalid date"
                                      : format(d, "dd MMM yyyy");
                                  })()
                                : "—"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={cn(statusConfig[med.status])}>
                              {med.status}
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
                                <DropdownMenuItem
                                  className="gap-2"
                                  onClick={() => handleEdit(med)}
                                >
                                  <Edit className="w-4 h-4" />
                                  Edit Medicine
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="gap-2"
                                  onClick={() => handleStockUpdate(med)}
                                >
                                  <Package className="w-4 h-4" />
                                  Update Stock
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="gap-2 text-destructive">
                                  <Trash2 className="w-4 h-4" />
                                  Delete Medicine
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {filteredMedicines.length === 0 && (
                  <div className="text-center py-12">
                    <Pill className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">No medicines found</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Medicine Dialog */}
      <Dialog
        open={isAddDialogOpen}
        onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Medicine</DialogTitle>
            <DialogDescription>
              Enter the details of the new medicine
            </DialogDescription>
          </DialogHeader>
          {renderFormFields()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMedicine} disabled={loading.action}>
              {loading.action ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Medicine"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Medicine Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Medicine</DialogTitle>
            <DialogDescription>Update the medicine details</DialogDescription>
          </DialogHeader>
          {renderFormFields()}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateMedicine} disabled={loading.action}>
              {loading.action ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Medicine"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Stock Dialog */}
      <Dialog
        open={isStockDialogOpen}
        onOpenChange={(open) => {
          setIsStockDialogOpen(open);
          if (!open) setStockUpdate({ quantity: "", type: "add" });
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Stock</DialogTitle>
            <DialogDescription>
              Current stock: {selectedMedicine?.stock_quantity} units
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex gap-4">
              <Button
                variant={stockUpdate.type === "add" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setStockUpdate({ ...stockUpdate, type: "add" })}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Stock
              </Button>
              <Button
                variant={stockUpdate.type === "remove" ? "default" : "outline"}
                className="flex-1"
                onClick={() =>
                  setStockUpdate({ ...stockUpdate, type: "remove" })
                }
              >
                <Package className="w-4 h-4 mr-2" />
                Remove Stock
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input
                type="number"
                min="1"
                value={stockUpdate.quantity}
                onChange={(e) =>
                  setStockUpdate({ ...stockUpdate, quantity: e.target.value })
                }
                placeholder="Enter quantity"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsStockDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateStock} disabled={loading.action}>
              {loading.action ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Stock"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
