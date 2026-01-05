import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsService } from '../services/permissions.service';
import { REQUIRED_ROLES_KEY } from '../constants/metadata-keys';
import { RequirePermissionsOptions } from '../decorators/permissions.decorator';
import { JwtPayload } from '../types/jwt-payload.interface';

/**
 * Guard to enforce role-based permissions
 * Works in conjunction with @RequirePermissions decorator
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name);

  constructor(
    private reflector: Reflector,
    private permissionsService: PermissionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get required permissions from decorator metadata
    const permissionsOptions = this.reflector.getAllAndOverride<
      RequirePermissionsOptions | undefined
    >(REQUIRED_ROLES_KEY, [context.getHandler(), context.getClass()]);

    // If no permissions decorator found, allow access
    if (!permissionsOptions) {
      this.logger.debug('No permissions required, allowing access');
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: JwtPayload = request.user;

    if (!user) {
      this.logger.warn('No user found in request');
      throw new ForbiddenException('Authentication required');
    }

    const { roles, requireAll = false } = permissionsOptions;

    // Validate permissions
    const hasPermission = this.permissionsService.validatePermissions(
      user,
      roles,
      requireAll,
    );

    if (!hasPermission) {
      const userRoles = this.permissionsService.getUserRoles(user);
      this.logger.warn(
        `Access denied for user ${user.preferred_username}. ` +
          `Required: ${roles.join(', ')} (requireAll: ${requireAll}), ` +
          `User has: ${userRoles.join(', ')}`,
      );

      throw new ForbiddenException(
        `Insufficient permissions. Required role${roles.length > 1 ? 's' : ''}: ${roles.join(', ')}`,
      );
    }

    this.logger.debug(
      `Access granted for user ${user.preferred_username} to ${context.getClass().name}.${context.getHandler().name}`,
    );

    return true;
  }
}
