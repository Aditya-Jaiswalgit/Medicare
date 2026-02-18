import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
// import { ClinicAdminDashboard } from "@/components/dashboard/ClinicAdminDashboard";
// import { DoctorDashboard } from "@/components/dashboard/DoctorDashboard";
// import { PatientDashboard } from "@/components/dashboard/PatientDashboard";
// import { PharmacistDashboard } from "@/components/dashboard/PharmacistDashboard";
// import { ReceptionistDashboard } from "@/components/dashboard/ReceptionistDashboard";
// import { AccountantDashboard } from "@/components/dashboard/AccountantDashboard";
// import { LabTechnicianDashboard } from "@/components/dashboard/LabTechnicianDashboard";
import { SuperAdminDashboard } from "./SuperAdminDashboard";
import { DoctorDashboard } from "./DoctorAdminDashboard";
import { ClinicAdminDashboard } from "./ClinicAdminDashboard";

export default function Dashboard() {
  const { user, role } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const renderDashboard = () => {
    switch (role) {
      case "super_admin":
        return <SuperAdminDashboard />;
      case "clinic_admin":
        return <ClinicAdminDashboard />;
      case "doctor":
        return <DoctorDashboard />;
      // case "patient":
      //   return <PatientDashboard />;
      // case "pharmacist":
      //   return <PharmacistDashboard />;
      // case "receptionist":
      //   return <ReceptionistDashboard />;
      // case "accountant":
      //   return <AccountantDashboard />;
      // case "lab_technician":
      //   return <LabTechnicianDashboard />;
      default:
        return (
          <div className="text-center p-8 text-muted-foreground">
            Dashboard not available for your role
          </div>
        );
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {getGreeting()}, {user?.full_name?.split(" ")[0] || "User"}!
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's what's happening at your clinic today.
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Today</p>
            <p className="text-lg font-semibold text-foreground">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Role-Specific Dashboard */}
        {renderDashboard()}
      </div>
    </DashboardLayout>
  );
}
