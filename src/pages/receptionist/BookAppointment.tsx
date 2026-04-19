import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from "@/contexts/AuthContext";
import {
  CalendarDays,
  Clock,
  User,
  Stethoscope,
  Phone,
  Search,
  Plus,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { format, parse, isValid } from "date-fns";
import { toast } from "@/hooks/use-toast";

interface Patient {
  id: string;
  full_name: string;
  email: string;
  patientCode?: string;
}
interface Doctor {
  id: string;
  full_name: string; // ← was "name"
  department: string;
  specialization: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export default function BookAppointment() {
  const { token, isLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const role = sessionStorage.getItem("role");
  // Form state
  const [patientSearch, setPatientSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [appointmentDate, setAppointmentDate] = useState<Date | undefined>(
    undefined,
  );
  const [dateInputValue, setDateInputValue] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [appointmentType, setAppointmentType] = useState("");
  const [bookingSource, setBookingSource] = useState("");
  const [reason, setReason] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [notes, setNotes] = useState("");
  const [duration, setDuration] = useState("30");
  const [showPatientResults, setShowPatientResults] = useState(false);

  // Fetch patients on mount
  useEffect(() => {
    if (!isLoading && token) {
      fetchPatients();
      fetchDoctors();
    }
  }, [isLoading, token]);

  // Fetch available time slots when doctor and date are selected
  const fetchPatients = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/${role}/patients`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) throw new Error("Failed to fetch patients");

      const result: ApiResponse<Patient[]> = await response.json();
      if (result.success) {
        setPatients(result.data);
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
      toast({
        title: "Error",
        description: "Failed to load patients",
        variant: "destructive",
      });
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/${role}/doctors`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) throw new Error("Failed to fetch doctors");

      const result: ApiResponse<Doctor[]> = await response.json();
      if (result.success) {
        setDoctors(result.data);
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
      toast({
        title: "Error",
        description: "Failed to load doctors",
        variant: "destructive",
      });
    }
  };

  // Filter
  const filteredPatients = patients.filter(
    (p) =>
      p.full_name?.toLowerCase().includes(patientSearch.toLowerCase()) ||
      p.phone?.includes(patientSearch),
  );
  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setPatientSearch(patient.full_name); // ← was patient.name
    setShowPatientResults(false);
  };
  // Select patient

  const handleDateInputChange = (value: string) => {
    setDateInputValue(value);
    const parsed = parse(value, "dd/MM/yyyy", new Date());
    if (isValid(parsed)) {
      setAppointmentDate(parsed);
    }
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    setAppointmentDate(date);
    if (date) {
      setDateInputValue(format(date, "dd/MM/yyyy"));
      setSelectedTime(""); // Reset time when date changes
    }
  };

  const handleBookAppointment = async () => {
    // Validation
    if (!selectedPatient) {
      toast({
        title: "Error",
        description: "Please select a patient",
        variant: "destructive",
      });
      return;
    }
    if (!selectedDoctor) {
      toast({
        title: "Error",
        description: "Please select a doctor",
        variant: "destructive",
      });
      return;
    }
    if (!appointmentDate) {
      toast({
        title: "Error",
        description: "Please select appointment date",
        variant: "destructive",
      });
      return;
    }
    if (!selectedTime) {
      toast({
        title: "Error",
        description: "Please select appointment time",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const appointmentData = {
        patient_id: selectedPatient.id,
        doctor_id: selectedDoctor,
        appointment_date: format(appointmentDate, "yyyy-MM-dd"),
        appointment_time: selectedTime,
        reason: reason || appointmentType,
        duration_minutes: parseInt(duration),
        type: appointmentType,
        booking_source: bookingSource,
        symptoms: symptoms,
        notes: notes,
      };

      const response = await fetch(
        `http://localhost:5000/api/${role}/appointments`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(appointmentData),
        },
      );

      const result: ApiResponse<any> = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to book appointment");
      }

      if (result.success) {
        toast({
          title: "Success!",
          description: `Appointment booked successfully for ${format(appointmentDate, "dd MMM yyyy")} at ${selectedTime}`,
        });

        // Reset form
        setSelectedPatient(null);
        setPatientSearch("");
        setSelectedDoctor("");
        setAppointmentDate(undefined);
        setDateInputValue("");
        setSelectedTime("");
        setAppointmentType("");
        setBookingSource("");
        setReason("");
        setSymptoms("");
        setNotes("");
        setDuration("30");
      }
    } catch (error) {
      console.error("Error booking appointment:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to book appointment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <CalendarDays className="w-6 h-6" />
            Book Appointment
          </h1>
          <p className="text-muted-foreground">
            Schedule a new appointment for a patient
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Patient Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Patient Details
                </CardTitle>
                <CardDescription>Search and select a patient</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, phone, or patient code..."
                    value={patientSearch}
                    onChange={(e) => {
                      setPatientSearch(e.target.value);
                      setShowPatientResults(true);
                      if (
                        selectedPatient &&
                        e.target.value !== selectedPatient.full_name
                      ) {
                        setSelectedPatient(null);
                      }
                    }}
                    onFocus={() => setShowPatientResults(true)}
                    className="pl-10"
                  />
                  {showPatientResults && patientSearch && (
                    <div className="absolute z-10 w-full mt-1 bg-background border rounded-lg shadow-lg max-h-60 overflow-auto">
                      {filteredPatients.length > 0 ? (
                        filteredPatients.map((patient) => (
                          <div
                            key={patient.id}
                            className="p-3 hover:bg-muted cursor-pointer border-b last:border-0"
                            onClick={() => handleSelectPatient(patient)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">
                                  {patient.full_name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {patient.phone}
                                </p>
                              </div>
                              <Badge variant="outline">
                                {patient.patientCode}
                              </Badge>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-center text-muted-foreground">
                          No patients found
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {selectedPatient && (
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-lg">
                          {selectedPatient.full_name}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {selectedPatient.phone}
                          </span>
                          <Badge variant="outline">
                            {selectedPatient.patientCode}
                          </Badge>
                        </div>
                      </div>
                      <CheckCircle className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Appointment Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Stethoscope className="w-5 h-5" />
                  Appointment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Select Doctor *</Label>
                    <Select
                      value={selectedDoctor}
                      onValueChange={setSelectedDoctor}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        {doctors.map((doctor) => (
                          <SelectItem key={doctor.id} value={doctor.id}>
                            <div className="flex items-center gap-2">
                              <span>{doctor.full_name}</span>
                              <span className="text-muted-foreground">
                                ({doctor.department})
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Appointment Type *</Label>
                    <Select
                      value={appointmentType}
                      onValueChange={setAppointmentType}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="New Consultation">
                          New Consultation
                        </SelectItem>
                        <SelectItem value="Follow-up">Follow-up</SelectItem>
                        <SelectItem value="Routine Checkup">
                          Routine Checkup
                        </SelectItem>
                        <SelectItem value="Emergency">Emergency</SelectItem>
                        <SelectItem value="Lab Review">Lab Review</SelectItem>
                        <SelectItem value="Vaccination">Vaccination</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Appointment Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <div className="relative">
                          <Input
                            placeholder="DD/MM/YYYY"
                            value={dateInputValue}
                            onChange={(e) =>
                              handleDateInputChange(e.target.value)
                            }
                            className="pr-10"
                          />
                          <CalendarDays className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground cursor-pointer" />
                        </div>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={appointmentDate}
                          onSelect={handleCalendarSelect}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>Appointment Time *</Label>
                    <Input
                      type="time"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      disabled={!selectedDoctor || !appointmentDate}
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Booking Source</Label>
                    <Select
                      value={bookingSource}
                      onValueChange={setBookingSource}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Walk-in">Walk-in</SelectItem>
                        <SelectItem value="Phone">Phone</SelectItem>
                        <SelectItem value="Online">Online</SelectItem>
                        <SelectItem value="Mobile App">Mobile App</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Duration (minutes)</Label>
                    <Select value={duration} onValueChange={setDuration}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Reason for Visit</Label>
                  <Input
                    placeholder="Brief reason..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Symptoms</Label>
                  <Textarea
                    placeholder="Describe patient symptoms..."
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Additional Notes</Label>
                  <Textarea
                    placeholder="Any additional notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Summary */}
          <div className="space-y-6">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Appointment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Patient</span>
                    <span className="font-medium">
                      {selectedPatient?.full_name || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Doctor</span>
                    <span className="font-medium">
                      {doctors.find((d) => d.id === selectedDoctor)
                        ?.full_name || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium">
                      {appointmentDate
                        ? format(appointmentDate, "dd MMM yyyy")
                        : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Time</span>
                    <span className="font-medium">{selectedTime || "-"}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Type</span>
                    <span className="font-medium">
                      {appointmentType || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Source</span>
                    <span className="font-medium">{bookingSource || "-"}</span>
                  </div>
                </div>

                <Button
                  className="w-full gap-2"
                  size="lg"
                  onClick={handleBookAppointment}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Book Appointment
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
