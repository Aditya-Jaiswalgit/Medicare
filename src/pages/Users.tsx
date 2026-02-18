import { useState, useEffect } from "react";
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
  Loader2,
} from "lucide-react";
import { UserRole, UserStatus } from "@/types/clinic";
import { cn } from "@/lib/utils";
import { AddUserDialog } from "@/components/users/AddUserDialog";
import { EditUserDialog, UserData } from "@/components/users/EditUserDialog";
import { ChangeRoleDialog } from "@/components/users/ChangeRoleDialog";
import { DeleteUserDialog } from "@/components/users/DeleteUserDialog";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ApiUser {
  id: string;
  email: string;
  role: UserRole;
  full_name: string;
  phone: string;
  address: string | null;
  department: string | null;
  specialization: string | null;
  is_active: boolean;
  created_at: string;
}

interface ApiResponse {
  success: boolean;
  data: ApiUser[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

const rolesToFetch = [
  "patient",
  "doctor",
  "lab-technician", // ← hyphen
  "pharmacist",
  "accountant",
  "receptionist",
  "clinic-admin", // ← underscore
];

const roleConfig: Record<
  UserRole,
  { label: string; icon: React.ElementType; color: string; description: string }
> = {
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

// Transform API user to match the expected format
const transformApiUser = (apiUser: ApiUser) => ({
  id: apiUser.id,
  full_name: apiUser.full_name,
  email: apiUser.email,
  phone: apiUser.phone,
  role: apiUser.role,
  status: apiUser.is_active ? "Active" : ("Inactive" as UserStatus),
  created_at: new Date(apiUser.created_at).toLocaleDateString(),
  last_login: undefined,
});

export default function UsersPage() {
  const token = localStorage.getItem("token");
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

  // API state
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 1,
  });

  // Fetch users by role
  const fetchUsersByRole = async (role?: string) => {
    setLoading(true);
    try {
      if (!role || role === "all") {
        const rolesToFetch = [
          "patient",
          "doctor",
          "lab_technician",
          "pharmacist",
          "accountant",
          "receptionist",
        ];

        const promises = rolesToFetch.map(async (r) => {
          const response = await fetch(
            `http://localhost:5000/api/clinic-admin/users/${r}`, // ← Fixed!
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            },
          );

          if (!response.ok) {
            console.error(`Failed to fetch ${r}:`, response.status);
            return [];
          }

          const data: ApiResponse = await response.json();
          return data.data;
        });

        const results = await Promise.all(promises);
        const allUsers = results.flat();
        setUsers(allUsers);

        setPagination({
          total: allUsers.length,
          page: 1,
          limit: allUsers.length,
          pages: 1,
        });
      } else {
        const response = await fetch(
          `http://localhost:5000/api/clinic-admin/users/${role}`, // ← Fixed!
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error("API Error:", response.status, errorText);
          throw new Error(`Failed to fetch users: ${response.status}`);
        }

        const data: ApiResponse = await response.json();
        setUsers(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and fetch when role changes
  useEffect(() => {
    fetchUsersByRole(selectedRole !== "all" ? selectedRole : undefined);
  }, [selectedRole]);

  // Filter users based on search and status
  const filteredUsers = users.map(transformApiUser).filter((user) => {
    const matchesSearch =
      user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      selectedStatus === "all" || user.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const userCountByRole = users.reduce(
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
              All Users ({filteredUsers.length} of {pagination.total})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
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
                                <p className="text-foreground">
                                  {user.created_at}
                                </p>
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
                                  user.status === "Active"
                                    ? "default"
                                    : "secondary"
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
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add User Dialog */}
      <AddUserDialog
        open={isAddUserOpen}
        onOpenChange={setIsAddUserOpen}
        onSuccess={() =>
          fetchUsersByRole(selectedRole !== "all" ? selectedRole : undefined)
        }
      />

      {/* Edit User Dialog */}
      <EditUserDialog
        open={!!editUser}
        onOpenChange={(open) => !open && setEditUser(null)}
        user={editUser}
        onSuccess={() =>
          fetchUsersByRole(selectedRole !== "all" ? selectedRole : undefined)
        }
      />

      {/* Change Role Dialog */}
      <ChangeRoleDialog
        open={!!changeRoleUser}
        onOpenChange={(open) => !open && setChangeRoleUser(null)}
        user={changeRoleUser}
        onSuccess={() =>
          fetchUsersByRole(selectedRole !== "all" ? selectedRole : undefined)
        }
      />

      {/* Delete User Dialog */}
      <DeleteUserDialog
        open={!!deleteUser}
        onOpenChange={(open) => !open && setDeleteUser(null)}
        user={deleteUser}
        onSuccess={() =>
          fetchUsersByRole(selectedRole !== "all" ? selectedRole : undefined)
        }
      />
    </DashboardLayout>
  );
}
