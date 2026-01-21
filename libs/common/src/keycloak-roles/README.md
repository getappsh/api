# Keycloak Roles Module

Automatic Keycloak role synchronization module for the GetApp API microservice.

## Overview

This module automatically manages Keycloak roles and groups for the permissions system. When the API microservice starts, it:
1. Searches for existing roles in Keycloak
2. Creates any missing basic roles from the `ApiRole` enum
3. Creates/updates composite roles (contributor, system-administrator)
4. **Adds missing roles to composite roles**
5. **Removes obsolete roles from composite roles**
6. **Creates/updates groups linked to composite roles**
7. **Syncs group role assignments (adds missing, removes obsolete)**

The synchronization is fully automated and provides detailed logging about all changes.

## Features

- **Automatic Synchronization**: Roles and groups are synced automatically when the microservice starts
- **Idempotent**: Safe to run multiple times - only creates missing roles/groups
- **Smart Composite Sync**: Automatically adds missing child roles and removes obsolete ones from composite roles
- **Group Management**: Automatically creates groups and links them to composite roles
- **Smart Group Sync**: Adds missing role assignments and removes obsolete ones from groups
- **Detailed Logging**: Clear, structured logs showing exactly what changes are being made
- **Configurable**: Can be disabled via environment variable
- **Future-Ready**: Service can be injected for manual role/group management or exposed via controllers

## Configuration

Add these environment variables to your `.env` file:

```env
# Keycloak connection
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=getapp
KEYCLOAK_CLIENT_ID=api

# Admin credentials for role management
KEYCLOAK_ADMIN_USER=admin
KEYCLOAK_ADMIN_PASSWORD=your-admin-password

# Auto-sync control (default: true)
KEYCLOAK_AUTO_SYNC_ROLES=true
```

## Module Structure

```
keycloak-roles/
├── constants/
│   └── role-definitions.constant.ts  # Role descriptions, composite role definitions, and group definitions
├── interfaces/
│   └── keycloak-role.interface.ts    # TypeScript interfaces for roles and groups
├── keycloak-roles.module.ts          # NestJS module
├── keycloak-roles.service.ts         # Core service with role and group management logic
└── index.ts                          # Barrel exports
```

## Usage

### Automatic Sync (Default Behavior)

The module is already imported in the API microservice and will automatically sync roles and groups on startup.

### Manual Role Management

You can inject the `KeycloakRolesService` to manually manage roles and groups:

```typescript
import { KeycloakRolesService } from '@app/common/keycloak-roles';

@Injectable()
export class YourService {
  constructor(private readonly keycloakRolesService: KeycloakRolesService) {}

  async manageRoles() {
    // Get all roles
    const roles = await this.keycloakRolesService.getRoles();

    // Get specific role
    const role = await this.keycloakRolesService.getRole('create-project');

    // Create a new role
    await this.keycloakRolesService.createRole('my-custom-role', 'Description');

    // Delete a role
    await this.keycloakRolesService.deleteRole('my-custom-role');

    // Manually trigger full sync
    await this.keycloakRolesService.setupAllRoles();
  }

  async manageGroups() {
    // Get all groups
    const groups = await this.keycloakRolesService.getGroups();

    // Get specific group by name
    const group = await this.keycloakRolesService.getGroupByName('Contributors');

    // Create a new group
    const groupId = await this.keycloakRolesService.createGroup('My Team', {
      'team-type': ['engineering'],
    });

    // Get roles assigned to a group
    const groupRoles = await this.keycloakRolesService.getGroupClientRoles(groupId);

    // Assign roles to a group
    const rolesToAssign = [await this.keycloakRolesService.getRole('contributor')];
    await this.keycloakRolesService.assignRolesToGroup(groupId, rolesToAssign);

    // Remove roles from a group
    await this.keycloakRolesService.removeRolesFromGroup(groupId, rolesToAssign);

    // Delete a group
    await this.keycloakRolesService.deleteGroup(groupId);
  }
}
```

### Adding New Roles

1. Add the role to the `ApiRole` enum in `libs/common/src/permissions/constants/roles.enum.ts`
2. Add a description in `role-definitions.constant.ts`
3. Optionally add to a composite role if needed
4. Restart the microservice - the new role will be created automatically

### Adding New Groups

1. Add a group definition to `GROUP_DEFINITIONS` in `role-definitions.constant.ts`:

