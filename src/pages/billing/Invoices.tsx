import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Receipt,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Printer,
  Eye,
  DollarSign,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type PaymentStatus = 'Paid' | 'Unpaid' | 'Partial';

interface Invoice {
  id: string;
  invoice_number: string;
  patient_name: string;
  date: string;
  items: number;
  total_amount: number;
  paid_amount: number;
  payment_status: PaymentStatus;
  payment_method?: string;
}

const mockInvoices: Invoice[] = [
  {
    id: '1',
    invoice_number: 'INV-2024-001',
    patient_name: 'John Smith',
    date: '2024-01-20',
    items: 3,
    total_amount: 250.00,
    paid_amount: 250.00,
    payment_status: 'Paid',
    payment_method: 'Card',
  },
  {
    id: '2',
    invoice_number: 'INV-2024-002',
    patient_name: 'Sarah Johnson',
    date: '2024-01-20',
    items: 5,
    total_amount: 450.00,
    paid_amount: 0,
    payment_status: 'Unpaid',
  },
  {
    id: '3',
    invoice_number: 'INV-2024-003',
    patient_name: 'Michael Brown',
    date: '2024-01-19',
    items: 2,
    total_amount: 180.00,
    paid_amount: 100.00,
    payment_status: 'Partial',
    payment_method: 'Cash',
  },
  {
    id: '4',
    invoice_number: 'INV-2024-004',
    patient_name: 'Emily Davis',
    date: '2024-01-19',
    items: 4,
    total_amount: 320.00,
    paid_amount: 320.00,
    payment_status: 'Paid',
    payment_method: 'UPI',
  },
  {
    id: '5',
    invoice_number: 'INV-2024-005',
    patient_name: 'Robert Wilson',
    date: '2024-01-18',
    items: 1,
    total_amount: 500.00,
    paid_amount: 0,
    payment_status: 'Unpaid',
  },
];

const statusConfig: Record<PaymentStatus, { icon: React.ElementType; color: string }> = {
  Paid: {
    icon: CheckCircle,
    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  },
  Unpaid: {
    icon: XCircle,
    color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  },
  Partial: {
    icon: Clock,
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  },
};

export default function InvoicesPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredInvoices = mockInvoices.filter((inv) => {
    const matchesSearch =
      inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.patient_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || inv.payment_status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = mockInvoices.reduce((sum, i) => sum + i.paid_amount, 0);
  const pendingAmount = mockInvoices.reduce((sum, i) => sum + (i.total_amount - i.paid_amount), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Receipt className="w-6 h-6" />
              Invoices
            </h1>
            <p className="text-muted-foreground">Manage billing and invoices</p>
          </div>
          <Button className="gap-2" onClick={() => navigate('/billing/create')}>
            <Plus className="w-4 h-4" />
            Create Invoice
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Receipt className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{mockInvoices.length}</p>
                  <p className="text-xs text-muted-foreground">Total Invoices</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">${totalRevenue.toFixed(0)}</p>
                  <p className="text-xs text-muted-foreground">Collected</p>
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
                  <p className="text-2xl font-bold">${pendingAmount.toFixed(0)}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {mockInvoices.filter((i) => i.payment_status === 'Paid').length}
                  </p>
                  <p className="text-xs text-muted-foreground">Paid Invoices</p>
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
                  placeholder="Search by invoice number or patient..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Unpaid">Unpaid</SelectItem>
                  <SelectItem value="Partial">Partial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Invoices Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              All Invoices ({filteredInvoices.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Invoice</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                    <TableHead className="hidden lg:table-cell">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((inv) => {
                    const StatusIcon = statusConfig[inv.payment_status].icon;
                    return (
                      <TableRow key={inv.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">{inv.invoice_number}</p>
                            <p className="text-xs text-muted-foreground">{inv.items} items</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="w-4 h-4 text-primary" />
                            </div>
                            <span className="font-medium">{inv.patient_name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{inv.date}</TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div>
                            <p className="font-medium">${inv.total_amount.toFixed(2)}</p>
                            {inv.payment_status === 'Partial' && (
                              <p className="text-xs text-muted-foreground">
                                Paid: ${inv.paid_amount.toFixed(2)}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn('gap-1', statusConfig[inv.payment_status].color)}>
                            <StatusIcon className="w-3 h-3" />
                            {inv.payment_status}
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
                              <DropdownMenuItem className="gap-2">
                                <Eye className="w-4 h-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2">
                                <Printer className="w-4 h-4" />
                                Print Invoice
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2">
                                <CreditCard className="w-4 h-4" />
                                Record Payment
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="gap-2">
                                <Edit className="w-4 h-4" />
                                Edit Invoice
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {filteredInvoices.length === 0 && (
              <div className="text-center py-12">
                <Receipt className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">No invoices found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
