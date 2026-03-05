import { useEffect, useState } from "react";
import { StatCard } from "@/components/dashboard/StatCard";
import { DollarSign, Package, TrendingUp, ShoppingCart } from "lucide-react";

interface PharmacistData {
  today_revenue: number;
  week_revenue: number;
  month_revenue: number;
  low_stock_count: number;
  total_medicines: number;
  recent_sales: Array<{
    name: string;
    total_sold: string;
  }>;
}

export function PharmacistDashboard() {
  const [data, setData] = useState<PharmacistData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          "http://localhost:5000/api/pharmacist/dashboard",
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
        console.error("Error fetching pharmacist data:", error);
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
          title="Total Medicines"
          value={data.total_medicines.toString()}
          icon={<Package className="w-6 h-6" />}
          iconClassName="bg-accent text-accent-foreground"
        />
      </div>

      {/* Inventory Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card-elevated p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Inventory Status
          </h2>
          <div className="space-y-4">
            <div className="p-4 bg-secondary/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Low Stock Items
                  </p>
                  <p className="text-3xl font-bold text-warning mt-1">
                    {data.low_stock_count}
                  </p>
                </div>
                <Package className="w-12 h-12 text-warning/20" />
              </div>
            </div>
            <div className="p-4 bg-secondary/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Medicines
                  </p>
                  <p className="text-3xl font-bold text-foreground mt-1">
                    {data.total_medicines}
                  </p>
                </div>
                <Package className="w-12 h-12 text-primary/20" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Sales */}
        <div className="card-elevated p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-success" />
            Recent Sales
          </h2>
          <div className="space-y-3">
            {data.recent_sales.length > 0 ? (
              data.recent_sales.map((sale, index) => (
                <div
                  key={index}
                  className="p-3 bg-secondary/50 rounded-lg flex items-center justify-between"
                >
                  <span className="text-sm text-foreground">{sale.name}</span>
                  <span className="text-sm font-semibold text-muted-foreground">
                    {sale.total_sold} sold
                  </span>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No recent sales
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Revenue Breakdown */}
      <div className="card-elevated p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Revenue Overview
        </h3>
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
    </div>
  );
}
