const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

export type PermissionField = "view" | "add" | "edit" | "delete";

export interface SystemObject {
  sys_obj_id: string;
  object_name: string;
  description?: string | null;
}

export interface UserRoleRecord {
  role_id: string;
  role_name: string;
}

export interface RolePermissionRecord {
  permission_id: string;
  role_id: string;
  sys_obj_id: string;
  view: boolean;
  add: boolean;
  edit: boolean;
  delete: boolean;
}

export interface PermissionMap {
  [objectName: string]: {
    view: boolean;
    add: boolean;
    edit: boolean;
    delete: boolean;
  };
}

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
  error?: string;
};

function getAuthHeaders(headers?: HeadersInit): HeadersInit {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };
}

async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: getAuthHeaders(init.headers),
    credentials: "include",
  });

  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null;

  if (!response.ok || !payload?.success) {
    throw new Error(payload?.message || payload?.error || "Request failed");
  }

  return payload.data;
}

function toBoolean(value: unknown) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value === 1;
  }

  if (typeof value === "string") {
    return ["true", "1", "yes", "y"].includes(value.toLowerCase());
  }

  return false;
}

export function normalizeRoleName(role: string) {
  return role.trim().toLowerCase().replace(/[\s-]+/g, "_");
}

export function prettifyRoleName(role: string) {
  return role
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function normalizeMenuName(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

export async function fetchSystemObjects() {
  const data = await apiRequest<any[]>("/system_object/list");
  return data
    .map((item) => ({
      sys_obj_id: String(item.sys_obj_id ?? item.id ?? item.object_id ?? ""),
      object_name: String(item.object_name ?? item.name ?? item.menu_name ?? "").trim(),
      description: item.description == null ? null : String(item.description),
    }))
    .filter((item) => item.sys_obj_id && item.object_name);
}

export async function createSystemObject(payload: { object_name: string; description?: string | null }) {
  const data = await apiRequest<any>("/system_object/add", {
    method: "POST",
    body: JSON.stringify({
      object_name: payload.object_name,
      description: payload.description ?? null,
    }),
  });

  return {
    sys_obj_id: String(data.sys_obj_id ?? data.id ?? data.object_id ?? ""),
    object_name: String(data.object_name ?? payload.object_name).trim(),
    description: data.description == null ? payload.description ?? null : String(data.description),
  } satisfies SystemObject;
}

export async function fetchUserRoles() {
  const data = await apiRequest<any[]>("/user_role/list");
  return data
    .map((item) => ({
      role_id: String(item.role_id ?? item.id ?? ""),
      role_name: String(item.role_name ?? item.role ?? item.name ?? "").trim(),
    }))
    .filter((item) => item.role_id && item.role_name);
}

export async function createUserRole(payload: { role_name: string }) {
  const data = await apiRequest<any>("/user_role/add", {
    method: "POST",
    body: JSON.stringify({
      role_name: payload.role_name,
    }),
  });

  return {
    role_id: String(data.role_id ?? data.id ?? ""),
    role_name: String(data.role_name ?? data.role ?? payload.role_name).trim(),
  } satisfies UserRoleRecord;
}

export async function updateUserRole(
  roleId: string,
  payload: { role_name: string },
) {
  const data = await apiRequest<any>(`/user_role/update/${roleId}`, {
    method: "PUT",
    body: JSON.stringify({
      role_name: payload.role_name,
    }),
  });

  return {
    role_id: String(data.role_id ?? roleId),
    role_name: String(data.role_name ?? data.role ?? payload.role_name).trim(),
  } satisfies UserRoleRecord;
}

export async function fetchRolePermissions() {
  const data = await apiRequest<any[]>("/role_per/list");
  return data.map(
    (item) =>
      ({
        permission_id: String(item.permission_id ?? item.id ?? ""),
        role_id: String(item.role_id ?? ""),
        sys_obj_id: String(item.sys_obj_id ?? ""),
        view: toBoolean(item.view),
        add: toBoolean(item.add),
        edit: toBoolean(item.edit),
        delete: toBoolean(item.delete),
      }) satisfies RolePermissionRecord,
  );
}

export async function createRolePermission(payload: Omit<RolePermissionRecord, "permission_id">) {
  const data = await apiRequest<any>("/role_per/add", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return {
    permission_id: String(data.permission_id ?? data.id ?? ""),
    role_id: String(data.role_id ?? payload.role_id),
    sys_obj_id: String(data.sys_obj_id ?? payload.sys_obj_id),
    view: toBoolean(data.view ?? payload.view),
    add: toBoolean(data.add ?? payload.add),
    edit: toBoolean(data.edit ?? payload.edit),
    delete: toBoolean(data.delete ?? payload.delete),
  } satisfies RolePermissionRecord;
}

export async function updateRolePermission(
  permissionId: string,
  payload: Partial<Omit<RolePermissionRecord, "permission_id">>,
) {
  const data = await apiRequest<any>(`/role_per/update/${permissionId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  return {
    permission_id: String(data.permission_id ?? permissionId),
    role_id: String(data.role_id ?? payload.role_id ?? ""),
    sys_obj_id: String(data.sys_obj_id ?? payload.sys_obj_id ?? ""),
    view: toBoolean(data.view ?? payload.view),
    add: toBoolean(data.add ?? payload.add),
    edit: toBoolean(data.edit ?? payload.edit),
    delete: toBoolean(data.delete ?? payload.delete),
  } satisfies RolePermissionRecord;
}

export async function fetchPermissionMapByRole(roleId: string) {
  const data = await apiRequest<PermissionMap>(`/role_per/permission/${roleId}`);
  return Object.entries(data || {}).reduce<PermissionMap>((acc, [key, value]) => {
    acc[key] = {
      view: toBoolean(value?.view),
      add: toBoolean(value?.add),
      edit: toBoolean(value?.edit),
      delete: toBoolean(value?.delete),
    };
    return acc;
  }, {});
}
