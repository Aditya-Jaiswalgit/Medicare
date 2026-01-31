import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { UserRole } from '@/types/clinic';
import {
  Shield,
  Building2,
  Stethoscope,
  Calendar,
  Pill,
  TestTube,
  DollarSign,
  User,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ChangeRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: { id: string; full_name: string; role: UserRole } | null;
  onSubmit?: (userId: string, newRole: UserRole) => void;
}

const roleConfig: Record<
  UserRole,
  { label: string; icon: React.ElementType; color: string; description: string }
> = {
  super_admin: {
    label: 'Super Admin',
    icon: Shield,
    color: 'border-purple-500 bg-purple-50 dark:bg-purple-900/20',
    description: 'Full system access - Tenants, Licensing, Plans',
  },
  clinic_admin: {
    label: 'Clinic Admin',
    icon: Building2,
    color: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20',
    description: 'Clinic management - Settings, Users, Reports',
  },
  doctor: {
    label: 'Doctor',
    icon: Stethoscope,
    color: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20',
    description: 'Medical practice - EMR, Prescriptions',
  },
  receptionist: {
    label: 'Receptionist',
    icon: Calendar,
    color: 'border-amber-500 bg-amber-50 dark:bg-amber-900/20',
    description: 'Front desk - Appointments, Registration',
  },
  pharmacist: {
    label: 'Pharmacist',
    icon: Pill,
    color: 'border-rose-500 bg-rose-50 dark:bg-rose-900/20',
    description: 'Pharmacy - Medicines, Billing',
  },
  lab_technician: {
    label: 'Lab Technician',
    icon: TestTube,
    color: 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20',
    description: 'Laboratory - Tests & Results',
  },
  accountant: {
    label: 'Accountant',
    icon: DollarSign,
    color: 'border-green-500 bg-green-50 dark:bg-green-900/20',
    description: 'Finance - Payments, GST, Reports',
  },
  patient: {
    label: 'Patient',
    icon: User,
    color: 'border-slate-500 bg-slate-50 dark:bg-slate-900/20',
    description: 'Patient access - Appointments, Records',
  },
};

export function ChangeRoleDialog({ open, onOpenChange, user, onSubmit }: ChangeRoleDialogProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user || !selectedRole || selectedRole === user.role) return;
    
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      onSubmit?.(user.id, selectedRole);
      toast.success('Role changed successfully!', {
        description: `${user.full_name} is now a ${roleConfig[selectedRole].label}.`,
      });
      onOpenChange(false);
      setSelectedRole(null);
    } catch (error) {
      toast.error('Failed to change role');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  const currentRoleConfig = roleConfig[user.role];
  const CurrentIcon = currentRoleConfig.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">Change User Role</DialogTitle>
          <DialogDescription>
            Change the role and permissions for {user.full_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Role */}
          <div className="p-4 rounded-lg bg-muted/50 border">
            <p className="text-sm text-muted-foreground mb-2">Current Role</p>
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center border-2',
                  currentRoleConfig.color
                )}
              >
                <CurrentIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium">{currentRoleConfig.label}</p>
                <p className="text-xs text-muted-foreground">{currentRoleConfig.description}</p>
              </div>
            </div>
          </div>

          {/* New Role Selection */}
          <div className="space-y-3">
            <p className="text-sm font-medium">Select New Role</p>
            <RadioGroup
              value={selectedRole || ''}
              onValueChange={(value) => setSelectedRole(value as UserRole)}
              className="grid grid-cols-2 gap-3"
            >
              {Object.entries(roleConfig).map(([role, config]) => {
                const Icon = config.icon;
                const isSelected = selectedRole === role;
                const isCurrent = user.role === role;
                return (
                  <Label
                    key={role}
                    htmlFor={`role-${role}`}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all',
                      isCurrent && 'opacity-50 cursor-not-allowed',
                      isSelected
                        ? config.color + ' border-current'
                        : 'border-border hover:border-muted-foreground/50'
                    )}
                  >
                    <RadioGroupItem
                      value={role}
                      id={`role-${role}`}
                      disabled={isCurrent}
                      className="sr-only"
                    />
                    <Icon
                      className={cn(
                        'w-5 h-5',
                        isSelected ? 'text-current' : 'text-muted-foreground'
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          'text-sm font-medium truncate',
                          isSelected ? 'text-current' : 'text-foreground'
                        )}
                      >
                        {config.label}
                      </p>
                    </div>
                    {isCurrent && (
                      <span className="text-xs text-muted-foreground">Current</span>
                    )}
                  </Label>
                );
              })}
            </RadioGroup>
          </div>

          {/* Warning */}
          {selectedRole && selectedRole !== user.role && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Changing the role will update the user's permissions immediately. Make sure this is intended.
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedRole || selectedRole === user.role || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Changing...
                </>
              ) : (
                'Change Role'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
