#!/usr/bin/env ts-node

import axios, { AxiosInstance } from 'axios';
import { config } from 'dotenv';
import { resolve } from 'path';
import { ApiRole } from '../libs/common/src/permissions/constants/roles.enum';

// Load .env file from project root
config({ path: resolve(__dirname, '../.env') });

/**
 * Keycloak Role Setup Script
 * 
 * This script automatically creates all roles in Keycloak for the permissions system.
 * Reads configuration from .env file.
 * 
 * Usage:
 *   ts-node scripts/setup-keycloak-roles.ts
 * 
 * Required .env variables:
 *   KEYCLOAK_URL=http://localhost:8080
 *   KEYCLOAK_REALM=getapp
 *   KEYCLOAK_CLIENT_ID=api
 *   KEYCLOAK_ADMIN_USER=admin
 *   KEYCLOAK_ADMIN_PASSWORD=admin
 */

interface KeycloakConfig {
  baseUrl: string;
  realm: string;
  clientId: string;
  adminUser: string;
  adminPassword: string;
}

interface RoleDefinition {
  name: string;
  description: string;
  composite?: boolean;
  compositeRoles?: string[];
}

// Role descriptions for better documentation in Keycloak
const roleDescriptions: Record<string, string> = {
  // Admin
  'admin': 'Full administrative access to all system resources and operations',
  'user': 'Basic user access',
  'permissions-enabled': 'Special stamp role that enables permission validation when present',

  // Project Management
  'create-project': 'Permission to create new projects',
  'view-project': 'Permission to view project details',
  'update-project': 'Permission to update existing projects',
  'delete-project': 'Permission to delete projects',
  'list-projects': 'Permission to list/browse all projects',

  // Release Management
  'create-release': 'Permission to create new releases',
  'view-release': 'Permission to view release details',
  'update-release': 'Permission to update existing releases',
  'delete-release': 'Permission to delete releases',
  'push-release': 'Permission to push/deploy releases',
  'publish-release': 'Permission to publish releases',
  'list-releases': 'Permission to list/browse all releases',

  // Artifact Management
  'upload-artifact': 'Permission to upload artifacts',
  'download-artifact': 'Permission to download artifacts',
  'delete-artifact': 'Permission to delete artifacts',
  'view-artifact': 'Permission to view artifact details',
  'list-artifacts': 'Permission to list/browse artifacts',

  // Deployment
  'deploy-dev': 'Permission to deploy to development environments',
  'deploy-staging': 'Permission to deploy to staging environments',
  'deploy-production': 'Permission to deploy to production environments',

  // Discovery & Offerings
  'view-discovery': 'Permission to view discovery services and devices',
  'manage-discovery': 'Permission to manage discovery services (edit, delete devices)',
  'view-offering': 'Permission to view offerings',
  'create-offering': 'Permission to create offerings',
  'update-offering': 'Permission to update offerings',
  'delete-offering': 'Permission to delete offerings',

  // User Management
  'view-user': 'Permission to view user information',
  'manage-users': 'Permission to manage users',

  // Analytics & Monitoring
  'view-analytics': 'Permission to view analytics and reports',
  'view-logs': 'Permission to view system logs',
  'view-metrics': 'Permission to view system metrics',

  // Configuration
  'manage-config': 'Permission to manage system configuration',
  'view-config': 'Permission to view system configuration',
};

