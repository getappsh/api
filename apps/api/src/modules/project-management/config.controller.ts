import {
  BadRequestException,
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
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { RequireRole, ApiRole } from '@app/common';
import { PROJECT_MANAGEMENT } from '@app/common/utils/paths';
import { AuthUser } from '../../utils/sso/sso.decorators';
import { UserContextInterceptor } from '../../utils/interceptor/user-context.interceptor';
import { ProjectManagementService } from './project-management.service';
import {
  AddConfigMapAssociationDto,
  ApplyConfigRevisionDto,
  ConfigMapAssociationDto,
  ConfigMapForProjectDto,
  ConfigRevisionDto,
  DeleteConfigEntryDto,
  DeleteConfigGroupDto,
  DeviceConfigDto,
  GetConfigRevisionQueryDto,
  GetConfigRevisionsQueryDto,
  UpsertConfigEntryDto,
  UpsertConfigGroupDto,
} from '@app/common/dto/project-management';

@ApiTags('Config')
@ApiBearerAuth()
@UseInterceptors(UserContextInterceptor)
@Controller(`${PROJECT_MANAGEMENT}/:projectIdentifier/config`)
export class ConfigController {
  constructor(private readonly projectManagementService: ProjectManagementService) {}

  // ---------------------------------------------------------------------------
  // Revisions
  // ---------------------------------------------------------------------------

  @Get('revisions')
  @RequireRole(ApiRole.VIEW_PROJECT)
  @ApiOperation({ summary: 'Get all config revisions for a project' })
  @ApiParam({ name: 'projectIdentifier', description: 'Project ID or name' })
  @ApiOkResponse({ type: [ConfigRevisionDto] })
  getRevisions(
    @Param('projectIdentifier') projectIdentifier: string,
    @Query() query: GetConfigRevisionsQueryDto,
  ) {
    return this.projectManagementService.getConfigRevisions(projectIdentifier, query);
  }

  @Get('revisions/:revisionId')
  @RequireRole(ApiRole.VIEW_PROJECT)
  @ApiOperation({ summary: 'Get a specific config revision by ID' })
  @ApiParam({ name: 'projectIdentifier', description: 'Project ID or name' })
  @ApiParam({ name: 'revisionId', description: 'Revision ID' })
  @ApiOkResponse({ type: ConfigRevisionDto })
  getRevisionById(
    @Param('revisionId') revisionId: number,
    @Query() query: GetConfigRevisionQueryDto,
  ) {
    return this.projectManagementService.getConfigRevisionById(+revisionId, query);
  }

  @Post('revisions/apply')
  @RequireRole(ApiRole.UPDATE_PROJECT)
  @ApiOperation({ summary: 'Apply the current DRAFT revision (promotes to ACTIVE)' })
  @ApiParam({ name: 'projectIdentifier', description: 'Project ID or name' })
  @ApiOkResponse({ type: ConfigRevisionDto })
  applyRevision(
    @Param('projectIdentifier') projectIdentifier: string,
    @Body() dto: ApplyConfigRevisionDto,
    @AuthUser() user: any,
  ) {
    dto.appliedBy = dto.appliedBy ?? user?.email;
    return this.projectManagementService.applyConfigRevision(projectIdentifier, dto);
  }

  @Post('revisions/draft')
  @RequireRole(ApiRole.UPDATE_PROJECT)
  @ApiOperation({ summary: 'Create a new DRAFT revision (only when no draft exists)' })
  @ApiParam({ name: 'projectIdentifier', description: 'Project ID or name' })
  @ApiOkResponse({ type: ConfigRevisionDto })
  createDraftRevision(@Param('projectIdentifier') projectIdentifier: string) {
    return this.projectManagementService.createDraftRevision(projectIdentifier);
  }

  @Delete('revisions/draft')
  @RequireRole(ApiRole.UPDATE_PROJECT)
  @ApiOperation({ summary: 'Delete the current DRAFT revision' })
  @ApiParam({ name: 'projectIdentifier', description: 'Project ID or name' })
  deleteDraftRevision(@Param('projectIdentifier') projectIdentifier: string) {
    return this.projectManagementService.deleteDraftRevision(projectIdentifier);
  }

  // ---------------------------------------------------------------------------
  // Groups
  // ---------------------------------------------------------------------------

  @Put('groups')
  @RequireRole(ApiRole.UPDATE_PROJECT)
  @ApiOperation({ summary: 'Create or update a config group in the DRAFT revision' })
  @ApiParam({ name: 'projectIdentifier', description: 'Project ID or name' })
  upsertGroup(
    @Param('projectIdentifier') projectIdentifier: string,
    @Body() dto: UpsertConfigGroupDto,
  ) {
    return this.projectManagementService.upsertConfigGroup(projectIdentifier, dto);
  }

  @Get('config-maps')
  @RequireRole(ApiRole.VIEW_PROJECT)
  @ApiOperation({ summary: 'List all ConfigMap projects that apply to this CONFIG project (via device type or global)' })
  @ApiParam({ name: 'projectIdentifier', description: 'CONFIG project ID or name' })
  @ApiOkResponse({ type: [ConfigMapForProjectDto] })
  getConfigMapsForProject(@Param('projectIdentifier') projectIdentifier: string) {
    return this.projectManagementService.getConfigMapsForProject(projectIdentifier);
  }

  @Delete('groups')
  @RequireRole(ApiRole.UPDATE_PROJECT)
  @ApiOperation({ summary: 'Delete a config group from the DRAFT revision' })
  @ApiParam({ name: 'projectIdentifier', description: 'Project ID or name' })
  deleteGroup(
    @Param('projectIdentifier') projectIdentifier: string,
    @Body() dto: DeleteConfigGroupDto,
  ) {
    return this.projectManagementService.deleteConfigGroup(projectIdentifier, dto);
  }

  // ---------------------------------------------------------------------------
  // Entries
  // ---------------------------------------------------------------------------

  @Put('groups/:groupName/entries')
  @RequireRole(ApiRole.UPDATE_PROJECT)
  @ApiOperation({ summary: 'Create or update an entry in a config group (DRAFT)' })
  @ApiParam({ name: 'projectIdentifier', description: 'Project ID or name' })
  @ApiParam({ name: 'groupName', description: 'Group name' })
  upsertEntry(
    @Param('projectIdentifier') projectIdentifier: string,
    @Param('groupName') groupName: string,
    @Body() dto: UpsertConfigEntryDto,
  ) {
    return this.projectManagementService.upsertConfigEntry(projectIdentifier, groupName, dto);
  }

  @Delete('groups/:groupName/entries')
  @RequireRole(ApiRole.UPDATE_PROJECT)
  @ApiOperation({ summary: 'Delete an entry from a config group (DRAFT)' })
  @ApiParam({ name: 'projectIdentifier', description: 'Project ID or name' })
  @ApiParam({ name: 'groupName', description: 'Group name' })
  deleteEntry(
    @Param('projectIdentifier') projectIdentifier: string,
    @Body() dto: DeleteConfigEntryDto,
  ) {
    return this.projectManagementService.deleteConfigEntry(projectIdentifier, dto);
  }
}

// ---------------------------------------------------------------------------
// ConfigMap association controller (separate route base)
// ---------------------------------------------------------------------------

@ApiTags('ConfigMap')
@ApiBearerAuth()
@UseInterceptors(UserContextInterceptor)
@Controller(`${PROJECT_MANAGEMENT}/:projectIdentifier/config-map`)
export class ConfigMapController {
  constructor(private readonly projectManagementService: ProjectManagementService) {}

  @Get('associations')
  @RequireRole(ApiRole.VIEW_PROJECT)
  @ApiOperation({ summary: 'List device-type associations for a ConfigMap project' })
  @ApiParam({ name: 'projectIdentifier', description: 'ConfigMap project ID or name' })
  @ApiOkResponse({ type: [ConfigMapAssociationDto] })
  getAssociations(@Param('projectIdentifier') projectIdentifier: string) {
    return this.projectManagementService.getConfigMapAssociations(projectIdentifier);
  }

  @Post('associations')
  @RequireRole(ApiRole.UPDATE_PROJECT)
  @ApiOperation({ summary: 'Add device-type or device-id associations to a ConfigMap project' })
  @ApiParam({ name: 'projectIdentifier', description: 'ConfigMap project ID or name' })
  @ApiOkResponse({ type: [ConfigMapAssociationDto] })
  addAssociation(
    @Param('projectIdentifier') projectIdentifier: string,
    @Body() dto: AddConfigMapAssociationDto,
  ) {
    if (dto.deviceTypeId == null && (!dto.deviceIds || dto.deviceIds.length === 0)) {
      throw new BadRequestException('At least one association target must be provided: deviceTypeId or deviceIds');
    }
    return this.projectManagementService.addConfigMapAssociation(projectIdentifier, dto);
  }

  @Delete('associations/:associationId')
  @RequireRole(ApiRole.UPDATE_PROJECT)
  @ApiOperation({ summary: 'Remove a device-type association from a ConfigMap project' })
  @ApiParam({ name: 'projectIdentifier', description: 'ConfigMap project ID or name' })
  @ApiParam({ name: 'associationId', description: 'Association ID' })
  removeAssociation(@Param('associationId') associationId: number) {
    return this.projectManagementService.removeConfigMapAssociation(+associationId);
  }
}

// ---------------------------------------------------------------------------
// Device-facing config endpoint (Device-Auth, no role enforcement)
// ---------------------------------------------------------------------------

@ApiTags('Config')
@ApiSecurity('Device-Auth')
@UseInterceptors(UserContextInterceptor)
@Controller(`${PROJECT_MANAGEMENT}/device-config`)
export class DeviceConfigController {
  constructor(private readonly projectManagementService: ProjectManagementService) {}

  @Get(':deviceId')
  @ApiOperation({
    summary: 'Get rendered config for a device',
    description:
      'Returns the fully assembled config for the given device by merging the latest ACTIVE revision of its CONFIG project with all applicable ConfigMap revisions. The result is cached in S3 and served from cache when no relevant database changes have occurred. Authenticate with the Device-Auth header.',
  })
  @ApiParam({ name: 'deviceId', description: 'Device ID' })
  @ApiOkResponse({ type: DeviceConfigDto })
  getDeviceConfig(@Param('deviceId') deviceId: string) {
    return this.projectManagementService.getDeviceConfig(deviceId);
  }
}
