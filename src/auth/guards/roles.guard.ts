import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ActiveUserData } from '../interface/active-user-data.interface';
import { Role } from '../enums/role-type.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get the roles required by the route from metadata
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) return true;

    // Get the currently authenticated user
    const request = context
      .switchToHttp()
      .getRequest<{ user?: ActiveUserData }>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException(
        'Authentication required to access this resource',
      );
    }

    if (!requiredRoles.includes(user.role as Role)) {
      throw new ForbiddenException(
        `Access denied. Required role(s): ${requiredRoles.join(
          ', ',
        )}. Your role: ${user.role}`,
      );
    }

    return true;
  }
}