// Composite roles definitions
const compositeRoles: RoleDefinition[] = [
  {
    name: 'super-user',
    description: 'Composite role with all possible permissions - full system access',
    composite: true,
    compositeRoles: [
      // Projects
      ApiRole.CREATE_PROJECT,
      ApiRole.VIEW_PROJECT,
      ApiRole.UPDATE_PROJECT,
      ApiRole.DELETE_PROJECT,
      ApiRole.LIST_PROJECTS,
      // Releases
      ApiRole.CREATE_RELEASE,
      ApiRole.VIEW_RELEASE,
      ApiRole.UPDATE_RELEASE,
      ApiRole.DELETE_RELEASE,
      ApiRole.PUSH_RELEASE,
      ApiRole.PUBLISH_RELEASE,
      ApiRole.LIST_RELEASES,
      // Artifacts
      ApiRole.UPLOAD_ARTIFACT,
      ApiRole.DOWNLOAD_ARTIFACT,
      ApiRole.DELETE_ARTIFACT,
      ApiRole.VIEW_ARTIFACT,
      ApiRole.LIST_ARTIFACTS,
      // Deployment
      ApiRole.DEPLOY_DEV,
      ApiRole.DEPLOY_STAGING,
      ApiRole.DEPLOY_PRODUCTION,
      // Discovery & Offerings
      ApiRole.VIEW_DISCOVERY,
      ApiRole.MANAGE_DISCOVERY,
      ApiRole.VIEW_OFFERING,
      ApiRole.CREATE_OFFERING,
      ApiRole.UPDATE_OFFERING,
      ApiRole.DELETE_OFFERING,
      // Users
      ApiRole.VIEW_USER,
      ApiRole.MANAGE_USERS,
      // Analytics & Monitoring
      ApiRole.VIEW_ANALYTICS,
      ApiRole.VIEW_LOGS,
      ApiRole.VIEW_METRICS,
      // Configuration
      ApiRole.MANAGE_CONFIG,
      ApiRole.VIEW_CONFIG,
      // Enable permissions
      ApiRole.PERMISSIONS_ENABLED,
    ],
  },
  {
    name: 'project-manager',
    description: 'Composite role for project managers',
    composite: true,
    compositeRoles: [
      ApiRole.VIEW_PROJECT,
      ApiRole.CREATE_PROJECT,
      ApiRole.UPDATE_PROJECT,
      ApiRole.LIST_PROJECTS,
      ApiRole.VIEW_RELEASE,
      ApiRole.LIST_RELEASES,
      ApiRole.PERMISSIONS_ENABLED,
    ],
  },
  {
    name: 'release-manager',
    description: 'Composite role for release managers',
    composite: true,
    compositeRoles: [
      ApiRole.VIEW_RELEASE,
      ApiRole.CREATE_RELEASE,
      ApiRole.UPDATE_RELEASE,
      ApiRole.DELETE_RELEASE,
      ApiRole.PUSH_RELEASE,
      ApiRole.PUBLISH_RELEASE,
      ApiRole.LIST_RELEASES,
      ApiRole.VIEW_PROJECT,
      ApiRole.PERMISSIONS_ENABLED,
    ],
  },
  {
    name: 'developer',
    description: 'Composite role for developers',
    composite: true,
    compositeRoles: [
      ApiRole.VIEW_PROJECT,
      ApiRole.LIST_PROJECTS,
      ApiRole.VIEW_RELEASE,
      ApiRole.LIST_RELEASES,
      ApiRole.UPLOAD_ARTIFACT,
      ApiRole.DOWNLOAD_ARTIFACT,
      ApiRole.VIEW_ARTIFACT,
      ApiRole.LIST_ARTIFACTS,
      ApiRole.DEPLOY_DEV,
      ApiRole.PERMISSIONS_ENABLED,
    ],
  },
  {
    name: 'devops',
    description: 'Composite role for DevOps engineers',
    composite: true,
    compositeRoles: [
      ApiRole.VIEW_PROJECT,
      ApiRole.LIST_PROJECTS,
      ApiRole.VIEW_RELEASE,
      ApiRole.PUSH_RELEASE,
      ApiRole.DEPLOY_DEV,
      ApiRole.DEPLOY_STAGING,
      ApiRole.DEPLOY_PRODUCTION,
      ApiRole.VIEW_LOGS,
      ApiRole.VIEW_METRICS,
      ApiRole.VIEW_ANALYTICS,
      ApiRole.PERMISSIONS_ENABLED,
    ],
  },
  {
    name: 'viewer',
    description: 'Read-only access to view all system resources',
    composite: true,
    compositeRoles: [
      // View projects
      ApiRole.VIEW_PROJECT,
      ApiRole.LIST_PROJECTS,
      // View releases
      ApiRole.VIEW_RELEASE,
      ApiRole.LIST_RELEASES,
      // View artifacts
      ApiRole.VIEW_ARTIFACT,
      ApiRole.LIST_ARTIFACTS,
      // View discovery & devices
      ApiRole.VIEW_DISCOVERY,
      // View offerings
      ApiRole.VIEW_OFFERING,
      // View users
      ApiRole.VIEW_USER,
      // View analytics & monitoring
      ApiRole.VIEW_ANALYTICS,
      ApiRole.VIEW_LOGS,
      ApiRole.VIEW_METRICS,
      // View configuration
      ApiRole.VIEW_CONFIG,
      // Enable permissions
      ApiRole.PERMISSIONS_ENABLED,
    ],
  },
  {
    name: 'system-admin',
    description: 'Composite role for system administrators',
    composite: true,
    compositeRoles: [
      ApiRole.MANAGE_USERS,
      ApiRole.MANAGE_CONFIG,
      ApiRole.VIEW_ANALYTICS,
      ApiRole.VIEW_LOGS,
      ApiRole.VIEW_METRICS,
      ApiRole.VIEW_CONFIG,
      ApiRole.PERMISSIONS_ENABLED,
    ],
  },
];

