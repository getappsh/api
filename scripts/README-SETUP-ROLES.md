# Keycloak Roles Setup Script

This script automatically creates all the required roles in Keycloak for the permissions system.

## Quick Start

### 1. Install Dependencies (if needed)

The script uses `axios` which should already be in your project. If not:

```bash
npm install axios
```

### 2. Run the Script

#### Option A: Using Default Local Keycloak

If you're running Keycloak locally with default settings:

```bash
cd /Volumes/Matan/getapp/server/api
npx ts-node scripts/setup-keycloak-roles.ts
```

#### Option B: Using Environment Variables

Set your Keycloak configuration:

```bash
export KEYCLOAK_URL="http://localhost:8080"
export KEYCLOAK_REALM="getapp"
export KEYCLOAK_CLIENT_ID="api"
export KEYCLOAK_ADMIN_USER="admin"
export KEYCLOAK_ADMIN_PASSWORD="your-admin-password"

npx ts-node scripts/setup-keycloak-roles.ts
```

#### Option C: One-liner

```bash
KEYCLOAK_URL=http://localhost:8080 \
KEYCLOAK_REALM=getapp \
KEYCLOAK_CLIENT_ID=api \
KEYCLOAK_ADMIN_USER=admin \
KEYCLOAK_ADMIN_PASSWORD=admin \
npx ts-node scripts/setup-keycloak-roles.ts
```

#### Option D: For Remote Keycloak

```bash
KEYCLOAK_URL=https://your-keycloak-server.com \
KEYCLOAK_REALM=production \
KEYCLOAK_CLIENT_ID=api \
KEYCLOAK_ADMIN_USER=admin \
KEYCLOAK_ADMIN_PASSWORD=secure-password \
npx ts-node scripts/setup-keycloak-roles.ts
```

## Configuration

The script accepts the following environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `KEYCLOAK_URL` | Keycloak base URL | `http://localhost:8080` |
| `KEYCLOAK_REALM` | Realm name | `getapp` |
| `KEYCLOAK_CLIENT_ID` | Client ID | `api` |
| `KEYCLOAK_ADMIN_USER` | Admin username | `admin` |
| `KEYCLOAK_ADMIN_PASSWORD` | Admin password | `admin` |

## What It Does

The script will:

1. **Authenticate** with Keycloak using admin credentials
2. **Find your client** (e.g., `api`) in the specified realm
3. **Create all basic roles**:
   - admin
   - user
   - permissions-enabled
   - create-project, view-project, update-project, delete-project, list-projects
   - create-release, view-release, update-release, delete-release, push-release, publish-release, list-releases
   - upload-artifact, download-artifact, delete-artifact, view-artifact, list-artifacts
   - deploy-dev, deploy-staging, deploy-production
   - manage-discovery
   - view-offering, create-offering, update-offering, delete-offering
   - view-user, manage-users
   - view-analytics, view-logs, view-metrics
   - manage-config, view-config

4. **Create composite roles**:
   - `project-manager` (manages projects and views releases)
   - `release-manager` (full release management)
   - `developer` (view projects, releases, manage artifacts, deploy to dev)
   - `devops` (deployment and monitoring)
   - `viewer` (read-only access)
   - `system-admin` (user and config management)

5. **Skip existing roles** automatically (safe to re-run)

## Output Example

```
🚀 Starting Keycloak Role Setup

Configuration:
  - Keycloak URL: http://localhost:8080
  - Realm: getapp
  - Client ID: api
  - Admin User: admin

🔐 Authenticating with Keycloak Admin...
✅ Successfully authenticated

🔍 Finding client: api...
✅ Found client UUID: 12345678-1234-1234-1234-123456789abc

📋 Checking existing roles...
   Found 5 existing roles

📝 Creating basic roles...

   ✅ Created: admin
   ✅ Created: user
   ✅ Created: permissions-enabled
   ✅ Created: create-project
   ...

✅ Basic roles summary: 30 created, 5 skipped

📦 Creating composite roles...

📦 Creating composite role: project-manager...
   ✅ Created role: project-manager
   ✅ Added 6 composite roles to 'project-manager'
...

🎉 Role setup completed!

📊 Final Summary:
  - Total roles in client: 41
  - Basic roles defined: 35
  - Composite roles: 6

✅ All done! Your roles are ready in Keycloak.
```

