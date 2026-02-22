import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types/clinic";
import {
  LayoutDashboard,
  Users,
  Hospital,
  UserCog,
  Calendar,
  Stethoscope,
  FileText,
  Pill,
  TestTube,
  DollarSign,
  BarChart3,
  Settings,
  LogOut,
  Building2,
  ClipboardList,
  Bell,
  Package,
  CreditCard,
  UserPlus,
  ChevronDown,
  ChevronRight,
  Clock,
  Receipt,
  Shield,
  Database,
  Lock,
  User,
  Wallet,
  FlaskConical,
  Activity,
  CalendarDays,
  FileBarChart,
  BadgeDollarSign,
  Percent,
  Mail,
  MessageSquare,
  ScrollText,
  HardDrive,
  Link as LinkIcon,
  KeyRound,
  Search,
  Banknote,
  ListTodo,
  CalendarCheck,
  CalendarX,
  UserX,
  Layers,
  TrendingUp,
  Heart,
  FileHeart,
  FilePlus,
  Beaker,
  ClipboardCheck,
  FileSearch,
  FileClock,
  ShoppingCart,
  Truck,
  AlertTriangle,
  Boxes,
  RefreshCw,
  PiggyBank,
  Briefcase,
  UserCheck,
  Building,
  Contact,
  Fingerprint,
  CalendarClock,
  CalendarOff,
  Scale,
  Gift,
  Landmark,
  FileSpreadsheet,
  Calculator,
  MessageCircle,
  Send,
  MessagesSquare,
  Smartphone,
  Zap,
  PlusCircle,
  Tags,
  LineChart,
  PieChart,
  AreaChart,
  Cake,
  Info,
  AtSign,
  History,
  Megaphone,
  FolderTree,
  BedDouble,
  Table,
  X,
  Menu,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface NavGroup {
  label: string;
  icon: React.ElementType;
  items: NavItem[];
}

type NavConfig = (NavItem | NavGroup)[];

function isNavGroup(item: NavItem | NavGroup): item is NavGroup {
  return "items" in item;
}

const clinicAdminNav: NavConfig = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Users", href: "/users", icon: Users },
  {
    label: "Appointments",
    icon: Calendar,
    items: [
      { label: "All Appointments", href: "/appointments", icon: Calendar },
      {
        label: "Book Appointment",
        href: "/appointments/book",
        icon: CalendarDays,
      },
      {
        label: "Calendar View",
        href: "/appointments/calendar",
        icon: CalendarClock,
      },
    ],
  },

  {
    label: "Queue",
    icon: ListTodo,
    items: [
      { label: "Queue List", href: "/queue", icon: ListTodo },
      { label: "Token Generation", href: "/queue/token", icon: Ticket },
      { label: "Check-in", href: "/queue/checkin", icon: UserCheck },
      { label: "Call Patient", href: "/queue/call", icon: Megaphone },
    ],
  },

  {
    label: "Billing",
    icon: CreditCard,
    items: [
      { label: "Create Invoice", href: "/billing/create", icon: FilePlus },
      { label: "Invoices", href: "/billing/invoices", icon: Receipt },
      { label: "Payments", href: "/billing/payments", icon: Banknote },
      { label: "Pending", href: "/billing/pending", icon: Clock },
    ],
  },

  { label: "Pharmacy", href: "/pharmacy/medicines", icon: Pill },

  { label: "Lab Tests", href: "/lab/tests", icon: TestTube },

  { label: "Role Permissions", href: "/role-permissions", icon: Shield },

  { label: "Reports", href: "/reports", icon: BarChart3 },

  { label: "Clinic Profile", href: "/clinic/profile", icon: Building2 },
];

// Import Award icon (was missing)
import { Award, Pen, Star, Ban, FileCheck } from "lucide-react";

// Doctor Dashboard Nav Config
const doctorNav: NavConfig = [
  // Dashboard
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },

  // Appointments
  {
    label: "My Appointments",
    icon: Calendar,
    items: [
      {
        label: "Today's Appointments",
        href: "/appointments/today",
        icon: CalendarCheck,
      },
      {
        label: "Appointment Calendar",
        href: "/appointments/calendar",
        icon: CalendarClock,
      },
      {
        label: "All Appointments",
        href: "/appointments",
        icon: Calendar,
      },
    ],
  },

  // Patients
  {
    label: "My Patients",
    icon: Users,
    items: [
      { label: "Patient List", href: "/patients", icon: Users },
      { label: "Search Patient", href: "/patients/search", icon: Search },
    ],
  },

  // Reports
  {
    label: "Reports",
    icon: BarChart3,
    items: [{ label: "Reports Overview", href: "/reports", icon: BarChart3 }],
  },
];

// Receptionist Dashboard Nav Config
const receptionistNav: NavConfig = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  {
    label: "Patients",
    icon: Users,
    href: "/patients/register",
  },

  {
    label: "Appointments",
    icon: Calendar,
    items: [
      { label: "All Appointments", href: "/appointments", icon: Calendar },
      {
        label: "Book Appointment",
        href: "/appointments/book",
        icon: CalendarDays,
      },
      { label: "Today", href: "/appointments/today", icon: CalendarCheck },
      {
        label: "Calendar",
        href: "/appointments/calendar",
        icon: CalendarClock,
      },
      { label: "Manage", href: "/appointments/manage", icon: CalendarX },
    ],
  },

  {
    label: "Queue",
    icon: ListTodo,
    items: [
      { label: "Queue", href: "/queue", icon: ListTodo },
      { label: "Token", href: "/queue/token", icon: Ticket },
      { label: "Check-in", href: "/queue/checkin", icon: UserCheck },
      { label: "Call", href: "/queue/call", icon: Megaphone },
    ],
  },

  {
    label: "Billing",
    icon: CreditCard,
    items: [
      { label: "Create Invoice", href: "/billing/create", icon: FilePlus },
      { label: "Payments", href: "/billing/payments", icon: Banknote },
      { label: "History", href: "/billing/history", icon: History },
    ],
  },

  {
    label: "Communication",
    href: "/communication/reminders",
    icon: MessagesSquare,
  },

  { label: "Daily Reports", href: "/reports/daily", icon: BarChart3 },
];

