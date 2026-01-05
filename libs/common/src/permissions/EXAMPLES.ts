/**
 * EXAMPLE: How to use the Permissions System in your API Controllers
 * 
 * This file demonstrates various ways to protect your endpoints with role-based permissions.
 * Copy these examples to your actual controllers and modify as needed.
 */

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  RequireRole,
  RequireAnyRole,
  RequireAllRoles,
  RequirePermissions,
  ApiRole,
  PermissionsGuard,
  PermissionsService,
  JwtPayload,
} from '@app/common';

/**
 * Example 1: Basic Controller with Role Protection
 */
@Controller('projects')
@UseGuards(PermissionsGuard) // Apply guard to all routes in this controller
export class ProjectsController {
  
  constructor(private permissionsService: PermissionsService) {}

  /**
   * GET /projects
   * Requires: list-projects role
   */
  @Get()
  @RequireRole(ApiRole.LIST_PROJECTS)
  async findAll() {
    return { message: 'List all projects' };
  }

  /**
   * GET /projects/:id
   * Requires: view-project role
   */
  @Get(':id')
  @RequireRole(ApiRole.VIEW_PROJECT)
  async findOne(@Param('id') id: string) {
    return { message: `Get project ${id}` };
  }

  /**
   * POST /projects
   * Requires: create-project role
   */
  @Post()
  @RequireRole(ApiRole.CREATE_PROJECT)
  async create(@Body() createDto: any) {
    return { message: 'Create project' };
  }

  /**
   * PUT /projects/:id
   * Requires: update-project role
   */
  @Put(':id')
  @RequireRole(ApiRole.UPDATE_PROJECT)
  async update(@Param('id') id: string, @Body() updateDto: any) {
    return { message: `Update project ${id}` };
  }

  /**
   * DELETE /projects/:id
   * Requires: delete-project role
   */
  @Delete(':id')
  @RequireRole(ApiRole.DELETE_PROJECT)
  async remove(@Param('id') id: string) {
    return { message: `Delete project ${id}` };
  }
}

/**
 * Example 2: Multiple Role Options (OR logic)
 * User needs ANY ONE of the specified roles
 */
@Controller('releases')
@UseGuards(PermissionsGuard)
export class ReleasesController {

  /**
   * GET /releases/:id
   * Requires: view-release OR admin role
   */
  @Get(':id')
  @RequireAnyRole([ApiRole.VIEW_RELEASE, ApiRole.ADMIN])
  async findOne(@Param('id') id: string) {
    return { message: `Get release ${id}` };
  }

  /**
   * POST /releases/:id/push
   * Requires: push-release OR admin role
   */
  @Post(':id/push')
  @RequireAnyRole([ApiRole.PUSH_RELEASE, ApiRole.ADMIN])
  async pushRelease(@Param('id') id: string) {
    return { message: `Push release ${id}` };
  }
}

/**
 * Example 3: Require Multiple Roles (AND logic)
 * User must have ALL specified roles
 */
@Controller('deployments')
@UseGuards(PermissionsGuard)
export class DeploymentsController {

  /**
   * POST /deployments/production
   * Requires: Both view-release AND deploy-production roles
   */
  @Post('production')
  @RequireAllRoles([ApiRole.VIEW_RELEASE, ApiRole.DEPLOY_PRODUCTION])
  async deployToProduction(@Body() deployDto: any) {
    return { message: 'Deploy to production' };
  }

  /**
   * POST /deployments/staging
   * Requires: Both view-release AND deploy-staging roles
   */
  @Post('staging')
  @RequireAllRoles([ApiRole.VIEW_RELEASE, ApiRole.DEPLOY_STAGING])
  async deployToStaging(@Body() deployDto: any) {
    return { message: 'Deploy to staging' };
  }
}

/**
 * Example 4: Using the Base Decorator with Full Options
 */
@Controller('artifacts')
@UseGuards(PermissionsGuard)
export class ArtifactsController {

  /**
   * POST /artifacts/upload
   * Requires: upload-artifact OR admin (any one)
   */
  @Post('upload')
  @RequirePermissions({
    roles: [ApiRole.UPLOAD_ARTIFACT, ApiRole.ADMIN],
    requireAll: false, // Default: false (OR logic)
  })
  async upload(@Body() uploadDto: any) {
    return { message: 'Upload artifact' };
  }

  /**
   * DELETE /artifacts/:id
   * Requires: Both view-artifact AND delete-artifact roles
   */
  @Delete(':id')
  @RequirePermissions({
    roles: [ApiRole.VIEW_ARTIFACT, ApiRole.DELETE_ARTIFACT],
    requireAll: true, // Must have ALL roles
  })
  async delete(@Param('id') id: string) {
    return { message: `Delete artifact ${id}` };
  }
}

/**
 * Example 5: Using PermissionsService Directly in Business Logic
 */
@Controller('offerings')
@UseGuards(PermissionsGuard)
export class OfferingsController {
  
  constructor(private permissionsService: PermissionsService) {}

