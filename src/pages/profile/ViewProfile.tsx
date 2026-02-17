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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Edit,
  Save,
  X,
  Camera,
  Building2,
} from "lucide-react";

interface ProfileData {
  id: string;
  email: string;
  role: string;
  clinic_id: string | null;
  full_name: string;
  phone: string;
  address: string;
  department: string | null;
  specialization: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  clinic_name?: string;
}

interface UpdateProfileData {
  full_name: string;
  phone: string;
  address: string;
}

export default function ViewProfile() {
  const { user, role } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    address: "",
  });

  // Fetch profile data on component mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/auth/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        setProfileData(result.data);
        // Initialize form data with current values
        setFormData({
          full_name: result.data.full_name || "",
          phone: result.data.phone || "",
          address: result.data.address || "",
        });
      } else {
        throw new Error(result.message || "Failed to fetch profile");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setProfileData((prev) => ({
          ...prev!,
          ...result.data,
        }));
        setIsEditing(false);
        toast({
          title: "Success!",
          description: result.message || "Profile updated successfully",
        });
      } else {
        throw new Error(result.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original profile data
    if (profileData) {
      setFormData({
        full_name: profileData.full_name || "",
        phone: profileData.phone || "",
        address: profileData.address || "",
      });
    }
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const getRoleDisplayName = (role: string) => {
    const names: Record<string, string> = {
      super_admin: "Super Admin",
      clinic_admin: "Clinic Admin",
      doctor: "Doctor",
      receptionist: "Receptionist",
      pharmacist: "Pharmacist",
      lab_technician: "Lab Technician",
      accountant: "Accountant",
      patient: "Patient",
    };
    return names[role] || role;
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!profileData) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Failed to load profile data</p>
          <Button onClick={fetchProfile} className="mt-4">
            Retry
          </Button>
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
              <User className="w-6 h-6" />
              My Profile
            </h1>
            <p className="text-muted-foreground">
              View and manage your personal information
            </p>
          </div>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} className="gap-2">
              <Edit className="w-4 h-4" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={handleUpdate}
                className="gap-2"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                className="gap-2"
                disabled={isSaving}
              >
                <X className="w-4 h-4" />
                Cancel
              </Button>
            </div>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="relative inline-block">
                  <Avatar className="w-32 h-32 mx-auto border-4 border-background">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                      {getInitials(profileData.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute bottom-0 right-0 rounded-full h-8 w-8"
                      disabled
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{profileData.full_name}</h2>
                  <Badge className="mt-1 capitalize">
                    {getRoleDisplayName(profileData.role)}
                  </Badge>
                </div>
                {profileData.clinic_name && (
                  <div className="text-sm text-muted-foreground">
                    <p className="flex items-center justify-center gap-2">
                      <Building2 className="w-4 h-4" />
                      {profileData.clinic_name}
                    </p>
                  </div>
                )}
                <div className="text-sm text-muted-foreground space-y-1">
                  {profileData.department && (
                    <p className="flex items-center justify-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      {profileData.department}
                    </p>
                  )}
                  <p className="flex items-center justify-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Joined {formatDate(profileData.created_at)}
                  </p>
                </div>
                <Separator />
                <div className="text-left space-y-2 text-sm">
                  <p className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    {profileData.email}
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    {profileData.phone || "Not provided"}
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    {profileData.address || "Address not provided"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Your personal and contact details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    value={
                      isEditing ? formData.full_name : profileData.full_name
                    }
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    disabled={true}
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={isEditing ? formData.phone : profileData.phone || ""}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Enter your phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    value={getRoleDisplayName(profileData.role)}
                    disabled={true}
                    className="bg-muted capitalize"
                  />
                </div>
              </div>

              <Separator />

              <h4 className="font-medium">Address</h4>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={
                    isEditing ? formData.address : profileData.address || ""
                  }
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Enter your address"
                />
              </div>

              {/* Additional fields from API that might be useful */}
              {profileData.specialization && (
                <div className="space-y-2">
                  <Label>Specialization</Label>
                  <Input
                    value={profileData.specialization}
                    disabled
                    className="bg-muted"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your account details and activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <Label className="text-muted-foreground text-xs">Status</Label>
                <div>
                  <Badge
                    variant={profileData.is_active ? "default" : "destructive"}
                    className="capitalize"
                  >
                    {profileData.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">
                  Created At
                </Label>
                <p className="text-sm">
                  {new Date(profileData.created_at).toLocaleString()}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">
                  Last Updated
                </Label>
                <p className="text-sm">
                  {new Date(profileData.updated_at).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
