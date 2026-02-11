import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Users,
  UserPlus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Shield,
  Mail,
  Phone,
  Building2,
  Stethoscope,
  Calendar,
  Pill,
  TestTube,
  DollarSign,
  UserCog,
  User,
} from "lucide-react";
import { UserRole, UserStatus } from "@/types/clinic";
import { cn } from "@/lib/utils";
import { AddUserDialog } from "@/components/users/AddUserDialog";
import { EditUserDialog, UserData } from "@/components/users/EditUserDialog";
import { ChangeRoleDialog } from "@/components/users/ChangeRoleDialog";
import { DeleteUserDialog } from "@/components/users/DeleteUserDialog";

interface MockUser {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  last_login?: string;
}

const mockUsers: MockUser[] = [
  {
    id: "1",
    full_name: "Eden Hazard",
    email: "hazard@gmail.com",
    phone: "900938746",
    role: "patient",
    status: "Active",
    created_at: "2024-01-16",
    last_login: "2024-01-20 10:15",
  },
  {
    id: "2",
    full_name: "Sarah Mitchell",
    email: "sarah@medicare.com",
    phone: "+1 234 567 8902",
    role: "clinic_admin",
    status: "Active",
    created_at: "2024-01-16",
    last_login: "2024-01-20 10:15",
  },
  {
    id: "3",
    full_name: "Dr. James Wilson",
    email: "dr.wilson@medicare.com",
    phone: "+1 234 567 8903",
    role: "doctor",
    status: "Active",
    created_at: "2024-01-17",
    last_login: "2024-01-20 08:45",
  },
  {
    id: "4",
    full_name: "Dr. Emily Chen",
    email: "dr.chen@medicare.com",
    phone: "+1 234 567 8904",
    role: "doctor",
    status: "Active",
    created_at: "2024-01-17",
    last_login: "2024-01-19 16:30",
  },
  {
    id: "5",
    full_name: "Maria Garcia",
    email: "maria@medicare.com",
    phone: "+1 234 567 8905",
    role: "receptionist",
    status: "Active",
    created_at: "2024-01-18",
    last_login: "2024-01-20 07:00",
  },
  {
    id: "6",
    full_name: "Robert Johnson",
    email: "robert@medicare.com",
    phone: "+1 234 567 8906",
    role: "pharmacist",
    status: "Active",
    created_at: "2024-01-18",
    last_login: "2024-01-20 08:00",
  },
  {
    id: "7",
    full_name: "Lisa Thompson",
    email: "lisa@medicare.com",
    phone: "+1 234 567 8907",
    role: "lab_technician",
    status: "Active",
    created_at: "2024-01-19",
    last_login: "2024-01-20 09:00",
  },
  {
    id: "8",
    full_name: "Michael Brown",
    email: "michael@medicare.com",
    phone: "+1 234 567 8908",
    role: "accountant",
    status: "Active",
    created_at: "2024-01-19",
    last_login: "2024-01-20 08:30",
  },
  {
    id: "9",
    full_name: "Jennifer Davis",
    email: "jennifer@example.com",
    phone: "+1 234 567 8909",
    role: "patient",
    status: "Active",
    created_at: "2024-01-20",
    last_login: "2024-01-20 11:00",
  },
  {
    id: "10",
    full_name: "David Martinez",
    email: "david@example.com",
    phone: "+1 234 567 8910",
    role: "patient",
    status: "Inactive",
    created_at: "2024-01-20",
  },
];

const roleConfig: Record<
  UserRole,
  { label: string; icon: React.ElementType; color: string; description: string }
