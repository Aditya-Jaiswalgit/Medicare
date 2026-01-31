import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '@/types/clinic';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user for demo purposes
const mockUsers: Record<UserRole, User> = {
  super_admin: {
    user_id: '1',
    role_id: '1',
    full_name: 'Super Admin',
    username: 'superadmin',
    email: 'admin@clinic.com',
    phone: '+1234567890',
    status: 'Active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  clinic_admin: {
    user_id: '2',
    role_id: '2',
    full_name: 'Clinic Administrator',
    username: 'clinicadmin',
    email: 'clinic@clinic.com',
    phone: '+1234567890',
    status: 'Active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  doctor: {
    user_id: '3',
    role_id: '3',
    full_name: 'Dr. Sarah Johnson',
    username: 'dr.sarah',
    email: 'doctor@clinic.com',
    phone: '+1234567890',
    status: 'Active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  receptionist: {
    user_id: '4',
    role_id: '4',
    full_name: 'Emily Davis',
    username: 'emily.d',
    email: 'reception@clinic.com',
    phone: '+1234567890',
    status: 'Active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  pharmacist: {
    user_id: '5',
    role_id: '5',
    full_name: 'Michael Chen',
    username: 'michael.c',
    email: 'pharmacy@clinic.com',
    phone: '+1234567890',
    status: 'Active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  lab_technician: {
    user_id: '6',
    role_id: '6',
    full_name: 'Lisa Wilson',
    username: 'lisa.w',
    email: 'lab@clinic.com',
    phone: '+1234567890',
    status: 'Active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  accountant: {
    user_id: '7',
    role_id: '7',
    full_name: 'Robert Taylor',
    username: 'robert.t',
    email: 'accounts@clinic.com',
    phone: '+1234567890',
    status: 'Active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  patient: {
    user_id: '8',
    role_id: '8',
    full_name: 'John Smith',
    username: 'john.s',
    email: 'patient@example.com',
    phone: '+1234567890',
    status: 'Active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);

  const login = async (email: string, password: string, selectedRole: UserRole) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const mockUser = mockUsers[selectedRole];
    setUser(mockUser);
    setRole(selectedRole);
  };

  const logout = () => {
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
