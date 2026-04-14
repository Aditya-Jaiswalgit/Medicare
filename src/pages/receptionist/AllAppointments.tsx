import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from "@/contexts/AuthContext";
import {
  Calendar as CalendarIcon,
  Search,
  MoreVertical,
  Clock,
  Trash2,
  User,
  Stethoscope,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  RefreshCw,
  Download,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  format,
  parse,
  isValid,
  isToday,
  isFuture,
  isPast,
  startOfDay,
  endOfDay,
  isWithinInterval,
} from "date-fns";
import { toast } from "@/hooks/use-toast";

// Types
interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  appointment_time: string;
  duration_minutes: number;
  reason: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  patient_name: string;
  patient_phone: string;
  doctor_name: string;
  specialization: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface AppointmentStats {
  total: number;
  pending: number;
  approved: number;
  completed: number;
  cancelled: number;
  noShow: number;
}

const statusConfig: Record<
  string,
  { icon: React.ElementType; color: string; bgColor: string; label: string }
> = {
  pending: {
    icon: Clock,
    color: "text-blue-700 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    label: "Pending",
  },
  approved: {
    icon: CheckCircle,
    color: "text-green-700 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    label: "Approved",
  },
  completed: {
    icon: CheckCircle,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    label: "Completed",
  },
  cancelled: {
    icon: XCircle,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-900/30",
    label: "Cancelled",
  },
  no_show: {
    icon: AlertCircle,
    color: "text-gray-600 dark:text-gray-400",
    bgColor: "bg-gray-100 dark:bg-gray-900/30",
    label: "No Show",
  },
  rejected: {
    icon: XCircle,
    color: "text-red-700 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-900/30",
    label: "Rejected",
  },
};

