import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { UserRole } from "@/types/clinic";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const userFormSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(100, { message: "Name must be less than 100 characters" }),
  email: z
    .string()
    .trim()
    .email({ message: "Please enter a valid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
  phone: z
    .string()
    .trim()
    .min(10, { message: "Phone number must be at least 10 digits" })
    .max(20, { message: "Phone number must be less than 20 characters" })
    .regex(/^[+]?[\d\s-]+$/, { message: "Please enter a valid phone number" }),
  role: z.enum([
    "clinic_admin",
    "doctor",
    "receptionist",
    "pharmacist",
    "lab_technician",
    "accountant",
    "patient",
  ] as const),
  status: z.enum(["Active", "Inactive"] as const),
  // Role-specific fields
  specialization: z.string().optional(),
  qualification: z.string().optional(),
  consultation_fee: z.string().optional(),
  department: z.string().optional(),
  address: z.string().optional(),
  date_of_birth: z.string().optional(),
  gender: z.enum(["Male", "Female", "Other"]).optional(),
  blood_group: z.string().optional(),
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: UserFormValues) => void;
}

const roleConfig: Record<
  UserRole,
  { label: string; icon: React.ElementType; color: string; description: string }
> = {
  clinic_admin: {
    label: "Clinic Admin",
    icon: Building2,
    color: "border-blue-500 bg-blue-50 dark:bg-blue-900/20",
    description: "Clinic management - Settings, Users, Reports",
  },
  doctor: {
    label: "Doctor",
    icon: Stethoscope,
    color: "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20",
    description: "Medical practice - EMR, Prescriptions",
  },
  receptionist: {
    label: "Receptionist",
    icon: Calendar,
    color: "border-amber-500 bg-amber-50 dark:bg-amber-900/20",
    description: "Front desk - Appointments, Registration",
  },
  pharmacist: {
    label: "Pharmacist",
    icon: Pill,
    color: "border-rose-500 bg-rose-50 dark:bg-rose-900/20",
    description: "Pharmacy - Medicines, Billing",
  },
  lab_technician: {
    label: "Lab Technician",
    icon: TestTube,
    color: "border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20",
    description: "Laboratory - Tests & Results",
  },
  accountant: {
    label: "Accountant",
    icon: DollarSign,
    color: "border-green-500 bg-green-50 dark:bg-green-900/20",
    description: "Finance - Payments, GST, Reports",
  },
  patient: {
    label: "Patient",
    icon: User,
    color: "border-slate-500 bg-slate-50 dark:bg-slate-900/20",
    description: "Patient access - Appointments, Records",
  },
};

export function AddUserDialog({
  open,
  onOpenChange,
  onSubmit,
}: AddUserDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      role: "patient",
      status: "Active",
      specialization: "",
      qualification: "",
      consultation_fee: "",
      department: "",
      address: "",
      date_of_birth: "",
      gender: undefined,
      blood_group: "",
    },
  });

  const selectedRole = form.watch("role");

  const handleSubmit = async (data: UserFormValues) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      onSubmit?.(data);
      toast.success("User created successfully!", {
        description: `${data.full_name} has been added as ${roleConfig[data.role].label}`,
      });
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to create user");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Add New User</DialogTitle>
          <DialogDescription>
            Create a new user account and assign their role in the system.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* Role Selection */}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">
                    Select Role
                  </FormLabel>
                  <FormDescription>
                    Choose the role that defines the user's permissions and
                    access
                  </FormDescription>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2"
                    >
                      {Object.entries(roleConfig).map(([role, config]) => {
                        const Icon = config.icon;
                        const isSelected = field.value === role;
                        return (
                          <Label
                            key={role}
                            htmlFor={role}
                            className={cn(
                              "flex flex-col items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all",
                              isSelected
                                ? config.color + " border-current"
                                : "border-border hover:border-muted-foreground/50",
                            )}
                          >
                            <RadioGroupItem
                              value={role}
                              id={role}
                              className="sr-only"
                            />
                            <Icon
                              className={cn(
                                "w-6 h-6",
                                isSelected
                                  ? "text-current"
                                  : "text-muted-foreground",
                              )}
                            />
                            <span
                              className={cn(
                                "text-xs font-medium text-center",
                                isSelected
                                  ? "text-current"
                                  : "text-muted-foreground",
                              )}
                            >
                              {config.label}
                            </span>
                          </Label>
                        );
                      })}
                    </RadioGroup>
                  </FormControl>
                  <p className="text-sm text-muted-foreground mt-2">
                    {roleConfig[selectedRole].description}
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address *</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="email@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number *</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="+1 234 567 8900"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Role-Specific Fields */}
            {selectedRole === "doctor" && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">
                    Doctor Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="specialization"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Specialization</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select specialization" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="general">
                                General Medicine
                              </SelectItem>
                              <SelectItem value="cardiology">
                                Cardiology
                              </SelectItem>
                              <SelectItem value="dermatology">
                                Dermatology
                              </SelectItem>
                              <SelectItem value="neurology">
                                Neurology
                              </SelectItem>
                              <SelectItem value="orthopedics">
                                Orthopedics
                              </SelectItem>
                              <SelectItem value="pediatrics">
                                Pediatrics
                              </SelectItem>
                              <SelectItem value="psychiatry">
                                Psychiatry
                              </SelectItem>
                              <SelectItem value="gynecology">
                                Gynecology
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="qualification"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Qualification</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., MBBS, MD" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="consultation_fee"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Consultation Fee</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="e.g., 500"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </>
            )}

            {selectedRole === "patient" && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">
                    Patient Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="date_of_birth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Birth</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gender</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Male">Male</SelectItem>
                              <SelectItem value="Female">Female</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="blood_group"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Blood Group</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select blood group" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="A+">A+</SelectItem>
                              <SelectItem value="A-">A-</SelectItem>
                              <SelectItem value="B+">B+</SelectItem>
                              <SelectItem value="B-">B-</SelectItem>
                              <SelectItem value="AB+">AB+</SelectItem>
                              <SelectItem value="AB-">AB-</SelectItem>
                              <SelectItem value="O+">O+</SelectItem>
                              <SelectItem value="O-">O-</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter full address"
                              className="resize-none"
                              rows={2}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </>
            )}

            {(selectedRole === "pharmacist" ||
              selectedRole === "lab_technician" ||
              selectedRole === "receptionist" ||
              selectedRole === "accountant") && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">
                    Staff Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="department"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Department</FormLabel>
                          <FormControl>
                            <Input
                              placeholder={`e.g., ${
                                selectedRole === "pharmacist"
                                  ? "Pharmacy"
                                  : selectedRole === "lab_technician"
                                    ? "Pathology Lab"
                                    : selectedRole === "receptionist"
                                      ? "Front Desk"
                                      : "Finance"
                              }`}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="qualification"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Qualification</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter qualification"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Submit Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create User"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
