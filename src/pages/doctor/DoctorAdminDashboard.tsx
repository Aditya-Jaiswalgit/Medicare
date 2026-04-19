import { useEffect, useState } from "react";
import { StatCard } from "@/components/dashboard/StatCard";
import { Calendar, Clock, AlertCircle, Activity } from "lucide-react";

interface DoctorData {
  today_appointments: number;
  upcoming_appointments: number;
  pending_requests: number;
  total_visits: number;
}

export function DoctorDashboard() {
  const [data, setData] = useState<DoctorData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `http://localhost:5000/api/doctor/dashboard`,
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
        console.error("Error fetching doctor data:", error);
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
          title="Today's Appointments"
          value={data.today_appointments.toString()}
          icon={<Calendar className="w-6 h-6" />}
          iconClassName="bg-primary/10 text-primary"
        />
        <StatCard
          title="Upcoming Appointments"
          value={data.upcoming_appointments.toString()}
          icon={<Clock className="w-6 h-6" />}
          iconClassName="bg-success/10 text-success"
        />
        <StatCard
          title="Pending Requests"
          value={data.pending_requests.toString()}
          icon={<AlertCircle className="w-6 h-6" />}
          iconClassName="bg-warning/10 text-warning"
        />
        <StatCard
          title="Total Visits"
          value={data.total_visits.toString()}
          icon={<Activity className="w-6 h-6" />}
          iconClassName="bg-accent text-accent-foreground"
        />
      </div>

      {/* Quick Stats */}
      <div className="card-elevated p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Quick Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-secondary/50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Appointments Today
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
                  Pending Requests
                </p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {data.pending_requests}
                </p>
              </div>
              <AlertCircle className="w-12 h-12 text-warning/20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
