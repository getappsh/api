# User Roles and Permissions Guide

**Last Updated:** January 21, 2026

## Table of Contents
1. [What are Roles?](#what-are-roles)
2. [Understanding Composite Roles](#understanding-composite-roles)
3. [How Roles are Set Up Automatically](#how-roles-are-set-up-automatically)
4. [Managing Users and Groups](#managing-users-and-groups)
5. [Assigning Users to Groups](#assigning-users-to-groups)
6. [Creating New Composite Roles](#creating-new-composite-roles)
7. [Environment Configuration](#environment-configuration)
8. [Enabling and Disabling Permissions](#enabling-and-disabling-permissions)
9. [Available Roles Reference](#available-roles-reference)
10. [Common Scenarios](#common-scenarios)

---

## What are Roles?

**Roles** are permissions that control what users can do in the GetApp system. Think of a role as a key that unlocks specific features or actions.

### Examples:
- `view-project` - Allows you to see project details
- `create-project` - Allows you to create new projects
- `delete-release` - Allows you to delete releases

Each role represents a specific action or access level in the system. Users can have multiple roles, giving them access to different features.

### Special Role

- **`permissions-enabled`** - Special flag that activates permission checking for specific users.

---

## Understanding Composite Roles

**Composite roles** are like "bundles" of individual roles. Instead of assigning 10 separate roles to a user, you can assign one composite role that includes all of them.

### Why Use Composite Roles?

- **Easier Management**: Assign one role instead of many
- **Consistency**: All users in the same role have the same permissions
- **Flexibility**: Change permissions for all users by updating the composite role

### Example: Contributor Role

The `contributor` composite role includes:
- Creating, viewing, updating, and deleting projects
- Creating, viewing, updating, and publishing releases
- Uploading, viewing, and downloading artifacts
- And more...

When you assign someone the `contributor` role, they automatically get all these permissions.

### Pre-configured Composite Roles

The system comes with two main composite roles:

#### 1. **Contributor**
Users who can contribute to projects - create releases, upload artifacts, manage projects, and define policies:
- Manage projects (create, view, update, delete, list)
- Manage releases (create, view, update, delete, publish, list)
- Manage artifacts (upload, download, view, delete, list)
- Manage policies (create, view, update, delete, list)
- View discovery services, offerings, users, analytics, logs, metrics, and configuration

#### 2. **System Administrator**
Users who can deploy applications, manage devices, configure the system, and manage all policies and restrictions:
- Manage discovery services and devices
- Link projects to device types
- Push releases to devices
- Manage offerings (create, update, delete)
- Manage users
- Manage system configuration
- Manage policies and restrictions (create, view, update, delete, list)
- View analytics, logs, metrics, projects, releases, and artifacts

---

## How Roles are Set Up Automatically

**Good news!** You don't need to manually create roles. The system automatically sets up all roles when it starts.

> **Note:** Auto-sync is enabled by default. To disable it and manage roles manually, set `KEYCLOAK_AUTO_SYNC_ROLES=false` in your environment variables.

### What Happens Automatically:

1. **System Startup**: When the GetApp API service starts, it connects to the OIDC provider (the authentication system)

2. **Role Creation**: The system checks which roles exist and creates any missing ones

3. **Composite Role Setup**: Composite roles (like `contributor` and `system-administrator`) are automatically configured with their child roles

4. **Group Creation**: User groups are automatically created and linked to composite roles

5. **Synchronization**: If roles or groups change in the code, the system updates the OIDC provider automatically

### You'll See Log Messages Like:

```
🚀 Starting OIDC Role Synchronization
✅ Created: create-project
✅ Created: view-release
✅ Synced composite role: 'contributor'
✅ Synced group: 'Contributors'
🎉 Synchronization Complete!
```

**No manual work needed!** Just start the system and everything is configured.

---

## Managing Users and Groups

### What are Groups?

**Groups** are collections of users who share the same permissions. Think of them like departments or teams in your organization.

### Pre-configured Groups:

#### 1. **Contributors Group**
- **Purpose**: Team members who work on projects
- **Automatic Role**: `contributor` (composite role)
- **Members Get**: All contributor permissions automatically

#### 2. **System Administrators Group**
- **Purpose**: IT staff who deploy and manage the system
- **Automatic Role**: `system-administrator` (composite role)
- **Members Get**: Full system management permissions

### Benefits of Using Groups:

✅ **Easy User Management**: Add a user to a group instead of assigning individual roles

✅ **Consistent Permissions**: All group members have the same access

✅ **Quick Updates**: Change group permissions once, affects all members

✅ **Clear Organization**: See which team each user belongs to

---

## Assigning Users to Groups

### In Keycloak Admin Console:

1. **Open Keycloak Admin Console**
   - Navigate to `http://your-keycloak-url/admin`
   - Login with admin credentials

2. **Go to Users Section**
   - Click **"Users"** in the left sidebar
   - Find and click on the user you want to manage

3. **Open Groups Tab**
   - Click the **"Groups"** tab

4. **Add User to Group**
   - Click **"Join Group"** button
   - Select a group (e.g., "Contributors" or "System Administrators")
   - Click **"Join"**

5. **Verify**
   - The group now appears in the user's "Group Membership" list
   - The user automatically gets all roles from that group

### Quick Example:

**Scenario**: You hired a new developer, Sarah

**Steps**:
1. Create Sarah's user account in Keycloak
2. Add Sarah to the "Contributors" group
3. Done! Sarah can now create projects, upload artifacts, and manage releases

---

## Creating New Composite Roles

You can create your own composite roles for your organization's needs.

### Option 1: In Keycloak UI (Easy)

1. **Navigate to Client Roles**
   - Go to **Clients** → **api** → **Roles** tab

2. **Create New Role**
   - Click **"Create Role"**
   - Enter role name (e.g., `project-manager`)
   - Add description

3. **Make it Composite**
   - Enable **"Composite Role"** toggle
   - Select **api** client from dropdown

4. **Add Child Roles**
   - Select roles you want to include (e.g., `view-project`, `create-project`, `update-project`)
   - Click **"Add selected"**

5. **Save**
   - Your composite role is ready to assign to users!

### Option 2: Define in Code (Advanced)

For automatic setup, developers can add composite roles to the configuration file.

**File**: `api/libs/common/src/oidc-roles/constants/role-definitions.constant.ts`

```typescript
export const COMPOSITE_ROLE_DEFINITIONS: CompositeRoleDefinition[] = [
  // Existing roles...
  
  // Add your new composite role:
  {
    name: 'project-manager',
    description: 'Composite role for project managers',
    childRoles: [
      ApiRole.VIEW_PROJECT,
      ApiRole.CREATE_PROJECT,
      ApiRole.UPDATE_PROJECT,
      ApiRole.DELETE_PROJECT,
      ApiRole.LIST_PROJECTS,
      ApiRole.VIEW_RELEASE,
      ApiRole.LIST_RELEASES,
    ],
  },
];
```

After adding this, restart the API service. The new composite role will be created automatically!

### Example Composite Roles You Might Want:

- **`release-manager`**: All release-related permissions
- **`devops-engineer`**: Deployment + monitoring permissions
- **`viewer`**: Read-only access to everything
- **`project-admin`**: All project and release permissions

---

## Environment Configuration

The permissions system uses environment variables to control its behavior.

### Required Environment Variables:

Add these to your `.env` file:

```bash
# Keycloak Connection
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=getapp
KEYCLOAK_CLIENT_ID=api

# Admin Credentials (for automatic role setup)
KEYCLOAK_ADMIN_USER=admin
KEYCLOAK_ADMIN_PASSWORD=your-admin-password
```

### Optional Environment Variables:

```bash
# Auto-sync roles and groups on startup (default: true)
KEYCLOAK_AUTO_SYNC_ROLES=true

# Enable permission checking globally (default: false)
ENABLE_PERMISSIONS=false
```

### Where to Find These:

- **KEYCLOAK_URL**: The web address of your Keycloak server
- **KEYCLOAK_REALM**: Your Keycloak realm name (usually `getapp`)
- **KEYCLOAK_CLIENT_ID**: Your application client ID (usually `api`)
- **KEYCLOAK_ADMIN_USER**: Keycloak admin username
- **KEYCLOAK_ADMIN_PASSWORD**: Keycloak admin password

---

## Enabling and Disabling Permissions

By default, permission checking is **disabled**. This means users can access any endpoint without role validation.

### How to Enable Permissions

You have **two options**:

#### Option 1: Enable for Everyone (Global)

Set environment variable:

```bash
ENABLE_PERMISSIONS=true
```

**Effect**: All users must have the required roles to access protected endpoints.

#### Option 2: Enable for Specific Users (Gradual Rollout)

Assign the `permissions-enabled` role to specific users in Keycloak.

**Effect**: Only users with this role have permission checking enforced. Others can access everything.

**Use Case**: Test the permissions system with a few users before rolling it out to everyone.

### How to Disable Permissions

#### Option 1: Disable Globally

Set environment variable:

```bash
ENABLE_PERMISSIONS=false
```

or remove the variable entirely.

#### Option 2: Remove the Stamp Role

Remove the `permissions-enabled` role from all users in Keycloak.

### Disabling Automatic Role Synchronization

If you want to manage roles manually and disable automatic setup:

```bash
KEYCLOAK_AUTO_SYNC_ROLES=false
```

**Note**: Only disable this if you're managing roles manually in Keycloak.

---

## Available Roles Reference

Here's a complete list of all available roles in the system:

### 🔐 Composite Roles

| Role | Description |
|------|-------------|
| `contributor` | Can contribute to projects - create releases, upload artifacts, and manage projects |
| `system-administrator` | Can deploy applications, manage devices, and configure the system |

### 📁 Project Management

| Role | Description |
|------|-------------|
| `create-project` | Create new projects |
| `view-project` | View project details |
| `update-project` | Modify existing projects |
| `delete-project` | Delete projects |
| `list-projects` | Browse all projects |

### 🚀 Release Management

| Role | Description |
|------|-------------|
| `create-release` | Create new releases |
| `view-release` | View release details |
| `update-release` | Modify existing releases |
| `delete-release` | Delete releases |
| `push-release` | Push/deploy releases |
| `publish-release` | Publish releases |
| `list-releases` | Browse all releases |

### 📦 Artifact Management

| Role | Description |
|------|-------------|
| `upload-artifact` | Upload artifacts |
| `download-artifact` | Download artifacts |
| `delete-artifact` | Delete artifacts |
| `view-artifact` | View artifact details |
| `list-artifacts` | Browse all artifacts |

### 🚢 Deployment

| Role | Description |
|------|-------------|
| `deploy-dev` | Deploy to development environment |
| `deploy-staging` | Deploy to staging environment |
| `deploy-production` | Deploy to production environment |

### 🔍 Discovery & Offerings

| Role | Description |
|------|-------------|
| `view-discovery` | View discovery services |
| `manage-discovery` | Manage discovery services |
| `view-offering` | View offerings |
| `create-offering` | Create offerings |
| `update-offering` | Update offerings |
| `delete-offering` | Delete offerings |

### 👥 User Management

| Role | Description |
|------|-------------|
| `view-user` | View user information |
| `manage-users` | Manage users (create, update, delete) |

### 📊 Analytics & Monitoring

| Role | Description |
|------|-------------|
| `view-analytics` | View analytics and reports |
| `view-logs` | View system logs |
| `view-metrics` | View system metrics |

### ⚙️ Configuration

| Role | Description |
|------|-------------|
| `manage-config` | Manage system configuration |
| `view-config` | View system configuration |

### 📋 Policies & Rules Management

| Role | Description |
|------|-------------|
| `create-policy` | Create policies (release-associated rules) |
| `view-policy` | View policy details |
| `update-policy` | Update existing policies |
| `delete-policy` | Delete policies |
| `list-policies` | Browse all policies |
| `create-restriction` | Create restrictions (device-associated rules) |
| `view-restriction` | View restriction details |
| `update-restriction` | Update existing restrictions |
| `delete-restriction` | Delete restrictions |
| `list-restrictions` | Browse all restrictions |

### 🏷️ Special Roles

| Role | Description |
|------|-------------|
| `permissions-enabled` | Enables permission checking for specific users |

---

## Common Scenarios

### Scenario 1: Onboarding a New Developer

**Goal**: Give Sarah access to work on projects

**Steps**:
1. Create Sarah's account in Keycloak
2. Add Sarah to the **"Contributors"** group
3. Done! Sarah can now:
   - Create and manage projects
   - Upload and download artifacts
   - Create and publish releases

### Scenario 2: Promoting to DevOps Engineer

**Goal**: Give John deployment permissions

**Steps**:
1. Add John to the **"System Administrators"** group
2. Done! John can now:
   - Do everything contributors can do
   - Deploy to dev, staging, and production
   - View system metrics and logs
   - Manage system configuration

### Scenario 3: Creating a Read-Only User

**Goal**: Give a stakeholder read-only access

**Steps**:
1. In Keycloak, create a composite role called `viewer`
2. Add these roles to it:
   - `view-project`
   - `view-release`
   - `view-artifact`
   - `view-offering`
   - `list-projects`
   - `list-releases`
3. Assign the `viewer` role to the stakeholder
4. Done! They can see everything but can't make changes

### Scenario 4: Testing Permissions for One User

**Goal**: Test permission enforcement before rolling out to everyone

**Steps**:
1. Keep `ENABLE_PERMISSIONS=false` (global disable)
2. In Keycloak, assign the `permissions-enabled` role to one test user
3. Test with that user account
4. If everything works, either:
   - Set `ENABLE_PERMISSIONS=true` to enable for everyone, OR
   - Add `permissions-enabled` role to more users gradually

### Scenario 5: Emergency Access Needed

**Goal**: Give someone temporary full system access

**Steps**:
1. Add the user to the **"System Administrators"** group in Keycloak
2. Done! They have full system administrative access
3. When done, remove them from the group

---

## Need Help?

### Common Issues

**Q: Permissions aren't being checked**
- **A**: Check if `ENABLE_PERMISSIONS=true` is set, or if users have the `permissions-enabled` role

**Q: User can't access something they should be able to**
- **A**: Check the user's group membership in Keycloak. Verify the group has the correct composite role.

**Q: Roles aren't appearing in Keycloak**
- **A**: Check the application logs. The system creates roles automatically on startup. Make sure `KEYCLOAK_AUTO_SYNC_ROLES` is not set to `false`.

**Q: How do I give someone access to everything?**
- **A**: Add them to the "System Administrators" group, or assign the `admin` role directly.

### Getting More Information

- Check application logs for detailed permission checking information
- Use [jwt.io](https://jwt.io) to decode user tokens and see their roles
- Review Keycloak admin console to verify group memberships and role assignments

---

## Summary

### Key Takeaways:

✅ **Roles** control what users can do (individual permissions)

✅ **Composite Roles** bundle multiple roles together (like `contributor`)

✅ **Groups** assign roles to multiple users at once (like "Contributors" group)

✅ **Everything is automatic** - roles and groups are created when the system starts

✅ **Enable permissions** either globally (`ENABLE_PERMISSIONS=true`) or per-user (`permissions-enabled` role)

✅ **Manage users** by adding them to groups in Keycloak

✅ **Create custom composite roles** to fit your organization's needs

---

**Need to make changes?** Most user management happens in the Keycloak Admin Console. Just add users to groups and the system handles the rest automatically!
