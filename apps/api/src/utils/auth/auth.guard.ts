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
    let accessToken: string | undefined = undefined;
    if (request.headers.cookie) {
      accessToken = this.getCookie(request.headers.cookie, "accessToken");
    }
    if (accessToken) {
      request.headers["Authorization"] = `Bearer ${accessToken}`;
    }

    if ((socket.authorized && request.header("auth_type") && request.header("auth_type") == "CC") || isUnprotected) { // CC stands for client certificates
      if (request.header("integration_test") === "true") {
        request["user"] = {
          // realm_access: { roles: ["agent"] },
          given_name: "integration",
          family_name: "test",
          email: "integraion@test.com"
        }
      }
      return true
    }

    if (authOrProject && request.headers['x-project-token']) {
      return true
    }

    // Check for project token or device secret first (priority over JWT)
    const secret = process.env.DEVICE_AUTH ?? process.env.DEVICE_SECRET
    let secretKeys: string[] = []
    if (secret) {
      secretKeys = secret.split(",");
    }

    const hasDeviceAuth = request.header("Device-Auth") && secretKeys.some(k => request.header("Device-Auth") === k.trim());
    
    // If project token or device secret is present, use old guard only
    if (hasDeviceAuth) {
      return true;
    }

    // Check for Authorization header (case-insensitive) - only if no project token/secret
    const authHeader = request.headers.authorization || request.headers["authorization"] || 
                       request.headers.Authorization || request.headers["Authorization"];
    
    if (authHeader) {
      // If PermissionsGuard is available, use it for JWT validation
      if (this.permissionsGuard) {
        try {
          return await this.permissionsGuard.canActivate(context);
        } catch (error) {
          // If PermissionsGuard fails, fall back to old Keycloak guard
          return await super.canActivate(context);
        }
      }
      // Fallback to old Keycloak guard if PermissionsGuard not available
      return await super.canActivate(context);
    }

    throw new UnauthorizedException({ message: socket.authorizationError || "unknown error" })
  }

  getCookie(cookies: string, cname: any) {
    let name = cname + "=";
    let ca = cookies?.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";

  }
}


