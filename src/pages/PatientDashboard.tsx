import { useEffect, useState } from "react";
import { Calendar, FileText, DollarSign, Clock } from "lucide-react";

interface PatientData {
  upcoming_appointments: Array<{
    id: string;
    appointment_date: string;
    appointment_time: string;
    reason: string;
    doctor_name: string;
    specialization: string;
    clinic_name: string;
    status: string;
  }>;
  recent_lab_reports: [];
  recent_bills: Array<{
    id: string;
    bill_number: string;
    total_amount: string;
    paid_amount: string;
    status: string;
    created_at: string;
    bill_type: string;
  }>;
}

export function PatientDashboard() {
  const [data, setData] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          "http://localhost:5000/api/role/dashboard",
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
        console.error("Error fetching patient data:", error);
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
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-elevated p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Upcoming</p>
              <p className="text-2xl font-bold text-foreground">
                {data.upcoming_appointments.length}
              </p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
              <FileText className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Lab Reports</p>
              <p className="text-2xl font-bold text-foreground">
                {data.recent_lab_reports.length}
              </p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bills</p>
              <p className="text-2xl font-bold text-foreground">
                {data.recent_bills.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div className="card-elevated p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Upcoming Appointments
        </h2>
        <div className="space-y-3">
          {data.upcoming_appointments.length > 0 ? (
            data.upcoming_appointments.map((appointment, index) => (
              <div
                key={appointment.id}
                className="p-4 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">
                      {appointment.doctor_name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {appointment.specialization}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {appointment.reason}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {new Date(
                          appointment.appointment_date,
                        ).toLocaleDateString()}{" "}
                        at {appointment.appointment_time}
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          appointment.status === "approved"
                            ? "bg-success/10 text-success"
                            : "bg-warning/10 text-warning"
                        }`}
                      >
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No upcoming appointments
            </p>
          )}
        </div>
      </div>

      {/* Recent Bills */}
      <div className="card-elevated p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-warning" />
          Recent Bills
        </h2>
        <div className="space-y-3">
          {data.recent_bills.length > 0 ? (
            data.recent_bills.map((bill, index) => (
              <div
                key={bill.id}
                className="p-4 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">
                      {bill.bill_number}
                    </p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {bill.bill_type}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(bill.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground">
                      ${bill.total_amount}
                    </p>
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-medium mt-1 ${
                        bill.status === "paid"
                          ? "bg-success/10 text-success"
                          : "bg-warning/10 text-warning"
                      }`}
                    >
                      {bill.status}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No recent bills
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
