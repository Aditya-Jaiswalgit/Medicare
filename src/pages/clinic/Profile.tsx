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
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Building2, Clock, Phone, Mail, MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface ClinicData {
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

interface ApiResponse {
  success: boolean;
  data: ClinicData;
}

export default function ClinicProfilePage() {
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(true);
  const [clinicData, setClinicData] = useState<ClinicData | null>(null);

  useEffect(() => {
    fetchClinicData();
  }, []);

  const fetchClinicData = async () => {
    setLoading(true);
    try {
      // First, get user profile to get clinic_id
      const profileResponse = await fetch(
        `http://localhost:5000/api/auth/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!profileResponse.ok) {
        throw new Error("Failed to fetch profile");
      }

      const profileResult = await profileResponse.json();

      if (!profileResult.success) {
        throw new Error("Failed to get profile data");
      }

      const userClinicId = profileResult.data.clinic_id;

      // Now fetch clinic details using the clinic_id
      const clinicResponse = await fetch(
        `http://localhost:5000/api/clinic-admin/clinic/profile/${userClinicId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!clinicResponse.ok) {
        throw new Error("Failed to fetch clinic data");
      }

      const clinicResult: ApiResponse = await clinicResponse.json();

      if (!clinicResult.success) {
        throw new Error("Failed to get clinic data");
      }

      setClinicData(clinicResult.data);
    } catch (error) {
      console.error("Error fetching clinic data:", error);
      toast.error("Failed to load clinic information");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
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
              <Building2 className="w-6 h-6" />
              Clinic Profile
            </h1>
            <p className="text-muted-foreground">
              View your clinic's basic information
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Main Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Your clinic's primary details (Read-only)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="clinic-name">Clinic Name</Label>
                  <Input
                    id="clinic-name"
                    value={clinicData?.name || ""}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clinic-id">Clinic ID</Label>
                  <Input
                    id="clinic-id"
                    value={clinicData?.id || ""}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="admin-count">Admin Count</Label>
                  <Input
                    id="admin-count"
                    value={clinicData?.admin_count || "0"}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="created-at">Created On</Label>
                  <Input
                    id="created-at"
                    value={
                      clinicData?.created_at
                        ? formatDate(clinicData.created_at)
                        : ""
                    }
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      className="pl-10 bg-muted"
                      value={clinicData?.phone || "Not available"}
                      disabled
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      className="pl-10 bg-muted"
                      value={clinicData?.email || "Not available"}
                      disabled
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Textarea
                    id="address"
                    className="pl-10 bg-muted"
                    value={clinicData?.address || "Not available"}
                    rows={2}
                    disabled
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Status:</span>
                <span
                  className={
                    clinicData?.is_active
                      ? "text-green-600 font-medium"
                      : "text-red-600 font-medium"
                  }
                >
                  {clinicData?.is_active ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Note:</strong> Clinic information can only be updated
                  by the Super Admin. Please contact your administrator if you
                  need to make changes.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Working Hours */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Working Hours
              </CardTitle>
              <CardDescription>Your clinic's operating hours</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ].map((day) => (
                  <div
                    key={day}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{day}</p>
                      <p className="text-sm text-muted-foreground">
                        {day === "Sunday" ? "Closed" : "09:00 - 18:00"}
                      </p>
                    </div>
                    <Switch defaultChecked={day !== "Sunday"} disabled />
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Working hours are currently not editable. Contact Super Admin to
                update.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
