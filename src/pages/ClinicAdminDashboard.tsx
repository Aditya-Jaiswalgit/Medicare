import { useEffect, useState } from "react";
import { StatCard } from "@/components/dashboard/StatCard";
import {
  Users,
  Stethoscope,
  Calendar,
  DollarSign,
  UserCog,
  Pill,
  TestTube,
} from "lucide-react";

interface ClinicAdminData {
  total_doctors: number;
  total_receptionists: number;
  total_pharmacists: number;
  total_accountants: number;
  total_lab_technicians: number;
  total_patients: number;
  today_appointments: number;
  week_revenue: number;
}

export function ClinicAdminDashboard() {
  const [data, setData] = useState<ClinicAdminData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          "http://localhost:5000/api/clinic-admin/dashboard",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            credentials: "include",
          },
        );

        if (response.ok) {
          const result = await response.json();
          setData(result.data);
        }
      } catch (error) {
        console.error("Error fetching clinic admin data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">Loading...</div>
    );
  }

  if (!data) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        No data available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Patients"
          value={data.total_patients.toString()}
          icon={<Users className="w-6 h-6" />}
          iconClassName="bg-primary/10 text-primary"
        />
        <StatCard
          title="Total Doctors"
          value={data.total_doctors.toString()}
          icon={<Stethoscope className="w-6 h-6" />}
          iconClassName="bg-success/10 text-success"
        />
        <StatCard
          title="Today's Appointments"
          value={data.today_appointments.toString()}
          icon={<Calendar className="w-6 h-6" />}
          iconClassName="bg-warning/10 text-warning"
        />
        <StatCard
          title="Week Revenue"
          value={`$${data.week_revenue}`}
          icon={<DollarSign className="w-6 h-6" />}
          iconClassName="bg-accent text-accent-foreground"
        />
      </div>

      {/* Staff Overview */}
      <div className="card-elevated p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Staff Overview
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-secondary/50 rounded-lg text-center">
            <UserCog className="w-8 h-8 mx-auto text-primary mb-2" />
            <p className="text-2xl font-bold text-foreground">
              {data.total_receptionists}
            </p>
            <p className="text-sm text-muted-foreground">Receptionists</p>
          </div>
          <div className="p-4 bg-secondary/50 rounded-lg text-center">
            <Pill className="w-8 h-8 mx-auto text-success mb-2" />
            <p className="text-2xl font-bold text-foreground">
              {data.total_pharmacists}
            </p>
            <p className="text-sm text-muted-foreground">Pharmacists</p>
          </div>
          <div className="p-4 bg-secondary/50 rounded-lg text-center">
            <TestTube className="w-8 h-8 mx-auto text-warning mb-2" />
            <p className="text-2xl font-bold text-foreground">
              {data.total_lab_technicians}
            </p>
            <p className="text-sm text-muted-foreground">Lab Technicians</p>
          </div>
          <div className="p-4 bg-secondary/50 rounded-lg text-center">
            <DollarSign className="w-8 h-8 mx-auto text-accent mb-2" />
            <p className="text-2xl font-bold text-foreground">
              {data.total_accountants}
            </p>
            <p className="text-sm text-muted-foreground">Accountants</p>
          </div>
        </div>
      </div>
    </div>
  );
}
