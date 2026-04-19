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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  TestTube,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  FileText,
  DollarSign,
  Clock,
  CheckCircle,
  Beaker,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LabTest {
  id: string;
  test_name: string;
  category: string;
  price: number;
  turnaround_time: string;
  sample_type: string;
  status: 'Active' | 'Inactive';
}

const mockLabTests: LabTest[] = [
  {
    id: '1',
    test_name: 'Complete Blood Count (CBC)',
    category: 'Hematology',
    price: 25.00,
    turnaround_time: '2-4 hours',
    sample_type: 'Blood',
    status: 'Active',
  },
  {
    id: '2',
    test_name: 'Lipid Profile',
    category: 'Biochemistry',
    price: 45.00,
    turnaround_time: '4-6 hours',
    sample_type: 'Blood',
    status: 'Active',
  },
  {
    id: '3',
    test_name: 'Liver Function Test (LFT)',
    category: 'Biochemistry',
    price: 55.00,
    turnaround_time: '4-6 hours',
    sample_type: 'Blood',
    status: 'Active',
  },
  {
    id: '4',
    test_name: 'Thyroid Profile (T3, T4, TSH)',
    category: 'Endocrinology',
    price: 65.00,
    turnaround_time: '6-8 hours',
    sample_type: 'Blood',
    status: 'Active',
  },
  {
    id: '5',
    test_name: 'Urine Routine',
    category: 'Microbiology',
    price: 15.00,
    turnaround_time: '1-2 hours',
    sample_type: 'Urine',
    status: 'Active',
  },
  {
    id: '6',
    test_name: 'HbA1c',
    category: 'Biochemistry',
    price: 35.00,
    turnaround_time: '4-6 hours',
    sample_type: 'Blood',
    status: 'Inactive',
  },
];

export default function LabTestsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredTests = mockLabTests.filter((test) => {
    const matchesSearch = test.test_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || test.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(mockLabTests.map((t) => t.category))];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <TestTube className="w-6 h-6" />
              Lab Test Management
            </h1>
            <p className="text-muted-foreground">Manage laboratory tests and pricing</p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Test
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TestTube className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{mockLabTests.length}</p>
                  <p className="text-xs text-muted-foreground">Total Tests</p>
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
                  <p className="text-2xl font-bold">
                    {mockLabTests.filter((t) => t.status === 'Active').length}
                  </p>
                  <p className="text-xs text-muted-foreground">Active Tests</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Beaker className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{categories.length}</p>
                  <p className="text-xs text-muted-foreground">Categories</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">156</p>
                  <p className="text-xs text-muted-foreground">Tests Today</p>
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
                  placeholder="Search lab tests..."
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
            </div>
          </CardContent>
        </Card>

        {/* Lab Tests Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TestTube className="w-5 h-5" />
              All Lab Tests ({filteredTests.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Test Name</TableHead>
                    <TableHead className="hidden md:table-cell">Category</TableHead>
                    <TableHead className="hidden lg:table-cell">Sample</TableHead>
                    <TableHead className="hidden lg:table-cell">TAT</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTests.map((test) => (
                    <TableRow key={test.id} className="hover:bg-muted/50">
                      <TableCell>
                        <p className="font-medium text-foreground">{test.test_name}</p>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline">{test.category}</Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">{test.sample_type}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                          {test.turnaround_time}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{test.price.toFixed(2)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            test.status === 'Active'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                          )}
                        >
                          {test.status}
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
                              <Edit className="w-4 h-4" />
                              Edit Test
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 text-destructive">
                              <Trash2 className="w-4 h-4" />
                              Delete Test
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredTests.length === 0 && (
              <div className="text-center py-12">
                <TestTube className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">No lab tests found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
