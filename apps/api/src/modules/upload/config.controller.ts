import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { RequireRole, ApiRole } from '@app/common';
import { GET_CONFIG } from '@app/common/utils/paths';
import { AuthUser } from '../../utils/sso/sso.decorators';
import { UserContextInterceptor } from '../../utils/interceptor/user-context.interceptor';
import { ConfigService } from './config.service';
import {
  ApplyConfigRevisionDto,
  ConfigRevisionDto,
  DeleteConfigGroupDto,
  DeviceConfigDto,
  GetConfigRevisionQueryDto,
  GetConfigRevisionsQueryDto,
  UpsertConfigGroupDto,
} from '@app/common/dto/project-management';

@ApiTags('Get Config: Config Management')
@ApiBearerAuth()
@UseInterceptors(UserContextInterceptor)
@Controller(`${GET_CONFIG}/:configIdentifier/config`)
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  // ---------------------------------------------------------------------------
  // Revisions
  // ---------------------------------------------------------------------------

  @Get('revisions')
  @RequireRole(ApiRole.VIEW_CONFIG_REVISION)
  @ApiOperation({ summary: 'Get all config revisions for a project' })
  @ApiParam({ name: 'configIdentifier', description: 'Config project ID or name' })
  @ApiOkResponse({ type: [ConfigRevisionDto] })
  getRevisions(
    @Param('configIdentifier') configIdentifier: string,
    @Query() query: GetConfigRevisionsQueryDto,
  ) {
    return this.configService.getConfigRevisions(configIdentifier, query);
  }

  @Get('revisions/:revisionId')
  @RequireRole(ApiRole.VIEW_CONFIG_REVISION)
  @ApiOperation({ summary: 'Get a specific config revision by ID' })
  @ApiParam({ name: 'configIdentifier', description: 'Config project ID or name' })
  @ApiParam({ name: 'revisionId', description: 'Revision ID' })
  @ApiOkResponse({ type: ConfigRevisionDto })
  getRevisionById(
    @Param('revisionId') revisionId: number,
    @Query() query: GetConfigRevisionQueryDto,
  ) {
    return this.configService.getConfigRevisionById(+revisionId, query);
  }

  @Get('device-config/:deviceId/version/:semver')
  @RequireRole(ApiRole.VIEW_CONFIG_REVISION)
  @ApiOperation({ summary: 'Get the assembled device config for a specific semver (prefers S3 cache)' })
  @ApiParam({ name: 'configIdentifier', description: 'Config project ID or name (used for access control)' })
  @ApiParam({ name: 'deviceId', description: 'Device ID' })
  @ApiParam({ name: 'semver', description: 'Semantic version (e.g. 1.2.0)' })
  @ApiOkResponse({ type: DeviceConfigDto })
  getDeviceConfigByVersion(
    @Param('deviceId') deviceId: string,
    @Param('semver') semver: string,
  ) {
    return this.configService.getDeviceConfigByVersion({ deviceId, semver });
  }

  @Post('revisions/apply')
  @RequireRole(ApiRole.MANAGE_CONFIG_REVISION)
  @ApiOperation({ summary: 'Apply the current DRAFT revision (promotes to ACTIVE)' })
  @ApiParam({ name: 'configIdentifier', description: 'Config project ID or name' })
  @ApiOkResponse({ type: ConfigRevisionDto })
  applyRevision(
    @Param('configIdentifier') configIdentifier: string,
    @Body() dto: ApplyConfigRevisionDto,
    @AuthUser() user: any,
  ) {
    dto.appliedBy = dto.appliedBy ?? user?.email;
    return this.configService.applyConfigRevision(configIdentifier, dto);
  }

  @Post('revisions/draft')
  @RequireRole(ApiRole.MANAGE_CONFIG_REVISION)
  @ApiOperation({ summary: 'Create a new DRAFT revision (only when no draft exists)' })
  @ApiParam({ name: 'configIdentifier', description: 'Config project ID or name' })
  @ApiOkResponse({ type: ConfigRevisionDto })
  createDraftRevision(@Param('configIdentifier') configIdentifier: string) {
    return this.configService.createDraftRevision(configIdentifier);
  }

  @Delete('revisions/draft')
  @RequireRole(ApiRole.MANAGE_CONFIG_REVISION)
  @ApiOperation({ summary: 'Delete the current DRAFT revision' })
  @ApiParam({ name: 'configIdentifier', description: 'Config project ID or name' })
  deleteDraftRevision(@Param('configIdentifier') configIdentifier: string) {
    return this.configService.deleteDraftRevision(configIdentifier);
  }

  // ---------------------------------------------------------------------------
  // Groups
  // ---------------------------------------------------------------------------

  @Put('groups')
  @RequireRole(ApiRole.MANAGE_CONFIG_GROUP)
  @ApiOperation({
    summary: 'Create or update a config group in the DRAFT revision',
    description:
      'Creates a new group or updates an existing one inside the current DRAFT revision. ' +
      '**Sensitive keys**: any key path listed in `sensitiveKeys` will have its value encrypted in Vault; ' +
      'the API returns `***` for those paths instead of the real value. ' +
      '**Preserving secrets**: if you send `***` as the value for a sensitive key (e.g. you are only updating ' +
      'non-sensitive fields), the existing secret is kept — you do not need to re-supply the plaintext.',
  })
  @ApiParam({ name: 'configIdentifier', description: 'Config project ID or name' })
  upsertGroup(
    @Param('configIdentifier') configIdentifier: string,
    @Body() dto: UpsertConfigGroupDto,
  ) {
    return this.configService.upsertConfigGroup(configIdentifier, dto);
  }

  @Delete('groups')
  @RequireRole(ApiRole.MANAGE_CONFIG_GROUP)
  @ApiOperation({ summary: 'Delete a config group from the DRAFT revision' })
  @ApiParam({ name: 'configIdentifier', description: 'Config project ID or name' })
  deleteGroup(
    @Param('configIdentifier') configIdentifier: string,
    @Body() dto: DeleteConfigGroupDto,
  ) {
    return this.configService.deleteConfigGroup(configIdentifier, dto);
  }
}

