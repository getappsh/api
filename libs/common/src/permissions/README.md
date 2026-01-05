# Permissions System

A comprehensive role-based access control (RBAC) system for validating JWT permissions in your NestJS microservices.

## Overview

This permissions system validates user roles from Keycloak JWT tokens before allowing access to protected endpoints. It uses the `resource_access.api.roles` array from the JWT payload.

## Features

- ✅ Role-based authorization using JWT tokens
- ✅ Conditional activation via environment variable or stamp role
- ✅ Reusable across multiple microservices
- ✅ Admin bypass - users with `admin` role have access to everything
- ✅ Flexible decorators for easy endpoint protection
- ✅ Support for "any role" or "all roles" validation
- ✅ Comprehensive logging for debugging
- ✅ TypeScript type safety

## Installation

The permissions system is available in `@app/common` library and can be imported in any microservice.

### 1. Import the Module

In your microservice's `app.module.ts` (e.g., `api/apps/api/src/app.module.ts`):

```typescript
import { Module } from '@nestjs/common';
import { PermissionsModule } from '@app/common';

@Module({
  imports: [
    // ... other imports
    PermissionsModule.forRoot(),
    // ... other imports
  ],
})
export class AppModule {}
```

Or with custom configuration:

```typescript
import { PermissionsModule } from '@app/common';

@Module({
  imports: [
    PermissionsModule.forRootWithConfig({
      enableEnvVar: 'ENABLE_PERMISSIONS',
      stampRole: 'permissions-enabled',
      resourceName: 'api',
    }),
  ],
})
export class AppModule {}
```

### 2. Apply the Guard Globally (Optional)

To apply the guard globally, add it to your main module:

```typescript
import { APP_GUARD } from '@nestjs/core';
import { PermissionsGuard } from '@app/common';

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
})
export class AppModule {}
```

Or apply it at controller/method level as needed.

## Usage

### Basic Usage

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { RequireRole, ApiRole, PermissionsGuard } from '@app/common';

@Controller('projects')
@UseGuards(PermissionsGuard)
export class ProjectsController {
  @Get()
  @RequireRole(ApiRole.VIEW_PROJECT)
  findAll() {
    return 'This action returns all projects';
  }

  @Post()
  @RequireRole(ApiRole.CREATE_PROJECT)
  create() {
    return 'This action creates a project';
  }

  @Delete(':id')
  @RequireRole(ApiRole.DELETE_PROJECT)
  remove(@Param('id') id: string) {
    return `This action removes project ${id}`;
  }
}
```

### Multiple Roles (Any)

Allow access if user has ANY of the specified roles:

```typescript
import { RequireAnyRole, ApiRole } from '@app/common';

@Get(':id')
@RequireAnyRole([ApiRole.VIEW_PROJECT, ApiRole.ADMIN])
findOne(@Param('id') id: string) {
  return `This action returns project ${id}`;
}
```

### Multiple Roles (All)

Require user to have ALL specified roles:

```typescript
import { RequireAllRoles, ApiRole } from '@app/common';

@Put(':id')
@RequireAllRoles([ApiRole.VIEW_PROJECT, ApiRole.UPDATE_PROJECT])
update(@Param('id') id: string) {
  return `This action updates project ${id}`;
}
```

### Advanced Usage

Using the base decorator with options:

```typescript
import { RequirePermissions, ApiRole } from '@app/common';

@Post(':id/deploy')
@RequirePermissions({
  roles: [ApiRole.DEPLOY_PRODUCTION, ApiRole.PUSH_RELEASE],
  requireAll: true,
})
deployToProduction(@Param('id') id: string) {
  return `This action deploys project ${id} to production`;
}
```

### Using PermissionsService Directly

You can also use the service directly in your business logic:

```typescript
import { Injectable } from '@nestjs/common';
import { PermissionsService, ApiRole } from '@app/common';

@Injectable()
export class ProjectsService {
  constructor(private permissionsService: PermissionsService) {}

