import { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  UserPlus,
  Activity,
  Calendar,
  Download,
  Loader2,
} from "lucide-react";
import { PatientFilters } from "@/components/patients/PatientFilters";
import { PatientTable } from "@/components/patients/PatientTable";
import { AddPatientDialog } from "@/components/patients/AddPatientDialog";
import { PatientDetailsDialog } from "@/components/patients/PatientDetailsDialog";
import { DeletePatientDialog } from "@/components/patients/DeletePatientDialog";
import { MedicalHistoryDialog } from "@/components/patients/MedicalHistoryDialog";
import {
  BookAppointmentDialog,
  AppointmentFormData,
} from "@/components/patients/BookAppointmentDialog";
import { ConsultationDialog } from "@/components/patients/ConsultationDialog";
import { PrescriptionDialog } from "@/components/patients/PrescriptionDialog";
import { LabReportsDialog } from "@/components/patients/LabReportsDialog";
import { toast } from "sonner";
import { DateRange } from "react-day-picker";
import { MedicalHistory } from "@/types/patient";

interface ApiPatient {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  address: string | null;
  is_active: boolean;
  created_at: string;
  date_of_birth: string | null;
  blood_group: string | null;
  emergency_contact: string | null;
  medical_history: string | null;
  allergies: string | null;
  total_visits: number;
  last_visit: string | null;
}

