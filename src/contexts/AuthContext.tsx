import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, UserRole } from "@/types/clinic";

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore auth state from localStorage on mount
  useEffect(() => {
    const restoreAuth = () => {
      try {
        const token = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");
        const savedRole = localStorage.getItem("role");

        if (token && savedUser && savedRole) {
          setUser(JSON.parse(savedUser));
          setRole(savedRole as UserRole);
        }
      } catch (error) {
        console.error("Failed to restore auth state:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("role");
      } finally {
        setIsLoading(false);
      }
    };

    restoreAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Invalid credentials");
      }

      const responseData = await response.json();

      // Handle nested response structure: response.data contains { token, user }
      const { token, user } = responseData.data;

      if (!user || !user.role) {
        throw new Error("Invalid response from server");
      }

      // Set user and role from API response
      setUser(user);
      setRole(user.role as UserRole);

      // Store JWT token and user data for persistence
      if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("role", user.role);
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
  };

  return (
    <AuthContext.Provider
      value={{ user, role, isAuthenticated: !!user, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
