import { useEffect, useState } from "react";
import { StatCard } from "@/components/dashboard/StatCard";
import { DollarSign, TrendingUp, FileText, AlertCircle } from "lucide-react";

interface AccountantData {
  today_revenue: number;
  week_revenue: number;
  month_revenue: number;
  bills_generated: number;
  pending_payments: number;
  revenue_breakdown: {
    treatment: number;
    medicine: number;
  };
}

export function AccountantDashboard() {
  const [data, setData] = useState<AccountantData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          "http://localhost:5000/api/accountant/dashboard",
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
        console.error("Error fetching accountant data:", error);
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
          title="Today's Revenue"
          value={`$${data.today_revenue}`}
          icon={<DollarSign className="w-6 h-6" />}
          iconClassName="bg-primary/10 text-primary"
        />
        <StatCard
          title="Week Revenue"
          value={`$${data.week_revenue}`}
          icon={<TrendingUp className="w-6 h-6" />}
          iconClassName="bg-success/10 text-success"
        />
        <StatCard
          title="Month Revenue"
          value={`$${data.month_revenue}`}
          icon={<DollarSign className="w-6 h-6" />}
          iconClassName="bg-warning/10 text-warning"
        />
        <StatCard
          title="Pending Payments"
          value={data.pending_payments.toString()}
          icon={<AlertCircle className="w-6 h-6" />}
          iconClassName="bg-accent text-accent-foreground"
        />
      </div>

      {/* Revenue Overview */}
      <div className="card-elevated p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Revenue Overview
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-secondary/50 rounded-lg">
            <p className="text-2xl font-bold text-foreground">
              ${data.today_revenue}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Today</p>
          </div>
          <div className="text-center p-4 bg-secondary/50 rounded-lg">
            <p className="text-2xl font-bold text-foreground">
              ${data.week_revenue}
            </p>
            <p className="text-sm text-muted-foreground mt-1">This Week</p>
          </div>
          <div className="text-center p-4 bg-secondary/50 rounded-lg">
            <p className="text-2xl font-bold text-foreground">
              ${data.month_revenue}
            </p>
            <p className="text-sm text-muted-foreground mt-1">This Month</p>
          </div>
        </div>
      </div>

      {/* Revenue Breakdown & Bills */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Revenue Breakdown */}
        <div className="card-elevated p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Revenue Breakdown
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-secondary/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  Treatment Revenue
                </span>
                <span className="font-semibold text-foreground">
                  ${data.revenue_breakdown.treatment}
                </span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{
                    width: `${(data.revenue_breakdown.treatment / (data.revenue_breakdown.treatment + data.revenue_breakdown.medicine)) * 100 || 0}%`,
                  }}
                />
              </div>
            </div>
            <div className="p-4 bg-secondary/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  Medicine Revenue
                </span>
                <span className="font-semibold text-foreground">
                  ${data.revenue_breakdown.medicine}
                </span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-success rounded-full"
                  style={{
                    width: `${(data.revenue_breakdown.medicine / (data.revenue_breakdown.treatment + data.revenue_breakdown.medicine)) * 100 || 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bills Status */}
        <div className="card-elevated p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Bills Status
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-secondary/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Bills Generated
                  </p>
                  <p className="text-3xl font-bold text-foreground mt-1">
                    {data.bills_generated}
                  </p>
                </div>
                <FileText className="w-12 h-12 text-primary/20" />
              </div>
            </div>
            <div className="p-4 bg-secondary/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Pending Payments
                  </p>
                  <p className="text-3xl font-bold text-warning mt-1">
                    {data.pending_payments}
                  </p>
                </div>
                <AlertCircle className="w-12 h-12 text-warning/20" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
