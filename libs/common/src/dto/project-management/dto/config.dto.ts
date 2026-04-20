import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// ---------------------------------------------------------------------------
// Entry DTOs
// ---------------------------------------------------------------------------

export class ConfigEntryDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  key: string;

  @ApiProperty({ required: false })
  value: string | null;

  @ApiProperty({ description: 'Whether the value is stored as a secret in Vault' })
  isSensitive: boolean;
}

export class UpsertConfigEntryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  value?: string;

  @ApiProperty({ required: false, default: false })
  @IsBoolean()
  @IsOptional()
  isSensitive?: boolean;
}

export class DeleteConfigEntryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  groupName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  key: string;
}

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

  @ApiProperty({ type: [ConfigEntryDto] })
  entries: ConfigEntryDto[];
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

  @ApiProperty({ type: [UpsertConfigEntryDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpsertConfigEntryDto)
  @IsOptional()
  entries?: UpsertConfigEntryDto[];
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
  @ApiProperty({ required: false, description: 'Include groups and entries in each revision' })
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
}

export class AddConfigMapAssociationDto {
  @ApiProperty({ required: false, description: 'Device type ID to associate with. Omit for global.' })
  @IsInt()
  @IsOptional()
  deviceTypeId?: number;
}

// ---------------------------------------------------------------------------
// Device config
// ---------------------------------------------------------------------------

export class DeviceConfigDto {
  @ApiProperty()
  deviceId: string;

  @ApiProperty({ required: false })
  configRevisionId: number | null;

  @ApiProperty({ description: 'Assembled config groups keyed by group name' })
  groups: Record<string, Record<string, string | null>>;

  @ApiProperty()
  computedAt: string;
}
