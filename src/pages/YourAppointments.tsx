import React, { useState, useEffect } from "react";
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
  Calendar,
  Clock,
  Search,
  Stethoscope,
  Building2,
  MapPin,
  Phone,
  FileText,
  CheckCircle2,
  XCircle,
  Clock3,
  Loader2,
  CalendarDays,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";

interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  receptionist_id: string | null;
  clinic_id: string;
  appointment_date: string;
  appointment_time: string;
  duration_minutes: number;
  reason: string;
  status: "pending" | "approved" | "cancelled" | "completed";
  notes: string | null;
  created_at: string;
  updated_at: string;
  doctor_name: string;
  specialization: string;
  doctor_phone: string;
  clinic_name: string;
  clinic_address: string;
}

interface ApiResponse {
  success: boolean;
  data: Appointment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

const statusConfig = {
  pending: {
    label: "Pending",
    icon: Clock3,
    color:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  approved: {
    label: "Approved",
    icon: CheckCircle2,
    color:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
};

const YourAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<
    Appointment[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch appointments on component mount
  useEffect(() => {
    fetchAppointments();
  }, []);

  // Filter appointments when search or filter changes
  useEffect(() => {
    filterAppointments();
  }, [appointments, searchQuery, statusFilter]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/patient/appointments?page=${currentPage}&limit=${pagination.limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch appointments");
      }

      const result: ApiResponse = await response.json();

      if (result.success) {
        setAppointments(result.data);
        setPagination(result.pagination);
      } else {
        throw new Error("Failed to load appointments");
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Failed to load your appointments");
    } finally {
      setLoading(false);
    }
  };

  const filterAppointments = () => {
    let filtered = [...appointments];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (apt) =>
          apt.doctor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          apt.clinic_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          apt.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
          apt.specialization.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((apt) => apt.status === statusFilter);
    }

    setFilteredAppointments(filtered);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy");
  };

  const formatTime = (timeString: string) => {
    // Convert 24h format to 12h format
    const [hours, minutes] = timeString.split(":");
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return format(date, "hh:mm a");
  };

  const getStatusBadge = (status: Appointment["status"]) => {
    const config = statusConfig[status];
    const Icon = config.icon;
    return (
      <Badge className={cn("gap-1.5 font-medium", config.color)}>
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </Badge>
    );
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchAppointments();
  };

  if (loading && appointments.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">
              Loading your appointments...
            </p>
          </div>
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
              <CalendarDays className="w-6 h-6" />
              My Appointments
            </h1>
            <p className="text-muted-foreground">
              View and manage your appointments
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pagination.total}</p>
                  <p className="text-sm text-muted-foreground">
                    Total Appointments
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-100">
                  <Clock3 className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {appointments.filter((a) => a.status === "pending").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {appointments.filter((a) => a.status === "approved").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Approved</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <CheckCircle2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {
                      appointments.filter((a) => a.status === "completed")
                        .length
                    }
                  </p>
                  <p className="text-sm text-muted-foreground">Completed</p>
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
                  placeholder="Search by doctor, clinic, or reason..."
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Appointments List */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Your Appointments ({filteredAppointments.length} of{" "}
              {pagination.total})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">
                  No appointments found
                </p>
                {searchQuery || statusFilter !== "all" ? (
                  <Button
                    variant="link"
                    onClick={() => {
                      setSearchQuery("");
                      setStatusFilter("all");
                    }}
                  >
                    Clear filters
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => (window.location.href = "/book-appointment")}
                  >
                    Book Your First Appointment
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAppointments.map((appointment) => (
                  <Card key={appointment.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex flex-col lg:flex-row">
                        {/* Date & Time Section */}
                        <div className="lg:w-48 bg-muted/30 p-4 flex flex-row lg:flex-col items-center lg:items-start gap-4 lg:gap-2 border-b lg:border-b-0 lg:border-r">
                          <div className="text-center lg:text-left">
                            <p className="text-sm text-muted-foreground">
                              Date
                            </p>
                            <p className="text-lg font-semibold text-foreground">
                              {formatDate(appointment.appointment_date)}
                            </p>
                          </div>
                          <div className="text-center lg:text-left">
                            <p className="text-sm text-muted-foreground">
                              Time
                            </p>
                            <p className="text-lg font-semibold text-foreground flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {formatTime(appointment.appointment_time)}
                            </p>
                          </div>
                          <div className="text-center lg:text-left lg:mt-auto">
                            <p className="text-xs text-muted-foreground">
                              Duration
                            </p>
                            <p className="text-sm font-medium">
                              {appointment.duration_minutes} mins
                            </p>
                          </div>
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 p-4">
                          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                            {/* Doctor & Clinic Info */}
                            <div className="space-y-3">
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                  <Stethoscope className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-foreground">
                                    {appointment.doctor_name}
                                  </h3>
                                  <p className="text-sm text-muted-foreground">
                                    {appointment.specialization}
                                  </p>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                  <Building2 className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-foreground">
                                    {appointment.clinic_name}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <MapPin className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-muted-foreground">
                                    {appointment.clinic_address}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <Phone className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-muted-foreground">
                                    {appointment.doctor_phone}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Status & Reason */}
                            <div className="space-y-3">
                              {getStatusBadge(appointment.status)}

                              <div className="bg-muted/30 rounded-lg p-3 max-w-xs">
                                <p className="text-xs text-muted-foreground mb-1">
                                  Reason for visit
                                </p>
                                <p className="text-sm text-foreground">
                                  {appointment.reason}
                                </p>
                              </div>

                              {appointment.notes && (
                                <div className="flex items-start gap-2 text-sm">
                                  <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                                  <span className="text-muted-foreground">
                                    {appointment.notes}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2 mt-4 pt-3 border-t">
                            {appointment.status === "pending" && (
                              <>
                                <Button variant="outline" size="sm">
                                  Reschedule
                                </Button>
                                <Button variant="destructive" size="sm">
                                  Cancel
                                </Button>
                              </>
                            )}
                            {appointment.status === "approved" && (
                              <Button variant="outline" size="sm">
                                <AlertCircle className="w-4 h-4 mr-2" />
                                Preparation Instructions
                              </Button>
                            )}
                            {appointment.status === "completed" && (
                              <Button variant="outline" size="sm">
                                View Summary
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex items-center justify-between pt-4">
                    <p className="text-sm text-muted-foreground">
                      Showing page {pagination.page} of {pagination.pages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.pages}
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default YourAppointments;