> = {
  clinic_admin: {
    label: "Clinic Admin",
    icon: Building2,
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    description: "Clinic Settings, Users, Reports",
  },
  doctor: {
    label: "Doctor",
    icon: Stethoscope,
    color:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    description: "EMR, Prescriptions",
  },
  receptionist: {
    label: "Receptionist",
    icon: Calendar,
    color:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    description: "Appointments, Registration",
  },
  pharmacist: {
    label: "Pharmacist",
    icon: Pill,
    color: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
    description: "Medicines, Billing",
  },
  lab_technician: {
    label: "Lab Technician",
    icon: TestTube,
    color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
    description: "Tests & Results",
  },
  accountant: {
    label: "Accountant",
    icon: DollarSign,
    color:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    description: "Payments, GST, Reports",
  },
  patient: {
    label: "Patient",
    icon: User,
    color:
      "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400",
    description: "Appointments, Records",
  },
};

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserData | null>(null);
  const [changeRoleUser, setChangeRoleUser] = useState<{
    id: string;
    full_name: string;
    role: UserRole;
  } | null>(null);
  const [deleteUser, setDeleteUser] = useState<{
    id: string;
    full_name: string;
    email: string;
  } | null>(null);

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch =
      user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === "all" || user.role === selectedRole;
    const matchesStatus =
      selectedStatus === "all" || user.status === selectedStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const userCountByRole = mockUsers.reduce(
    (acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              User Management
            </h1>
            <p className="text-muted-foreground">
              Manage all users and their roles in the system
            </p>
          </div>
          <Button className="gap-2" onClick={() => setIsAddUserOpen(true)}>
            <UserPlus className="w-4 h-4" />
            Add New User
          </Button>
        </div>

        {/* Role Cards Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {Object.entries(roleConfig).map(([role, config]) => {
            const Icon = config.icon;
            const count = userCountByRole[role] || 0;
            return (
              <Card
                key={role}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md",
                  selectedRole === role && "ring-2 ring-primary",
                )}
                onClick={() =>
                  setSelectedRole(selectedRole === role ? "all" : role)
                }
              >
                <CardContent className="p-3 text-center">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-lg mx-auto mb-2 flex items-center justify-center",
                      config.color,
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">{count}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {config.label}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {Object.entries(roleConfig).map(([role, config]) => (
                    <SelectItem key={role} value={role}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5" />
              All Users ({filteredUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Contact
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Created
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => {
                    const roleInfo = roleConfig[user.role];
                    const RoleIcon = roleInfo.icon;
                    return (
                      <TableRow key={user.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-semibold text-primary">
                                {user.full_name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-foreground">
                                {user.full_name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center",
                                roleInfo.color,
                              )}
                            >
                              <RoleIcon className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                {roleInfo.label}
                              </p>
                              <p className="text-xs text-muted-foreground hidden xl:block">
                                {roleInfo.description}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                              <Mail className="w-3.5 h-3.5" />
                              <span className="truncate max-w-32">
                                {user.email}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                              <Phone className="w-3.5 h-3.5" />
                              {user.phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="text-sm">
                            <p className="text-foreground">{user.created_at}</p>
                            {user.last_login && (
                              <p className="text-xs text-muted-foreground">
                                Last: {user.last_login}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              user.status === "Active" ? "default" : "secondary"
                            }
                            className={cn(
                              user.status === "Active"
                                ? "bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400",
                            )}
                          >
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                className="gap-2"
                                onClick={() =>
                                  setEditUser({
                                    id: user.id,
                                    full_name: user.full_name,
                                    email: user.email,
                                    phone: user.phone,
                                    role: user.role,
                                    status: user.status,
                                  })
                                }
                              >
                                <Edit className="w-4 h-4" />
                                Edit User
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="gap-2"
                                onClick={() =>
                                  setChangeRoleUser({
                                    id: user.id,
                                    full_name: user.full_name,
                                    role: user.role,
                                  })
                                }
                              >
                                <UserCog className="w-4 h-4" />
                                Change Role
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="gap-2 text-destructive"
                                onClick={() =>
                                  setDeleteUser({
                                    id: user.id,
                                    full_name: user.full_name,
                                    email: user.email,
                                  })
                                }
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete User
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

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No users found matching your criteria
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add User Dialog */}
      <AddUserDialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen} />

      {/* Edit User Dialog */}
      <EditUserDialog
        open={!!editUser}
        onOpenChange={(open) => !open && setEditUser(null)}
        user={editUser}
      />

      {/* Change Role Dialog */}
      <ChangeRoleDialog
        open={!!changeRoleUser}
        onOpenChange={(open) => !open && setChangeRoleUser(null)}
        user={changeRoleUser}
      />

      {/* Delete User Dialog */}
      <DeleteUserDialog
        open={!!deleteUser}
        onOpenChange={(open) => !open && setDeleteUser(null)}
        user={deleteUser}
      />
    </DashboardLayout>
  );
}