class KeycloakRoleSetup {
  private axiosInstance: AxiosInstance;
  private config: KeycloakConfig;
  private accessToken: string | null = null;
  private clientUuid: string | null = null;

  constructor(config: KeycloakConfig) {
    this.config = config;
    this.axiosInstance = axios.create({
      baseURL: config.baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Get admin access token
   */
  async getAdminToken(): Promise<string> {
    console.log('🔐 Authenticating with Keycloak Admin...');
    
    try {
      const response = await this.axiosInstance.post(
        `/realms/master/protocol/openid-connect/token`,
        new URLSearchParams({
          grant_type: 'password',
          client_id: 'admin-cli',
          username: this.config.adminUser,
          password: this.config.adminPassword,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      this.accessToken = response.data.access_token;
      this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${this.accessToken}`;
      console.log('✅ Successfully authenticated\n');
      return this.accessToken as string;
    } catch (error: any) {
      console.error('❌ Failed to authenticate:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get client UUID by client ID
   */
  async getClientUuid(): Promise<string> {
    console.log(`🔍 Finding client: ${this.config.clientId}...`);
    
    try {
      const response = await this.axiosInstance.get(
        `/admin/realms/${this.config.realm}/clients?clientId=${this.config.clientId}`
      );

      if (!response.data || response.data.length === 0) {
        throw new Error(`Client '${this.config.clientId}' not found in realm '${this.config.realm}'`);
      }

      this.clientUuid = response.data[0].id;
      console.log(`✅ Found client UUID: ${this.clientUuid}\n`);
      return this.clientUuid as string;
    } catch (error: any) {
      console.error('❌ Failed to find client:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get existing roles for the client
   */
  async getExistingRoles(): Promise<string[]> {
    if (!this.clientUuid) {
      throw new Error('Client UUID not set. Call getClientUuid() first.');
    }

    try {
      const response = await this.axiosInstance.get(
        `/admin/realms/${this.config.realm}/clients/${this.clientUuid}/roles`
      );

      return response.data.map((role: any) => role.name);
    } catch (error: any) {
      console.error('❌ Failed to get existing roles:', error.response?.data || error.message);
      return [];
    }
  }

  /**
   * Create a single role
   */
  async createRole(roleName: string, description: string): Promise<boolean> {
    if (!this.clientUuid) {
      throw new Error('Client UUID not set. Call getClientUuid() first.');
    }

    try {
      await this.axiosInstance.post(
        `/admin/realms/${this.config.realm}/clients/${this.clientUuid}/roles`,
        {
          name: roleName,
          description: description,
          composite: false,
          clientRole: true,
        }
      );
      return true;
    } catch (error: any) {
      if (error.response?.status === 409) {
        // Role already exists
        return false;
      }
      throw error;
    }
  }

  /**
   * Get role by name
   */
  async getRole(roleName: string): Promise<any> {
    if (!this.clientUuid) {
      throw new Error('Client UUID not set. Call getClientUuid() first.');
    }

    try {
      const response = await this.axiosInstance.get(
        `/admin/realms/${this.config.realm}/clients/${this.clientUuid}/roles/${roleName}`
      );
      return response.data;
    } catch (error: any) {
      console.error(`❌ Failed to get role ${roleName}:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Create composite role
   */
  async createCompositeRole(roleDefinition: RoleDefinition): Promise<void> {
    if (!this.clientUuid) {
      throw new Error('Client UUID not set. Call getClientUuid() first.');
    }

    console.log(`📦 Creating composite role: ${roleDefinition.name}...`);

    // First create the role
    const created = await this.createRole(roleDefinition.name, roleDefinition.description);
    
    if (!created) {
      console.log(`   ⚠️  Role '${roleDefinition.name}' already exists, updating composites...`);
    } else {
      console.log(`   ✅ Created role: ${roleDefinition.name}`);
    }

    // Get the role details
    const role = await this.getRole(roleDefinition.name);

    // Get all the child roles
    const childRoles: any[] = [];
    for (const childRoleName of roleDefinition.compositeRoles || []) {
      try {
        const childRole = await this.getRole(childRoleName);
        childRoles.push(childRole);
      } catch (error) {
        console.log(`   ⚠️  Child role '${childRoleName}' not found, skipping...`);
      }
    }

    if (childRoles.length > 0) {
      // Add composites
      try {
        await this.axiosInstance.post(
          `/admin/realms/${this.config.realm}/clients/${this.clientUuid}/roles/${role.name}/composites`,
          childRoles
        );
        console.log(`   ✅ Added ${childRoles.length} composite roles to '${roleDefinition.name}'`);
      } catch (error: any) {
        console.log(`   ⚠️  Failed to add composites:`, error.response?.data?.errorMessage || error.message);
      }
    }
  }

  /**
   * Setup all roles
   */
  async setupRoles(): Promise<void> {
    console.log('🚀 Starting Keycloak Role Setup\n');
    console.log(`Configuration:
  - Keycloak URL: ${this.config.baseUrl}
  - Realm: ${this.config.realm}
  - Client ID: ${this.config.clientId}
  - Admin User: ${this.config.adminUser}
\n`);

    // Authenticate
    await this.getAdminToken();

    // Get client UUID
    await this.getClientUuid();

    // Get existing roles
    console.log('📋 Checking existing roles...');
    const existingRoles = await this.getExistingRoles();
    console.log(`   Found ${existingRoles.length} existing roles\n`);

    // Create all basic roles from enum
    console.log('📝 Creating basic roles...\n');
    const allRoles = Object.values(ApiRole);
    let createdCount = 0;
    let skippedCount = 0;

    for (const role of allRoles) {
      const description = roleDescriptions[role] || `Role: ${role}`;
      
      try {
        const created = await this.createRole(role, description);
        if (created) {
          console.log(`   ✅ Created: ${role}`);
          createdCount++;
        } else {
          console.log(`   ⏭️  Skipped (exists): ${role}`);
          skippedCount++;
        }
      } catch (error: any) {
        console.error(`   ❌ Failed to create ${role}:`, error.response?.data?.errorMessage || error.message);
      }
    }

    console.log(`\n✅ Basic roles summary: ${createdCount} created, ${skippedCount} skipped\n`);

    // Create composite roles
    console.log('📦 Creating composite roles...\n');
    for (const compositeRole of compositeRoles) {
      try {
        await this.createCompositeRole(compositeRole);
      } catch (error: any) {
        console.error(`❌ Failed to create composite role ${compositeRole.name}:`, error.response?.data || error.message);
      }
    }

    console.log('\n🎉 Role setup completed!\n');
    
    // Final summary
    const finalRoles = await this.getExistingRoles();
    console.log(`📊 Final Summary:
  - Total roles in client: ${finalRoles.length}
  - Basic roles defined: ${allRoles.length}
  - Composite roles: ${compositeRoles.length}
`);
  }
}

// Main execution
async function main() {
  // Get configuration from .env file
  const keycloakConfig: KeycloakConfig = {
    baseUrl: process.env.KEYCLOAK_URL || 'http://localhost:8080',
    realm: process.env.KEYCLOAK_REALM || 'getapp',
    clientId: process.env.KEYCLOAK_CLIENT_ID || 'api',
    adminUser: process.env.KEYCLOAK_ADMIN_USER || 'admin',
    adminPassword: process.env.KEYCLOAK_ADMIN_PASSWORD || 'admin',
  };

  // Validate configuration
  console.log('📄 Reading configuration from .env file...\n');
  
  if (!process.env.KEYCLOAK_URL) {
    console.warn('⚠️  KEYCLOAK_URL not found in .env, using default: http://localhost:8080');
  }
  if (!process.env.KEYCLOAK_REALM) {
    console.warn('⚠️  KEYCLOAK_REALM not found in .env, using default: getapp');
  }
  if (!process.env.KEYCLOAK_CLIENT_ID) {
    console.warn('⚠️  KEYCLOAK_CLIENT_ID not found in .env, using default: api');
  }
  if (!process.env.KEYCLOAK_ADMIN_USER) {
    console.warn('⚠️  KEYCLOAK_ADMIN_USER not found in .env, using default: admin');
  }
  if (!process.env.KEYCLOAK_ADMIN_PASSWORD) {
    console.error('❌ KEYCLOAK_ADMIN_PASSWORD is required in .env file!');
    process.exit(1);
  }
  
  if (keycloakConfig.adminPassword === 'admin') {
    console.warn('\n⚠️  WARNING: Using default admin password. Update KEYCLOAK_ADMIN_PASSWORD in .env for production.\n');
  }

  try {
    const setup = new KeycloakRoleSetup(keycloakConfig);
    await setup.setupRoles();
    
    console.log('✅ All done! Your roles are ready in Keycloak.\n');
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Setup failed:', error.message);
    console.error('\nPlease check your .env configuration and try again.\n');
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { KeycloakRoleSetup, KeycloakConfig };
