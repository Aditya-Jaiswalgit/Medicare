import { UserRole } from '@/types/clinic';

export type Module = 
  | 'dashboard'
  | 'users'
  | 'tenants'
  | 'doctors'
  | 'patients'
  | 'appointments'
  | 'emr'
  | 'prescriptions'
  | 'medicines'
  | 'inventory'
  | 'lab_tests'
  | 'billing'
  | 'payments'
  | 'reports'
  | 'settings'
  | 'notifications';

export type Permission = 'view' | 'create' | 'update' | 'delete';

export interface ModulePermissions {
  view: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
}

export type RolePermissions = Record<Module, ModulePermissions>;

// Define fixed permissions for each role
export const rolePermissions: Record<UserRole, RolePermissions> = {
  super_admin: {
    dashboard: { view: true, create: true, update: true, delete: true },
    users: { view: true, create: true, update: true, delete: true },
    tenants: { view: true, create: true, update: true, delete: true },
    doctors: { view: true, create: true, update: true, delete: true },
    patients: { view: true, create: true, update: true, delete: true },
    appointments: { view: true, create: true, update: true, delete: true },
    emr: { view: true, create: true, update: true, delete: true },
    prescriptions: { view: true, create: true, update: true, delete: true },
    medicines: { view: true, create: true, update: true, delete: true },
    inventory: { view: true, create: true, update: true, delete: true },
    lab_tests: { view: true, create: true, update: true, delete: true },
    billing: { view: true, create: true, update: true, delete: true },
    payments: { view: true, create: true, update: true, delete: true },
    reports: { view: true, create: true, update: true, delete: true },
    settings: { view: true, create: true, update: true, delete: true },
    notifications: { view: true, create: true, update: true, delete: true },
  },
  clinic_admin: {
    dashboard: { view: true, create: false, update: false, delete: false },
    users: { view: true, create: true, update: true, delete: true },
    tenants: { view: false, create: false, update: false, delete: false },
    doctors: { view: true, create: true, update: true, delete: true },
    patients: { view: true, create: true, update: true, delete: true },
    appointments: { view: true, create: true, update: true, delete: true },
    emr: { view: true, create: false, update: false, delete: false },
    prescriptions: { view: true, create: false, update: false, delete: false },
    medicines: { view: true, create: true, update: true, delete: true },
    inventory: { view: true, create: true, update: true, delete: true },
    lab_tests: { view: true, create: true, update: true, delete: true },
    billing: { view: true, create: true, update: true, delete: true },
    payments: { view: true, create: true, update: true, delete: true },
    reports: { view: true, create: true, update: false, delete: false },
    settings: { view: true, create: true, update: true, delete: false },
    notifications: { view: true, create: true, update: true, delete: true },
  },
  doctor: {
    dashboard: { view: true, create: false, update: false, delete: false },
    users: { view: false, create: false, update: false, delete: false },
    tenants: { view: false, create: false, update: false, delete: false },
    doctors: { view: true, create: false, update: false, delete: false },
    patients: { view: true, create: false, update: true, delete: false },
    appointments: { view: true, create: false, update: true, delete: false },
    emr: { view: true, create: true, update: true, delete: false },
    prescriptions: { view: true, create: true, update: true, delete: false },
    medicines: { view: true, create: false, update: false, delete: false },
    inventory: { view: false, create: false, update: false, delete: false },
    lab_tests: { view: true, create: true, update: false, delete: false },
    billing: { view: false, create: false, update: false, delete: false },
    payments: { view: false, create: false, update: false, delete: false },
    reports: { view: true, create: false, update: false, delete: false },
    settings: { view: true, create: false, update: true, delete: false },
    notifications: { view: true, create: false, update: true, delete: true },
  },
  receptionist: {
    dashboard: { view: true, create: false, update: false, delete: false },
    users: { view: false, create: false, update: false, delete: false },
    tenants: { view: false, create: false, update: false, delete: false },
    doctors: { view: true, create: false, update: false, delete: false },
    patients: { view: true, create: true, update: true, delete: false },
    appointments: { view: true, create: true, update: true, delete: true },
    emr: { view: false, create: false, update: false, delete: false },
    prescriptions: { view: false, create: false, update: false, delete: false },
    medicines: { view: false, create: false, update: false, delete: false },
    inventory: { view: false, create: false, update: false, delete: false },
    lab_tests: { view: false, create: false, update: false, delete: false },
    billing: { view: true, create: true, update: true, delete: false },
    payments: { view: true, create: true, update: false, delete: false },
    reports: { view: false, create: false, update: false, delete: false },
    settings: { view: false, create: false, update: false, delete: false },
    notifications: { view: true, create: true, update: false, delete: false },
  },
  pharmacist: {
    dashboard: { view: true, create: false, update: false, delete: false },
    users: { view: false, create: false, update: false, delete: false },
    tenants: { view: false, create: false, update: false, delete: false },
    doctors: { view: false, create: false, update: false, delete: false },
    patients: { view: true, create: false, update: false, delete: false },
    appointments: { view: false, create: false, update: false, delete: false },
    emr: { view: false, create: false, update: false, delete: false },
    prescriptions: { view: true, create: false, update: true, delete: false },
    medicines: { view: true, create: true, update: true, delete: true },
    inventory: { view: true, create: true, update: true, delete: true },
    lab_tests: { view: false, create: false, update: false, delete: false },
    billing: { view: true, create: true, update: true, delete: false },
    payments: { view: true, create: true, update: false, delete: false },
    reports: { view: true, create: false, update: false, delete: false },
    settings: { view: false, create: false, update: false, delete: false },
    notifications: { view: true, create: false, update: false, delete: false },
  },
  lab_technician: {
    dashboard: { view: true, create: false, update: false, delete: false },
    users: { view: false, create: false, update: false, delete: false },
    tenants: { view: false, create: false, update: false, delete: false },
    doctors: { view: false, create: false, update: false, delete: false },
    patients: { view: true, create: false, update: false, delete: false },
    appointments: { view: false, create: false, update: false, delete: false },
    emr: { view: false, create: false, update: false, delete: false },
    prescriptions: { view: false, create: false, update: false, delete: false },
    medicines: { view: false, create: false, update: false, delete: false },
    inventory: { view: false, create: false, update: false, delete: false },
    lab_tests: { view: true, create: true, update: true, delete: false },
    billing: { view: false, create: false, update: false, delete: false },
    payments: { view: false, create: false, update: false, delete: false },
    reports: { view: true, create: true, update: false, delete: false },
    settings: { view: false, create: false, update: false, delete: false },
    notifications: { view: true, create: false, update: false, delete: false },
  },
  accountant: {
    dashboard: { view: true, create: false, update: false, delete: false },
    users: { view: false, create: false, update: false, delete: false },
    tenants: { view: false, create: false, update: false, delete: false },
    doctors: { view: false, create: false, update: false, delete: false },
    patients: { view: true, create: false, update: false, delete: false },
    appointments: { view: false, create: false, update: false, delete: false },
    emr: { view: false, create: false, update: false, delete: false },
    prescriptions: { view: false, create: false, update: false, delete: false },
    medicines: { view: false, create: false, update: false, delete: false },
    inventory: { view: false, create: false, update: false, delete: false },
    lab_tests: { view: false, create: false, update: false, delete: false },
    billing: { view: true, create: true, update: true, delete: true },
    payments: { view: true, create: true, update: true, delete: true },
    reports: { view: true, create: true, update: true, delete: false },
    settings: { view: false, create: false, update: false, delete: false },
    notifications: { view: true, create: false, update: false, delete: false },
  },
  patient: {
    dashboard: { view: true, create: false, update: false, delete: false },
    users: { view: false, create: false, update: false, delete: false },
    tenants: { view: false, create: false, update: false, delete: false },
    doctors: { view: true, create: false, update: false, delete: false },
    patients: { view: false, create: false, update: false, delete: false },
    appointments: { view: true, create: true, update: true, delete: true },
    emr: { view: true, create: false, update: false, delete: false },
    prescriptions: { view: true, create: false, update: false, delete: false },
    medicines: { view: false, create: false, update: false, delete: false },
    inventory: { view: false, create: false, update: false, delete: false },
    lab_tests: { view: true, create: false, update: false, delete: false },
    billing: { view: true, create: false, update: false, delete: false },
    payments: { view: true, create: true, update: false, delete: false },
    reports: { view: false, create: false, update: false, delete: false },
    settings: { view: true, create: false, update: true, delete: false },
    notifications: { view: true, create: false, update: true, delete: true },
  },
};

// Module display names
export const moduleDisplayNames: Record<Module, string> = {
  dashboard: 'Dashboard',
  users: 'User Management',
  tenants: 'Tenants',
  doctors: 'Doctors',
  patients: 'Patients',
  appointments: 'Appointments',
  emr: 'EMR (Medical Records)',
  prescriptions: 'Prescriptions',
  medicines: 'Medicines',
  inventory: 'Inventory',
  lab_tests: 'Lab Tests',
  billing: 'Billing',
  payments: 'Payments',
  reports: 'Reports',
  settings: 'Settings',
  notifications: 'Notifications',
};

// Check if a role has a specific permission on a module
export function hasPermission(
  role: UserRole | null,
  module: Module,
  permission: Permission
): boolean {
  if (!role) return false;
  return rolePermissions[role]?.[module]?.[permission] ?? false;
}

// Get all permissions for a role
export function getRolePermissions(role: UserRole): RolePermissions {
  return rolePermissions[role];
}

// Get list of modules a role can access (has view permission)
export function getAccessibleModules(role: UserRole): Module[] {
  const permissions = rolePermissions[role];
  return (Object.keys(permissions) as Module[]).filter(
    (module) => permissions[module].view
  );
}
