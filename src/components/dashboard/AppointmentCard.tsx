import { Clock, User, MoreVertical } from 'lucide-react';
import { Appointment, AppointmentStatus } from '@/types/clinic';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface AppointmentCardProps {
  appointment: Appointment;
  showDoctor?: boolean;
  showPatient?: boolean;
}

const statusStyles: Record<AppointmentStatus, string> = {
  Scheduled: 'bg-primary/10 text-primary',
  Completed: 'bg-success/10 text-success',
  Cancelled: 'bg-destructive/10 text-destructive',
};

export function AppointmentCard({ 
  appointment, 
  showDoctor = true, 
  showPatient = true 
}: AppointmentCardProps) {
  return (
    <div className="card-elevated p-4 hover:translate-y-[-2px] transition-all duration-200">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
            <User className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            {showPatient && (
              <p className="font-medium text-foreground truncate">
                {appointment.patient?.full_name || 'Patient Name'}
              </p>
            )}
            {showDoctor && (
              <p className="text-sm text-muted-foreground truncate">
                Dr. {appointment.doctor?.full_name || 'Doctor Name'}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {appointment.appointment_time}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={cn(
            'px-2.5 py-1 text-xs font-medium rounded-full',
            statusStyles[appointment.status]
          )}>
            {appointment.status}
          </span>
          <Button variant="ghost" size="icon" className="w-8 h-8">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
