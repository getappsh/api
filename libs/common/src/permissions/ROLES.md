# Keycloak Roles Configuration

## Overview

This document lists all the roles that need to be configured in Keycloak for the permissions system. These roles should be added to the **API** client in Keycloak under `resource_access.api.roles`.

## Role Categories

### 🔐 ADMIN ROLES

#### `admin`
- **Description**: Full administrative access to all system resources and operations
- **Behavior**: Users with this role bypass all permission checks
- **Usage**: Assign to system administrators only

#### `user`
- **Description**: Basic user access
- **Usage**: Default role for authenticated users

---

### 📁 PROJECT MANAGEMENT

#### `create-project`
- **Description**: Permission to create new projects
- **Example Endpoint**: `POST /projects`

#### `view-project`
- **Description**: Permission to view project details
- **Example Endpoint**: `GET /projects/:id`

#### `update-project`
- **Description**: Permission to update existing projects
- **Example Endpoint**: `PUT /projects/:id`, `PATCH /projects/:id`

#### `delete-project`
- **Description**: Permission to delete projects
- **Example Endpoint**: `DELETE /projects/:id`

#### `list-projects`
- **Description**: Permission to list/browse all projects
- **Example Endpoint**: `GET /projects`

---

### 🚀 RELEASE MANAGEMENT

#### `create-release`
- **Description**: Permission to create new releases
- **Example Endpoint**: `POST /releases`

#### `view-release`
- **Description**: Permission to view release details
- **Example Endpoint**: `GET /releases/:id`

#### `update-release`
- **Description**: Permission to update existing releases
- **Example Endpoint**: `PUT /releases/:id`, `PATCH /releases/:id`

#### `delete-release`
- **Description**: Permission to delete releases
- **Example Endpoint**: `DELETE /releases/:id`

#### `push-release`
- **Description**: Permission to push/deploy releases
- **Example Endpoint**: `POST /releases/:id/push`

#### `publish-release`
- **Description**: Permission to publish releases
- **Example Endpoint**: `POST /releases/:id/publish`

#### `list-releases`
- **Description**: Permission to list/browse all releases
- **Example Endpoint**: `GET /releases`

---

### 📦 ARTIFACT MANAGEMENT

#### `upload-artifact`
- **Description**: Permission to upload artifacts
- **Example Endpoint**: `POST /artifacts`

#### `download-artifact`
- **Description**: Permission to download artifacts
- **Example Endpoint**: `GET /artifacts/:id/download`

#### `delete-artifact`
- **Description**: Permission to delete artifacts
- **Example Endpoint**: `DELETE /artifacts/:id`

#### `view-artifact`
- **Description**: Permission to view artifact details
- **Example Endpoint**: `GET /artifacts/:id`

#### `list-artifacts`
- **Description**: Permission to list/browse artifacts
- **Example Endpoint**: `GET /artifacts`

---

### 🚢 DEPLOYMENT

#### `deploy-dev`
- **Description**: Permission to deploy to development environments
- **Example Endpoint**: `POST /deploy/dev`

#### `deploy-staging`
- **Description**: Permission to deploy to staging environments
- **Example Endpoint**: `POST /deploy/staging`

#### `deploy-production`
- **Description**: Permission to deploy to production environments
- **Example Endpoint**: `POST /deploy/production`

---

### 🔍 DISCOVERY & OFFERINGS

#### `manage-discovery`
- **Description**: Permission to manage discovery services
- **Example Endpoint**: `POST /discovery`, `PUT /discovery/:id`

#### `view-offering`
- **Description**: Permission to view offerings
- **Example Endpoint**: `GET /offerings/:id`

#### `create-offering`
- **Description**: Permission to create offerings
- **Example Endpoint**: `POST /offerings`

#### `update-offering`
- **Description**: Permission to update offerings
- **Example Endpoint**: `PUT /offerings/:id`

#### `delete-offering`
- **Description**: Permission to delete offerings
- **Example Endpoint**: `DELETE /offerings/:id`

---

### 👥 USER MANAGEMENT

#### `view-user`
- **Description**: Permission to view user information
- **Example Endpoint**: `GET /users/:id`

#### `manage-users`
- **Description**: Permission to manage users (create, update, delete)
- **Example Endpoint**: `POST /users`, `PUT /users/:id`, `DELETE /users/:id`

---

### 📊 ANALYTICS & MONITORING

#### `view-analytics`
- **Description**: Permission to view analytics and reports
- **Example Endpoint**: `GET /analytics`

#### `view-logs`
- **Description**: Permission to view system logs
- **Example Endpoint**: `GET /logs`

#### `view-metrics`
- **Description**: Permission to view system metrics
- **Example Endpoint**: `GET /metrics`

---

### ⚙️ CONFIGURATION

#### `manage-config`
- **Description**: Permission to manage system configuration
- **Example Endpoint**: `POST /config`, `PUT /config/:key`

#### `view-config`
- **Description**: Permission to view system configuration
- **Example Endpoint**: `GET /config`

---

### 🏷️ SPECIAL ROLES

#### `permissions-enabled` ⭐
- **Description**: Special stamp role that enables permission validation when present
- **Behavior**: Acts as a feature flag - when this role is present in a user's API roles, permission checking is activated for that user
- **Usage**: Add this role to users or groups when you want to enable permission validation without setting the global environment variable

---

## Keycloak Configuration Steps

### 1. Access Keycloak Admin Console

Navigate to your Keycloak admin console (e.g., `http://localhost:8080/admin`)

