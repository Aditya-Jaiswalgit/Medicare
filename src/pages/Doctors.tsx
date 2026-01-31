import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Stethoscope,
  UserPlus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { EditUserDialog, UserData } from '@/components/users/EditUserDialog';
import { DeleteUserDialog } from '@/components/users/DeleteUserDialog';
import { AddUserDialog } from '@/components/users/AddUserDialog';

interface Doctor {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  specialization: string;
  qualification: string;
  consultation_fee: number;
  availability_status: 'Available' | 'Unavailable';
  patients_today: number;
  total_patients: number;
  experience_years: number;
  created_at: string;
}

const mockDoctors: Doctor[] = [
  {
    id: '1',
    full_name: 'Dr. James Wilson',
    email: 'dr.wilson@medicare.com',
    phone: '+1 234 567 8901',
    specialization: 'Cardiology',
    qualification: 'MBBS, MD, DM (Cardiology)',
    consultation_fee: 500,
    availability_status: 'Available',
    patients_today: 12,
    total_patients: 1850,
    experience_years: 15,
    created_at: '2024-01-15',
  },
  {
    id: '2',
    full_name: 'Dr. Emily Chen',
    email: 'dr.chen@medicare.com',
    phone: '+1 234 567 8902',
    specialization: 'Dermatology',
    qualification: 'MBBS, MD (Dermatology)',
    consultation_fee: 400,
    availability_status: 'Available',
    patients_today: 8,
    total_patients: 1200,
    experience_years: 10,
    created_at: '2024-01-16',
  },
  {
    id: '3',
    full_name: 'Dr. Michael Brown',
    email: 'dr.brown@medicare.com',
    phone: '+1 234 567 8903',
    specialization: 'Orthopedics',
    qualification: 'MBBS, MS (Ortho)',
    consultation_fee: 600,
    availability_status: 'Unavailable',
    patients_today: 0,
    total_patients: 2100,
    experience_years: 18,
    created_at: '2024-01-17',
  },
  {
    id: '4',
    full_name: 'Dr. Sarah Johnson',
    email: 'dr.johnson@medicare.com',
    phone: '+1 234 567 8904',
    specialization: 'Pediatrics',
    qualification: 'MBBS, MD (Pediatrics)',
    consultation_fee: 350,
    availability_status: 'Available',
    patients_today: 15,
    total_patients: 3200,
    experience_years: 12,
    created_at: '2024-01-18',
  },
  {
    id: '5',
    full_name: 'Dr. Robert Taylor',
    email: 'dr.taylor@medicare.com',
    phone: '+1 234 567 8905',
    specialization: 'Neurology',
    qualification: 'MBBS, DM (Neurology)',
    consultation_fee: 700,
    availability_status: 'Available',
    patients_today: 6,
    total_patients: 950,
    experience_years: 8,
    created_at: '2024-01-19',
  },
  {
    id: '6',
    full_name: 'Dr. Lisa Anderson',
    email: 'dr.anderson@medicare.com',
    phone: '+1 234 567 8906',
    specialization: 'Gynecology',
    qualification: 'MBBS, MD (OB-GYN)',
    consultation_fee: 450,
    availability_status: 'Available',
    patients_today: 10,
    total_patients: 2800,
    experience_years: 14,
    created_at: '2024-01-20',
  },
];

const specializations = [
  'All Specializations',
  'Cardiology',
  'Dermatology',
  'Orthopedics',
  'Pediatrics',
  'Neurology',
  'Gynecology',
  'General Medicine',
  'Psychiatry',
];

