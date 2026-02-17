import { useState, useEffect } from "react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Building2,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users,
  Plus,
  Eye,
  UserCog,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface Clinic {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  admin_count: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface ApiResponse {
  success: boolean;
  data: Clinic[];
  pagination: Pagination;
}

// Form schema for clinic admin
const clinicAdminFormSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: "Please enter a valid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/[A-Z]/, {
      message: "Password must contain at least one uppercase letter",
    })
    .regex(/[a-z]/, {
      message: "Password must contain at least one lowercase letter",
    })
    .regex(/[0-9]/, { message: "Password must contain at least one number" })
    .regex(/[!@#$%^&*(),.?":{}|<>]/, {
      message: "Password must contain at least one special character",
    }),
  full_name: z
    .string()
    .trim()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(100, { message: "Name must be less than 100 characters" }),
  phone: z
    .string()
    .trim()
    .min(10, { message: "Phone number must be at least 10 digits" })
    .max(20, { message: "Phone number must be less than 20 characters" })
    .regex(/^[+]?[\d\s-]+$/, { message: "Please enter a valid phone number" }),
  address: z
    .string()
    .trim()
    .min(5, { message: "Address must be at least 5 characters" })
    .max(500, { message: "Address must be less than 500 characters" }),
});

type ClinicAdminFormValues = z.infer<typeof clinicAdminFormSchema>;

