import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Eye,
  Edit,
  Trash2,
  Calendar,
  MessageSquare,
  FileText,
  Activity,
  MoreVertical,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Patient {
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

interface PatientTableProps {
  patients: Patient[];
  onView: (patient: Patient) => void;
  onEdit: (patient: Patient) => void;
  onDelete: (patient: Patient) => void;
  onBookAppointment: (patient: Patient) => void;
  onMedicalHistory: (patient: Patient) => void;
  onConsultation: (patient: Patient) => void;
  onPrescription: (patient: Patient) => void;
  onLabReports: (patient: Patient) => void;
  onStatusChange: (patient: Patient, status: "Active" | "Inactive") => void;
}

export function PatientTable({
  patients,
  onView,
  onEdit,
  onDelete,
  onBookAppointment,
  onMedicalHistory,
  onConsultation,
  onPrescription,
  onLabReports,
  onStatusChange,
}: PatientTableProps) {
  const [sortColumn, setSortColumn] = useState<keyof Patient>("firstName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Helper function to safely parse and format dates
  const formatDate = (dateString: string | null | undefined): string => {
    if (
      !dateString ||
      typeof dateString !== "string" ||
      dateString.trim() === ""
    ) {
      return "-";
    }

    try {
      // Check if it's already a formatted date (contains / or -)
      if (
        dateString.includes("/") ||
        dateString.match(/^\d{1,2}-\d{1,2}-\d{4}$/)
      ) {
        return dateString;
      }

      const date = new Date(dateString);

      // Validate the date
      if (isNaN(date.getTime())) {
        console.warn(`Invalid date: ${dateString}`);
        return "-";
      }

      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      console.error(`Error formatting date: ${dateString}`, error);
      return "-";
    }
  };

  // Helper function to safely render cell content
  const renderCellContent = (patient: Patient, column: keyof Patient) => {
    const value = patient[column];

    // Handle null/undefined values
    if (value === null || value === undefined) {
      return "-";
    }

    // Convert to string
    const stringValue = String(value).trim();

    // Empty string handling
    if (stringValue === "") {
      return "-";
    }

    switch (column) {
      case "dateOfBirth":
      case "registrationDate":
      case "lastVisit":
        return formatDate(stringValue);

      case "totalVisits":
        return stringValue;

      case "status":
        return (
          <Badge
            variant={stringValue === "Active" ? "default" : "secondary"}
            className="cursor-pointer"
          >
            {stringValue}
          </Badge>
        );

      case "bloodGroup":
        return stringValue || "-";

      default:
        return stringValue;
    }
  };

  // Sort patients
  const sortedPatients = [...patients].sort((a, b) => {
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];

    // Handle null/undefined
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    const comparison = String(aValue).localeCompare(String(bValue));
    return sortDirection === "asc" ? comparison : -comparison;
  });

  const handleSort = (column: keyof Patient) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  if (patients.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <p>No patients found</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("patientCode")}
            >
              Patient Code
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("firstName")}
            >
              Name
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("email")}
            >
              Email
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("phone")}
            >
              Phone
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("dateOfBirth")}
            >
              DOB
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("bloodGroup")}
            >
              Blood Group
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("registrationDate")}
            >
              Registration Date
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("lastVisit")}
            >
              Last Visit
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("totalVisits")}
            >
              Visits
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("status")}
            >
              Status
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedPatients.map((patient) => (
            <TableRow key={patient.id} className="hover:bg-muted/50">
              <TableCell className="font-medium">
                {patient.patientCode}
              </TableCell>
              <TableCell>
                {patient.firstName} {patient.lastName}
              </TableCell>
              <TableCell>{renderCellContent(patient, "email")}</TableCell>
              <TableCell>{renderCellContent(patient, "phone")}</TableCell>
              <TableCell>{renderCellContent(patient, "dateOfBirth")}</TableCell>
              <TableCell>{renderCellContent(patient, "bloodGroup")}</TableCell>
              <TableCell>
                {renderCellContent(patient, "registrationDate")}
              </TableCell>
              <TableCell>{renderCellContent(patient, "lastVisit")}</TableCell>
              <TableCell>{renderCellContent(patient, "totalVisits")}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {patient.status === "Active" ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  <Badge
                    variant={
                      patient.status === "Active" ? "default" : "secondary"
                    }
                    className="cursor-pointer"
                    onClick={() =>
                      onStatusChange(
                        patient,
                        patient.status === "Active" ? "Inactive" : "Active",
                      )
                    }
                  >
                    {patient.status}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onView(patient)}
                    title="View details"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(patient)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onMedicalHistory(patient)}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Medical History
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onBookAppointment(patient)}
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Book Appointment
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onConsultation(patient)}>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Consultation
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onPrescription(patient)}>
                        <Activity className="w-4 h-4 mr-2" />
                        Prescription
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onLabReports(patient)}>
                        <FileText className="w-4 h-4 mr-2" />
                        Lab Reports
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete(patient)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
