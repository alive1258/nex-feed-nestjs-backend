import { RoleBasedPermissions, RoleHierarchy } from 'src/config/roles.config';
import { Permission } from '../enums/permission-type.enum';
import { Role } from '../enums/role-type.enum';

interface PermissionContext {
  roles: Role[];
  permissions: Permission[];
}

export class PermissionManager {
  private readonly cachedRoleHierarchy = new Map<Role, Set<Role>>();
  private readonly cachedRolePermissions = new Map<Role, Set<Permission>>();

  constructor(private readonly context: PermissionContext) {
    // Precompute role hierarchy
    for (const role of Object.keys(RoleHierarchy) as Role[]) {
      this.cachedRoleHierarchy.set(role, this.computeRoleHierarchy(role));
    }

    // Precompute permissions per role
    for (const role of Object.keys(RoleBasedPermissions) as Role[]) {
      this.cachedRolePermissions.set(role, this.computeRolePermissions(role));
    }
  }

  /** Check if the user has a specific permission */
  hasPermission(required: Permission): boolean {
    // Direct user permissions
    if (
      this.context.permissions.some((p) => this.matchPermission(p, required))
    ) {
      return true;
    }

    // Permissions via roles
    return this.hasPermissionThroughRoles(this.context.roles, required);
  }

  /** Check if the user has all of the given permissions */
  hasPermissions(requiredPermissions: Permission[]): boolean {
    return requiredPermissions.every((p) => this.hasPermission(p));
  }

  /** Check if the user has any of the given permissions */
  hasAnyPermission(requiredPermissions: Permission[]): boolean {
    return requiredPermissions.some((p) => this.hasPermission(p));
  }

  /** Check if the user has a specific role (including via hierarchy) */
  hasRole(requiredRole: Role): boolean {
    return this.context.roles.some((role) => {
      const hierarchySet = this.cachedRoleHierarchy.get(role);
      return role === requiredRole || hierarchySet?.has(requiredRole);
    });
  }

  /** Get the "highest" role of the user based on hierarchy */
  getMaxRole(): Role {
    return this.context.roles.reduce((maxRole, currentRole) => {
      return this.cachedRoleHierarchy.get(maxRole)?.has(currentRole)
        ? maxRole
        : currentRole;
    }, this.context.roles[0]);
  }

  /** Precompute all roles inherited by a role */
  private computeRoleHierarchy(
    role: Role,
    visited = new Set<Role>(),
  ): Set<Role> {
    const result = new Set<Role>();
    if (visited.has(role)) return result;
    visited.add(role);

    const inheritedRoles = RoleHierarchy[role] || [];
    inheritedRoles.forEach((r) => {
      result.add(r);
      this.computeRoleHierarchy(r, visited).forEach((rr) => result.add(rr));
    });

    return result;
  }

  /** Precompute all permissions for a role (including inherited) */
  private computeRolePermissions(
    role: Role,
    visited = new Set<Role>(),
  ): Set<Permission> {
    const result = new Set<Permission>();
    if (visited.has(role)) return result;
    visited.add(role);

    RoleBasedPermissions[role]?.forEach((p) => result.add(p));

    const hierarchySet = this.cachedRoleHierarchy.get(role);
    hierarchySet?.forEach((inheritedRole) => {
      this.computeRolePermissions(inheritedRole, visited).forEach((p) =>
        result.add(p),
      );
    });

    return result;
  }

  /** Match permissions, supports wildcards (e.g., product:*) */
  private matchPermission(
    userPermission: Permission,
    required: Permission,
  ): boolean {
    if (userPermission === required) return true;

    const [resource] = required.split(':');
    return userPermission.toString() === `${resource}:*`;
  }

  /** Check permission through roles */
  private hasPermissionThroughRoles(
    roles: Role[],
    permission: Permission,
  ): boolean {
    return roles.some((role) =>
      Array.from(this.cachedRolePermissions.get(role) || []).some((p) =>
        this.matchPermission(p, permission),
      ),
    );
  }
}
