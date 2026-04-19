import { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Activity,
  Calendar,
  Download,
  Loader2,
  Stethoscope,
} from "lucide-react";

import { PatientFilters } from "@/components/patients/PatientFilters";
import { PatientTable } from "@/components/patients/PatientTable";
import { PatientDetailsDialog } from "@/components/patients/PatientDetailsDialog";
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
import { useAuth } from "@/contexts/AuthContext";

const ROLE = "doctor"; // hardcoded — this page is doctor-only
const BASE_URL = "http://localhost:5000/api";

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

const transformPatient = (apiPatient: ApiPatient): PatientForTable => {
  const nameParts = apiPatient.full_name.split(" ");
  return {
    id: apiPatient.id,
    patientCode: `PT-${apiPatient.id.slice(0, 8)}`,
    firstName: nameParts[0] || "",
    lastName: nameParts.slice(1).join(" ") || "",
    email: apiPatient.email,
    phone: apiPatient.phone,
    dateOfBirth: apiPatient.date_of_birth || "",
    gender: "Not specified",
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

export default function MyPatients() {
  const { token } = useAuth();

  const [patients, setPatients] = useState<ApiPatient[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGender, setSelectedGender] = useState("all");
  const [selectedBloodGroup, setSelectedBloodGroup] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  // Dialogs
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [medicalHistoryDialogOpen, setMedicalHistoryDialogOpen] =
    useState(false);
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false);
  const [consultationDialogOpen, setConsultationDialogOpen] = useState(false);
  const [prescriptionDialogOpen, setPrescriptionDialogOpen] = useState(false);
  const [labReportsDialogOpen, setLabReportsDialogOpen] = useState(false);

  const [selectedPatient, setSelectedPatient] =
    useState<PatientForTable | null>(null);
  const [medicalHistoryData, setMedicalHistoryData] = useState<
    Record<string, MedicalHistory>
  >({});

  // ── Fetch only this doctor's patients ──────────────────────────
  const fetchPatients = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: "1", limit: "100" });
      if (selectedStatus !== "all") params.append("status", selectedStatus);
      if (selectedBloodGroup !== "all")
        params.append("blood_group", selectedBloodGroup);
      if (searchQuery) params.append("search", searchQuery);

      const response = await fetch(
        `${BASE_URL}/${ROLE}/patients?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) throw new Error("Failed to fetch patients");

      const result: ApiResponse = await response.json();
      if (result.success) setPatients(result.data);
      else toast.error("Failed to load patients");
    } catch (error) {
      console.error("Error fetching patients:", error);
      toast.error("Failed to load patients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchPatients();
  }, [token, selectedStatus, selectedBloodGroup]);

  // ── Frontend filter + transform ─────────────────────────────────
  const filteredPatients = useMemo(() => {
    return patients
      .filter((p) => {
        const q = searchQuery.toLowerCase();
        return (
          p.full_name.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q) ||
          p.phone.includes(searchQuery)
        );
      })
      .map(transformPatient);
  }, [patients, searchQuery]);

  // ── Stats ───────────────────────────────────────────────────────
  const activeCount = patients.filter((p) => p.is_active).length;
  const todayVisits = patients.filter((p) => {
    if (!p.last_visit) return false;
    return new Date(p.last_visit).toDateString() === new Date().toDateString();
  }).length;
  const thisWeekNew = patients.filter((p) => {
    const created = new Date(p.created_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return created >= weekAgo;
  }).length;

  // ── Handlers ────────────────────────────────────────────────────
  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedGender("all");
    setSelectedBloodGroup("all");
    setSelectedStatus("all");
    setDateRange(undefined);
  };

  const handleViewPatient = (patient: PatientForTable) => {
    setSelectedPatient(patient);
    setDetailsDialogOpen(true);
  };

  // Doctor cannot edit/delete patients — no-ops with toast
  const handleEditPatient = (_patient: PatientForTable) => {
    toast.error("Doctors cannot edit patient records. Contact clinic admin.");
  };

  const handleDeletePatient = (_patient: PatientForTable) => {
    toast.error("Doctors cannot delete patients. Contact clinic admin.");
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
      const response = await fetch(`${BASE_URL}/${ROLE}/appointments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(appointmentData),
      });

      if (!response.ok) throw new Error("Failed to create appointment");

      toast.success("Appointment booked successfully");
      setAppointmentDialogOpen(false);
    } catch (error) {
      console.error("Error booking appointment:", error);
      toast.error("Failed to book appointment");
    }
  };

  // Doctor "status change" is read-only — block it
  const handleStatusChange = (
    _patient: PatientForTable,
    _status: "Active" | "Inactive",
  ) => {
    toast.error("Doctors cannot change patient status. Contact clinic admin.");
  };

  const handleExport = () => {
    if (filteredPatients.length === 0) return;

    const headers = [
      "Patient Code",
      "Name",
      "Email",
      "Phone",
      "Blood Group",
      "Last Visit",
      "Total Visits",
      "Status",
    ];
    const rows = filteredPatients.map((p) => [
      p.patientCode,
      `${p.firstName} ${p.lastName}`,
      p.email,
      p.phone,
      p.bloodGroup || "-",
      p.lastVisit || "-",
      p.totalVisits,
      p.status,
    ]);

    const csv = [headers, ...rows]
      .map((r) => r.map((v) => `"${v}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `my-patients-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Exported successfully");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Stethoscope className="w-6 h-6" />
              My Patients
            </h1>
            <p className="text-muted-foreground">
              Patients assigned to you through appointments
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => fetchPatients()}
              className="gap-2"
            >
              <Activity className="w-4 h-4" />
              Refresh
            </Button>
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={filteredPatients.length === 0}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Export
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
                  <p className="text-xs text-muted-foreground">My Patients</p>
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
                  <p className="text-2xl font-bold">{todayVisits}</p>
                  <p className="text-xs text-muted-foreground">Visited Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{thisWeekNew}</p>
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

      {/* Dialogs — no Add/Delete dialogs since doctor is read-only for patient mgmt */}
      <PatientDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        patient={selectedPatient}
        onEdit={handleEditPatient}
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
