import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Patient } from '@/types/patient';
import { cn } from '@/lib/utils';
import { differenceInYears, format } from 'date-fns';
import {
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Phone,
  ToggleLeft,
  ToggleRight,
  Heart,
  Settings2,
  Mail,
  MapPin,
  User,
  FileText,
  Stethoscope,
  Pill,
  FlaskConical,
} from 'lucide-react';

interface PatientTableProps {
  patients: Patient[];
  onView: (patient: Patient) => void;
  onEdit: (patient: Patient) => void;
  onDelete: (patient: Patient) => void;
  onBookAppointment: (patient: Patient) => void;
  onMedicalHistory: (patient: Patient) => void;
  onConsultation: (patient: Patient) => void;
  onPrescription: (patient: Patient) => void;
  onLabReports: (patient: Patient) => void;
  onStatusChange: (patient: Patient, newStatus: 'Active' | 'Inactive') => void;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

type ColumnKey = 
  | 'patientCode'
  | 'patientName'
  | 'ageGender'
  | 'phone'
  | 'alternatePhone'
  | 'email'
  | 'bloodGroup'
  | 'maritalStatus'
  | 'occupation'
  | 'address'
  | 'city'
  | 'state'
  | 'pincode'
  | 'aadharNumber'
  | 'emergencyContact'
  | 'registrationDate'
  | 'lastVisit'
  | 'totalVisits'
  | 'notes'
  | 'status';

interface ColumnConfig {
  key: ColumnKey;
  label: string;
  defaultVisible: boolean;
}

const COLUMN_CONFIG: ColumnConfig[] = [
  { key: 'patientCode', label: 'Patient Code', defaultVisible: true },
  { key: 'patientName', label: 'Patient Name', defaultVisible: true },
  { key: 'ageGender', label: 'Age/Gender', defaultVisible: true },
  { key: 'phone', label: 'Phone', defaultVisible: true },
  { key: 'alternatePhone', label: 'Alternate Phone', defaultVisible: false },
  { key: 'email', label: 'Email', defaultVisible: false },
  { key: 'bloodGroup', label: 'Blood Group', defaultVisible: true },
  { key: 'maritalStatus', label: 'Marital Status', defaultVisible: false },
  { key: 'occupation', label: 'Occupation', defaultVisible: false },
  { key: 'address', label: 'Address', defaultVisible: false },
  { key: 'city', label: 'City', defaultVisible: false },
  { key: 'state', label: 'State', defaultVisible: false },
  { key: 'pincode', label: 'Pincode', defaultVisible: false },
  { key: 'aadharNumber', label: 'Aadhar Number', defaultVisible: false },
  { key: 'emergencyContact', label: 'Emergency Contact', defaultVisible: false },
  { key: 'registrationDate', label: 'Registration Date', defaultVisible: true },
  { key: 'lastVisit', label: 'Last Visit', defaultVisible: false },
  { key: 'totalVisits', label: 'Total Visits', defaultVisible: false },
  { key: 'notes', label: 'Notes', defaultVisible: false },
  { key: 'status', label: 'Status', defaultVisible: true },
];

const getDefaultVisibleColumns = (): Set<ColumnKey> => {
  return new Set(COLUMN_CONFIG.filter(col => col.defaultVisible).map(col => col.key));
};

export function PatientTable({ patients, onView, onEdit, onDelete, onBookAppointment, onMedicalHistory, onConsultation, onPrescription, onLabReports, onStatusChange }: PatientTableProps) {
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleColumns, setVisibleColumns] = useState<Set<ColumnKey>>(getDefaultVisibleColumns);

