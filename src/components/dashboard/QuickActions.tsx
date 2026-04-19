import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types/clinic";
import {
  UserPlus,
  Calendar,
  FileText,
  Pill,
  TestTube,
  CreditCard,
  ClipboardList,
  Users,
  History,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickAction {
  label: string;
  href: string;
  icon: React.ElementType;
  color: string;
}

const roleQuickActions: Record<UserRole, QuickAction[]> = {
  super_admin: [
    {
      label: "View Reports",
      href: "/reports",
      icon: FileText,
      color: "bg-success/10 text-success",
    },
  ],
  clinic_admin: [
    {
      label: "Add Doctor",
      href: "/doctors",
      icon: UserPlus,
      color: "bg-primary/10 text-primary",
    },
    {
      label: "View Reports",
      href: "/reports",
      icon: FileText,
      color: "bg-warning/10 text-warning",
    },
  ],
  doctor: [
    {
      label: "View Schedule",
      href: "/appointments",
      icon: Calendar,
      color: "bg-warning/10 text-warning",
    },
  ],
  receptionist: [
    {
      label: "Register Patient",
      href: "/patients",
      icon: UserPlus,
      color: "bg-primary/10 text-primary",
    },
    {
      label: "Book Appointment",
      href: "/appointments",
      icon: Calendar,
      color: "bg-success/10 text-success",
    },
    {
      label: "Generate Bill",
      href: "/billing/create",
      icon: CreditCard,
      color: "bg-warning/10 text-warning",
    },
  ],
  pharmacist: [
    {
      label: "Create Bill",
      href: "/billing/create",
      icon: Pill,
      color: "bg-primary/10 text-primary",
    },
  ],
  lab_technician: [
    {
      label: "New Test",
      href: "/lab/tests",
      icon: TestTube,
      color: "bg-primary/10 text-primary",
    },
    {
      label: "Upload Results",
      href: "/reports/daily",
      icon: FileText,
      color: "bg-success/10 text-success",
    },
  ],
  accountant: [
    {
      label: "Record Payment",
      href: "/billing/create",
      icon: CreditCard,
      color: "bg-primary/10 text-primary",
    },
    {
      label: "Generate Report",
      href: "/reports/new",
      icon: FileText,
      color: "bg-success/10 text-success",
    },
  ],
  patient: [
    {
      label: "Book Appointment",
      href: "/appointments",
      icon: Calendar,
      color: "bg-primary/10 text-primary",
    },
    {
      label: "View Records",
      href: "/reports/daily",
      icon: FileText,
      color: "bg-success/10 text-success",
    },
  ],
};

export function QuickActions() {
  const { role } = useAuth();

  if (!role) return null;

  const actions = roleQuickActions[role];

  return (
    <div className="card-elevated p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Quick Actions
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              to={action.href}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors duration-200 group"
            >
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                  action.color,
                )}
              >
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium text-foreground text-center">
                {action.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
