import { ReactNode, useState } from "react";
import { Navigate, Route, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Sidebar } from "./Sidebar";
import { Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import NotificationDialog from "../dashboard/NotificationDialog";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isAuthenticated, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:ml-64 min-h-screen flex flex-col">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="flex items-center justify-between px-4 lg:px-6 py-3 lg:py-4">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </Button>

            {/* Empty div for spacing on mobile */}
            <div className="lg:hidden" />

            <div className="flex items-center gap-2 lg:gap-3 ml-auto">
              <NotificationDialog />

              {/* Profile Icon */}
              <div
                className="flex items-center gap-3 pl-3 border-l border-border cursor-pointer"
                onClick={() => navigate("/profile")}
              >
                <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-foreground">
                    {user?.full_name?.charAt(0) || "U"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
