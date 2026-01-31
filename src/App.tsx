import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/patients/register" element={<Patients />} />
            <Route path="/patients/search" element={<Patients />} />
            <Route path="/appointments" element={<AllAppointments />} />
            <Route path="/appointments/book" element={<BookAppointment />} />
            <Route path="/appointments/today" element={<TodaysAppointments />} />
            <Route path="/appointments/calendar" element={<AppointmentCalendar />} />
            <Route path="/appointments/manage" element={<ManageAppointments />} />
            <Route path="/queue" element={<Queue />} />
            <Route path="/queue/token" element={<TokenGeneration />} />
            <Route path="/queue/checkin" element={<CheckIn />} />
            <Route path="/queue/call" element={<Queue />} />
            <Route path="/billing/create" element={<CreateInvoice />} />
            <Route path="/billing/payments" element={<BillingInvoices />} />
            <Route path="/billing/history" element={<BillingInvoices />} />
            <Route path="/billing/pending" element={<BillingInvoices />} />
            <Route path="/billing/receipt" element={<BillingInvoices />} />
            <Route path="/communication/reminders" element={<Communication />} />
            <Route path="/communication/notifications" element={<Communication />} />
            <Route path="/communication/history" element={<Communication />} />
            <Route path="/reports/daily" element={<DailyReports />} />
            <Route path="/reports/appointments" element={<DailyReports />} />
            <Route path="/reports/registrations" element={<DailyReports />} />
            <Route path="/reports/payments" element={<DailyReports />} />
            <Route path="/role-permissions" element={<RolePermissions />} />
            <Route path="/profile" element={<ViewProfile />} />
            <Route path="/profile/password" element={<ChangePassword />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/reports/:type" element={<Reports />} />
            <Route path="/clinic/profile" element={<ClinicProfile />} />
            <Route path="/pharmacy/medicines" element={<PharmacyMedicines />} />
            <Route path="/billing/invoices" element={<BillingInvoices />} />
            <Route path="/lab/tests" element={<LabTests />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;