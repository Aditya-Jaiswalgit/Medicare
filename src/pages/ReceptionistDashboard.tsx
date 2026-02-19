import { useEffect, useState } from "react";
import { StatCard } from "@/components/dashboard/StatCard";
import { Users, Calendar, Clock, AlertCircle } from "lucide-react";

interface ReceptionistData {
  total_patients: number;
  today_appointments: number;
  upcoming_appointments: number;
  pending_approvals: number;
}

export function ReceptionistDashboard() {
  const [data, setData] = useState<ReceptionistData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          "http://localhost:5000/api/receptionist/dashboard",
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
        console.error("Error fetching receptionist data:", error);
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
          title="Today's Appointments"
          value={data.today_appointments.toString()}
          icon={<Calendar className="w-6 h-6" />}
          iconClassName="bg-success/10 text-success"
        />
        <StatCard
          title="Upcoming"
          value={data.upcoming_appointments.toString()}
          icon={<Clock className="w-6 h-6" />}
          iconClassName="bg-warning/10 text-warning"
        />
        <StatCard
          title="Pending Approvals"
          value={data.pending_approvals.toString()}
          icon={<AlertCircle className="w-6 h-6" />}
          iconClassName="bg-accent text-accent-foreground"
        />
      </div>

      {/* Quick Overview */}
      <div className="card-elevated p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Quick Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-secondary/50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Today's Schedule
                </p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {data.today_appointments}
                </p>
              </div>
              <Calendar className="w-12 h-12 text-primary/20" />
            </div>
          </div>
          <div className="p-4 bg-secondary/50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Pending Approvals
                </p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {data.pending_approvals}
                </p>
              </div>
              <AlertCircle className="w-12 h-12 text-warning/20" />
            </div>
          </div>
        </div>
      </div>

      {/* Appointment Status */}
      <div className="card-elevated p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Appointment Status
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Today's Appointments</span>
            <span className="font-semibold text-foreground">
              {data.today_appointments}
            </span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-success rounded-full"
              style={{ width: "70%" }}
            />
          </div>

          <div className="flex items-center justify-between mt-4">
            <span className="text-muted-foreground">Upcoming Appointments</span>
            <span className="font-semibold text-foreground">
              {data.upcoming_appointments}
            </span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full"
              style={{ width: "50%" }}
            />
          </div>

          <div className="flex items-center justify-between mt-4">
            <span className="text-muted-foreground">Pending Approvals</span>
            <span className="font-semibold text-foreground">
              {data.pending_approvals}
            </span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-warning rounded-full"
              style={{ width: "30%" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
