import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Doctors from "./pages/Doctors";
import Patients from "./pages/Patients";
import Appointments from "./pages/Appointments";
import RolePermissions from "./pages/RolePermissions";
import Reports from "./pages/Reports";
import ClinicProfile from "./pages/clinic/Profile";
import PharmacyMedicines from "./pages/pharmacy/Medicines";
import BillingInvoices from "./pages/billing/Invoices";
import CreateInvoice from "./pages/billing/CreateInvoice";
import LabTests from "./pages/lab/Tests";
import NotFound from "./pages/NotFound";
// Profile pages
import ViewProfile from "./pages/profile/ViewProfile";
import ChangePassword from "./pages/profile/ChangePassword";
// Receptionist pages
import Queue from "./pages/receptionist/Queue";
import TokenGeneration from "./pages/receptionist/TokenGeneration";
import CheckIn from "./pages/receptionist/CheckIn";
import Communication from "./pages/receptionist/Communication";
import DailyReports from "./pages/receptionist/DailyReports";
import AppointmentCalendar from "./pages/receptionist/AppointmentCalendar";
import ManageAppointments from "./pages/receptionist/ManageAppointments";
import BookAppointment from "./pages/receptionist/BookAppointment";
import TodaysAppointments from "./pages/receptionist/TodaysAppointments";
import AllAppointments from "./pages/receptionist/AllAppointments";

import { useLocation } from "react-router-dom";
import CreateClinic from "./components/users/CreateClinic";
import Clinics from "./pages/Clinics";

const queryClient = new QueryClient();

// Loading component
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

// Protected Route wrapper component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Public Route wrapper (for login page)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Routes component (needs to be inside AuthProvider to use useAuth)
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Index />} />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <Users />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctors"
        element={
          <ProtectedRoute>
            <Doctors />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patients"
        element={
          <ProtectedRoute>
            <Patients />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patients/register"
        element={
          <ProtectedRoute>
            <Patients />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patients/search"
        element={
          <ProtectedRoute>
            <Patients />
          </ProtectedRoute>
        }
      />
      <Route
        path="/appointments"
        element={
          <ProtectedRoute>
            <AllAppointments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/appointments/book"
        element={
          <ProtectedRoute>
            <BookAppointment />
          </ProtectedRoute>
        }
      />
      <Route
        path="/appointments/today"
        element={
          <ProtectedRoute>
            <TodaysAppointments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/appointments/calendar"
        element={
          <ProtectedRoute>
            <AppointmentCalendar />
          </ProtectedRoute>
        }
      />
      <Route
        path="/appointments/manage"
        element={
          <ProtectedRoute>
            <ManageAppointments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/queue"
        element={
          <ProtectedRoute>
            <Queue />
          </ProtectedRoute>
        }
      />
      <Route
        path="/queue/token"
        element={
          <ProtectedRoute>
            <TokenGeneration />
          </ProtectedRoute>
        }
      />
      <Route
        path="/queue/checkin"
        element={
          <ProtectedRoute>
            <CheckIn />
          </ProtectedRoute>
        }
      />
      <Route
        path="/queue/call"
        element={
          <ProtectedRoute>
            <Queue />
          </ProtectedRoute>
        }
      />
      <Route
        path="/billing/create"
        element={
          <ProtectedRoute>
            <CreateInvoice />
          </ProtectedRoute>
        }
      />
      <Route
        path="/billing/payments"
        element={
          <ProtectedRoute>
            <BillingInvoices />
          </ProtectedRoute>
        }
      />
      <Route
        path="/billing/history"
        element={
          <ProtectedRoute>
            <BillingInvoices />
          </ProtectedRoute>
        }
      />
      <Route
        path="/billing/pending"
        element={
          <ProtectedRoute>
            <BillingInvoices />
          </ProtectedRoute>
        }
      />
      <Route
        path="/billing/receipt"
        element={
          <ProtectedRoute>
            <BillingInvoices />
          </ProtectedRoute>
        }
      />
      <Route
        path="/billing/invoices"
        element={
          <ProtectedRoute>
            <BillingInvoices />
          </ProtectedRoute>
        }
      />
      <Route
        path="/communication/reminders"
        element={
          <ProtectedRoute>
            <Communication />
          </ProtectedRoute>
        }
      />
      <Route
        path="/communication/notifications"
        element={
          <ProtectedRoute>
            <Communication />
          </ProtectedRoute>
        }
      />
      <Route
        path="/communication/history"
        element={
          <ProtectedRoute>
            <Communication />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports/daily"
        element={
          <ProtectedRoute>
            <DailyReports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports/appointments"
        element={
          <ProtectedRoute>
            <DailyReports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports/registrations"
        element={
          <ProtectedRoute>
            <DailyReports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports/payments"
        element={
          <ProtectedRoute>
            <DailyReports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/role-permissions"
        element={
          <ProtectedRoute>
            <RolePermissions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ViewProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/password"
        element={
          <ProtectedRoute>
            <ChangePassword />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports/:type"
        element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clinic/profile"
        element={
          <ProtectedRoute>
            <ClinicProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pharmacy/medicines"
        element={
          <ProtectedRoute>
            <PharmacyMedicines />
          </ProtectedRoute>
        }
      />
      <Route
        path="/lab/tests"
        element={
          <ProtectedRoute>
            <LabTests />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create/Clinic"
        element={
          <ProtectedRoute>
            <CreateClinic />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clinics"
        element={
          <ProtectedRoute>
            <Clinics />
          </ProtectedRoute>
        }
      />

      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
