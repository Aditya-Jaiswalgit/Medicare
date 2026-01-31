import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserPlus, Activity, Calendar, Download } from "lucide-react";
import { mockPatients, mockMedicalHistory } from "@/data/mockPatientData";
import { Patient, MedicalHistory } from "@/types/patient";
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
import { useToast } from "@/hooks/use-toast";
import { DateRange } from "react-day-picker";
import { isWithinInterval, format } from "date-fns";

export default function PatientsPage() {
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
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
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [editPatient, setEditPatient] = useState<Patient | null>(null);
  const [medicalHistoryData, setMedicalHistoryData] =
    useState<Record<string, MedicalHistory>>(mockMedicalHistory);

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        patient.patientCode.toLowerCase().includes(searchLower) ||
        patient.firstName.toLowerCase().includes(searchLower) ||
        (patient.lastName?.toLowerCase() || "").includes(searchLower) ||
        patient.phone.includes(searchQuery);
      const matchesGender =
        selectedGender === "all" || patient.gender === selectedGender;
      const matchesBloodGroup =
        selectedBloodGroup === "all" ||
        patient.bloodGroup === selectedBloodGroup;
      const matchesStatus =
        selectedStatus === "all" || patient.status === selectedStatus;
      const matchesDate =
        !dateRange?.from ||
        !dateRange?.to ||
        isWithinInterval(new Date(patient.registrationDate), {
          start: dateRange.from,
          end: dateRange.to,
        });

      return (
        matchesSearch &&
        matchesGender &&
        matchesBloodGroup &&
        matchesStatus &&
        matchesDate
      );
    });
  }, [
    patients,
    searchQuery,
    selectedGender,
    selectedBloodGroup,
    selectedStatus,
    dateRange,
  ]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedGender("all");
    setSelectedBloodGroup("all");
    setSelectedStatus("all");
    setDateRange(undefined);
  };

  const handleAddPatient = (data) => {
    if (editPatient) {
      // Update existing patient
      setPatients(
        patients.map((p) =>
          p.id === editPatient.id
            ? {
                ...p,
                ...data,
                registrationDate: data.registrationDate
                  ? format(data.registrationDate, "yyyy-MM-dd")
                  : p.registrationDate,
              }
            : p,
        ),
      );
      toast({
        title: "Patient Updated",
        description: `${data.firstName} ${data.lastName || ""} has been updated.`,
      });
    } else {
      // Add new patient
      const newPatient: Patient = {
        id: String(patients.length + 1),
        patientCode: `PT-2024-${String(patients.length + 1).padStart(3, "0")}`,
        ...data,
        status: "Active",
        registrationDate: data.registrationDate
          ? format(data.registrationDate, "yyyy-MM-dd")
          : format(new Date(), "yyyy-MM-dd"),
        lastVisit: "",
        totalVisits: 0,
      };
      setPatients([newPatient, ...patients]);
      toast({
        title: "Patient Added",
        description: `${data.firstName} ${data.lastName || ""} has been added.`,
      });
    }
    setEditPatient(null);
    setAddDialogOpen(false);
  };

  const handleStatusChange = (
    patient: Patient,
    newStatus: "Active" | "Inactive",
  ) => {
    setPatients(
      patients.map((p) =>
        p.id === patient.id ? { ...p, status: newStatus } : p,
      ),
    );
    toast({
      title: "Status Updated",
      description: `${patient.firstName} ${patient.lastName || ""} is now ${newStatus}.`,
    });
  };

  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setDetailsDialogOpen(true);
  };

  const handleEditPatient = (patient: Patient) => {
    setEditPatient(patient);
    setAddDialogOpen(true);
  };

  const handleDeletePatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setDeleteDialogOpen(true);
  };

  const handleMedicalHistory = (patient: Patient) => {
    setSelectedPatient(patient);
    setMedicalHistoryDialogOpen(true);
  };

  const handleSaveMedicalHistory = (
    patientId: string,
    data: MedicalHistory,
  ) => {
    setMedicalHistoryData((prev) => ({ ...prev, [patientId]: data }));
  };

  const handleBookAppointment = (patient: Patient) => {
    setSelectedPatient(patient);
    setAppointmentDialogOpen(true);
  };

  const handleConsultation = (patient: Patient) => {
    setSelectedPatient(patient);
    setConsultationDialogOpen(true);
  };

  const handlePrescription = (patient: Patient) => {
    setSelectedPatient(patient);
    setPrescriptionDialogOpen(true);
  };

  const handleLabReports = (patient: Patient) => {
    setSelectedPatient(patient);
    setLabReportsDialogOpen(true);
  };

  const handleConfirmBooking = (appointmentData: AppointmentFormData) => {
    // In a real app, this would save to the database
    console.log("Appointment booked:", appointmentData);
  };

  const confirmDelete = () => {
    if (selectedPatient) {
      // Soft delete - set status to Inactive instead of removing
      setPatients(
        patients.map((p) =>
          p.id === selectedPatient.id
            ? { ...p, status: "Inactive" as const }
            : p,
        ),
      );
      toast({
        title: "Patient Deactivated",
        description: `${selectedPatient.firstName} ${selectedPatient.lastName} has been marked as inactive.`,
      });
      setDeleteDialogOpen(false);
      setSelectedPatient(null);
    }
  };

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Patient data is being exported to Excel.",
    });
  };

  const activeCount = patients.filter((p) => p.status === "Active").length;

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
          </CardContent>
        </Card>
      </div>

      <AddPatientDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSubmit={handleAddPatient}
        editData={
          editPatient
            ? {
                ...editPatient,
                dateOfBirth: new Date(editPatient.dateOfBirth),
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
