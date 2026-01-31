import { useAuth } from '@/contexts/AuthContext';
import { 
  Module, 
  Permission, 
  hasPermission, 
  getRolePermissions, 
  getAccessibleModules,
  RolePermissions 
} from '@/lib/permissions';

export function usePermissions() {
  const { role } = useAuth();

  const can = (module: Module, permission: Permission): boolean => {
    return hasPermission(role, module, permission);
  };

  const canView = (module: Module): boolean => can(module, 'view');
  const canCreate = (module: Module): boolean => can(module, 'create');
  const canUpdate = (module: Module): boolean => can(module, 'update');
  const canDelete = (module: Module): boolean => can(module, 'delete');

  const permissions: RolePermissions | null = role ? getRolePermissions(role) : null;
  const accessibleModules: Module[] = role ? getAccessibleModules(role) : [];

  return {
    can,
    canView,
    canCreate,
    canUpdate,
    canDelete,
    permissions,
    accessibleModules,
    role,
  };
}