export default function DoctorsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('All Specializations');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false);
  const [editDoctor, setEditDoctor] = useState<UserData | null>(null);
  const [deleteDoctor, setDeleteDoctor] = useState<{ id: string; full_name: string; email: string } | null>(null);

  const filteredDoctors = mockDoctors.filter((doctor) => {
    const matchesSearch =
      doctor.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialization =
      selectedSpecialization === 'All Specializations' ||
      doctor.specialization === selectedSpecialization;
    const matchesStatus =
      selectedStatus === 'all' || doctor.availability_status === selectedStatus;
    return matchesSearch && matchesSpecialization && matchesStatus;
  });

  const availableDoctors = mockDoctors.filter((d) => d.availability_status === 'Available').length;
  const totalPatients = mockDoctors.reduce((sum, d) => sum + d.patients_today, 0);

  const handleEditDoctor = (doctor: Doctor) => {
    setEditDoctor({
      id: doctor.id,
      full_name: doctor.full_name,
      email: doctor.email,
      phone: doctor.phone,
      role: 'doctor',
      status: 'Active',
      specialization: doctor.specialization.toLowerCase(),
      qualification: doctor.qualification,
      consultation_fee: doctor.consultation_fee.toString(),
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Stethoscope className="w-6 h-6" />
              Doctors
            </h1>
            <p className="text-muted-foreground">
              Manage doctors and their schedules
            </p>
          </div>
          <Button className="gap-2" onClick={() => setIsAddDoctorOpen(true)}>
            <UserPlus className="w-4 h-4" />
            Add Doctor
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{mockDoctors.length}</p>
                  <p className="text-xs text-muted-foreground">Total Doctors</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{availableDoctors}</p>
                  <p className="text-xs text-muted-foreground">Available Now</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalPatients}</p>
                  <p className="text-xs text-muted-foreground">Patients Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {Math.round(mockDoctors.reduce((sum, d) => sum + d.experience_years, 0) / mockDoctors.length)}
                  </p>
                  <p className="text-xs text-muted-foreground">Avg Experience (Yrs)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search doctors by name, email, or specialization..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
                <SelectTrigger className="w-full sm:w-52">
                  <SelectValue placeholder="Specialization" />
                </SelectTrigger>
                <SelectContent>
                  {specializations.map((spec) => (
                    <SelectItem key={spec} value={spec}>
                      {spec}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="Unavailable">Unavailable</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Doctors Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Stethoscope className="w-5 h-5" />
              All Doctors ({filteredDoctors.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Doctor</TableHead>
                    <TableHead>Specialization</TableHead>
                    <TableHead className="hidden md:table-cell">Contact</TableHead>
                    <TableHead className="hidden lg:table-cell">Fee</TableHead>
                    <TableHead className="hidden lg:table-cell">Patients Today</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDoctors.map((doctor) => (
                    <TableRow key={doctor.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                            <span className="text-sm font-semibold text-emerald-600">
                              {doctor.full_name.split(' ').slice(1).map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{doctor.full_name}</p>
                            <p className="text-xs text-muted-foreground">{doctor.qualification}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                          {doctor.specialization}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Mail className="w-3.5 h-3.5" />
                            <span className="truncate max-w-32">{doctor.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Phone className="w-3.5 h-3.5" />
                            {doctor.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center gap-1 text-foreground">
                          <DollarSign className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{doctor.consultation_fee}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="text-center">
                          <p className="font-medium text-foreground">{doctor.patients_today}</p>
                          <p className="text-xs text-muted-foreground">
                            Total: {doctor.total_patients.toLocaleString()}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            doctor.availability_status === 'Available'
                              ? 'bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-red-100 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400'
                          )}
                        >
                          {doctor.availability_status === 'Available' ? (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          ) : (
                            <XCircle className="w-3 h-3 mr-1" />
                          )}
                          {doctor.availability_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="gap-2"
                              onClick={() => handleEditDoctor(doctor)}
                            >
                              <Edit className="w-4 h-4" />
                              Edit Doctor
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="gap-2 text-destructive"
                              onClick={() => setDeleteDoctor({
                                id: doctor.id,
                                full_name: doctor.full_name,
                                email: doctor.email,
                              })}
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete Doctor
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredDoctors.length === 0 && (
              <div className="text-center py-12">
                <Stethoscope className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">No doctors found matching your criteria</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Doctor Dialog */}
      <AddUserDialog open={isAddDoctorOpen} onOpenChange={setIsAddDoctorOpen} />

      {/* Edit Doctor Dialog */}
      <EditUserDialog
        open={!!editDoctor}
        onOpenChange={(open) => !open && setEditDoctor(null)}
        user={editDoctor}
      />

      {/* Delete Doctor Dialog */}
      <DeleteUserDialog
        open={!!deleteDoctor}
        onOpenChange={(open) => !open && setDeleteDoctor(null)}
        user={deleteDoctor}
      />
    </DashboardLayout>
  );
}
