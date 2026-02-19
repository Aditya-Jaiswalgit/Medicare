import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Phone, Mail, MapPin, Calendar, Edit } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface PatientForDialog {
  id: string;
  firstName: string;
  lastName: string;
  patientCode: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  bloodGroup: string;
  address: string;
  emergencyContact: string;
  status: "Active" | "Inactive";
  registrationDate: string;
  lastVisit: string;
  totalVisits: number;
}

interface PatientDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: PatientForDialog | null;
  onEdit: (patient: PatientForDialog) => void;
}

export function PatientDetailsDialog({
  open,
  onOpenChange,
  patient,
  onEdit,
}: PatientDetailsDialogProps) {
  if (!patient) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-lg font-semibold text-primary">
                  {patient.firstName.charAt(0)}
                  {patient.lastName?.charAt(0) || ""}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  {patient.firstName} {patient.lastName}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {patient.patientCode}
                </p>
              </div>
            </div>
            <Badge
              className={cn(
                patient.status === "Active"
                  ? "bg-success/10 text-success hover:bg-success/20"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {patient.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={() => onEdit(patient)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Information
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  Personal Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <InfoRow
                  label="Full Name"
                  value={`${patient.firstName} ${patient.lastName || ""}`}
                />
                <InfoRow
                  label="Date of Birth"
                  value={
                    patient.dateOfBirth
                      ? format(new Date(patient.dateOfBirth), "PPP")
                      : "-"
                  }
                />
                <InfoRow
                  label="Blood Group"
                  value={patient.bloodGroup || "-"}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <InfoRow
                  label="Phone"
                  value={patient.phone}
                  icon={<Phone className="w-3.5 h-3.5" />}
                />
                <InfoRow
                  label="Email"
                  value={patient.email || "-"}
                  icon={<Mail className="w-3.5 h-3.5" />}
                />
                <InfoRow
                  label="Address"
                  value={patient.address || "-"}
                  icon={<MapPin className="w-3.5 h-3.5" />}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  Visit Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <InfoRow
                  label="Registration Date"
                  value={patient.registrationDate}
                />
                <InfoRow label="Last Visit" value={patient.lastVisit || "-"} />
                <InfoRow
                  label="Total Visits"
                  value={patient.totalVisits.toString()}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Emergency Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <InfoRow
                  label="Contact"
                  value={patient.emergencyContact || "-"}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InfoRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-muted-foreground flex items-center gap-1.5">
        {icon}
        {label}
      </span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}
