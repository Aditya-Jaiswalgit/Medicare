import { useEffect, useState } from "react";
import { StatCard } from "@/components/dashboard/StatCard";
import { Building2, Users, Activity } from "lucide-react";

interface SuperAdminData {
  total_clinics: number;
  total_clinic_admins: number;
  recent_clinics: Array<{
    id: string;
    name: string;
    address: string;
    phone: string;
    email: string;
    created_at: string;
  }>;
  activity_summary: {
    today_activities: string;
    week_activities: string;
    total_activities: string;
  };
}

export function SuperAdminDashboard() {
  const [data, setData] = useState<SuperAdminData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          "http://localhost:5000/api/super-admin/dashboard",
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
        console.error("Error fetching super admin data:", error);
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Clinics"
          value={data.total_clinics.toString()}
          icon={<Building2 className="w-6 h-6" />}
          iconClassName="bg-primary/10 text-primary"
        />
        <StatCard
          title="Clinic Admins"
          value={data.total_clinic_admins.toString()}
          icon={<Users className="w-6 h-6" />}
          iconClassName="bg-success/10 text-success"
        />
        <StatCard
          title="Today's Activities"
          value={data.activity_summary.today_activities}
          icon={<Activity className="w-6 h-6" />}
          iconClassName="bg-warning/10 text-warning"
        />
        <StatCard
          title="Week Activities"
          value={data.activity_summary.week_activities}
          icon={<Activity className="w-6 h-6" />}
          iconClassName="bg-accent text-accent-foreground"
        />
      </div>

      {/* Recent Clinics */}
      <div className="card-elevated p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Recent Clinics
        </h2>
        <div className="space-y-3">
          {data.recent_clinics.length > 0 ? (
            data.recent_clinics.map((clinic, index) => (
              <div
                key={clinic.id}
                className="p-4 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">
                      {clinic.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {clinic.address}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        📞 {clinic.phone}
                      </span>
                      <span className="flex items-center gap-1">
                        ✉️ {clinic.email}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground sm:text-right">
                    {new Date(clinic.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No clinics yet
            </p>
          )}
        </div>
      </div>

      {/* Activity Summary */}
      <div className="card-elevated p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Activity Overview
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="text-center p-4 bg-secondary/50 rounded-lg">
            <p className="text-2xl font-bold text-foreground">
              {data.activity_summary.today_activities}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Today</p>
          </div>
          <div className="text-center p-4 bg-secondary/50 rounded-lg">
            <p className="text-2xl font-bold text-foreground">
              {data.activity_summary.week_activities}
            </p>
            <p className="text-sm text-muted-foreground mt-1">This Week</p>
          </div>
          <div className="text-center p-4 bg-secondary/50 rounded-lg">
            <p className="text-2xl font-bold text-foreground">
              {data.activity_summary.total_activities}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Total</p>
          </div>
        </div>
      </div>
    </div>
  );
}