```typescript
{
  name: 'My Team',
  path: '/My Team',
  description: 'Description of what this group can do',
  compositeRoles: ['contributor', 'system-administrator'], // Roles to assign
  attributes: {
    'team-type': ['engineering'],
    'auto-managed': ['true'],
  },
}
```

2. Restart the microservice - the group will be created and roles assigned automatically

### Example Startup Logs

When the microservice starts, you'll see comprehensive logs:

```
🔄 Auto-sync is ENABLED - Starting automatic role synchronization...

🚀 ========================================
🚀 Starting Keycloak Role Synchronization
🚀 ========================================
📍 Keycloak URL: http://localhost:8080
📍 Realm: getapp
📍 Client ID: api

🔐 Authenticating with Keycloak Admin...
✅ Authentication successful

🔍 Finding client in Keycloak...
✅ Client found: a1b2c3d4-...

📋 Fetching existing roles...
✅ Found 42 existing role(s) in Keycloak

📝 ========================================
📝 Synchronizing Basic Roles
📝 ========================================
🎯 Total basic roles defined: 45

   ✅ Created: new-permission-role
   ...

📊 Basic Roles Summary:
   ✅ Created: 3
   ⏭️  Skipped (already existed): 42
   📈 Total: 45

📦 ========================================
📦 Synchronizing Composite Roles
📦 ========================================
🎯 Total composite roles defined: 2

📦 Syncing composite role: 'contributor'
   Description: Composite role for contributors
   ℹ️  Role already exists, syncing composite roles...
   📋 Current composite roles (15): create-project, view-project, ...
   🎯 Desired composite roles (18): create-project, view-project, ...
   ➕ Added 3 missing composite role(s) to 'contributor': ...
   ✅ Synced (3 added, 0 removed)

📊 Composite Roles Summary:
   ✅ Processed successfully: 2
   ❌ Failed: 0
   📈 Total: 2

👥 ========================================
👥 Synchronizing Groups
👥 ========================================
🎯 Total groups defined: 2

👥 Syncing group: 'Contributors'
   Description: Users who can contribute to projects
   ℹ️  Group already exists, syncing roles...
   ✓ Updated group attributes
   📋 Current roles (1): contributor
   🎯 Desired roles (1): contributor
   ✓ No obsolete roles to remove
   ✓ No new roles to assign
   ✅ Already in sync

👥 Syncing group: 'System Administrators'
   Description: Users who can deploy applications
   ℹ️  Group already exists, syncing roles...
   ✓ Updated group attributes
   📋 Current roles (0): none
   🎯 Desired roles (1): system-administrator
   ➕ Assigned 1 missing role(s): system-administrator
   ✅ Synced (1 added, 0 removed)

📊 Groups Summary:
   ✅ Synced successfully: 2
   ❌ Failed: 0
   📈 Total: 2

🎉 ========================================
🎉 Synchronization Complete!
🎉 ========================================
📊 Final Statistics:
   📋 Total roles in Keycloak: 45
   👥 Total groups in Keycloak: 2
   📝 Basic roles defined: 45
   📦 Composite roles defined: 2
   👥 Groups defined: 2
   ✅ Basic roles created: 3
   ✅ Composite roles synced: 2
   ✅ Groups synced: 2
🎉 ========================================

✅ Automatic role synchronization completed successfully
```

### Disabling Auto-Sync

Set `KEYCLOAK_AUTO_SYNC_ROLES=false` in your `.env` file to disable automatic synchronization.

## API Methods

### KeycloakRolesService

#### Role Management

| Method | Description | Returns |
|--------|-------------|---------|
| `getRoles()` | Get all existing roles | `Promise<KeycloakRole[]>` |
| `getRole(name)` | Get a specific role by name | `Promise<KeycloakRole>` |
| `createRole(name, description)` | Create a new role | `Promise<boolean>` |
| `deleteRole(name)` | Delete a role | `Promise<void>` |

#### Group Management

