import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  createRolePermission,
  createSystemObject,
  createUserRole,
  fetchRolePermissions,
  fetchSystemObjects,
  fetchUserRoles,
  prettifyRoleName,
  updateRolePermission,
  updateUserRole,
  type PermissionField,
  type RolePermissionRecord,
  type SystemObject,
  type UserRoleRecord,
} from "@/lib/role-management";
import {
  ChevronDown,
  ChevronUp,
  Database,
  Lock,
  PenSquare,
  Plus,
  RefreshCw,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

const permissionColumns: PermissionField[] = ["view", "add", "edit", "delete"];

export default function RolePermissionsPage() {
  const { role } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [roles, setRoles] = useState<UserRoleRecord[]>([]);
  const [systemObjects, setSystemObjects] = useState<SystemObject[]>([]);
  const [permissionRows, setPermissionRows] = useState<RolePermissionRecord[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [newRoleName, setNewRoleName] = useState("");
  const [editRoleName, setEditRoleName] = useState("");
  const [createRoleOpen, setCreateRoleOpen] = useState(false);
  const [updateRoleOpen, setUpdateRoleOpen] = useState(false);
  const [createSystemObjectOpen, setCreateSystemObjectOpen] = useState(false);
  const [systemObjectsOpen, setSystemObjectsOpen] = useState(false);
  const [systemObjectForm, setSystemObjectForm] = useState({ object_name: "", description: "" });
  const systemObjectsSectionRef = useRef<HTMLDivElement | null>(null);

  const canManagePermissions = role === "super_admin" || role === "clinic_admin";

  const jumpToSystemObjects = () => {
    setSystemObjectsOpen(true);
    systemObjectsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const loadData = async (showLoader = true) => {
    try {
      if (showLoader) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }

      const [rolesData, systemObjectsData, permissionData] = await Promise.all([
        fetchUserRoles(),
        fetchSystemObjects(),
        fetchRolePermissions(),
      ]);

      setRoles(rolesData);
      setSystemObjects(systemObjectsData);
      setPermissionRows(permissionData);
      setSelectedRoleId((current) =>
        current && rolesData.some((item) => item.role_id === current)
          ? current
          : rolesData[0]?.role_id || "",
      );
    } catch (error) {
      toast({
        title: "Failed to load role management",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const selectedRole = useMemo(
    () => roles.find((item) => item.role_id === selectedRoleId) || null,
    [roles, selectedRoleId],
  );

  const permissionsByObject = useMemo(() => {
    const map = new Map<string, RolePermissionRecord>();
    permissionRows
      .filter((item) => item.role_id === selectedRoleId)
      .forEach((item) => map.set(item.sys_obj_id, item));
    return map;
  }, [permissionRows, selectedRoleId]);

  useEffect(() => {
    if (!selectedRole) {
      setEditRoleName("");
      return;
    }

    setEditRoleName(selectedRole.role_name);
  }, [selectedRole]);

  const handleCreateRole = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const roleName = newRoleName.trim();

    if (!roleName) {
      toast({
        title: "Role name is required",
        description: "Enter a role name to create.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSavingKey("create-role");

      const created = await createUserRole({
        role_name: roleName,
      });
      setRoles((current) => [created, ...current]);
      setSelectedRoleId(created.role_id);
      setNewRoleName("");
      setCreateRoleOpen(false);
      toast({
        title: "Role created",
        description: `${prettifyRoleName(created.role_name)} added successfully.`,
      });

      await loadData(false);
    } catch (error) {
      toast({
        title: "Unable to create role",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSavingKey(null);
    }
  };

  const handleUpdateRole = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedRole) {
      toast({
        title: "Select a role first",
        description: "Choose a role from the list before updating it.",
        variant: "destructive",
      });
      return;
    }

    const roleName = editRoleName.trim();

    if (!roleName) {
      toast({
        title: "Role name is required",
        description: "Enter a role name to update.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSavingKey("update-role");

      const updated = await updateUserRole(selectedRole.role_id, {
        role_name: roleName,
      });
      setRoles((current) =>
        current.map((item) => (item.role_id === updated.role_id ? updated : item)),
      );
      toast({
        title: "Role updated",
        description: `${prettifyRoleName(updated.role_name)} updated successfully.`,
      });
      setUpdateRoleOpen(false);

      await loadData(false);
    } catch (error) {
      toast({
        title: "Unable to update role",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSavingKey(null);
    }
  };

  const handleSystemObjectSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const objectName = systemObjectForm.object_name.trim();
    const description = systemObjectForm.description.trim();

    if (!objectName) {
      toast({
        title: "System object name is required",
        description: "Enter the menu name you want to show in the sidebar.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSavingKey("system-object");
      const created = await createSystemObject({
        object_name: objectName,
        description: description || null,
      });
      setSystemObjects((current) => [created, ...current]);
      setSystemObjectForm({ object_name: "", description: "" });
      setCreateSystemObjectOpen(false);
      setSystemObjectsOpen(true);
      toast({
        title: "System object created",
        description: `${created.object_name} can now be used as a sidebar menu.`,
      });
    } catch (error) {
      toast({
        title: "Unable to create system object",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSavingKey(null);
    }
  };

  const handlePermissionToggle = async (
    sysObjId: string,
    field: PermissionField,
    checked: boolean,
  ) => {
    if (!selectedRoleId) {
      return;
    }

    const existing = permissionRows.find(
      (item) => item.role_id === selectedRoleId && item.sys_obj_id === sysObjId,
    );
    const nextPayload = {
      role_id: selectedRoleId,
      sys_obj_id: sysObjId,
      view: existing?.view ?? false,
      add: existing?.add ?? false,
      edit: existing?.edit ?? false,
      delete: existing?.delete ?? false,
      [field]: checked,
    };

    try {
      setSavingKey(`${selectedRoleId}:${sysObjId}:${field}`);

      if (existing) {
        const updated = await updateRolePermission(existing.permission_id, nextPayload);
        setPermissionRows((current) =>
          current.map((item) => (item.permission_id === updated.permission_id ? updated : item)),
        );
      } else {
        const created = await createRolePermission(nextPayload);
        setPermissionRows((current) => [...current, created]);
      }
    } catch (error) {
      toast({
        title: "Permission update failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSavingKey(null);
    }
  };

  if (!canManagePermissions) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl rounded-lg border p-4">
          <div className="flex items-center gap-2 font-semibold">
            <ShieldAlert className="h-4 w-4" />
            Access restricted
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Only Super Admin and Clinic Admin can manage roles, permissions, and system menus.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
              <Lock className="h-6 w-6" />
              Role & Permission Management
            </h1>
            <p className="text-sm text-muted-foreground">
              Create roles, create sidebar menu objects, and assign access for Super Admin/Admin.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" type="button" onClick={jumpToSystemObjects}>
              <Database className="mr-2 h-4 w-4" />
              System Objects
            </Button>
            <Button variant="outline" onClick={() => void loadData(false)} disabled={isRefreshing}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <div className="space-y-6">
            <Card
              className={`border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background transition-all ${
                selectedRole ? "xl:sticky xl:top-6" : ""
              }`}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Role Control Center
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" onClick={() => setCreateRoleOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Role
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  disabled={!selectedRole}
                  onClick={() => setUpdateRoleOpen(true)}
                >
                  <PenSquare className="mr-2 h-4 w-4" />
                  Update Selected Role
                </Button>
                <div className="rounded-xl border bg-background/80 p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Selected Role
                  </p>
                  {selectedRole ? (
                    <div className="mt-2">
                      <div className="text-base font-semibold">{prettifyRoleName(selectedRole.role_name)}</div>
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-muted-foreground">
                      Select a role from the list to manage it.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Role List</CardTitle>
                <CardDescription>
                  Left side list me se role select karte hi right side me uski permissions show hongi.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {isLoading ? (
                  <p className="text-sm text-muted-foreground">Loading roles...</p>
                ) : roles.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No roles found.</p>
                ) : (
                  roles.map((item) => {
                    const active = item.role_id === selectedRoleId;
                    return (
                      <button
                        key={item.role_id}
                        type="button"
                        onClick={() => setSelectedRoleId(item.role_id)}
                        className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                          active
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border hover:border-primary/40 hover:bg-muted/40"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-medium">{prettifyRoleName(item.role_name)}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            {active ? <Badge>Selected</Badge> : null}
                            <Button
                              variant="outline"
                              size="sm"
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                setSelectedRoleId(item.role_id);
                                setUpdateRoleOpen(true);
                              }}
                            >
                              Update
                            </Button>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader className="gap-3 pb-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <CardTitle className="text-lg">User Role Permissions</CardTitle>
                  <CardDescription>
                    Selected role ka access yahin manage hoga.
                  </CardDescription>
                </div>
                <div className="w-full max-w-xs">
                  <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                    <SelectTrigger id="selected-role-dropdown" className="w-full">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((item) => (
                        <SelectItem key={item.role_id} value={item.role_id}>
                          {prettifyRoleName(item.role_name)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <ScrollArea className="w-full">
                  <div className="min-w-[720px] rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead>System Object</TableHead>
                          <TableHead className="text-center">View</TableHead>
                          <TableHead className="text-center">Add</TableHead>
                          <TableHead className="text-center">Edit</TableHead>
                          <TableHead className="text-center">Delete</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {systemObjects.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                              Create at least one system object first.
                            </TableCell>
                          </TableRow>
                        ) : (
                          systemObjects.map((objectItem) => {
                            const row = permissionsByObject.get(objectItem.sys_obj_id);
                            return (
                              <TableRow key={objectItem.sys_obj_id}>
                                <TableCell>
                                  <div className="font-medium">{objectItem.object_name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    Menu name from system object API
                                  </div>
                                </TableCell>
                                {permissionColumns.map((field) => (
                                  <TableCell key={field} className="text-center">
                                    <div className="flex justify-center">
                                      <Switch
                                        checked={row?.[field] ?? false}
                                        disabled={!selectedRoleId || savingKey !== null}
                                        onCheckedChange={(checked) =>
                                          void handlePermissionToggle(objectItem.sys_obj_id, field, checked)
                                        }
                                        aria-label={`${field} ${objectItem.object_name}`}
                                      />
                                    </div>
                                  </TableCell>
                                ))}
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

          </div>
        </div>

        <div ref={systemObjectsSectionRef}>
        <Card>
          <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                System Objects
              </CardTitle>
              <CardDescription>
                Permission table ke niche system object list rakhi gayi hai taaki workflow cleaner rahe.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" type="button" onClick={() => setSystemObjectsOpen((prev) => !prev)}>
                {systemObjectsOpen ? (
                  <ChevronUp className="mr-2 h-4 w-4" />
                ) : (
                  <ChevronDown className="mr-2 h-4 w-4" />
                )}
                {systemObjectsOpen ? "Hide System Objects" : "Show System Objects"}
              </Button>
              <Button type="button" onClick={() => setCreateSystemObjectOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create System Object
              </Button>
            </div>
          </CardHeader>
          {systemObjectsOpen ? (
            <CardContent>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-28">ID</TableHead>
                      <TableHead className="w-56">Object Name</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {systemObjects.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="py-10 text-center text-muted-foreground">
                          No system objects created yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      systemObjects.map((item) => (
                        <TableRow key={item.sys_obj_id}>
                          <TableCell>{item.sys_obj_id}</TableCell>
                          <TableCell className="font-medium">{item.object_name}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {item.description?.trim() || "-"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          ) : null}
        </Card>
        </div>

        <Dialog open={createRoleOpen} onOpenChange={setCreateRoleOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Role</DialogTitle>
                </DialogHeader>
                <form className="space-y-4" onSubmit={handleCreateRole}>
                  <div className="space-y-2">
                    <Label htmlFor="new-role-name-modal">Role name</Label>
                    <Input
                      id="new-role-name-modal"
                      placeholder="example: Reception Supervisor"
                      value={newRoleName}
                      onChange={(event) => setNewRoleName(event.target.value)}
                    />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setCreateRoleOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={savingKey === "create-role"}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create role
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
        </Dialog>

        <Dialog open={updateRoleOpen} onOpenChange={setUpdateRoleOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update Role</DialogTitle>
                </DialogHeader>
                <form className="space-y-4" onSubmit={handleUpdateRole}>
                  <div className="space-y-2">
                    <Label htmlFor="edit-role-name-modal">Role name</Label>
                    <Input
                      id="edit-role-name-modal"
                      placeholder="Select a role from the list"
                      value={editRoleName}
                      disabled={!selectedRole}
                      onChange={(event) => setEditRoleName(event.target.value)}
                    />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setUpdateRoleOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={!selectedRole || savingKey === "update-role"}>
                      <PenSquare className="mr-2 h-4 w-4" />
                      Update role
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
        </Dialog>
      </div>

      <Dialog open={createSystemObjectOpen} onOpenChange={setCreateSystemObjectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create System Object</DialogTitle>
            <DialogDescription>
              Add a new system object. This menu object will be available in the permissions table.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleSystemObjectSubmit}>
            <div className="space-y-2">
              <Label htmlFor="system-object-name-modal">Menu name</Label>
              <Input
                id="system-object-name-modal"
                placeholder="Appointments"
                value={systemObjectForm.object_name}
                onChange={(event) =>
                  setSystemObjectForm((current) => ({
                    ...current,
                    object_name: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="system-object-description-modal">Description</Label>
              <Textarea
                id="system-object-description-modal"
                placeholder="Optional description for this menu object"
                value={systemObjectForm.description}
                onChange={(event) =>
                  setSystemObjectForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateSystemObjectOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={savingKey === "system-object"}>
                <Plus className="mr-2 h-4 w-4" />
                Create system object
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
