import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";

// ── Types ──────────────────────────────────────────────────────────
export interface SaasUser {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SignupData {
  full_name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface SigninData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    user: SaasUser;
  };
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface SaasAuthContextType {
  user: SaasUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Auth methods
  signup: (data: SignupData) => Promise<void>;
  signin: (data: SigninData) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;

  // Helper methods
  isTokenExpired: () => boolean;
  refreshToken: () => Promise<void>;
}

// ── Constants ──────────────────────────────────────────────────────
const API_BASE_URL = "http://localhost:5000/api/auth";
const TOKEN_KEY = "saas_auth_token";
const USER_KEY = "saas_auth_user";
const TOKEN_EXPIRY_KEY = "saas_token_expiry";

// ── Context ───────────────────────────────��────────────────────────
const SaasAuthContext = createContext<SaasAuthContextType | undefined>(
  undefined,
);

export function SaasAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SaasUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Initialize auth state from storage ──────────────────────────
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);
        const tokenExpiry = localStorage.getItem(TOKEN_EXPIRY_KEY);

        if (storedToken && storedUser && tokenExpiry) {
          const expiryTime = parseInt(tokenExpiry, 10);
          const now = Date.now();

          // Check if token is expired
          if (now < expiryTime) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
          } else {
            // Token expired, clear storage
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            localStorage.removeItem(TOKEN_EXPIRY_KEY);
          }
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error);
        // Clear potentially corrupted data
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(TOKEN_EXPIRY_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // ── Check if token is expired ──────────────────────────────────
  const isTokenExpired = useCallback(() => {
    const tokenExpiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
    if (!tokenExpiry) return true;

    const expiryTime = parseInt(tokenExpiry, 10);
    return Date.now() >= expiryTime;
  }, []);

  // ── Refresh token (optional for future use) ────────────────────
  const refreshToken = useCallback(async () => {
    try {
      const currentToken = localStorage.getItem(TOKEN_KEY);
      if (!currentToken) throw new Error("No token to refresh");

      const response = await fetch(`${API_BASE_URL}/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Token refresh failed");
      }

      const data: AuthResponse = await response.json();
      if (data.data?.token) {
        const newToken = data.data.token;
        setToken(newToken);
        localStorage.setItem(TOKEN_KEY, newToken);

        // Set expiry to 24 hours from now (adjust based on your backend)
        const expiryTime = Date.now() + 24 * 60 * 60 * 1000;
        localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
      // Logout on refresh failure
      await logout();
    }
  }, []);

  // ── Sign Up ─────────────���──────────────────────────────────────
  const signup = useCallback(async (data: SignupData) => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const responseData: AuthResponse = await response.json();

      if (!response.ok) {
        const errorMessage =
          responseData.errors?.[0]?.message ||
          responseData.message ||
          "Signup failed";
        setError(errorMessage);
        throw new Error(errorMessage);
      }

      // Extract token and user from response
      const { token: newToken, user: newUser } = responseData.data || {};

      if (!newToken || !newUser) {
        throw new Error("Invalid response from server");
      }

      // Store in localStorage
      setToken(newToken);
      setUser(newUser);
      localStorage.setItem(TOKEN_KEY, newToken);
      localStorage.setItem(USER_KEY, JSON.stringify(newUser));

      // Set token expiry to 24 hours from now
      const expiryTime = Date.now() + 24 * 60 * 60 * 1000;
      localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred during signup";
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Sign In ────────────────────────────────────────────────────
  const signin = useCallback(async (data: SigninData) => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const responseData: AuthResponse = await response.json();

      if (!response.ok) {
        const errorMessage =
          responseData.errors?.[0]?.message ||
          responseData.message ||
          "Signin failed";
        setError(errorMessage);
        throw new Error(errorMessage);
      }

      // Extract token and user from response
      const { token: newToken, user: newUser } = responseData.data || {};

      if (!newToken || !newUser) {
        throw new Error("Invalid response from server");
      }

      // Store in localStorage
      setToken(newToken);
      setUser(newUser);
      localStorage.setItem(TOKEN_KEY, newToken);
      localStorage.setItem(USER_KEY, JSON.stringify(newUser));

      // Set token expiry to 24 hours from now
      const expiryTime = Date.now() + 24 * 60 * 60 * 1000;
      localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred during signin";
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Logout ─────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    setIsLoading(true);

    try {
      const currentToken = localStorage.getItem(TOKEN_KEY);

      // Call logout API if token exists
      if (currentToken) {
        try {
          await fetch(`${API_BASE_URL}/logout`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${currentToken}`,
            },
          });
        } catch (apiError) {
          console.warn(
            "Logout API call failed, clearing local state anyway",
            apiError,
          );
        }
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear state and storage regardless
      setUser(null);
      setToken(null);
      setError(null);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(TOKEN_EXPIRY_KEY);
      setIsLoading(false);
    }
  }, []);

  // ── Clear Error ────────────────────────────────────────────────
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: SaasAuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    error,
    signup,
    signin,
    logout,
    clearError,
    isTokenExpired,
    refreshToken,
  };

  return (
    <SaasAuthContext.Provider value={value}>
      {children}
    </SaasAuthContext.Provider>
  );
}

// ── Hook to use auth context ───────────────────────────────────────
export function useSaasAuth() {
  const context = useContext(SaasAuthContext);
  if (context === undefined) {
    throw new Error("useSaasAuth must be used within SaasAuthProvider");
  }
  return context;
}

// ── Optional: HOC for protecting routes ────────────────────────────
export function withAuthRequired<P extends object>(
  Component: React.ComponentType<P>,
) {
  return function ProtectedComponent(props: P) {
    const { isAuthenticated, isLoading } = useSaasAuth();

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin">Loading...</div>
        </div>
      );
    }

    if (!isAuthenticated) {
      window.location.href = "/signin";
      return null;
    }

    return <Component {...props} />;
  };
}
