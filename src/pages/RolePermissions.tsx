import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Shield,
  Building2,
  Stethoscope,
  Calendar,
  Pill,
  TestTube,
  DollarSign,
  User,
  Check,
  X,
  Eye,
  Plus,
  Pencil,
  Trash2,
  Lock,
} from 'lucide-react';
import { UserRole } from '@/types/clinic';
import { 
  rolePermissions, 
  Module, 
  moduleDisplayNames,
  Permission 
} from '@/lib/permissions';
import { cn } from '@/lib/utils';

const roleConfig: Record<UserRole, { label: string; icon: React.ElementType; color: string }> = {
  super_admin: {
    label: 'Super Admin',
    icon: Shield,
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  },
  clinic_admin: {
    label: 'Clinic Admin',
    icon: Building2,
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  },
  doctor: {
    label: 'Doctor',
    icon: Stethoscope,
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  },
  receptionist: {
    label: 'Receptionist',
    icon: Calendar,
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  },
  pharmacist: {
    label: 'Pharmacist',
    icon: Pill,
    color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  },
  lab_technician: {
    label: 'Lab Technician',
    icon: TestTube,
    color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  },
  accountant: {
    label: 'Accountant',
    icon: DollarSign,
    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  },
  patient: {
    label: 'Patient',
    icon: User,
    color: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400',
  },
};

const permissionIcons: Record<Permission, React.ElementType> = {
  view: Eye,
  create: Plus,
  update: Pencil,
  delete: Trash2,
};

const modules = Object.keys(moduleDisplayNames) as Module[];
const roles = Object.keys(roleConfig) as UserRole[];

export default function RolePermissionsPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole>('super_admin');

  const PermissionBadge = ({ allowed }: { allowed: boolean }) => (
    <div
      className={cn(
        'w-8 h-8 rounded-full flex items-center justify-center',
        allowed
          ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
          : 'bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400'
      )}
    >
      {allowed ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Lock className="w-6 h-6" />
            Role Permissions
          </h1>
          <p className="text-muted-foreground">
            View and manage access permissions for each role
          </p>
        </div>

        <Tabs defaultValue="by-role" className="space-y-6">
          <TabsList>
            <TabsTrigger value="by-role">By Role</TabsTrigger>
            <TabsTrigger value="matrix">Permission Matrix</TabsTrigger>
          </TabsList>

          {/* By Role View */}
          <TabsContent value="by-role" className="space-y-6">
            {/* Role Selector */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {roles.map((role) => {
                const config = roleConfig[role];
                const Icon = config.icon;
                const isSelected = selectedRole === role;
                return (
                  <Card
                    key={role}
                    className={cn(
                      'cursor-pointer transition-all hover:shadow-md',
                      isSelected && 'ring-2 ring-primary'
                    )}
                    onClick={() => setSelectedRole(role)}
                  >
                    <CardContent className="p-3 text-center">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-lg mx-auto mb-2 flex items-center justify-center',
                          config.color
                        )}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-medium text-foreground truncate">
                        {config.label}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Selected Role Permissions */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  {(() => {
                    const config = roleConfig[selectedRole];
                    const Icon = config.icon;
                    return (
                      <div
                        className={cn(
                          'w-12 h-12 rounded-xl flex items-center justify-center',
                          config.color
                        )}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                    );
                  })()}
                  <div>
                    <CardTitle>{roleConfig[selectedRole].label} Permissions</CardTitle>
                    <CardDescription>
                      Access levels for each module in the system
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Module</TableHead>
                        <TableHead className="text-center w-24">
                          <div className="flex items-center justify-center gap-1">
                            <Eye className="w-4 h-4" />
                            <span className="hidden sm:inline">View</span>
                          </div>
                        </TableHead>
                        <TableHead className="text-center w-24">
                          <div className="flex items-center justify-center gap-1">
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Create</span>
                          </div>
                        </TableHead>
                        <TableHead className="text-center w-24">
                          <div className="flex items-center justify-center gap-1">
                            <Pencil className="w-4 h-4" />
                            <span className="hidden sm:inline">Update</span>
                          </div>
                        </TableHead>
                        <TableHead className="text-center w-24">
                          <div className="flex items-center justify-center gap-1">
                            <Trash2 className="w-4 h-4" />
                            <span className="hidden sm:inline">Delete</span>
                          </div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {modules.map((module) => {
                        const perms = rolePermissions[selectedRole][module];
                        const hasAnyPermission = perms.view || perms.create || perms.update || perms.delete;
                        return (
                          <TableRow
                            key={module}
                            className={cn(!hasAnyPermission && 'opacity-50')}
                          >
                            <TableCell className="font-medium">
                              {moduleDisplayNames[module]}
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex justify-center">
                                <PermissionBadge allowed={perms.view} />
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex justify-center">
                                <PermissionBadge allowed={perms.create} />
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex justify-center">
                                <PermissionBadge allowed={perms.update} />
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex justify-center">
                                <PermissionBadge allowed={perms.delete} />
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Permission Matrix View */}
          <TabsContent value="matrix" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Permission Matrix</CardTitle>
                <CardDescription>
                  Compare view permissions across all roles
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <div className="min-w-[800px]">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="sticky left-0 bg-muted/50 z-10">Module</TableHead>
                        {roles.map((role) => (
                          <TableHead key={role} className="text-center min-w-20">
                            <div className="flex flex-col items-center gap-1">
                              {(() => {
                                const Icon = roleConfig[role].icon;
                                return (
                                  <div
                                    className={cn(
                                      'w-8 h-8 rounded-lg flex items-center justify-center',
                                      roleConfig[role].color
                                    )}
                                  >
                                    <Icon className="w-4 h-4" />
                                  </div>
                                );
                              })()}
                              <span className="text-xs">{roleConfig[role].label}</span>
                            </div>
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {modules.map((module) => (
                        <TableRow key={module}>
                          <TableCell className="font-medium sticky left-0 bg-background z-10">
                            {moduleDisplayNames[module]}
                          </TableCell>
                          {roles.map((role) => {
                            const perms = rolePermissions[role][module];
                            const permCount = [perms.view, perms.create, perms.update, perms.delete].filter(Boolean).length;
                            return (
                              <TableCell key={role} className="text-center">
                                {permCount === 0 ? (
                                  <Badge variant="secondary" className="bg-gray-100 text-gray-500 dark:bg-gray-800">
                                    None
                                  </Badge>
                                ) : permCount === 4 ? (
                                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                    Full
                                  </Badge>
                                ) : (
                                  <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                    {permCount}/4
                                  </Badge>
                                )}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
