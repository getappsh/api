import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsObject, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RuleType } from '../enums/rule.enums';
import { ReleaseIdentifierDto, PolicyAssociationDto } from './create-rule.dto';

// ─── Request DTOs ────────────────────────────────────────────────────────────

export class CreatePushRuleDto {
  @ApiProperty({ description: 'Push rule name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Push rule description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: PolicyAssociationDto, description: 'Release associations for this push rule' })
  @ValidateNested()
  @Type(() => PolicyAssociationDto)
  association: PolicyAssociationDto;

  @ApiPropertyOptional({ description: 'Whether the push rule is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ type: 'object', description: 'Rule engine compliant rule object' })
  @IsObject()
  @IsNotEmpty()
  rule: any;
}

export class PushRuleQueryDto {
  @ApiPropertyOptional({ description: 'Project identifier (ID or name)' })
  @IsOptional()
  projectIdentifier?: string | number;

  @ApiPropertyOptional({ description: 'Filter by active status' })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Filter by release catalog ID' })
  @IsOptional()
  @IsString()
  releaseId?: string;
}

// ─── Response DTOs ───────────────────────────────────────────────────────────

export class PushRuleAssociationDto {
  @ApiProperty({ type: [ReleaseIdentifierDto], description: 'Releases associated with this push rule' })
  releases: ReleaseIdentifierDto[];
}

export class PushRuleDefinitionDto {
  @ApiProperty({ description: 'Unique push rule ID (UUID)' })
  id: string;

  @ApiProperty({ description: 'Push rule name' })
  name: string;

  @ApiPropertyOptional({ description: 'Push rule description' })
  description?: string;

  @ApiProperty({ enum: RuleType, description: 'Rule type — always "push" for push rules' })
  type: RuleType;

  @ApiProperty({ type: PushRuleAssociationDto, description: 'Releases this push rule is associated with' })
  association: PushRuleAssociationDto;

  @ApiProperty({ description: 'Auto-incremented version number, increases on every rule update' })
  version: number;

  @ApiProperty({ description: 'ISO 8601 creation timestamp' })
  createdAt: string;

  @ApiProperty({ description: 'ISO 8601 last-updated timestamp' })
  updatedAt: string;

  @ApiProperty({ description: 'Whether this push rule is currently active' })
  isActive: boolean;

  @ApiProperty({ description: 'Rule engine compliant condition object (@usex/rule-engine format)' })
  rule: any;
}

export class PushRuleFieldDefinitionDto {
  @ApiProperty({ description: 'Field name in JSONPath format (e.g., $.push.topic)' })
  name: string;

  @ApiProperty({ description: 'Field data type (string, number, boolean, object, array)' })
  type: string;

  @ApiProperty({ description: 'Human-readable label for the field' })
  label: string;

  @ApiPropertyOptional({ description: 'Field description' })
  description?: string;

  @ApiProperty({ description: 'When true, this field can only be used in push rules, not in policies or restrictions' })
  isPushOnly: boolean;
}