  const totalPages = Math.ceil(patients.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedPatients = patients.slice(startIndex, endIndex);

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value));
    setCurrentPage(1);
  };

  const toggleColumn = (columnKey: ColumnKey) => {
    setVisibleColumns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(columnKey)) {
        newSet.delete(columnKey);
      } else {
        newSet.add(columnKey);
      }
      return newSet;
    });
  };

  const showAllColumns = () => {
    setVisibleColumns(new Set(COLUMN_CONFIG.map(col => col.key)));
  };

  const resetColumns = () => {
    setVisibleColumns(getDefaultVisibleColumns());
  };

  const isColumnVisible = (key: ColumnKey) => visibleColumns.has(key);

  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push(-1);
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push(-1);
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push(-1);
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push(-1);
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const renderCellContent = (patient: Patient, columnKey: ColumnKey) => {
    const age = differenceInYears(new Date(), new Date(patient.dateOfBirth));
    
    switch (columnKey) {
      case 'patientCode':
        return (
          <span className="font-medium text-primary">{patient.patientCode}</span>
        );
      case 'patientName':
        return (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-sm font-semibold text-primary">
                {patient.firstName.charAt(0)}{patient.lastName?.charAt(0) || ''}
              </span>
            </div>
            <div className="min-w-0">
              <p className="font-medium truncate">
                {patient.firstName} {patient.lastName}
              </p>
            </div>
          </div>
        );
      case 'ageGender':
        return (
          <span>
            <span className="font-medium">{age}</span>
            <span className="text-muted-foreground"> / {patient.gender}</span>
          </span>
        );
      case 'phone':
        return (
          <div className="flex items-center gap-1.5 text-sm">
            <Phone className="w-3.5 h-3.5 text-muted-foreground" />
            {patient.phone}
          </div>
        );
      case 'alternatePhone':
        return patient.alternatePhone ? (
          <div className="flex items-center gap-1.5 text-sm">
            <Phone className="w-3.5 h-3.5 text-muted-foreground" />
            {patient.alternatePhone}
          </div>
        ) : <span className="text-muted-foreground">-</span>;
      case 'email':
        return patient.email ? (
          <div className="flex items-center gap-1.5 text-sm">
            <Mail className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="truncate max-w-[150px]">{patient.email}</span>
          </div>
        ) : <span className="text-muted-foreground">-</span>;
      case 'bloodGroup':
        return (
          <Badge variant="outline" className="font-medium">
            {patient.bloodGroup || '-'}
          </Badge>
        );
      case 'maritalStatus':
        return <span className="text-sm">{patient.maritalStatus || '-'}</span>;
      case 'occupation':
        return <span className="text-sm">{patient.occupation || '-'}</span>;
      case 'address':
        return patient.address ? (
          <div className="flex items-center gap-1.5 text-sm max-w-[200px]">
            <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="truncate">{patient.address}</span>
          </div>
        ) : <span className="text-muted-foreground">-</span>;
      case 'city':
        return <span className="text-sm">{patient.city || '-'}</span>;
      case 'state':
        return <span className="text-sm">{patient.state || '-'}</span>;
      case 'pincode':
        return <span className="text-sm">{patient.pincode || '-'}</span>;
      case 'aadharNumber':
        return patient.aadharNumber ? (
          <span className="text-sm font-mono">{patient.aadharNumber}</span>
        ) : <span className="text-muted-foreground">-</span>;
      case 'emergencyContact':
        return patient.emergencyContactName ? (
          <div className="text-sm">
            <p className="font-medium">{patient.emergencyContactName}</p>
            <p className="text-muted-foreground text-xs">
              {patient.emergencyContactPhone} ({patient.emergencyContactRelation})
            </p>
          </div>
        ) : <span className="text-muted-foreground">-</span>;
      case 'registrationDate':
        return (
          <span className="text-sm">
            {format(new Date(patient.registrationDate), 'MMM dd, yyyy')}
          </span>
        );
      case 'lastVisit':
        return patient.lastVisit ? (
          <span className="text-sm">
            {format(new Date(patient.lastVisit), 'MMM dd, yyyy')}
          </span>
        ) : <span className="text-muted-foreground">-</span>;
      case 'totalVisits':
        return (
          <Badge variant="secondary" className="font-medium">
            {patient.totalVisits || 0}
          </Badge>
        );
      case 'notes':
        return patient.notes ? (
          <div className="flex items-center gap-1.5 text-sm max-w-[200px]">
            <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="truncate">{patient.notes}</span>
          </div>
        ) : <span className="text-muted-foreground">-</span>;
      case 'status':
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onStatusChange(patient, patient.status === 'Active' ? 'Inactive' : 'Active')}
            className={cn(
              'gap-2 h-8 px-2',
              patient.status === 'Active'
                ? 'text-success hover:text-success hover:bg-success/10'
                : 'text-muted-foreground hover:text-muted-foreground hover:bg-muted'
            )}
          >
            {patient.status === 'Active' ? (
              <ToggleRight className="w-5 h-5" />
            ) : (
              <ToggleLeft className="w-5 h-5" />
            )}
            <span className="text-xs font-medium">{patient.status}</span>
          </Button>
        );
      default:
        return null;
    }
  };

  const visibleColumnsList = COLUMN_CONFIG.filter(col => isColumnVisible(col.key));

  return (
    <div className="space-y-4">
      {/* Column Visibility Controls */}
      <div className="flex items-center justify-end gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Settings2 className="w-4 h-4" />
              Columns ({visibleColumns.size})
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 max-h-[400px] overflow-y-auto">
            <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="flex gap-2 px-2 py-1.5">
              <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={showAllColumns}>
                Show All
              </Button>
              <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={resetColumns}>
                Reset
              </Button>
            </div>
            <DropdownMenuSeparator />
            {COLUMN_CONFIG.map((column) => (
              <DropdownMenuCheckboxItem
                key={column.key}
                checked={isColumnVisible(column.key)}
                onCheckedChange={() => toggleColumn(column.key)}
              >
                {column.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                {visibleColumnsList.map((column) => (
                  <TableHead key={column.key} className="whitespace-nowrap">
                    {column.label}
                  </TableHead>
                ))}
                <TableHead className="w-16 sticky right-0 bg-muted/50">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedPatients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={visibleColumnsList.length + 1} className="text-center py-12 text-muted-foreground">
                    No patients found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedPatients.map((patient) => (
                  <TableRow key={patient.id} className="hover:bg-muted/50">
                    {visibleColumnsList.map((column) => (
                      <TableCell key={column.key} className="whitespace-nowrap">
                        {renderCellContent(patient, column.key)}
                      </TableCell>
                    ))}
                    <TableCell className="sticky right-0 bg-background">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onView(patient)} className="gap-2">
                            <Eye className="w-4 h-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit(patient)} className="gap-2">
                            <Edit className="w-4 h-4" />
                            Edit Patient
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onMedicalHistory(patient)} className="gap-2">
                            <Heart className="w-4 h-4" />
                            Medical History
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onConsultation(patient)} className="gap-2">
                            <Stethoscope className="w-4 h-4" />
                            Consultations
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onPrescription(patient)} className="gap-2">
                            <Pill className="w-4 h-4" />
                            Prescriptions
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onLabReports(patient)} className="gap-2">
                            <FlaskConical className="w-4 h-4" />
                            Lab Reports
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onBookAppointment(patient)} className="gap-2">
                            <Calendar className="w-4 h-4" />
                            Book Appointment
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => onDelete(patient)} 
                            className="gap-2 text-destructive focus:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete Patient
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Show</span>
          <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
            <SelectTrigger className="w-20 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span>entries</span>
          <span className="ml-2">
            (Showing {startIndex + 1}-{Math.min(endIndex, patients.length)} of {patients.length})
          </span>
        </div>

        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className={cn(currentPage === 1 && 'pointer-events-none opacity-50')}
                />
              </PaginationItem>
              
              {getPageNumbers().map((page, idx) => (
                <PaginationItem key={idx}>
                  {page === -1 ? (
                    <span className="px-2">...</span>
                  ) : (
                    <PaginationLink
                      onClick={() => setCurrentPage(page)}
                      isActive={currentPage === page}
                    >
                      {page}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className={cn(currentPage === totalPages && 'pointer-events-none opacity-50')}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
}
