import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ActiveUserData } from '../interface/active-user-data.interface';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { Role } from '../enums/role-type.enum';
import { Permission } from '../enums/permission-type.enum';
import { PermissionManager } from './permission-manager.gurad';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get required permissions from the decorator
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true; // no permissions required
    }

    // Get the request and user
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as ActiveUserData & {
      role: Role | Role[]; // handle single or multiple roles
      permissions: Permission[];
    };

    if (!user?.role) {
      throw new ForbiddenException('User roles not found');
    }
    if (!user?.permissions) {
      throw new ForbiddenException('User permissions not found');
    }

    // Ensure roles is an array
    const rolesArray = Array.isArray(user.role) ? user.role : [user.role];

    // Initialize PermissionManager
    const pm = new PermissionManager({
      roles: rolesArray,
      permissions: user.permissions,
    });

    // Check permissions
    const allowed = pm.hasPermissions(requiredPermissions);
    if (!allowed) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