  async createProject(user: any) {
    // Check permission programmatically
    if (!this.permissionsService.hasRole(user, ApiRole.CREATE_PROJECT)) {
      throw new ForbiddenException('Cannot create project');
    }

    // Or check admin
    if (this.permissionsService.isAdmin(user)) {
      // Admin-specific logic
    }

    // Get all user roles
    const roles = this.permissionsService.getUserRoles(user);
    console.log('User roles:', roles);

    // Your business logic here
  }
}
```

## Enabling Permissions

Permissions validation is **disabled by default** and activates only when:

### Option 1: Environment Variable

Set the environment variable:

```bash
ENABLE_PERMISSIONS=true
```

Or in your `.env` file:

```
ENABLE_PERMISSIONS=true
```

### Option 2: Stamp Role

Add the `permissions-enabled` role to the user's API roles in Keycloak. The system will detect this role in the JWT and enable permissions checking.

**JWT Example:**

```json
{
  "resource_access": {
    "api": {
      "roles": [
        "permissions-enabled",
        "view-project",
        "create-project"
      ]
    }
  }
}
```

## Admin Bypass

Users with the `admin` role in their API roles **always** have access to all endpoints, regardless of specific role requirements.

```json
{
  "resource_access": {
    "api": {
      "roles": ["admin", "user"]
    }
  }
}
```

## Available Roles

See [ROLES.md](./ROLES.md) for the complete list of available roles to configure in Keycloak.

## Configuration Options

When using `PermissionsModule.forRootWithConfig()`:

```typescript
interface PermissionsConfig {
  // Environment variable name to check (default: 'ENABLE_PERMISSIONS')
  enableEnvVar?: string;

  // Stamp role that enables permissions (default: 'permissions-enabled')
  stampRole?: string;

  // Resource name in JWT (default: 'api')
  resourceName?: string;

  // Throw exception on forbidden (default: true)
  throwOnForbidden?: boolean;

  // Custom error message
  forbiddenMessage?: string;
}
```

## JWT Structure

The system expects a JWT with this structure:

```json
{
  "exp": 1767661272,
  "iat": 1767625272,
  "preferred_username": "test",
  "email": "test@test.com",
  "resource_access": {
    "api": {
      "roles": [
        "admin",
        "create-project",
        "view-release",
        "delete-release"
      ]
    }
  }
}
```

## Logging

The system includes comprehensive logging:

- Debug logs when permissions are checked
- Warning logs when access is denied
- Info logs for permission enable/disable

Set log level in your application:

```typescript
import { Logger } from '@nestjs/common';

const app = await NestFactory.create(AppModule, {
  logger: ['error', 'warn', 'log', 'debug'], // Include 'debug' for detailed logs
});
```

## Error Handling

When permission is denied, the guard throws a `ForbiddenException` with details:

```json
{
  "statusCode": 403,
  "message": "Insufficient permissions. Required roles: create-project, update-project",
  "error": "Forbidden"
}
```

## Testing

Mock the PermissionsService in your tests:

```typescript
import { PermissionsService } from '@app/common';

describe('ProjectsController', () => {
  let controller: ProjectsController;
  let permissionsService: PermissionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [
        {
          provide: PermissionsService,
          useValue: {
            validatePermissions: jest.fn().mockReturnValue(true),
            isAdmin: jest.fn().mockReturnValue(false),
            hasRole: jest.fn().mockReturnValue(true),
          },
        },
      ],
    }).compile();

    controller = module.get<ProjectsController>(ProjectsController);
    permissionsService = module.get<PermissionsService>(PermissionsService);
  });

  // Your tests here
});
```

## Future Proofing

This system is built to be reusable across microservices:

- **api**: Already set up
- **delivery**: Import `PermissionsModule` and use the same decorators
- **deploy**: Import `PermissionsModule` and use the same decorators
- **discovery**: Import `PermissionsModule` and use the same decorators

Just change the `resourceName` configuration to match your microservice's resource name in Keycloak.

## Best Practices

1. **Use composite roles in Keycloak**: Group related roles together (e.g., `project-manager` composite role includes `view-project`, `create-project`, `update-project`)

2. **Be specific with roles**: Don't overload the `admin` role; create specific roles for specific actions

3. **Apply guards appropriately**: Use global guard for most endpoints, then use decorators to specify required roles

4. **Log permission checks**: Keep debug logging enabled in development to troubleshoot permission issues

5. **Test thoroughly**: Test with different user roles to ensure proper access control

## Troubleshooting

### Permissions not being checked

1. Check if `ENABLE_PERMISSIONS=true` is set, or if the user has `permissions-enabled` role
2. Verify the guard is applied (globally or at controller/method level)
3. Check logs for "Permissions validation is disabled" messages

### Access denied unexpectedly

1. Check user's actual roles in JWT: Look at the `resource_access.api.roles` array
2. Verify the required role is spelled correctly in your decorator
3. Check if you're using `requireAll` when you meant to use `requireAny` (default)
4. Review logs for detailed permission check information

### JWT user not available

1. Ensure authentication middleware runs before permissions guard
2. Verify Keycloak auth is properly configured
3. Check that `request.user` is populated by your auth system
