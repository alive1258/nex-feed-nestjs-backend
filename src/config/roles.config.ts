import { Permission } from 'src/auth/enums/permission-type.enum';
import { Role } from 'src/auth/enums/role-type.enum';

// Role hierarchy definition
export const RoleHierarchy: Record<Role, readonly Role[]> = {
  [Role.ADMIN]: [],
} as const;

// Role-based permissions definition. role hierarchy (inheritance) SUPER_ADMIN > ADMIN > MANAGER > PREMIUM_USER > USER
export const RoleBasedPermissions: Record<Role, Permission[]> = {
  [Role.ADMIN]: [
    Permission.POSTS_CREATE,
    Permission.POSTS_VIEW,
    Permission.POSTS_UPDATE,
    Permission.POSTS_DELETE,

    Permission.POSTS_LIKE,
    Permission.POSTS_COMMENT,
    Permission.POSTS_REPLY,
  ],
};
