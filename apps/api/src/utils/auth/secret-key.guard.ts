import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class SecretKeyGuard implements CanActivate {
  private readonly logger = new Logger(SecretKeyGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {

    // Allow endpoints decorated with @Unprotected()
    const isUnprotected = this.reflector.getAllAndOverride<boolean>('out-of-auth', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isUnprotected) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();

    // First — check Device-Auth secret key
    const secret = process.env.DEVICE_AUTH;
    if (secret) {
      const secretKeys = secret.split(',').map(k => k.trim());
      const deviceAuthHeader = request.header('Device-Auth');
      if (deviceAuthHeader && secretKeys.some(k => deviceAuthHeader === k)) {
        return true;
      }
    }

    // No valid Device-Auth — try Bearer token
    const authHeader = request.header('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        this.logger.warn('Bearer token received but JWT_SECRET env var is not set');
        throw new UnauthorizedException('Token validation is not configured on this server');
      }
      try {
        const payload = await this.jwtService.verifyAsync<any>(token, { secret: jwtSecret });
        if (payload?.type === 'refresh') {
          this.logger.warn('Refresh token used as access token — rejected');
          throw new UnauthorizedException('Refresh token cannot be used for API access');
        }
        return true;
      } catch (error: any) {
        if (error instanceof UnauthorizedException) throw error;
        this.logger.warn(`Bearer token verification failed: ${error?.message ?? error}`);
        throw new UnauthorizedException('Invalid or expired token');
      }
    }

    throw new UnauthorizedException('No valid authentication provided');
  }
}
