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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Stethoscope,
  UserPlus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EditUserDialog, UserData } from "@/components/users/EditUserDialog";
import { DeleteUserDialog } from "@/components/users/DeleteUserDialog";
import { AddUserDialog } from "@/components/users/AddUserDialog";
import { toast } from "sonner";

interface ApiDoctor {
  id: string;
  email: string;
  role: string;
  full_name: string;
  phone: string;
  address: string | null;
  department: string | null;
  specialization: string;
  is_active: boolean;
  created_at: string;
}

interface Doctor {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  specialization: string;
  qualification: string;
  consultation_fee: number;
  availability_status: "Available" | "Unavailable";
  patients_today: number;
  total_patients: number;
  experience_years: number;
  created_at: string;
}

interface ApiResponse {
  success: boolean;
  data: ApiDoctor[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

const specializations = [
  "All Specializations",
  "Cardiology",
  "Dermatology",
  "Orthopedics",
  "Pediatrics",
  "Neurology",
  "Gynecology",
  "General Medicine",
  "Psychiatry",
];

// Transform API doctor to match the expected format
const transformApiDoctor = (apiDoctor: ApiDoctor): Doctor => {
  // Generate random data for fields not provided by API
  const consultationFee = Math.floor(Math.random() * 500) + 300; // Random between 300-800
  const patientsToday = Math.floor(Math.random() * 20) + 1; // Random between 1-20
  const totalPatients = Math.floor(Math.random() * 3000) + 500; // Random between 500-3500
  const experienceYears = Math.floor(Math.random() * 20) + 3; // Random between 3-23

  return {
    id: apiDoctor.id,
    full_name: apiDoctor.full_name,
    email: apiDoctor.email,
    phone: apiDoctor.phone,
    specialization:
      apiDoctor.specialization || apiDoctor.department || "General Medicine",
    qualification: "MBBS, MD", // Default qualification
    consultation_fee: consultationFee,
    availability_status: apiDoctor.is_active ? "Available" : "Unavailable",
    patients_today: patientsToday,
    total_patients: totalPatients,
    experience_years: experienceYears,
    created_at: new Date(apiDoctor.created_at).toLocaleDateString(),
  };
};

export default function DoctorsPage() {
  const token = localStorage.getItem("token");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState(
    "All Specializations",
  );
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false);
  const [editDoctor, setEditDoctor] = useState<UserData | null>(null);
  const [deleteDoctor, setDeleteDoctor] = useState<{
    id: string;
    full_name: string;
    email: string;
  } | null>(null);

  // API state
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 1,
  });

  // Fetch doctors
  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/clinic-admin/users/doctor`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch doctors");
      }

      const data: ApiResponse = await response.json();
      const transformedDoctors = data.data.map(transformApiDoctor);
      setDoctors(transformedDoctors);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      toast.error("Failed to load doctors");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchDoctors();
  }, []);

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch =
      doctor.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialization =
      selectedSpecialization === "All Specializations" ||
      doctor.specialization === selectedSpecialization;
    const matchesStatus =
      selectedStatus === "all" || doctor.availability_status === selectedStatus;
    return matchesSearch && matchesSpecialization && matchesStatus;
  });

  const availableDoctors = doctors.filter(
    (d) => d.availability_status === "Available",
  ).length;
  const totalPatients = doctors.reduce((sum, d) => sum + d.patients_today, 0);
  const avgExperience =
    doctors.length > 0
      ? Math.round(
          doctors.reduce((sum, d) => sum + d.experience_years, 0) /
            doctors.length,
        )
      : 0;

  const handleEditDoctor = (doctor: Doctor) => {
    setEditDoctor({
      id: doctor.id,
      full_name: doctor.full_name,
      email: doctor.email,
      phone: doctor.phone,
      role: "doctor",
      status:
        doctor.availability_status === "Available" ? "Active" : "Inactive",
      specialization: doctor.specialization.toLowerCase(),
      qualification: doctor.qualification,
      consultation_fee: doctor.consultation_fee.toString(),
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Stethoscope className="w-6 h-6" />
              Doctors
            </h1>
            <p className="text-muted-foreground">
              Manage doctors and their schedules
            </p>
          </div>
          <Button className="gap-2" onClick={() => setIsAddDoctorOpen(true)}>
            <UserPlus className="w-4 h-4" />
            Add Doctor
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{doctors.length}</p>
                  <p className="text-xs text-muted-foreground">Total Doctors</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{availableDoctors}</p>
                  <p className="text-xs text-muted-foreground">Available Now</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalPatients}</p>
                  <p className="text-xs text-muted-foreground">
                    Patients Today
                  </p>
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
                  <p className="text-2xl font-bold">{avgExperience}</p>
                  <p className="text-xs text-muted-foreground">
                    Avg Experience (Yrs)
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
                  placeholder="Search doctors by name, email, or specialization..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={selectedSpecialization}
                onValueChange={setSelectedSpecialization}
              >
                <SelectTrigger className="w-full sm:w-52">
                  <SelectValue placeholder="Specialization" />
                </SelectTrigger>
                <SelectContent>
                  {specializations.map((spec) => (
                    <SelectItem key={spec} value={spec}>
                      {spec}
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
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="Unavailable">Unavailable</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Doctors Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Stethoscope className="w-5 h-5" />
              All Doctors ({filteredDoctors.length} of {pagination.total})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Doctor</TableHead>
                        <TableHead>Specialization</TableHead>
                        <TableHead className="hidden md:table-cell">
                          Contact
                        </TableHead>
                        <TableHead className="hidden lg:table-cell">
                          Fee
                        </TableHead>
                        <TableHead className="hidden lg:table-cell">
                          Patients Today
                        </TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDoctors.map((doctor) => (
                        <TableRow key={doctor.id} className="hover:bg-muted/50">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                <span className="text-sm font-semibold text-emerald-600">
                                  {doctor.full_name
                                    .split(" ")
                                    .slice(1)
                                    .map((n) => n[0])
                                    .join("") || doctor.full_name.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-foreground">
                                  {doctor.full_name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {doctor.qualification}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            >
                              {doctor.specialization}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                <Mail className="w-3.5 h-3.5" />
                                <span className="truncate max-w-32">
                                  {doctor.email}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                <Phone className="w-3.5 h-3.5" />
                                {doctor.phone}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <div className="flex items-center gap-1 text-foreground">
                              <DollarSign className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">
                                ₹{doctor.consultation_fee}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <div className="text-center">
                              <p className="font-medium text-foreground">
                                {doctor.patients_today}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Total: {doctor.total_patients.toLocaleString()}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={cn(
                                doctor.availability_status === "Available"
                                  ? "bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400"
                                  : "bg-red-100 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400",
                              )}
                            >
                              {doctor.availability_status === "Available" ? (
                                <CheckCircle className="w-3 h-3 mr-1" />
                              ) : (
                                <XCircle className="w-3 h-3 mr-1" />
                              )}
                              {doctor.availability_status}
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
                                  onClick={() => handleEditDoctor(doctor)}
                                >
                                  <Edit className="w-4 h-4" />
                                  Edit Doctor
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="gap-2 text-destructive"
                                  onClick={() =>
                                    setDeleteDoctor({
                                      id: doctor.id,
                                      full_name: doctor.full_name,
                                      email: doctor.email,
                                    })
                                  }
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete Doctor
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {filteredDoctors.length === 0 && (
                  <div className="text-center py-12">
                    <Stethoscope className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No doctors found matching your criteria
                    </p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Doctor Dialog */}
      <AddUserDialog
        open={isAddDoctorOpen}
        onOpenChange={setIsAddDoctorOpen}
        onSuccess={fetchDoctors}
      />

      {/* Edit Doctor Dialog */}
      <EditUserDialog
        open={!!editDoctor}
        onOpenChange={(open) => !open && setEditDoctor(null)}
        user={editDoctor}
        onSuccess={fetchDoctors}
      />

      {/* Delete Doctor Dialog */}
      <DeleteUserDialog
        open={!!deleteDoctor}
        onOpenChange={(open) => !open && setDeleteDoctor(null)}
        user={deleteDoctor}
        onSuccess={fetchDoctors}
      />
    </DashboardLayout>
  );
}
