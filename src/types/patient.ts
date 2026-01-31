export interface Patient {
  id: string;
  patientCode: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: string;
  maritalStatus: string;
  occupation: string;
  phone: string;
  alternatePhone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  aadharNumber: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  photo: string;
  notes: string;
  status: 'Active' | 'Inactive';
  registrationDate: string;
  lastVisit: string;
  totalVisits: number;
}

export interface MedicalHistory {
  patientId: string;
  allergies: string;
  chronicConditions: string;
  pastSurgeries: string;
  familyHistory: string;
  currentMedications: string;
  immunizationRecords: string;
  smokingStatus: 'Never' | 'Former' | 'Current';
  alcoholConsumption: 'Never' | 'Occasional' | 'Regular' | 'Heavy';
  exerciseHabits: string;
  dietaryPreferences: string;
}

export interface Consultation {
  id: string;
  patientId: string;
  doctorName: string;
  date: string;
  diagnosis: string;
  notes: string;
  status: 'Completed' | 'Follow-up Required';
}

export interface Prescription {
  id: string;
  patientId: string;
  doctorName: string;
  date: string;
  medications: string[];
  instructions: string;
}

export interface LabReport {
  id: string;
  patientId: string;
  testName: string;
  date: string;
  status: 'Pending' | 'Completed' | 'Processing';
  result: string;
}

export type AppointmentType = 'NEW' | 'FOLLOW_UP' | 'EMERGENCY' | 'ROUTINE_CHECKUP';
export type AppointmentStatus = 'SCHEDULED' | 'CHECKED_IN' | 'IN_CONSULTATION' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
export type BookingSource = 'WALK_IN' | 'PHONE' | 'ONLINE' | 'MOBILE_APP';

export interface Appointment {
  id: string;
  appointmentNumber: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentType: AppointmentType;
  status: AppointmentStatus;
  tokenNumber?: number;
  reasonForVisit?: string;
  symptoms?: string;
  notes?: string;
  bookedBy?: string;
  bookingSource: BookingSource;
  cancelledBy?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  checkedInAt?: string;
  consultationStartedAt?: string;
  consultationEndedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type PatientFormData = Omit<Patient, 'id' | 'patientCode' | 'registrationDate' | 'lastVisit' | 'totalVisits'>;