## Troubleshooting

### Authentication Failed

**Error**: `Failed to authenticate`

**Solution**: Check your admin credentials:
```bash
# Verify admin user can login
curl -X POST "http://localhost:8080/realms/master/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password" \
  -d "client_id=admin-cli" \
  -d "username=admin" \
  -d "password=admin"
```

### Client Not Found

**Error**: `Client 'api' not found in realm 'getapp'`

**Solution**: 
1. Check that your client exists in Keycloak
2. Verify the realm name is correct
3. Make sure `KEYCLOAK_CLIENT_ID` matches your actual client ID

### Connection Refused

**Error**: `connect ECONNREFUSED`

**Solution**: 
1. Check Keycloak is running: `curl http://localhost:8080`
2. Verify the URL is correct
3. Check for firewall/network issues

### Roles Already Exist

**Not an error!** The script will skip existing roles and continue:
```
⏭️  Skipped (exists): admin
```

This means you can safely re-run the script.

## Next Steps

After running this script:

1. **Verify roles in Keycloak**:
   - Go to: `http://localhost:8080/admin`
   - Navigate to: Clients → `api` → Roles
   - You should see all 41 roles

2. **Assign roles to users**:
   - Go to: Users → Select User → Role Mappings
   - Select "api" from Client Roles dropdown
   - Assign appropriate roles or composite roles

3. **Enable permissions in your app**:
   ```bash
   # Add to your .env file
   ENABLE_PERMISSIONS=true
   ```

4. **Test the permissions**:
   - Login with a user
   - Try accessing different endpoints
   - Check the logs for permission validation messages

## Using Composite Roles

The script creates these composite roles for easier management:

### For Project Managers
```bash
# Assign "project-manager" composite role instead of individual roles
```
Includes: view-project, create-project, update-project, list-projects, view-release, list-releases

### For Developers
```bash
# Assign "developer" composite role
```
Includes: view-project, view-release, artifact management, deploy-dev

### For DevOps
```bash
# Assign "devops" composite role
```
Includes: view-project, push-release, all deployment permissions, monitoring

### For Read-Only Access
```bash
# Assign "viewer" composite role
```
Includes: view-project, view-release, view-artifact, view-offering

## Advanced Usage

### Running from Different Directory

```bash
npx ts-node /Volumes/Matan/getapp/server/api/scripts/setup-keycloak-roles.ts
```

### Using with Docker Compose

If Keycloak is in Docker Compose:

```bash
# Find Keycloak container
docker-compose ps

# The script should work with the exposed port
KEYCLOAK_URL=http://localhost:8080 npx ts-node scripts/setup-keycloak-roles.ts
```

### Automating in CI/CD

Add to your CI/CD pipeline:

```yaml
# GitHub Actions example
- name: Setup Keycloak Roles
  run: |
    cd api
    npx ts-node scripts/setup-keycloak-roles.ts
  env:
    KEYCLOAK_URL: ${{ secrets.KEYCLOAK_URL }}
    KEYCLOAK_REALM: ${{ secrets.KEYCLOAK_REALM }}
    KEYCLOAK_CLIENT_ID: api
    KEYCLOAK_ADMIN_USER: ${{ secrets.KEYCLOAK_ADMIN_USER }}
    KEYCLOAK_ADMIN_PASSWORD: ${{ secrets.KEYCLOAK_ADMIN_PASSWORD }}
```

## Security Notes

⚠️ **Important Security Considerations**:

1. **Never commit credentials** to version control
2. Use environment variables or secrets management for credentials
3. Use strong admin passwords in production
4. Consider using a dedicated service account instead of the main admin user
5. Run this script in a secure environment
6. Limit network access to Keycloak admin APIs

## Support

If you encounter issues:

1. Check the error message carefully
2. Verify your Keycloak is running and accessible
3. Ensure you have admin permissions
4. Check the Keycloak logs for more details
5. Re-run with verbose output

## Script Modification

The script is located at:
```
/Volumes/Matan/getapp/server/api/scripts/setup-keycloak-roles.ts
```

You can modify:
- Role descriptions in the `roleDescriptions` object
- Composite role definitions in the `compositeRoles` array
- Add/remove roles by editing the `ApiRole` enum

After modifications, just re-run the script!