// Import Ticket icon
import { Ticket } from "lucide-react";

const simpleNavItems: Record<
  Exclude<UserRole, "clinic_admin" | "doctor" | "receptionist">,
  NavItem[]
> = {
  super_admin: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Create Clinic", href: "/create/clinic", icon: Hospital },
    { label: "Clinic Management", href: "/Clinics", icon: Settings },
    { label: "Role Permissions", href: "/role-permissions", icon: UserCog },
  ],
  pharmacist: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Medicines", href: "/pharmacy/medicines", icon: Pill },
    { label: "Billing", href: "/billing/invoices", icon: CreditCard },
  ],
  lab_technician: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Lab Tests", href: "/lab/tests", icon: TestTube },
    { label: "Patients", href: "/patients", icon: Users },
  ],
  accountant: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Payments", href: "/billing/payments", icon: DollarSign },
    { label: "Invoices", href: "/billing/invoices", icon: CreditCard },
  ],
  patient: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Appointments", href: "/myappointments", icon: Calendar },
    { label: "Bills", href: "/mybills", icon: CreditCard },
  ],
};

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, role, logout } = useAuth();
  const location = useLocation();
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["Dashboard"]);

  if (!role) return null;

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) =>
      prev.includes(label) ? prev.filter((g) => g !== label) : [...prev, label],
    );
  };

  const getRoleDisplayName = (role: UserRole) => {
    const names: Record<UserRole, string> = {
      super_admin: "Super Admin",
      clinic_admin: "Clinic Admin",
      doctor: "Doctor",
      receptionist: "Receptionist",
      pharmacist: "Pharmacist",
      lab_technician: "Lab Technician",
      accountant: "Accountant",
      patient: "Patient",
    };
    return names[role];
  };

  const isActive = (href: string) => {
    if (href.includes("?")) {
      return location.pathname + location.search === href;
    }
    return location.pathname === href;
  };

  const isGroupActive = (items: NavItem[]) => {
    return items.some((item) => isActive(item.href));
  };

  const handleNavClick = () => {
    // Close sidebar on mobile when clicking a link
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const renderNavItem = (item: NavItem) => {
    const Icon = item.icon;
    const active = isActive(item.href);
    return (
      <Link
        key={item.href}
        to={item.href}
        onClick={handleNavClick}
        className={cn("sidebar-item", active && "sidebar-item-active")}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        <span className="truncate">{item.label}</span>
      </Link>
    );
  };

  const renderNavGroup = (group: NavGroup) => {
    const Icon = group.icon;
    const isExpanded = expandedGroups.includes(group.label);
    const groupActive = isGroupActive(group.items);

    return (
      <div key={group.label}>
        <button
          onClick={() => toggleGroup(group.label)}
          className={cn(
            "sidebar-item w-full justify-between",
            groupActive && "text-sidebar-primary",
          )}
        >
          <div className="flex items-center gap-3 min-w-0">
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span className="truncate">{group.label}</span>
          </div>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 flex-shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 flex-shrink-0" />
          )}
        </button>
        {isExpanded && (
          <div className="ml-4 mt-1 space-y-0.5 border-l border-sidebar-border pl-3">
            {group.items.map((item) => {
              const ItemIcon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={handleNavClick}
                  className={cn(
                    "sidebar-item text-sm py-2",
                    active && "sidebar-item-active",
                  )}
                >
                  <ItemIcon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const navConfig: NavConfig =
    role === "clinic_admin"
      ? clinicAdminNav
      : role === "doctor"
        ? doctorNav
        : role === "receptionist"
          ? receptionistNav
          : simpleNavItems[role];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen bg-sidebar flex flex-col border-r border-sidebar-border z-50 transition-transform duration-300 ease-in-out",
          "w-72 lg:w-64",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Logo */}
        <div className="p-4 lg:p-6 border-b border-sidebar-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
              <Stethoscope className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-sidebar-foreground truncate">
                City Care
              </h1>
              <p className="text-xs text-sidebar-foreground/60 truncate">
                Clinic Management
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="lg:hidden text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-medium text-sidebar-primary">
                {user?.full_name.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user?.full_name}
              </p>
              <p className="text-xs text-sidebar-foreground/60 truncate">
                {getRoleDisplayName(role)}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1">
          <nav className="p-3 lg:p-4 space-y-0.5">
            {navConfig.map((item) =>
              isNavGroup(item) ? renderNavGroup(item) : renderNavItem(item),
            )}
          </nav>
        </ScrollArea>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-sidebar-border space-y-1">
          <Link to="/profile" onClick={handleNavClick} className="sidebar-item">
            <User className="w-5 h-5 flex-shrink-0" />
            <span>My Profile</span>
          </Link>
          <Link
            to="/profile/password"
            onClick={handleNavClick}
            className="sidebar-item"
          >
            <KeyRound className="w-5 h-5 flex-shrink-0" />
            <span>Change Password</span>
          </Link>
          <button
            onClick={() => {
              logout();
              handleNavClick();
            }}
            className="sidebar-item w-full text-left hover:text-destructive"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