export default function Clinics() {
  const navigate = useNavigate();
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [filteredClinics, setFilteredClinics] = useState<Clinic[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isAddClinicAdminOpen, setIsAddClinicAdminOpen] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 1,
  });

  const form = useForm<ClinicAdminFormValues>({
    resolver: zodResolver(clinicAdminFormSchema),
    defaultValues: {
      email: "",
      password: "",
      full_name: "",
      phone: "",
      address: "",
    },
  });

  // Fetch clinics on component mount
  useEffect(() => {
    fetchClinics();
  }, []);

  // Filter clinics when search or filter changes
  useEffect(() => {
    filterClinics();
  }, [clinics, searchQuery, statusFilter]);

  const fetchClinics = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:5000/api/super-admin/clinics",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result: ApiResponse = await response.json();

      if (result.success) {
        setClinics(result.data);
        setPagination(result.pagination);
      } else {
        throw new Error("Failed to fetch clinics");
      }
    } catch (error) {
      console.error("Error fetching clinics:", error);
      toast({
        title: "Error",
        description: "Failed to load clinics",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterClinics = () => {
    let filtered = [...clinics];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (clinic) =>
          clinic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          clinic.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          clinic.phone.includes(searchQuery) ||
          clinic.address.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (clinic) => clinic.is_active === (statusFilter === "active"),
      );
    }

    setFilteredClinics(filtered);
  };

  const handleDelete = async (clinic: Clinic) => {
    if (confirm(`Are you sure you want to delete ${clinic.name}?`)) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `http://localhost:5000/api/super-admin/clinics/${clinic.id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const result = await response.json();

        if (result.success) {
          toast({
            title: "Success",
            description: "Clinic deleted successfully",
          });
          fetchClinics(); // Refresh the list
        } else {
          throw new Error(result.message || "Failed to delete clinic");
        }
      } catch (error) {
        console.error("Error deleting clinic:", error);
        toast({
          title: "Error",
          description:
            error instanceof Error ? error.message : "Failed to delete clinic",
          variant: "destructive",
        });
      }
    }
  };

  const handleAddClinicAdmin = (clinic: Clinic) => {
    setSelectedClinic(clinic);
    setIsAddClinicAdminOpen(true);
    form.reset();
  };

  const handleSubmitClinicAdmin = async (data: ClinicAdminFormValues) => {
    if (!selectedClinic) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:5000/api/super-admin/clinic-admins",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...data,
            clinic_id: selectedClinic.id,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to create clinic admin");
      }

      toast({
        title: "Success!",
        description: `Clinic admin "${data.full_name}" created successfully for ${selectedClinic.name}`,
      });

      setIsAddClinicAdminOpen(false);
      setSelectedClinic(null);
      form.reset();
      fetchClinics(); // Refresh to update admin count
    } catch (error) {
      console.error("Error creating clinic admin:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create clinic admin",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading clinics...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Building2 className="w-6 h-6" />
              Clinic Management
            </h1>
            <p className="text-muted-foreground">
              Manage all clinics and their administrators
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pagination.total}</p>
                  <p className="text-sm text-muted-foreground">Total Clinics</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/10">
                  <Building2 className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {clinics.filter((c) => c.is_active).length}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Active Clinics
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-warning/10">
                  <Users className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {clinics.reduce(
                      (sum, clinic) =>
                        sum + parseInt(clinic.admin_count || "0"),
                      0,
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Admins</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-destructive/10">
                  <Building2 className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {clinics.filter((c) => !c.is_active).length}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Inactive Clinics
                  </p>
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
                  placeholder="Search clinics by name, email, phone or address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Clinics Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              All Clinics ({filteredClinics.length} of {pagination.total})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Clinic Name</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Address
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Contact
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Created
                    </TableHead>
                    <TableHead>Admins</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClinics.map((clinic) => (
                    <TableRow key={clinic.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {clinic.name}
                            </p>
                            <p className="text-sm text-muted-foreground md:hidden">
                              {clinic.address}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate max-w-48">
                            {clinic.address}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Mail className="w-3.5 h-3.5" />
                            <span className="truncate max-w-32">
                              {clinic.email}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Phone className="w-3.5 h-3.5" />
                            {clinic.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(clinic.created_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="gap-1">
                          <Users className="w-3 h-3" />
                          {clinic.admin_count || "0"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={clinic.is_active ? "default" : "secondary"}
                          className={cn(
                            clinic.is_active
                              ? "bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400",
                          )}
                        >
                          {clinic.is_active ? "Active" : "Inactive"}
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
                              onClick={() => navigate(`/clinics/${clinic.id}`)}
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="gap-2"
                              onClick={() =>
                                navigate(`/clinics/edit/${clinic.id}`)
                              }
                            >
                              <Edit className="w-4 h-4" />
                              Edit Clinic
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="gap-2"
                              onClick={() => handleAddClinicAdmin(clinic)}
                            >
                              <UserCog className="w-4 h-4" />
                              Add Clinic Admin
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="gap-2 text-destructive"
                              onClick={() => handleDelete(clinic)}
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete Clinic
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredClinics.length === 0 && (
              <div className="text-center py-12">
                <Building2 className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No clinics found matching your criteria
                </p>
                {searchQuery && (
                  <Button
                    variant="link"
                    onClick={() => {
                      setSearchQuery("");
                      setStatusFilter("all");
                    }}
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Clinic Admin Dialog */}
      <Dialog
        open={isAddClinicAdminOpen}
        onOpenChange={setIsAddClinicAdminOpen}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <UserCog className="w-5 h-5" />
              Add Clinic Admin for {selectedClinic?.name}
            </DialogTitle>
            <DialogDescription>
              Create a new clinic administrator account. They will have full
              access to manage this clinic.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmitClinicAdmin)}
              className="space-y-6"
            >
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">
                  Admin Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="admin@clinic.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="9876543210"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password *</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter secure password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Password requirements */}
                <div className="bg-muted/50 p-3 rounded-lg text-sm space-y-1">
                  <p className="font-medium text-foreground">
                    Password must contain:
                  </p>
                  <ul className="text-muted-foreground list-disc list-inside space-y-0.5">
                    <li>At least 8 characters</li>
                    <li>At least one uppercase letter</li>
                    <li>At least one lowercase letter</li>
                    <li>At least one number</li>
                    <li>At least one special character</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">
                  Address Information
                </h3>
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter clinic admin's address"
                          className="resize-none"
                          rows={2}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Clinic Info (Read-only) */}
              <div className="bg-primary/5 p-4 rounded-lg space-y-2">
                <p className="text-sm font-medium text-foreground">
                  Assigned Clinic
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="w-4 h-4 text-primary" />
                  <span className="font-medium">{selectedClinic?.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{selectedClinic?.address}</span>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddClinicAdminOpen(false);
                    setSelectedClinic(null);
                    form.reset();
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <UserCog className="w-4 h-4 mr-2" />
                      Create Clinic Admin
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
