import { useEffect, useMemo, useRef, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Edit3,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Plus,
  RefreshCcw,
  Shield,
  Tags,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  createRolePermission,
  createSystemObject,
  createUserRole,
  fetchRolePermissions,
  fetchSystemObjects,
  fetchUserRoles,
  normalizeMenuName,
  normalizeRoleName,
  prettifyRoleName,
  type RolePermissionRecord,
  type SystemObject,
  type UserRoleRecord,
  updateRolePermission,
  updateUserRole,
} from "@/lib/role-management";

type PermissionKey = "view" | "add" | "edit" | "delete";

type PermissionDraft = Record<PermissionKey, boolean>;

const permissionKeys: PermissionKey[] = ["view", "add", "edit", "delete"];

const permissionLabels: Record<PermissionKey, string> = {
  view: "View",
  add: "Add",
  edit: "Edit",
  delete: "Delete",
};

export default function RolePermissionsPage() {
  const [roles, setRoles] = useState<UserRoleRecord[]>([]);
  const [systemObjects, setSystemObjects] = useState<SystemObject[]>([]);
  const [permissions, setPermissions] = useState<RolePermissionRecord[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [selectedObjectId, setSelectedObjectId] = useState<string>("");
  const [objectListVisible, setObjectListVisible] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [roleMode, setRoleMode] = useState<"create" | "edit">("create");
  const [roleName, setRoleName] = useState("");
  const [submittingRole, setSubmittingRole] = useState(false);

  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [moduleName, setModuleName] = useState("");
  const [moduleDescription, setModuleDescription] = useState("");
  const [submittingModule, setSubmittingModule] = useState(false);

  const systemObjectSectionRef = useRef<HTMLDivElement | null>(null);

  const selectedRole = useMemo(
    () => roles.find((role) => role.role_id === selectedRoleId) ?? null,
    [roles, selectedRoleId],
  );

  const permissionMap = useMemo(() => {
    const map = new Map<string, RolePermissionRecord>();
    permissions.forEach((record) => {
      map.set(`${record.role_id}:${record.sys_obj_id}`, record);
    });
    return map;
  }, [permissions]);

  const loadData = async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      const [roleList, objectList, permissionList] = await Promise.all([
        fetchUserRoles(),
        fetchSystemObjects(),
        fetchRolePermissions(),
      ]);

      setRoles(roleList);
      setSystemObjects(objectList);
      setPermissions(permissionList);

      setSelectedRoleId((current) => {
        if (current && roleList.some((role) => role.role_id === current)) {
          return current;
        }
        return roleList[0]?.role_id ?? "";
      });

      setSelectedObjectId((current) => {
        if (current && objectList.some((object) => object.sys_obj_id === current)) {
          return current;
        }
        return objectList[0]?.sys_obj_id ?? "";
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load role management data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const getPermissionDraft = (roleId: string, objectId: string): PermissionDraft => {
    const record = permissionMap.get(`${roleId}:${objectId}`);
    return {
      view: record?.view ?? false,
      add: record?.add ?? false,
      edit: record?.edit ?? false,
      delete: record?.delete ?? false,
    };
  };

  const handlePermissionToggle = async (
    objectId: string,
    permission: PermissionKey,
    nextValue: boolean,
  ) => {
    if (!selectedRoleId) {
      return;
    }

    const saveId = `${selectedRoleId}:${objectId}:${permission}`;
    setSavingKey(saveId);

    const existing = permissionMap.get(`${selectedRoleId}:${objectId}`);
    const current = getPermissionDraft(selectedRoleId, objectId);
    const nextDraft = {
      ...current,
      [permission]: nextValue,
    };

    try {
      let saved: RolePermissionRecord;

      if (existing) {
        saved = await updateRolePermission(existing.permission_id, nextDraft);
        setPermissions((prev) =>
          prev.map((item) =>
            item.permission_id === existing.permission_id ? saved : item,
          ),
        );
      } else {
        saved = await createRolePermission({
          role_id: selectedRoleId,
          sys_obj_id: objectId,
          ...nextDraft,
        });
        setPermissions((prev) => [...prev, saved]);
      }

      toast.success("Permission updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update permission");
    } finally {
      setSavingKey(null);
    }
  };

  const handleObjectSelect = (objectId: string) => {
    setSelectedObjectId(objectId);
  };

  const jumpToSystemObjects = () => {
    systemObjectSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const openCreateRole = () => {
    setRoleMode("create");
    setRoleName("");
    setRoleDialogOpen(true);
  };

  const openEditRole = (role?: UserRoleRecord | null) => {
    const targetRole = role ?? selectedRole;
    if (!targetRole) {
      return;
    }
    setRoleMode("edit");
    setRoleName(targetRole.role_name);
    setSelectedRoleId(targetRole.role_id);
    setRoleDialogOpen(true);
  };

  const handleRoleSubmit = async () => {
    const cleanedName = roleName.trim();

    if (!cleanedName) {
      toast.error("Role name is required");
      return;
    }

    const normalized = normalizeRoleName(cleanedName);
    const duplicate = roles.find(
      (role) =>
        normalizeRoleName(role.role_name) === normalized &&
        (roleMode === "create" || role.role_id !== selectedRoleId),
    );

    if (duplicate) {
      toast.error("This role already exists");
      return;
    }

    setSubmittingRole(true);

    try {
      if (roleMode === "create") {
        const created = await createUserRole({ role_name: cleanedName });
        setRoles((prev) => [...prev, created]);
        setSelectedRoleId(created.role_id);
        toast.success("Role created");
      } else if (selectedRoleId) {
        const updated = await updateUserRole(selectedRoleId, { role_name: cleanedName });
        setRoles((prev) =>
          prev.map((role) => (role.role_id === selectedRoleId ? updated : role)),
        );
        toast.success("Role updated");
      }

      setRoleDialogOpen(false);
      setRoleName("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save role");
    } finally {
      setSubmittingRole(false);
    }
  };

  const handleModuleSubmit = async () => {
    const cleanedName = moduleName.trim();
    const cleanedDescription = moduleDescription.trim();

    if (!cleanedName) {
      toast.error("Module name is required");
      return;
    }

    const normalized = normalizeMenuName(cleanedName);
    const duplicate = systemObjects.find(
      (object) => normalizeMenuName(object.object_name) === normalized,
    );

    if (duplicate) {
      toast.error("This module already exists");
      return;
    }

    setSubmittingModule(true);

    try {
      const created = await createSystemObject({
        object_name: cleanedName,
        description: cleanedDescription || null,
      });
      setSystemObjects((prev) => [...prev, created]);
      setSelectedObjectId(created.sys_obj_id);
      setObjectListVisible(true);
      setModuleDialogOpen(false);
      setModuleName("");
      setModuleDescription("");
      toast.success("Module created");
      setTimeout(() => {
        jumpToSystemObjects();
      }, 50);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create module");
    } finally {
      setSubmittingModule(false);
    }
  };

  const selectedRoleEnabledCount = useMemo(() => {
    if (!selectedRoleId) {
      return 0;
    }

    return systemObjects.reduce((count, object) => {
      const draft = getPermissionDraft(selectedRoleId, object.sys_obj_id);
      return count + permissionKeys.filter((key) => draft[key]).length;
    }, 0);
  }, [selectedRoleId, systemObjects, permissionMap]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
              <Lock className="h-6 w-6" />
              User Role & Permission Management
            </h1>
            <p className="text-muted-foreground">
              Role dropdown se permission control, object click se niche detail, aur full role management right side par.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => void loadData(false)} disabled={refreshing}>
              {refreshing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
              Refresh
            </Button>
            <Button variant="outline" onClick={jumpToSystemObjects}>
              <ChevronDown className="mr-2 h-4 w-4" />
              Jump to System Objects
            </Button>
            <Button variant="outline" onClick={() => setModuleDialogOpen(true)}>
              <Tags className="mr-2 h-4 w-4" />
              Add Object
            </Button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_380px]">
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Shield className="h-5 w-5" />
                    Permission Control
                  </CardTitle>
                  <CardDescription>
                    Upar role select karo aur niche object-wise permission control manage karo.
                  </CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{systemObjects.length} objects</Badge>
                  <Badge variant="outline">{selectedRoleEnabledCount} enabled actions</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 md:grid-cols-[280px_1fr] md:items-end">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Select Role</label>
                    <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.role_id} value={role.role_id}>
                            {prettifyRoleName(role.role_name)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="rounded-xl border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
                    {selectedRole ? (
                      <span>
                        Active role:{" "}
                        <span className="font-semibold text-foreground">
                          {prettifyRoleName(selectedRole.role_name)}
                        </span>
                      </span>
                    ) : (
                      <span>Select a role to manage permissions.</span>
                    )}
                  </div>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-16 text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading permissions...
                  </div>
                ) : !selectedRole ? (
                  <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                    Select a role to start managing permissions.
                  </div>
                ) : (
                  <div className="rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/40">
                          <TableHead className="min-w-[240px]">System Object</TableHead>
                          {permissionKeys.map((key) => (
                            <TableHead key={key} className="text-center">
                              {permissionLabels[key]}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {systemObjects.map((object) => {
                          const draft = getPermissionDraft(selectedRole.role_id, object.sys_obj_id);
                          const isSelected = object.sys_obj_id === selectedObjectId;

                          return (
                            <TableRow
                              key={object.sys_obj_id}
                              className={cn(
                                "cursor-pointer transition hover:bg-muted/30",
                                isSelected && "bg-primary/5",
                              )}
                              onClick={() => handleObjectSelect(object.sys_obj_id)}
                            >
                              <TableCell>
                                <div className="font-medium text-foreground">
                                  {object.object_name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {object.description || "No description added"}
                                </div>
                              </TableCell>
                              {permissionKeys.map((key) => {
                                const isSaving =
                                  savingKey === `${selectedRole.role_id}:${object.sys_obj_id}:${key}`;

                                return (
                                  <TableCell
                                    key={key}
                                    className="text-center"
                                    onClick={(event) => event.stopPropagation()}
                                  >
                                    <div className="flex items-center justify-center gap-2">
                                      <Switch
                                        checked={draft[key]}
                                        onCheckedChange={(checked) =>
                                          void handlePermissionToggle(
                                            object.sys_obj_id,
                                            key,
                                            checked,
                                          )
                                        }
                                        disabled={isSaving}
                                      />
                                      {isSaving && (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                                      )}
                                    </div>
                                  </TableCell>
                                );
                              })}
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card ref={systemObjectSectionRef}>
              <CardHeader className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Building2 className="h-5 w-5" />
                    System Object List
                  </CardTitle>
                  <CardDescription>
                    System object ko yahin se manage karo.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{systemObjects.length} total objects</Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setModuleDialogOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add
                  </Button>
                  <Button variant="outline" size="sm" disabled={!selectedObjectId}>
                    <Edit3 className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setObjectListVisible((prev) => !prev)}
                  >
                    {objectListVisible ? (
                      <>
                        <EyeOff className="mr-2 h-4 w-4" />
                        Hide Table
                      </>
                    ) : (
                      <>
                        <Eye className="mr-2 h-4 w-4" />
                        Show Table
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {objectListVisible ? (
                  <div className="rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/40">
                          <TableHead className="w-[160px]">Object ID</TableHead>
                          <TableHead>Object Name</TableHead>
                          <TableHead>Description</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {systemObjects.map((object) => (
                          <TableRow
                            key={object.sys_obj_id}
                            className={cn(
                              "cursor-pointer transition hover:bg-muted/30",
                              selectedObjectId === object.sys_obj_id && "bg-primary/5",
                            )}
                            onClick={() => handleObjectSelect(object.sys_obj_id)}
                          >
                            <TableCell>
                              <code className="rounded bg-muted px-2 py-1 text-xs">
                                {object.sys_obj_id}
                              </code>
                            </TableCell>
                            <TableCell className="font-medium text-foreground">
                              {object.object_name}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {object.description || "No description added"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex items-center justify-center rounded-lg border border-dashed py-10 text-sm text-muted-foreground">
                    Table hidden. Click "Show Table" to view system objects again.
                  </div>
                )}
              </CardContent>
            </Card>

          </div>

          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="h-5 w-5" />
                  Role Management
                </CardTitle>
                <CardDescription>
                  Pura role management right side me rakha gaya hai.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={openCreateRole}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Role
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => openEditRole()}
                    disabled={!selectedRole}
                  >
                    <Edit3 className="mr-2 h-4 w-4" />
                    Edit Role
                  </Button>
                </div>

                <ScrollArea className="h-[620px] pr-3">
                  <div className="space-y-3">
                    {loading ? (
                      <div className="flex items-center justify-center py-10 text-muted-foreground">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading roles...
                      </div>
                    ) : roles.length === 0 ? (
                      <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                        No roles found yet.
                      </div>
                    ) : (
                      roles.map((role) => {
                        const isActive = role.role_id === selectedRoleId;
                        return (
                          <div
                            key={role.role_id}
                            className={cn(
                              "rounded-xl border px-4 py-3 transition",
                              isActive
                                ? "border-primary bg-primary/5"
                                : "border-border bg-background",
                            )}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <button
                                type="button"
                                onClick={() => setSelectedRoleId(role.role_id)}
                                className="flex-1 text-left"
                              >
                                <div className="font-medium text-foreground">
                                  {prettifyRoleName(role.role_name)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {role.role_name}
                                </div>
                              </button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditRole(role)}
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                            </div>
                            {isActive && (
                              <div className="mt-3 flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-primary" />
                                <span className="text-xs font-medium text-primary">
                                  Selected for permission control
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{roleMode === "create" ? "Create Role" : "Edit Role"}</DialogTitle>
            <DialogDescription>
              {roleMode === "create"
                ? "Add a new user role for permission management."
                : "Update the selected role name."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Role Name</label>
            <Input
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder="e.g. nurse_manager"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void handleRoleSubmit()} disabled={submittingRole}>
              {submittingRole && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={moduleDialogOpen} onOpenChange={setModuleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Object</DialogTitle>
            <DialogDescription>
              Add a system object/module that can be assigned in permissions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Object Name</label>
              <Input
                value={moduleName}
                onChange={(e) => setModuleName(e.target.value)}
                placeholder="e.g. Billing"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Description</label>
              <Textarea
                value={moduleDescription}
                onChange={(e) => setModuleDescription(e.target.value)}
                placeholder="Optional description"
                className="min-h-[120px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModuleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void handleModuleSubmit()} disabled={submittingModule}>
              {submittingModule && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Object
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
