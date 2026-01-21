/**
 * Keycloak role representation
 */
export interface KeycloakRole {
  id?: string;
  name: string;
  description?: string;
  composite?: boolean;
  clientRole?: boolean;
  containerId?: string;
}

/**
 * Keycloak group representation
 */
export interface KeycloakGroup {
  id?: string;
  name: string;
  path?: string;
  attributes?: Record<string, string[]>;
  realmRoles?: string[];
  clientRoles?: Record<string, string[]>;
  subGroups?: KeycloakGroup[];
}

/**
 * Keycloak configuration for role management
 */
export interface KeycloakRoleConfig {
  baseUrl: string;
  realm: string;
  clientId: string;
  adminUser: string;
  adminPassword: string;
}