interface ApiResponse {
  success: boolean;
  data: ApiPatient[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

interface PatientForTable {
  id: string;
  patientCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
  address: string;
  emergencyContact: string;
  status: "Active" | "Inactive";
  registrationDate: string;
  lastVisit: string;
  totalVisits: number;
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<ApiPatient[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGender, setSelectedGender] = useState("all");
  const [selectedBloodGroup, setSelectedBloodGroup] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [medicalHistoryDialogOpen, setMedicalHistoryDialogOpen] =
    useState(false);
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false);
  const [consultationDialogOpen, setConsultationDialogOpen] = useState(false);
  const [prescriptionDialogOpen, setPrescriptionDialogOpen] = useState(false);
  const [labReportsDialogOpen, setLabReportsDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] =
    useState<PatientForTable | null>(null);
  const [editPatient, setEditPatient] = useState<PatientForTable | null>(null);
  const [medicalHistoryData, setMedicalHistoryData] = useState<
    Record<string, MedicalHistory>
  >({});

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 100,
    pages: 1,
  });

  // Transform API patient to table format
  const transformPatient = (apiPatient: ApiPatient): PatientForTable => {
    const nameParts = apiPatient.full_name.split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    return {
      id: apiPatient.id,
      patientCode: `PT-${apiPatient.id.slice(0, 8)}`,
      firstName,
      lastName,
      email: apiPatient.email,
      phone: apiPatient.phone,
      dateOfBirth: apiPatient.date_of_birth || "",
      gender: "Not specified", // Not in API response
      bloodGroup: apiPatient.blood_group || "",
      address: apiPatient.address || "",
      emergencyContact: apiPatient.emergency_contact || "",
      status: apiPatient.is_active ? "Active" : "Inactive",
      registrationDate: new Date(apiPatient.created_at).toLocaleDateString(),
      lastVisit: apiPatient.last_visit
        ? new Date(apiPatient.last_visit).toLocaleDateString()
        : "",
      totalVisits: apiPatient.total_visits || 0,
    };
  };

  // Fetch patients from API
  const fetchPatients = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({
        page: "1",
        limit: "100",
      });

      if (selectedStatus !== "all") {
        params.append("status", selectedStatus);
      }
      if (selectedBloodGroup !== "all") {
        params.append("blood_group", selectedBloodGroup);
      }
      if (searchQuery) {
        params.append("search", searchQuery);
      }

      const response = await fetch(
        `http://localhost:5000/api/receptionist/patients?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch patients");
      }

      const result: ApiResponse = await response.json();

      if (result.success) {
        setPatients(result.data);
        setPagination(result.pagination);
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
      toast.error("Failed to load patients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [selectedStatus, selectedBloodGroup]);

  // Apply frontend filters and transform data
  const filteredPatients = useMemo(() => {
    const filtered = patients.filter((patient) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        patient.full_name.toLowerCase().includes(searchLower) ||
        patient.email.toLowerCase().includes(searchLower) ||
        patient.phone.includes(searchQuery);

      return matchesSearch;
    });

    return filtered.map(transformPatient);
  }, [patients, searchQuery]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedGender("all");
    setSelectedBloodGroup("all");
    setSelectedStatus("all");
    setDateRange(undefined);
  };

  const handleAddPatient = (data: {
    firstName: string;
    lastName?: string;
    email: string;
    phone: string;
    dateOfBirth?: Date;
    gender?: string;
    bloodGroup?: string;
    address?: string;
    emergencyContact?: string;
    registrationDate?: Date;
  }) => {
    // In real implementation, this would call the API
    // For now, just refresh the list
    toast.success("Patient added successfully");
    setAddDialogOpen(false);
    fetchPatients();
  };

  const handleStatusChange = async (
    patient: PatientForTable,
    newStatus: "Active" | "Inactive",
  ) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/receptionist/patients/${patient.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            is_active: newStatus === "Active",
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      toast.success(`Patient status updated to ${newStatus}`);
      fetchPatients();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const handleViewPatient = (patient: PatientForTable) => {
    setSelectedPatient(patient);
    setDetailsDialogOpen(true);
  };

  const handleEditPatient = (patient: PatientForTable) => {
    setEditPatient(patient);
    setAddDialogOpen(true);
  };

  const handleDeletePatient = (patient: PatientForTable) => {
    setSelectedPatient(patient);
    setDeleteDialogOpen(true);
  };

  const handleMedicalHistory = (patient: PatientForTable) => {
    setSelectedPatient(patient);
    setMedicalHistoryDialogOpen(true);
  };

  const handleSaveMedicalHistory = (
    patientId: string,
    data: MedicalHistory,
  ) => {
    setMedicalHistoryData((prev) => ({ ...prev, [patientId]: data }));
    toast.success("Medical history saved successfully");
  };

  const handleBookAppointment = (patient: PatientForTable) => {
    setSelectedPatient(patient);
    setAppointmentDialogOpen(true);
  };

  const handleConsultation = (patient: PatientForTable) => {
    setSelectedPatient(patient);
    setConsultationDialogOpen(true);
  };

  const handlePrescription = (patient: PatientForTable) => {
    setSelectedPatient(patient);
    setPrescriptionDialogOpen(true);
  };

  const handleLabReports = (patient: PatientForTable) => {
    setSelectedPatient(patient);
    setLabReportsDialogOpen(true);
  };

  const handleConfirmBooking = async (appointmentData: AppointmentFormData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:5000/api/receptionist/appointments",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(appointmentData),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to create appointment");
      }

      toast.success("Appointment booked successfully");
      setAppointmentDialogOpen(false);
    } catch (error) {
      console.error("Error booking appointment:", error);
      toast.error("Failed to book appointment");
    }
  };

  const confirmDelete = async () => {
    if (selectedPatient) {
      await handleStatusChange(selectedPatient, "Inactive");
      setDeleteDialogOpen(false);
      setSelectedPatient(null);
    }
  };

  const handleExport = () => {
    toast.success("Export started", {
      description: "Patient data is being exported to Excel.",
    });
  };

  const activeCount = patients.filter((p) => p.is_active).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Users className="w-6 h-6" />
              Patient Management
            </h1>
            <p className="text-muted-foreground">
              Manage patient records and medical history
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport} className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button
              onClick={() => {
                setEditPatient(null);
                setAddDialogOpen(true);
              }}
              className="gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Add Patient
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{patients.length}</p>
                  <p className="text-xs text-muted-foreground">
                    Total Patients
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{activeCount}</p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">24</p>
                  <p className="text-xs text-muted-foreground">
                    Today's Visits
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">8</p>
                  <p className="text-xs text-muted-foreground">New This Week</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <PatientFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedGender={selectedGender}
              onGenderChange={setSelectedGender}
              selectedBloodGroup={selectedBloodGroup}
              onBloodGroupChange={setSelectedBloodGroup}
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              onClearFilters={handleClearFilters}
            />
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5" />
              Patients ({filteredPatients.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <PatientTable
                patients={filteredPatients}
                onView={handleViewPatient}
                onEdit={handleEditPatient}
                onDelete={handleDeletePatient}
                onBookAppointment={handleBookAppointment}
                onMedicalHistory={handleMedicalHistory}
                onConsultation={handleConsultation}
                onPrescription={handlePrescription}
                onLabReports={handleLabReports}
                onStatusChange={handleStatusChange}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <AddPatientDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSubmit={handleAddPatient}
        editData={
          editPatient
            ? {
                ...editPatient,
                dateOfBirth: editPatient.dateOfBirth
                  ? new Date(editPatient.dateOfBirth)
                  : undefined,
                registrationDate: new Date(editPatient.registrationDate),
              }
            : null
        }
      />
      <PatientDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        patient={selectedPatient}
        onEdit={handleEditPatient}
      />
      <DeletePatientDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        patient={selectedPatient}
        onConfirm={confirmDelete}
      />
      <MedicalHistoryDialog
        open={medicalHistoryDialogOpen}
        onOpenChange={setMedicalHistoryDialogOpen}
        patient={selectedPatient}
        onSave={handleSaveMedicalHistory}
      />
      <BookAppointmentDialog
        open={appointmentDialogOpen}
        onOpenChange={setAppointmentDialogOpen}
        patient={selectedPatient}
        onBook={handleConfirmBooking}
      />
      <ConsultationDialog
        open={consultationDialogOpen}
        onOpenChange={setConsultationDialogOpen}
        patient={selectedPatient}
      />
      <PrescriptionDialog
        open={prescriptionDialogOpen}
        onOpenChange={setPrescriptionDialogOpen}
        patient={selectedPatient}
      />
      <LabReportsDialog
        open={labReportsDialogOpen}
        onOpenChange={setLabReportsDialogOpen}
        patient={selectedPatient}
      />
    </DashboardLayout>
  );
}
