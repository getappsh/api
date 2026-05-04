import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

// ---------------------------------------------------------------------------
// Group DTOs
// ---------------------------------------------------------------------------

export class ConfigGroupDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  isGlobal: boolean;

  @ApiProperty({ required: false })
  gitFilePath: string | null;

  @ApiProperty({
    type: [String],
    description: 'Dot-notation key paths whose values are sensitive (e.g. ["password", "credentials.token"]). Values at these paths are masked as *** in API responses.',
  })
  sensitiveKeys: string[];

  @ApiProperty({
    required: false,
    description: 'The group configuration as a complete YAML string. Values at sensitiveKeys paths are masked as ***.',
  })
  yamlContent: string | null;
}

export class UpsertConfigGroupDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false, default: false })
  @IsBoolean()
  @IsOptional()
  isGlobal?: boolean;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  gitFilePath?: string;

  @ApiProperty({
    required: false,
    type: [String],
    description: 'Dot-notation key paths to treat as sensitive (e.g. ["password", "db.password"]). Replaces the previous list.',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  sensitiveKeys?: string[];

  @ApiProperty({
    required: false,
    description:
      'Complete YAML string for the group. Replaces existing content. ' +
      'Sensitive keys (listed in `sensitiveKeys`) will be encrypted and stored in Vault. ' +
      'When reading back a group the API masks those values as `***`. ' +
      'If you submit `***` as the value for a sensitive key, the existing secret is preserved — ' +
      'you do not need to re-supply the original plaintext value.',
    example: 'host: db.internal\nport: 5432\npassword: "***"',
  })
  @IsString()
  @IsOptional()
  yamlContent?: string;
}

export class DeleteConfigGroupDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  groupName: string;
}

// ---------------------------------------------------------------------------
// Revision DTOs
// ---------------------------------------------------------------------------

export enum ConfigRevisionStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}

export class ConfigRevisionDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  projectId: number;

  @ApiProperty()
  revisionNumber: number;

  @ApiProperty({ enum: ConfigRevisionStatus })
  status: ConfigRevisionStatus;

  @ApiProperty({ required: false })
  appliedBy: string | null;

  @ApiProperty({ required: false })
  appliedAt: Date | null;

  @ApiProperty({ required: false, description: 'Semantic version (e.g. "1.2.0") assigned when the revision was promoted to ACTIVE. Null for draft revisions.' })
  semVer: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ type: [ConfigGroupDto], required: false })
  groups?: ConfigGroupDto[];
}

export class ApplyConfigRevisionDto {
  @ApiProperty({ required: false, description: 'Who is applying (email / user id)' })
  @IsString()
  @IsOptional()
  appliedBy?: string;
}

export class GetConfigRevisionsQueryDto {
  @ApiProperty({ required: false, description: 'Include groups in each revision' })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  includeGroups?: boolean;
}

export class GetConfigRevisionQueryDto {
  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  includeGroups?: boolean;
}

// ---------------------------------------------------------------------------
// ConfigMap Association DTOs
// ---------------------------------------------------------------------------

export class ConfigMapAssociationDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  configMapProjectId: number;

  @ApiProperty({ required: false })
  deviceTypeId: number | null;

  @ApiProperty({ required: false, description: 'Specific device ID this association targets, or null for device-type / global rules' })
  deviceId: string | null;

  @ApiProperty({ required: false, description: 'Direct link to a specific CONFIG project, or null for device-type / device-id / global rules' })
  configProjectId: number | null;
}

export class AddConfigMapAssociationDto {
  @ApiProperty({ required: false, description: 'Device type ID to associate with.' })
  @IsInt()
  @IsOptional()
  deviceTypeId?: number;

  @ApiProperty({ required: false, description: 'Array of device IDs to associate with directly.' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  deviceIds?: string[];
}

export class ConfigMapForProjectDto {
  @ApiProperty({ description: 'Association ID' })
  associationId: number;

  @ApiProperty({ description: 'ConfigMap project ID' })
  configMapProjectId: number;

  @ApiProperty({ description: 'ConfigMap project name' })
  configMapProjectName: string;

  @ApiProperty({ description: 'Device type ID matched, or null for global associations', required: false })
  deviceTypeId: number | null;
}

// ---------------------------------------------------------------------------
// Device config
// ---------------------------------------------------------------------------

export class DeviceConfigDto {
  @ApiProperty()
  deviceId: string;

  @ApiProperty({ required: false })
  configRevisionId: number | null;

  @ApiProperty({ required: false, description: 'Semantic version of the active revision when this config was assembled' })
  semVer: string | null;

  @ApiProperty({ description: 'Assembled config groups keyed by group name. Each group is a parsed YAML object (supports nested structures).' })
  groups: Record<string, Record<string, any>>;

  @ApiProperty()
  computedAt: string;
}

export class GetDeviceConfigByVersionDto {
  @ApiProperty({ description: 'Device ID' })
  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @ApiProperty({ description: 'Semantic version of the revision to retrieve (e.g. "1.2.0")' })
  @IsString()
  @IsNotEmpty()
  semver: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  resolveSecrets?: boolean;
}
