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
  Pill,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Package,
  AlertTriangle,
  DollarSign,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Medicine {
  id: string;
  name: string;
  category: string;
  manufacturer: string;
  stock_quantity: number;
  unit_price: number;
  expiry_date: string;
  batch_number: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

const mockMedicines: Medicine[] = [
  {
    id: '1',
    name: 'Paracetamol 500mg',
    category: 'Analgesic',
    manufacturer: 'Sun Pharma',
    stock_quantity: 500,
    unit_price: 2.50,
    expiry_date: '2025-06-15',
    batch_number: 'BTH001',
    status: 'In Stock',
  },
  {
    id: '2',
    name: 'Amoxicillin 250mg',
    category: 'Antibiotic',
    manufacturer: 'Cipla',
    stock_quantity: 45,
    unit_price: 8.00,
    expiry_date: '2024-12-20',
    batch_number: 'BTH002',
    status: 'Low Stock',
  },
  {
    id: '3',
    name: 'Omeprazole 20mg',
    category: 'Antacid',
    manufacturer: 'Dr. Reddy\'s',
    stock_quantity: 200,
    unit_price: 5.50,
    expiry_date: '2025-03-10',
    batch_number: 'BTH003',
    status: 'In Stock',
  },
  {
    id: '4',
    name: 'Metformin 500mg',
    category: 'Antidiabetic',
    manufacturer: 'Lupin',
    stock_quantity: 0,
    unit_price: 4.00,
    expiry_date: '2024-11-30',
    batch_number: 'BTH004',
    status: 'Out of Stock',
  },
  {
    id: '5',
    name: 'Aspirin 75mg',
    category: 'Analgesic',
    manufacturer: 'Bayer',
    stock_quantity: 350,
    unit_price: 3.00,
    expiry_date: '2025-08-22',
    batch_number: 'BTH005',
    status: 'In Stock',
  },
  {
    id: '6',
    name: 'Cetirizine 10mg',
    category: 'Antihistamine',
    manufacturer: 'GSK',
    stock_quantity: 25,
    unit_price: 4.50,
    expiry_date: '2024-09-15',
    batch_number: 'BTH006',
    status: 'Low Stock',
  },
];

const statusConfig = {
  'In Stock': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  'Low Stock': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'Out of Stock': 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
};

export default function PharmacyMedicinesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredMedicines = mockMedicines.filter((med) => {
    const matchesSearch =
      med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.manufacturer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || med.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || med.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = [...new Set(mockMedicines.map((m) => m.category))];

  const totalValue = mockMedicines.reduce((sum, m) => sum + m.stock_quantity * m.unit_price, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Pill className="w-6 h-6" />
              Medicine Inventory
            </h1>
            <p className="text-muted-foreground">Manage pharmacy medicines and stock</p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Medicine
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Pill className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{mockMedicines.length}</p>
                  <p className="text-xs text-muted-foreground">Total Medicines</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Package className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {mockMedicines.filter((m) => m.status === 'In Stock').length}
                  </p>
                  <p className="text-xs text-muted-foreground">In Stock</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {mockMedicines.filter((m) => m.status === 'Low Stock').length}
                  </p>
                  <p className="text-xs text-muted-foreground">Low Stock</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">${totalValue.toFixed(0)}</p>
                  <p className="text-xs text-muted-foreground">Stock Value</p>
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
                  placeholder="Search medicines..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
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
                  <SelectItem value="In Stock">In Stock</SelectItem>
                  <SelectItem value="Low Stock">Low Stock</SelectItem>
                  <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Medicines Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Pill className="w-5 h-5" />
              All Medicines ({filteredMedicines.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Medicine</TableHead>
                    <TableHead className="hidden md:table-cell">Category</TableHead>
                    <TableHead className="hidden lg:table-cell">Stock</TableHead>
                    <TableHead className="hidden lg:table-cell">Price</TableHead>
                    <TableHead className="hidden xl:table-cell">Expiry</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMedicines.map((med) => (
                    <TableRow key={med.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{med.name}</p>
                          <p className="text-xs text-muted-foreground">{med.manufacturer}</p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline">{med.category}</Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center gap-1">
                          <Package className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{med.stock_quantity}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <span className="font-medium">${med.unit_price.toFixed(2)}</span>
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                          {med.expiry_date}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn(statusConfig[med.status])}>{med.status}</Badge>
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
                              <Edit className="w-4 h-4" />
                              Edit Medicine
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              <Package className="w-4 h-4" />
                              Update Stock
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="gap-2 text-destructive">
                              <Trash2 className="w-4 h-4" />
                              Delete Medicine
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredMedicines.length === 0 && (
              <div className="text-center py-12">
                <Pill className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">No medicines found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