### 2. Select Your Realm

Select the `getapp` realm (or your configured realm)

### 3. Navigate to Client Roles

1. Go to **Clients** in the left menu
2. Select the **api** client
3. Click on the **Roles** tab

### 4. Create Roles

For each role listed above:

1. Click **Add Role**
2. Enter the exact role name (e.g., `create-project`)
3. Add a description
4. Save

### 5. Create Composite Roles (Recommended)

Instead of assigning individual roles to each user, create composite roles that group related permissions:

#### Example: `project-manager` Composite Role

```
project-manager (composite role)
├── view-project
├── create-project
├── update-project
├── list-projects
└── view-release
```

To create:
1. Create a new role called `project-manager`
2. Enable **Composite Role**
3. Select the API client from dropdown
4. Add the individual roles listed above

#### Example: `release-manager` Composite Role

```
release-manager (composite role)
├── view-release
├── create-release
├── update-release
├── delete-release
├── push-release
├── publish-release
└── list-releases
```

#### Example: `developer` Composite Role

```
developer (composite role)
├── view-project
├── list-projects
├── view-release
├── list-releases
├── upload-artifact
├── download-artifact
├── view-artifact
├── list-artifacts
└── deploy-dev
```

#### Example: `devops` Composite Role

```
devops (composite role)
├── view-project
├── list-projects
├── view-release
├── push-release
├── deploy-dev
├── deploy-staging
├── deploy-production
├── view-logs
├── view-metrics
└── view-analytics
```

### 6. Assign Roles to Users

1. Go to **Users** in the left menu
2. Select a user
3. Click on **Role Mappings** tab
4. Select **api** from the **Client Roles** dropdown
5. Assign appropriate roles or composite roles

### 7. Enable Permissions (Choose One)

#### Option A: Global Environment Variable

Set in your application environment:
```bash
ENABLE_PERMISSIONS=true
```

This enables permissions for ALL users.

#### Option B: Stamp Role (Recommended for Gradual Rollout)

Assign the `permissions-enabled` role to specific users or groups. This enables permissions only for users who have this role, allowing you to:
- Test the system with specific users first
- Gradually roll out to more users
- Have different permission enforcement for different user groups

---

## Testing Your Configuration

### 1. Get a JWT Token

Login and retrieve the access token:

```bash
curl -X POST "http://localhost:8080/realms/getapp/protocol/openid-connect/token" \
  -d "client_id=api" \
  -d "username=testuser" \
  -d "password=testpass" \
  -d "grant_type=password"
```

### 2. Decode the Token

Use [jwt.io](https://jwt.io) to decode the token and verify the roles are present:

```json
{
  "resource_access": {
    "api": {
      "roles": [
        "permissions-enabled",
        "view-project",
        "create-project",
        "project-manager"
      ]
    }
  }
}
```

### 3. Test API Endpoints

Try accessing protected endpoints:

```bash
# Should work if user has view-project role
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/projects/123

# Should fail if user lacks create-project role
curl -X POST -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/projects \
  -d '{"name": "New Project"}'
```

---

## Role Hierarchy Suggestions

Based on typical use cases, here's a suggested role hierarchy:

```
admin (has everything)

├── system-admin (composite)
│   ├── manage-users
│   ├── manage-config
│   ├── view-analytics
│   ├── view-logs
│   └── view-metrics
│
├── project-admin (composite)
│   ├── All project-* roles
│   ├── All release-* roles
│   └── All offering-* roles
│
├── project-manager (composite)
│   ├── create-project
│   ├── update-project
│   ├── view-project
│   ├── list-projects
│   └── view-release
│
├── release-manager (composite)
│   ├── create-release
│   ├── update-release
│   ├── delete-release
│   ├── push-release
│   ├── publish-release
│   ├── view-release
│   └── list-releases
│
├── developer (composite)
│   ├── view-project
│   ├── view-release
│   ├── upload-artifact
│   ├── download-artifact
│   ├── view-artifact
│   └── deploy-dev
│
├── devops (composite)
│   ├── view-project
│   ├── push-release
│   ├── deploy-dev
│   ├── deploy-staging
│   ├── deploy-production
│   └── view-metrics
│
└── viewer (composite)
    ├── view-project
    ├── view-release
    ├── view-artifact
    └── view-offering
```

---

## Quick Reference: All Role Names

Copy-paste friendly list for creating roles:

```
admin
user
create-project
view-project
update-project
delete-project
list-projects
create-release
view-release
update-release
delete-release
push-release
publish-release
list-releases
upload-artifact
download-artifact
delete-artifact
view-artifact
list-artifacts
deploy-dev
deploy-staging
deploy-production
manage-discovery
view-offering
create-offering
update-offering
delete-offering
view-user
manage-users
view-analytics
view-logs
view-metrics
manage-config
view-config
permissions-enabled
```

---

## Notes

- **All role names are lowercase with hyphens** (e.g., `create-project`, not `CREATE_PROJECT`)
- **Roles are case-sensitive** - ensure they match exactly
- **The `admin` role bypasses all checks** - assign carefully
- **Use composite roles** to simplify user management
- **The `permissions-enabled` stamp role** allows selective enablement of permission checking

---

## Support

If you encounter issues with roles:

1. Check the application logs for permission validation messages
2. Verify the JWT contains the expected roles using jwt.io
3. Ensure the role names match exactly (case-sensitive)
4. Confirm the `resource_access.api.roles` path exists in the JWT
