import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { AppointmentCard } from '@/components/dashboard/AppointmentCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { Appointment } from '@/types/clinic';
import {
  Users,
  Calendar,
  Stethoscope,
  DollarSign,
  TrendingUp,
  Clock,
} from 'lucide-react';

// Mock data for demo
const mockAppointments: Appointment[] = [
  {
    appointment_id: '1',
    patient_id: '1',
    doctor_id: '1',
    appointment_date: new Date().toISOString().split('T')[0],
    appointment_time: '09:00 AM',
    status: 'Scheduled',
    created_by: '1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    patient: {
      patient_id: '1',
      user_id: '1',
      full_name: 'John Anderson',
      gender: 'Male',
      date_of_birth: '1985-03-15',
      contact_number: '+1234567890',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    doctor: {
      doctor_id: '1',
      user_id: '1',
      specialization: 'General Medicine',
      qualification: 'MD',
      consultation_fee: 100,
      availability_status: 'Available',
      full_name: 'Sarah Johnson',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    appointment_id: '2',
    patient_id: '2',
    doctor_id: '1',
    appointment_date: new Date().toISOString().split('T')[0],
    appointment_time: '10:30 AM',
    status: 'Scheduled',
    created_by: '1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    patient: {
      patient_id: '2',
      user_id: '2',
      full_name: 'Emily Chen',
      gender: 'Female',
      date_of_birth: '1990-07-22',
      contact_number: '+1234567891',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    doctor: {
      doctor_id: '1',
      user_id: '1',
      specialization: 'General Medicine',
      qualification: 'MD',
      consultation_fee: 100,
      availability_status: 'Available',
      full_name: 'Sarah Johnson',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    appointment_id: '3',
    patient_id: '3',
    doctor_id: '2',
    appointment_date: new Date().toISOString().split('T')[0],
    appointment_time: '11:00 AM',
    status: 'Completed',
    created_by: '1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    patient: {
      patient_id: '3',
      user_id: '3',
      full_name: 'Michael Brown',
      gender: 'Male',
      date_of_birth: '1978-11-08',
      contact_number: '+1234567892',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    doctor: {
      doctor_id: '2',
      user_id: '2',
      specialization: 'Cardiology',
      qualification: 'MD, DM',
      consultation_fee: 150,
      availability_status: 'Available',
      full_name: 'James Wilson',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    appointment_id: '4',
    patient_id: '4',
    doctor_id: '1',
    appointment_date: new Date().toISOString().split('T')[0],
    appointment_time: '02:00 PM',
    status: 'Scheduled',
    created_by: '1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    patient: {
      patient_id: '4',
      user_id: '4',
      full_name: 'Sophie Martinez',
      gender: 'Female',
      date_of_birth: '1995-01-30',
      contact_number: '+1234567893',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    doctor: {
      doctor_id: '1',
      user_id: '1',
      specialization: 'General Medicine',
      qualification: 'MD',
      consultation_fee: 100,
      availability_status: 'Available',
      full_name: 'Sarah Johnson',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
];

export default function Dashboard() {
  const { user, role } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {getGreeting()}, {user?.full_name.split(' ')[0]}!
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's what's happening at your clinic today.
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Today</p>
            <p className="text-lg font-semibold text-foreground">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Patients"
            value="2,847"
            icon={<Users className="w-6 h-6" />}
            trend={{ value: 12, isPositive: true }}
            iconClassName="bg-primary/10 text-primary"
          />
          <StatCard
            title="Today's Appointments"
            value="24"
            icon={<Calendar className="w-6 h-6" />}
            trend={{ value: 8, isPositive: true }}
            iconClassName="bg-success/10 text-success"
          />
          <StatCard
            title="Available Doctors"
            value="8"
            icon={<Stethoscope className="w-6 h-6" />}
            iconClassName="bg-warning/10 text-warning"
          />
          <StatCard
            title="Today's Revenue"
            value="$4,250"
            icon={<DollarSign className="w-6 h-6" />}
            trend={{ value: 15, isPositive: true }}
            iconClassName="bg-accent text-accent-foreground"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Appointments */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Today's Appointments
              </h2>
              <a href="/appointments" className="text-sm text-primary hover:underline">
                View all
              </a>
            </div>
            <div className="space-y-3">
              {mockAppointments.map((appointment, index) => (
                <div
                  key={appointment.appointment_id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <AppointmentCard appointment={appointment} />
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <QuickActions />

            {/* Performance Card */}
            <div className="card-elevated p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-success" />
                Weekly Overview
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Appointments Completed</span>
                    <span className="font-medium text-foreground">85%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full w-[85%] bg-success rounded-full" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Patient Satisfaction</span>
                    <span className="font-medium text-foreground">92%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full w-[92%] bg-primary rounded-full" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Revenue Target</span>
                    <span className="font-medium text-foreground">78%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full w-[78%] bg-warning rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
