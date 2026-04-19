import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

@Injectable()
export class SecretKeyGuard implements CanActivate {
  private readonly logger = new Logger(SecretKeyGuard.name);

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // If SECRET_AUTH_DISABLED is "true", skip auth (open mode)
    const authDisabled = process.env.SECRET_AUTH_DISABLED === 'true';
    if (authDisabled) {
      return true;
    }

    // Allow endpoints decorated with @Unprotected()
    const isUnprotected = this.reflector.getAllAndOverride<boolean>('out-of-auth', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isUnprotected) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const secret = process.env.DEVICE_AUTH;

    if (!secret) {
      this.logger.warn('SECRET_AUTH_ENABLED is true but DEVICE_AUTH / DEVICE_SECRET is not set — denying request');
      throw new UnauthorizedException('Server misconfiguration: secret key not configured');
    }

    const secretKeys = secret.split(',').map(k => k.trim());
    const deviceAuthHeader = request.header('Device-Auth');

    if (!deviceAuthHeader || !secretKeys.some(k => deviceAuthHeader === k)) {
      throw new UnauthorizedException('Invalid or missing Device-Auth header');
    }

    return true;
  }
}