  /**
   * GET /offerings/:id
   * Check permissions programmatically in the handler
   */
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: any) {
    const user: JwtPayload = req.user;

    // Check if user can view offerings
    if (!this.permissionsService.hasRole(user, ApiRole.VIEW_OFFERING)) {
      // Handle differently than throwing exception
      return { 
        message: 'Limited view',
        data: { id, name: 'Offering name only' }
      };
    }

    // User has permission, return full data
    return { 
      message: 'Full view',
      data: { id, name: 'Offering name', details: '...' }
    };
  }

  /**
   * POST /offerings
   * Check admin status programmatically
   */
  @Post()
  @RequireRole(ApiRole.CREATE_OFFERING)
  async create(@Body() createDto: any, @Request() req: any) {
    const user: JwtPayload = req.user;

    // Different behavior for admins
    if (this.permissionsService.isAdmin(user)) {
      // Admins can create offerings without approval
      return { message: 'Offering created immediately', status: 'active' };
    }

    // Regular users create offerings pending approval
    return { message: 'Offering created', status: 'pending_approval' };
  }

  /**
   * PUT /offerings/:id
   * Check multiple roles programmatically
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: any,
    @Request() req: any,
  ) {
    const user: JwtPayload = req.user;

    // Check if user has any of these roles
    const canUpdate = this.permissionsService.hasAnyRole(user, [
      ApiRole.UPDATE_OFFERING,
      ApiRole.ADMIN,
    ]);

    if (!canUpdate) {
      return { 
        error: 'Insufficient permissions',
        requiredRoles: [ApiRole.UPDATE_OFFERING, ApiRole.ADMIN]
      };
    }

    return { message: `Update offering ${id}` };
  }
}

/**
 * Example 6: Mixed Approach - Some Protected, Some Public
 */
@Controller('analytics')
export class AnalyticsController {

  /**
   * GET /analytics/public
   * No guard, no decorator = publicly accessible
   */
  @Get('public')
  async getPublicStats() {
    return { message: 'Public analytics' };
  }

  /**
   * GET /analytics/detailed
   * Protected endpoint
   */
  @Get('detailed')
  @UseGuards(PermissionsGuard)
  @RequireRole(ApiRole.VIEW_ANALYTICS)
  async getDetailedStats() {
    return { message: 'Detailed analytics' };
  }

  /**
   * GET /analytics/logs
   * Protected endpoint
   */
  @Get('logs')
  @UseGuards(PermissionsGuard)
  @RequireRole(ApiRole.VIEW_LOGS)
  async getLogs() {
    return { message: 'System logs' };
  }
}

/**
 * Example 7: Checking Permissions in a Service
 */
export class ProjectsService {
  
  constructor(private permissionsService: PermissionsService) {}

  async performComplexOperation(user: JwtPayload, projectId: string) {
    // Get all user roles for logging
    const userRoles = this.permissionsService.getUserRoles(user);
    console.log(`User ${user.preferred_username} has roles:`, userRoles);

    // Check multiple conditions
    const canView = this.permissionsService.hasRole(user, ApiRole.VIEW_PROJECT);
    const canUpdate = this.permissionsService.hasRole(user, ApiRole.UPDATE_PROJECT);
    const isAdmin = this.permissionsService.isAdmin(user);

    if (isAdmin) {
      // Admin can do everything
      return this.doCompleteOperation(projectId);
    } else if (canView && canUpdate) {
      // Can view and update
      return this.doUpdateOperation(projectId);
    } else if (canView) {
      // Can only view
      return this.doViewOperation(projectId);
    } else {
      throw new Error('Insufficient permissions');
    }
  }

  private async doCompleteOperation(projectId: string) {
    return { message: 'Complete operation' };
  }

  private async doUpdateOperation(projectId: string) {
    return { message: 'Update operation' };
  }

  private async doViewOperation(projectId: string) {
    return { message: 'View operation' };
  }
}

/**
 * Example 8: Conditional Logic Based on Permissions
 */
@Controller('users')
@UseGuards(PermissionsGuard)
export class UsersController {
  
  constructor(private permissionsService: PermissionsService) {}

  /**
   * GET /users
   * Returns different data based on user permissions
   */
  @Get()
  async findAll(@Request() req: any) {
    const user: JwtPayload = req.user;

    if (this.permissionsService.hasRole(user, ApiRole.MANAGE_USERS)) {
      // Return full user data including sensitive info
      return {
        users: [
          { id: 1, name: 'User 1', email: 'user1@example.com', role: 'admin' },
          { id: 2, name: 'User 2', email: 'user2@example.com', role: 'user' },
        ],
      };
    } else if (this.permissionsService.hasRole(user, ApiRole.VIEW_USER)) {
      // Return limited user data
      return {
        users: [
          { id: 1, name: 'User 1' },
          { id: 2, name: 'User 2' },
        ],
      };
    } else {
      // Return only current user
      return {
        users: [
          { id: user.sub, name: user.preferred_username },
        ],
      };
    }
  }
}

/**
 * NOTES:
 * 
 * 1. Always apply @UseGuards(PermissionsGuard) to protected controllers/methods
 * 
 * 2. The guard checks will only run if:
 *    - ENABLE_PERMISSIONS=true environment variable is set, OR
 *    - User has 'permissions-enabled' role in their JWT
 * 
 * 3. Users with 'admin' role bypass all permission checks
 * 
 * 4. Choose the right decorator:
 *    - @RequireRole(role) - Single role
 *    - @RequireAnyRole([roles]) - Any one of the roles (OR)
 *    - @RequireAllRoles([roles]) - All of the roles (AND)
 *    - @RequirePermissions({ roles, requireAll }) - Full control
 * 
 * 5. You can mix decorators with programmatic checks using PermissionsService
 * 
 * 6. The JWT user is available in @Request() req as req.user
 */
