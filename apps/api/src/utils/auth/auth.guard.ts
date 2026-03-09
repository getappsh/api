import { ExecutionContext, HttpException, HttpStatus, Logger, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard as ckAuthGuard, KeycloakConnectConfig } from 'nest-keycloak-connect';
import * as KeycloakConnect from 'keycloak-connect';
import { KeycloakMultiTenantService } from 'nest-keycloak-connect/services/keycloak-multitenant.service';
import { Request, Response, } from 'express';
import { TLSSocket } from 'tls';
import { Unprotected } from '../sso/sso.decorators';
import { ConfigService } from '@nestjs/config';
import { PermissionsGuard } from '@app/common/permissions';



export class AuthGuard extends ckAuthGuard {
  ref: Reflector
  constructor(
    singleTenant: KeycloakConnect.Keycloak,
    keycloakOpts: KeycloakConnectConfig,
    logger: Logger,
    multiTenant: KeycloakMultiTenantService,
    reflector: Reflector,
    private permissionsGuard?: PermissionsGuard,
  ) {
    super(singleTenant, keycloakOpts, logger, multiTenant, reflector)
    this.ref = reflector
  };

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const socket = request.socket as TLSSocket;

    const isUnprotected = this.ref.getAllAndOverride("out-of-auth", [context.getHandler(), context.getClass()])
    const authOrProject = this.ref.getAllAndOverride("auth-or-project", [context.getHandler(), context.getClass()])

    if ((socket.authorized && request.header("auth_type") && request.header("auth_type") == "CC") || isUnprotected) { // CC stands for client certificates
      if (request.header("integration_test") === "true") {
        request["user"] = {
          // realm_access: { roles: ["agent"] },
          given_name: "integration",
          family_name: "test",
          email: "integration@test.com"
        }
      }
      return true
    }
    
    if (authOrProject && request.headers['x-project-token']) {
      return true
    }
    
    // Check for device secret authentication
    const secret = process.env.DEVICE_AUTH ?? process.env.DEVICE_SECRET
    let secretKeys: string[] = []
    if (secret) {
      secretKeys = secret.split(",");
    }
    
    const hasDeviceAuth = request.header("Device-Auth") && secretKeys.some(k => request.header("Device-Auth") === k.trim());
    
    // Check for Authorization header — middleware has already normalized all casing variants to lowercase
    const authHeader = request.headers.authorization;
    
    // Verify that user is authenticated (either JWT or device auth)
    const isAuthenticated = hasDeviceAuth || authHeader;
    
    if (!isAuthenticated) {
      throw new UnauthorizedException({ message: socket.authorizationError || "No authentication provided" });
    }
    
    // If PermissionsGuard is available, ALWAYS use it for permission validation
    // It will check if endpoint has @RequireRole decorator and validate accordingly
    if (this.permissionsGuard) {
      // Validate permissions first
      const permissionsValid = await this.permissionsGuard.canActivate(context);
      if (!permissionsValid) {
        throw new UnauthorizedException({ message: "Permission validation failed" });
      }
      
      // For JWT: also validate token with Keycloak guard
      if (authHeader) {
        return await super.canActivate(context);
      }
      
      // For device auth: permissions passed, authentication already verified
      if (hasDeviceAuth) {
        return true;
      }
    }
    
    // No PermissionsGuard - use legacy behavior
    if (hasDeviceAuth) {
      return true;
    }
    
    if (authHeader) {
      return await super.canActivate(context);
    }

    throw new UnauthorizedException({ message: socket.authorizationError || "unknown error" })
  }

}


