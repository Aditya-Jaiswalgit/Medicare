export type UserRole = 'super_admin' | 'clinic_admin' | 'doctor' | 'receptionist' | 'pharmacist' | 'lab_technician' | 'accountant' | 'patient';

export type UserStatus = 'Active' | 'Inactive';
export type Gender = 'Male' | 'Female' | 'Other';
export type AvailabilityStatus = 'Available' | 'Unavailable';
export type AppointmentStatus = 'Scheduled' | 'Completed' | 'Cancelled';
export type PaymentStatus = 'Paid' | 'Unpaid' | 'Partial';
export type PaymentMode = 'Cash' | 'Card' | 'UPI' | 'Online';
export type TransactionType = 'IN' | 'OUT';
export type NotificationType = 'SMS' | 'Email' | 'App';
export type BillItemType = 'Consultation' | 'Medicine' | 'LabTest';

export interface User {
  user_id: string;
  role_id: string;
  full_name: string;
  username: string;
  email: string;
  phone?: string;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

export interface Role {
  role_id: string;
  role_name: UserRole;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Patient {
  patient_id: string;
  user_id: string;
  full_name: string;
  gender: Gender;
  date_of_birth: string;
  contact_number: string;
  address?: string;
  blood_group?: string;
  created_at: string;
  updated_at: string;
}

export interface Doctor {
  doctor_id: string;
  user_id: string;
  specialization: string;
  qualification: string;
  consultation_fee: number;
  availability_status: AvailabilityStatus;
  created_at: string;
  updated_at: string;
  full_name?: string;
}

export interface Appointment {
  appointment_id: string;
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  appointment_time: string;
  status: AppointmentStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
  patient?: Patient;
  doctor?: Doctor;
}

export interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  availableDoctors: number;
  pendingBills: number;
  todayRevenue: number;
  weeklyGrowth: number;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  href: string;
  color?: string;
}