export default function AllAppointments() {
  const { user, token, isLoading: authLoading } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const role = localStorage.getItem("role");
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedDoctor, setSelectedDoctor] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [fromDateInput, setFromDateInput] = useState("");
  const [toDateInput, setToDateInput] = useState("");

  // Dialogs
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  // Reschedule / Cancel form
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Stats
  const [stats, setStats] = useState<AppointmentStats>({
    total: 0,
    pending: 0,
    approved: 0,
    completed: 0,
    cancelled: 0,
    noShow: 0,
  });

  // Wait for auth before fetching
  useEffect(() => {
    if (!authLoading && token) {
      fetchAppointments();
    }
  }, [authLoading, token]);

  // Recalculate stats whenever appointments change
  useEffect(() => {
    setStats({
      total: appointments.length,
      pending: appointments.filter((a) => a.status === "pending").length,
      approved: appointments.filter((a) => a.status === "approved").length,
      completed: appointments.filter((a) => a.status === "completed").length,
      cancelled: appointments.filter((a) => a.status === "cancelled").length,
      noShow: appointments.filter((a) => a.status === "no_show").length,
    });
  }, [appointments]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/${role}/appointments`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) throw new Error("Failed to fetch appointments");

      const result: ApiResponse<Appointment[]> = await response.json();

      if (result.success) {
        setAppointments(Array.isArray(result.data) ? result.data : []);
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to load appointments",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast({
        title: "Error",
        description: "Failed to load appointments. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (
    appointmentId: string,
    status: string,
  ) => {
    try {
      setActionLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/${role}/appointments/${appointmentId}/status`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        },
      );

      if (!response.ok) throw new Error("Failed to update appointment status");

      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === appointmentId ? { ...apt, status } : apt,
        ),
      );

      toast({
        title: "Success",
        description: `Appointment marked as ${status}`,
      });
    } catch (error) {
      console.error("Error updating appointment status:", error);
      toast({
        title: "Error",
        description: "Failed to update appointment status",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const rescheduleAppointment = async () => {
    if (!selectedAppointment || !newDate || !newTime) {
      toast({
        title: "Error",
        description: "Please select date and time",
        variant: "destructive",
      });
      return;
    }

    try {
      setActionLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/${role}/appointments/${selectedAppointment.id}/reschedule`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            appointment_date: newDate,
            appointment_time: newTime,
          }),
        },
      );

      if (!response.ok) throw new Error("Failed to reschedule appointment");

      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === selectedAppointment.id
            ? { ...apt, appointment_date: newDate, appointment_time: newTime }
            : apt,
        ),
      );

      toast({
        title: "Success",
        description: "Appointment rescheduled successfully",
      });
      setRescheduleDialogOpen(false);
      setSelectedAppointment(null);
    } catch (error) {
      console.error("Error rescheduling appointment:", error);
      toast({
        title: "Error",
        description: "Failed to reschedule appointment",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const cancelAppointment = async () => {
    if (!selectedAppointment) return;

    try {
      setActionLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/${role}/appointments/${selectedAppointment.id}/cancel`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason: cancelReason }),
        },
      );

      if (!response.ok) throw new Error("Failed to cancel appointment");

      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === selectedAppointment.id
            ? { ...apt, status: "cancelled" }
            : apt,
        ),
      );

      toast({
        title: "Success",
        description: "Appointment cancelled successfully",
      });
      setCancelDialogOpen(false);
      setSelectedAppointment(null);
      setCancelReason("");
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast({
        title: "Error",
        description: "Failed to cancel appointment",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const deleteAppointment = async (appointmentId: string) => {
    try {
      setActionLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/${role}/appointments/${appointmentId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const result = await response.json();

      if (!response.ok) {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
        return;
      }

      // Remove from local state immediately
      setAppointments((prev) => prev.filter((apt) => apt.id !== appointmentId));
      toast({ title: "Success", description: "Appointment deleted" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete appointment",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleFromDateChange = (value: string) => {
    setFromDateInput(value);
    const parsed = parse(value, "dd/MM/yyyy", new Date());
    if (isValid(parsed)) setFromDate(parsed);
  };

  const handleToDateChange = (value: string) => {
    setToDateInput(value);
    const parsed = parse(value, "dd/MM/yyyy", new Date());
    if (isValid(parsed)) setToDate(parsed);
  };

  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch =
      apt.patient_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.doctor_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.patient_phone?.includes(searchQuery) ||
      apt.reason?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      selectedStatus === "all" || apt.status === selectedStatus;

    const matchesDoctor =
      selectedDoctor === "all" || apt.doctor_name === selectedDoctor;

    const aptDate = new Date(apt.appointment_date);
    let matchesDate = true;
    if (dateFilter === "today") {
      matchesDate = isToday(aptDate);
    } else if (dateFilter === "upcoming") {
      matchesDate = isFuture(aptDate) || isToday(aptDate);
    } else if (dateFilter === "past") {
      matchesDate = isPast(aptDate) && !isToday(aptDate);
    } else if (dateFilter === "custom" && fromDate && toDate) {
      matchesDate = isWithinInterval(aptDate, {
        start: startOfDay(fromDate),
        end: endOfDay(toDate),
      });
    }

    return matchesSearch && matchesStatus && matchesDoctor && matchesDate;
  });

  const doctorNames = [...new Set(appointments.map((a) => a.doctor_name))];

  const handleView = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setViewDialogOpen(true);
  };

  const handleReschedule = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setNewDate(format(new Date(appointment.appointment_date), "yyyy-MM-dd"));
    setNewTime(appointment.appointment_time);
    setRescheduleDialogOpen(true);
  };

  const handleCancelClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setCancelReason("");
    setCancelDialogOpen(true);
  };

  const handleExport = () => {
    if (filteredAppointments.length === 0) return;

    const exportData = filteredAppointments.map((apt) => ({
      "Patient Name": apt.patient_name,
      Phone: apt.patient_phone,
      Doctor: apt.doctor_name,
      Specialization: apt.specialization,
      Date: format(new Date(apt.appointment_date), "dd MMM yyyy"),
      Time: apt.appointment_time,
      Duration: `${apt.duration_minutes} min`,
      Reason: apt.reason,
      Status: apt.status,
      Notes: apt.notes || "",
    }));

    const headers = Object.keys(exportData[0]).join(",");
    const rows = exportData
      .map((row) =>
        Object.values(row)
          .map((v) => `"${v}"`)
          .join(","),
      )
      .join("\n");
    const csv = `${headers}\n${rows}`;

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `appointments_${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusConfig = (status: string) =>
    statusConfig[status] ?? {
      icon: Clock,
      color: "text-gray-600",
      bgColor: "bg-gray-100",
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
              <CalendarIcon className="w-6 h-6" />
              All Appointments
            </h1>
            <p className="text-muted-foreground">
              View and manage all appointments
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={fetchAppointments}
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleExport}
              disabled={filteredAppointments.length === 0}
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {[
            { label: "Total", value: stats.total, color: "text-foreground" },
            { label: "Pending", value: stats.pending, color: "text-blue-600" },
            {
              label: "Approved",
              value: stats.approved,
              color: "text-green-600",
            },
            {
              label: "Completed",
              value: stats.completed,
              color: "text-purple-600",
            },
            {
              label: "Cancelled",
              value: stats.cancelled,
              color: "text-red-600",
            },
            { label: "No Show", value: stats.noShow, color: "text-gray-600" },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className={`text-2xl font-bold ${stat.color}`}>
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by patient name, phone, doctor, or reason..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select
                  value={selectedDoctor}
                  onValueChange={setSelectedDoctor}
                >
                  <SelectTrigger className="w-full sm:w-52">
                    <SelectValue placeholder="All Doctors" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Doctors</SelectItem>
                    {doctorNames.map((doc) => (
                      <SelectItem key={doc} value={doc}>
                        {doc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="no_show">No Show</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1">
                  <Label className="text-sm text-muted-foreground mb-2 block">
                    Date Filter
                  </Label>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select date range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Dates</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="past">Past</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {dateFilter === "custom" && (
                  <>
                    <div className="flex-1">
                      <Label className="text-sm text-muted-foreground mb-2 block">
                        From Date
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <div className="relative">
                            <Input
                              placeholder="DD/MM/YYYY"
                              value={fromDateInput}
                              onChange={(e) =>
                                handleFromDateChange(e.target.value)
                              }
                              className="pr-10"
                            />
                            <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={fromDate}
                            onSelect={(date) => {
                              setFromDate(date);
                              if (date)
                                setFromDateInput(format(date, "dd/MM/yyyy"));
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="flex-1">
                      <Label className="text-sm text-muted-foreground mb-2 block">
                        To Date
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <div className="relative">
                            <Input
                              placeholder="DD/MM/YYYY"
                              value={toDateInput}
                              onChange={(e) =>
                                handleToDateChange(e.target.value)
                              }
                              className="pr-10"
                            />
                            <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={toDate}
                            onSelect={(date) => {
                              setToDate(date);
                              if (date)
                                setToDateInput(format(date, "dd/MM/yyyy"));
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appointments Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              Appointments ({filteredAppointments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Doctor
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Reason
                    </TableHead>
                    <TableHead className="hidden xl:table-cell">
                      Duration
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments.map((apt) => {
                    const config = getStatusConfig(apt.status);
                    const StatusIcon = config.icon;
                    return (
                      <TableRow key={apt.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">
                              {format(
                                new Date(apt.appointment_date),
                                "dd MMM yyyy",
                              )}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span>{apt.appointment_time}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">
                                {apt.patient_name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {apt.patient_phone}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-2">
                            <Stethoscope className="w-4 h-4 text-emerald-600" />
                            <div>
                              <p className="text-sm font-medium">
                                {apt.doctor_name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {apt.specialization}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <span className="text-sm text-muted-foreground">
                            {apt.reason || "-"}
                          </span>
                        </TableCell>
                        <TableCell className="hidden xl:table-cell">
                          <Badge variant="outline">
                            {apt.duration_minutes} min
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={cn(
                              "gap-1 border-0",
                              config.bgColor,
                              config.color,
                            )}
                          >
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
                              <DropdownMenuItem
                                className="gap-2"
                                onClick={() => handleView(apt)}
                              >
                                <Eye className="w-4 h-4" />
                                View Details
                              </DropdownMenuItem>

                              {/* ── Accept / Reject — doctor only, pending only ── */}
                              {role === "doctor" &&
                                apt.status === "pending" && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="gap-2 text-green-600 focus:text-green-600 focus:bg-green-50"
                                      onClick={() =>
                                        updateAppointmentStatus(
                                          apt.id,
                                          "approved",
                                        )
                                      }
                                      disabled={actionLoading}
                                    >
                                      <CheckCircle className="w-4 h-4" />
                                      Accept Appointment
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="gap-2 text-red-600 focus:text-red-600 focus:bg-red-50"
                                      onClick={() =>
                                        updateAppointmentStatus(
                                          apt.id,
                                          "rejected",
                                        )
                                      }
                                      disabled={actionLoading}
                                    >
                                      <XCircle className="w-4 h-4" />
                                      Reject Appointment
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                  </>
                                )}

                              {(apt.status === "pending" ||
                                apt.status === "approved") && (
                                <>
                                  <DropdownMenuItem
                                    className="gap-2"
                                    onClick={() => handleReschedule(apt)}
                                  >
                                    <RefreshCw className="w-4 h-4" />
                                    Reschedule
                                  </DropdownMenuItem>

                                  {role === "doctor" &&
                                    apt.status === "approved" && (
                                      <DropdownMenuItem
                                        className="gap-2 text-green-600 focus:text-green-600"
                                        onClick={() =>
                                          updateAppointmentStatus(
                                            apt.id,
                                            "completed",
                                          )
                                        }
                                        disabled={actionLoading}
                                      >
                                        <CheckCircle className="w-4 h-4" />
                                        Mark Completed
                                      </DropdownMenuItem>
                                    )}

                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="gap-2 text-destructive"
                                    onClick={() => handleCancelClick(apt)}
                                  >
                                    <XCircle className="w-4 h-4" />
                                    Cancel
                                  </DropdownMenuItem>
                                </>
                              )}

                              {(apt.status === "cancelled" ||
                                apt.status === "completed" ||
                                apt.status === "rejected" ||
                                apt.status === "no_show") && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="gap-2 text-destructive"
                                    onClick={() => deleteAppointment(apt.id)}
                                    disabled={actionLoading}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Delete Permanently
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

            {filteredAppointments.length === 0 && (
              <div className="text-center py-12">
                <CalendarIcon className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">No appointments found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                {[
                  { label: "Patient", value: selectedAppointment.patient_name },
                  { label: "Phone", value: selectedAppointment.patient_phone },
                  { label: "Doctor", value: selectedAppointment.doctor_name },
                  {
                    label: "Specialization",
                    value: selectedAppointment.specialization,
                  },
                  {
                    label: "Date",
                    value: format(
                      new Date(selectedAppointment.appointment_date),
                      "dd MMM yyyy",
                    ),
                  },
                  {
                    label: "Time",
                    value: selectedAppointment.appointment_time,
                  },
                  {
                    label: "Duration",
                    value: `${selectedAppointment.duration_minutes} minutes`,
                  },
                  { label: "Reason", value: selectedAppointment.reason || "-" },
                  { label: "Notes", value: selectedAppointment.notes || "-" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium text-right max-w-[60%]">
                      {value}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge
                    className={cn(
                      "gap-1 border-0",
                      getStatusConfig(selectedAppointment.status).bgColor,
                      getStatusConfig(selectedAppointment.status).color,
                    )}
                  >
                    {getStatusConfig(selectedAppointment.status).label}
                  </Badge>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog
        open={rescheduleDialogOpen}
        onOpenChange={setRescheduleDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
            <DialogDescription>
              Change the date and time for this appointment.
            </DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4 py-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="font-medium">
                  {selectedAppointment.patient_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  Current:{" "}
                  {format(
                    new Date(selectedAppointment.appointment_date),
                    "dd MMM yyyy",
                  )}{" "}
                  at {selectedAppointment.appointment_time}
                </p>
              </div>
              <div className="space-y-2">
                <Label>New Date</Label>
                <Input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  min={format(new Date(), "yyyy-MM-dd")}
                />
              </div>
              <div className="space-y-2">
                <Label>New Time</Label>
                <Input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRescheduleDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={rescheduleAppointment} disabled={actionLoading}>
              {actionLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Rescheduling...
                </>
              ) : (
                "Confirm Reschedule"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this appointment?
            </DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4 py-4">
              <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                <p className="font-medium">
                  {selectedAppointment.patient_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {format(
                    new Date(selectedAppointment.appointment_date),
                    "dd MMM yyyy",
                  )}{" "}
                  at {selectedAppointment.appointment_time}
                </p>
              </div>
              <div className="space-y-2">
                <Label>Reason for Cancellation</Label>
                <Textarea
                  placeholder="Enter reason..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
            >
              Keep Appointment
            </Button>
            <Button
              variant="destructive"
              onClick={cancelAppointment}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Cancel Appointment"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
