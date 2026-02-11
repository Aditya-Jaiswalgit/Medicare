import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types/clinic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Stethoscope,
  Mail,
  Lock,
  ArrowRight,
  Shield,
  Users,
  UserCog,
  Pill,
  TestTube,
  DollarSign,
  User,
} from "lucide-react";

const roles: { value: UserRole; label: string; icon: React.ElementType }[] = [
  { value: "super_admin", label: "Super Admin", icon: UserCog },
  { value: "clinic_admin", label: "Clinic Admin", icon: UserCog },
  { value: "doctor", label: "Doctor", icon: Stethoscope },
  { value: "receptionist", label: "Receptionist", icon: Users },
  { value: "pharmacist", label: "Pharmacist", icon: Pill },
  { value: "lab_technician", label: "Lab Technician", icon: TestTube },
  { value: "accountant", label: "Accountant", icon: DollarSign },
  { value: "patient", label: "Patient", icon: User },
];

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("patient");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    setIsLoading(true);

    try {
      await login(email, password, role);
      if (role === "clinic_admin") navigate("/users");
      else navigate("/dashboard");
    } catch (err) {
      setError("Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(45,212,191,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(45,212,191,0.1),transparent_50%)]" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">MediCare</h1>
              <p className="text-sm text-white/60">Clinic Management System</p>
            </div>
          </div>

          <div className="space-y-8 animate-fade-in">
            <div>
              <h2 className="text-4xl font-bold text-white leading-tight">
                Streamline Your
                <br />
                <span className="text-gradient">Healthcare Practice</span>
              </h2>
              <p className="text-lg text-white/70 mt-4 max-w-md">
                Manage appointments, patients, prescriptions, and billing all in
                one place.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-md">
              {[
                { icon: Users, label: "Patient Management" },
                { icon: Stethoscope, label: "EMR System" },
                { icon: DollarSign, label: "Billing & Invoicing" },
                { icon: Shield, label: "Secure & HIPAA" },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <feature.icon className="w-5 h-5 text-primary" />
                  <span className="text-sm text-white/80">{feature.label}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-sm text-white/40">
            © 2024 MediCare. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8 animate-slide-up">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">MediCare</h1>
              <p className="text-sm text-muted-foreground">Clinic Management</p>
            </div>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-foreground">Welcome back</h2>
            <p className="text-muted-foreground mt-2">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role">Login as</Label>
                <Select
                  value={role}
                  onValueChange={(value) => setRole(value as UserRole)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        <div className="flex items-center gap-2">
                          <r.icon className="w-4 h-4" />
                          <span>{r.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <a href="#" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              variant="gradient"
              size="xl"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Demo: Select any role and click Sign In
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