| Method | Description | Returns |
|--------|-------------|---------|
| `getGroups()` | Get all groups in the realm | `Promise<KeycloakGroup[]>` |
| `getGroupByName(name)` | Get a specific group by name | `Promise<KeycloakGroup \| null>` |
| `getGroupById(id)` | Get a specific group by ID | `Promise<KeycloakGroup>` |
| `createGroup(name, attributes?)` | Create a new group | `Promise<string>` (returns group ID) |
| `deleteGroup(id)` | Delete a group | `Promise<void>` |
| `updateGroupAttributes(id, attributes)` | Update group attributes | `Promise<void>` |
| `getGroupClientRoles(id)` | Get roles assigned to a group | `Promise<KeycloakRole[]>` |
| `assignRolesToGroup(id, roles)` | Assign roles to a group | `Promise<void>` |
| `removeRolesFromGroup(id, roles)` | Remove roles from a group | `Promise<void>` |

#### Synchronization

| Method | Description | Returns |
|--------|-------------|---------|
| `setupAllRoles()` | Sync all basic roles, composite roles, and groups | `Promise<{basicRoles, compositeRoles, groups}>` |

## Composite Roles

The module defines two composite roles:

- **contributor**: Can create/manage projects, releases, and artifacts
- **system-administrator**: Can deploy, manage devices, users, and system configuration

Composite roles automatically include their child roles. The synchronization process:
- ✅ Adds any missing child roles to the composite role
- ✅ Removes any obsolete child roles that are no longer in the definition
- ✅ Logs all changes made for full transparency

## Groups

The module defines groups that are automatically linked to composite roles:

- **Contributors**: Users assigned to this group automatically get the `contributor` composite role
- **System Administrators**: Users assigned to this group automatically get the `system-administrator` composite role

The group synchronization process:
- ✅ Creates groups if they don't exist
- ✅ Updates group attributes
- ✅ Adds missing role assignments to groups
- ✅ Removes obsolete role assignments from groups
- ✅ Logs all changes made for full transparency

### Benefits of Groups

- **User Management**: Add users to groups instead of assigning individual roles
- **Centralized Control**: Change group role assignments to affect all users in the group
- **Organization**: Group users by team, department, or function
- **Keycloak UI**: Easily manage user permissions through the Keycloak admin interface

### Example Log Output

When syncing composite roles, you'll see detailed logs like:

```
📦 Syncing composite role: 'contributor'
   Description: Composite role for contributors - can view and create releases, projects, and upload artifacts
   ℹ️  Role already exists, syncing composite roles...
   📋 Current composite roles (15): create-project, view-project, update-project, delete-project, list-projects, ...
   🎯 Desired composite roles (18): create-project, view-project, update-project, delete-project, list-projects, ...
   ➕ Added 3 missing composite role(s) to 'contributor': new-feature-role-1, new-feature-role-2, new-feature-role-3
   ➖ Removed 0 obsolete composite role(s)
   ✅ Synced (3 added, 0 removed)
```

## Error Handling

The module is designed to be non-blocking:
- If Keycloak is unavailable during startup, the error is logged but the microservice continues to start
- Individual role creation failures are logged but don't stop the overall sync process
- Existing roles are skipped (idempotent operation)

## Future Enhancements

The service is ready to be exposed via REST API controllers for dynamic role and group management:

```typescript
@Controller('roles')
export class RolesController {
  constructor(private readonly keycloakRolesService: KeycloakRolesService) {}

  @Get()
  async getAllRoles() {
    return this.keycloakRolesService.getRoles();
  }

  @Post()
  async createRole(@Body() dto: CreateRoleDto) {
    return this.keycloakRolesService.createRole(dto.name, dto.description);
  }

  // Additional role endpoints...
}

@Controller('groups')
export class GroupsController {
  constructor(private readonly keycloakRolesService: KeycloakRolesService) {}

  @Get()
  async getAllGroups() {
    return this.keycloakRolesService.getGroups();
  }

  @Post()
  async createGroup(@Body() dto: CreateGroupDto) {
    return this.keycloakRolesService.createGroup(dto.name, dto.attributes);
  }

  @Post(':id/roles')
  async assignRolesToGroup(@Param('id') groupId: string, @Body() dto: AssignRolesDto) {
    const roles = await Promise.all(
      dto.roleNames.map(name => this.keycloakRolesService.getRole(name))
    );
    return this.keycloakRolesService.assignRolesToGroup(groupId, roles);
  }

  // Additional group endpoints...
}
```

## Migration from Script

The old `scripts/setup-keycloak-roles.ts` script has been removed. All functionality is now integrated into the microservice startup process, eliminating the need for manual execution. The new implementation includes group management that was not available in the script.
