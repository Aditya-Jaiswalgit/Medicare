import { useEffect, useState } from "react";
import { StatCard } from "@/components/dashboard/StatCard";
import { TestTube, Clock, CheckCircle, Upload } from "lucide-react";

interface LabTechnicianData {
  pending_tests: number;
  completed_today: number;
  completed_week: number;
  total_uploaded: number;
}

export function LabTechnicianDashboard() {
  const [data, setData] = useState<LabTechnicianData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          "http://localhost:5000/api/lab-technician/dashboard",
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
        console.error("Error fetching lab technician data:", error);
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
          title="Pending Tests"
          value={data.pending_tests.toString()}
          icon={<Clock className="w-6 h-6" />}
          iconClassName="bg-primary/10 text-primary"
        />
        <StatCard
          title="Completed Today"
          value={data.completed_today.toString()}
          icon={<CheckCircle className="w-6 h-6" />}
          iconClassName="bg-success/10 text-success"
        />
        <StatCard
          title="Completed This Week"
          value={data.completed_week.toString()}
          icon={<TestTube className="w-6 h-6" />}
          iconClassName="bg-warning/10 text-warning"
        />
        <StatCard
          title="Total Uploaded"
          value={data.total_uploaded.toString()}
          icon={<Upload className="w-6 h-6" />}
          iconClassName="bg-accent text-accent-foreground"
        />
      </div>

      {/* Work Overview */}
      <div className="card-elevated p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Work Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-secondary/50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Tests</p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {data.pending_tests}
                </p>
              </div>
              <Clock className="w-12 h-12 text-primary/20" />
            </div>
          </div>
          <div className="p-4 bg-secondary/50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed Today</p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {data.completed_today}
                </p>
              </div>
              <CheckCircle className="w-12 h-12 text-success/20" />
            </div>
          </div>
        </div>
      </div>

      {/* Performance */}
      <div className="card-elevated p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Performance Metrics
        </h3>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">Completed Today</span>
              <span className="font-medium text-foreground">
                {data.completed_today} tests
              </span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-success rounded-full"
                style={{ width: "70%" }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">Completed This Week</span>
              <span className="font-medium text-foreground">
                {data.completed_week} tests
              </span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full"
                style={{ width: "85%" }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">Reports Uploaded</span>
              <span className="font-medium text-foreground">
                {data.total_uploaded} reports
              </span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-warning rounded-full"
                style={{ width: "60%" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
