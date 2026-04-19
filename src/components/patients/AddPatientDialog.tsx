import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, differenceInYears } from "date-fns";
import {
  CalendarIcon,
  User,
  Phone,
  AlertCircle,
  FileText,
  Loader2,
} from "lucide-react";
import { bloodGroups, maritalStatuses } from "@/data/mockPatientData";
import { toast } from "sonner";

const patientFormSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must be less than 50 characters"),
  lastName: z
    .string()
    .max(50, "Last name must be less than 50 characters")
    .optional(),
  dateOfBirth: z.date({ required_error: "Date of birth is required" }),
  gender: z.enum(["Male", "Female", "Other"], {
    required_error: "Gender is required",
  }),
  bloodGroup: z.string().optional(),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number is too long"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  address: z
    .string()
    .max(200, "Address must be less than 200 characters")
    .optional(),
});

type PatientFormValues = z.infer<typeof patientFormSchema>;

interface AddPatientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: PatientFormValues) => void;
  editData?: PatientFormValues | null;
}

export function AddPatientDialog({
  open,
  onOpenChange,
  onSubmit,
  editData,
}: AddPatientDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dobInput, setDobInput] = useState("");

  const defaultValues: Partial<PatientFormValues> = {
    firstName: "",
    lastName: "",
    gender: undefined,
    bloodGroup: "",
    phone: "",
    email: "",
    address: "",
  };

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: editData || defaultValues,
    values: editData || undefined,
  });

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      form.reset(defaultValues);
      setDobInput("");
    } else if (editData?.dateOfBirth) {
      setDobInput(format(new Date(editData.dateOfBirth), "dd/MM/yyyy"));
    }
  }, [open, editData]);

  const dateOfBirth = form.watch("dateOfBirth");
  const age = dateOfBirth ? differenceInYears(new Date(), dateOfBirth) : null;

  const handleSubmit = async (data: PatientFormValues) => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");

      // Prepare API payload
      const payload = {
        email: data.email || `${data.firstName.toLowerCase()}@patient.temp`,
        password: "Patient@123", // Default password for new patients
        role: "patient",
        full_name: `${data.firstName} ${data.lastName || ""}`.trim(),
        phone: data.phone,
        address: data.address || "",
        date_of_birth: format(data.dateOfBirth, "yyyy-MM-dd"),
        blood_group: data.bloodGroup || null,
      };

      const response = await fetch(
        "http://localhost:5000/api/receptionist/users",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to create patient");
      }

      toast.success("Patient added successfully", {
        description: `${data.firstName} ${data.lastName || ""} has been registered.`,
      });

      // Call the parent onSubmit to refresh the list
      onSubmit(data);

      form.reset();
      setDobInput("");
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating patient:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create patient",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            {editData ? "Edit Patient" : "Add New Patient"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2 border-b pb-2">
                <User className="w-4 h-4" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter first name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter last name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date of Birth *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type="text"
                                placeholder="DD/MM/YYYY"
                                value={dobInput}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setDobInput(value);
                                  const dateRegex =
                                    /^(\d{2})\/(\d{2})\/(\d{4})$/;
                                  const match = value.match(dateRegex);
                                  if (match) {
                                    const [, day, month, year] = match;
                                    const parsedDate = new Date(
                                      parseInt(year),
                                      parseInt(month) - 1,
                                      parseInt(day),
                                    );
                                    if (
                                      !isNaN(parsedDate.getTime()) &&
                                      parsedDate <= new Date() &&
                                      parsedDate >= new Date("1900-01-01")
                                    ) {
                                      field.onChange(parsedDate);
                                    }
                                  }
                                }}
                                className="pr-10"
                              />
                              <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
                            </div>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              field.onChange(date);
                              if (date) setDobInput(format(date, "dd/MM/yyyy"));
                            }}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                            numberOfMonths={1}
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="space-y-2">
                  <label className="text-sm font-medium">Age</label>
                  <Input
                    value={age !== null ? `${age} years` : "-"}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Gender *</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Male" id="male" />
                            <label
                              htmlFor="male"
                              className="text-sm cursor-pointer"
                            >
                              Male
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Female" id="female" />
                            <label
                              htmlFor="female"
                              className="text-sm cursor-pointer"
                            >
                              Female
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Other" id="other" />
                            <label
                              htmlFor="other"
                              className="text-sm cursor-pointer"
                            >
                              Other
                            </label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bloodGroup"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Blood Group</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {bloodGroups.map((bg) => (
                            <SelectItem key={bg} value={bg}>
                              {bg}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2 border-b pb-2">
                <Phone className="w-4 h-4" />
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="+91 XXXXX XXXXX" {...field} />
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
                      <FormLabel>Email (Optional)</FormLabel>
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
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter full address"
                        {...field}
                        rows={2}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Info Banner */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Default Login:</strong> Email will be auto-generated if
                not provided. Default password is{" "}
                <code className="px-1 py-0.5 bg-blue-100 dark:bg-blue-800 rounded">
                  Patient@123
                </code>
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
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
                ) : editData ? (
                  "Update Patient"
                ) : (
                  "Save Patient"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
