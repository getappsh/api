import { Body, Controller, Delete, Get, Logger, Param, Post, Put, Query, UseInterceptors } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { RequireRole, ApiRole } from '@app/common';
import { HierarchyService } from "./hierarchy.service";
import { DeviceTypeDto, CreateDeviceTypeDto, DeviceTypeParams, UpdateDeviceTypeDto, CreatePlatformDto, PlatformDto, PlatformParams, UpdatePlatformDto, PlatformDeviceTypeParams, DeviceTypeProjectParams, PlatformHierarchyDto, DeviceTypeHierarchyDto } from "@app/common/dto/devices-hierarchy";
import { UserContextInterceptor } from "../../../utils/interceptor/user-context.interceptor";


@ApiBearerAuth()
@Controller()
export class HierarchyController {
  private readonly logger = new Logger(HierarchyController.name);

  constructor(private readonly hierarchyService: HierarchyService) {}


  @Get('/platforms')
  @ApiOperation({ summary: 'Get all platforms', tags: ['Platforms'] })
  @ApiOkResponse({ type: PlatformDto, isArray: true })
  @ApiQuery({ name: 'query', required: false, description: 'Query to search platforms', type: String })
  getPlatforms(@Query('query') query?: string) {
    this.logger.debug(`Getting all platforms with query: ${query}`);
    return this.hierarchyService.getPlatforms(query)
  }

  @Post('/platforms')
  @RequireRole(ApiRole.MANAGE_DISCOVERY)
  @ApiOperation({ summary: 'Create Platform', tags: ['Platforms'] })
  @ApiCreatedResponse({ type: PlatformDto })
  createPlatform(@Body() dto: CreatePlatformDto) {
    this.logger.debug(`Creating platform with data: ${JSON.stringify(dto)}`);
    return this.hierarchyService.createPlatform(dto);
  }

  @Get('/platforms/:platformId')
  @ApiOperation({ summary: 'Get Platform by name', tags: ['Platforms'] })
  @ApiOkResponse({ type: PlatformDto })
  getPlatform(@Param() params: PlatformParams) {
    this.logger.debug(`Get platform: ${params.platformId}`);
    return this.hierarchyService.getPlatform(params);
  }

  @Put('/platforms/:platformId')
  @RequireRole(ApiRole.MANAGE_DISCOVERY)
  @ApiOperation({ summary: 'Update Platform', tags: ['Platforms'] })
  @ApiOkResponse({ type: PlatformDto })
  @ApiBody({ type: UpdatePlatformDto })
  updatePlatform(@Param() params: PlatformParams, @Body() dto: UpdatePlatformDto) {
    this.logger.debug(`Updating platform: ${params.platformId} with data: ${JSON.stringify(dto)}`);
    return this.hierarchyService.updatePlatform(params, dto);
  }

  @ApiOperation({ summary: 'Delete Platform', tags: ['Platforms'] })
  @ApiOkResponse()
  @Delete('/platforms/:platformId')
  @RequireRole(ApiRole.MANAGE_DISCOVERY)
  deletePlatform(@Param() params: PlatformParams) {
    this.logger.debug(`Deleting platform: ${params.platformId}`);
    return this.hierarchyService.deletePlatform(params);
  }

  @ApiOperation({ summary: 'Get full hierarchy for a platform', tags: ['Device - Hierarchy'] })
  @ApiOkResponse({ type: PlatformHierarchyDto })
  @Get('hierarchy/platforms/:platformId/tree')
  getPlatformHierarchy(@Param() params: PlatformParams) {
    this.logger.debug(`Getting full hierarchy tree for platform: '${params.platformId}'`);
    return this.hierarchyService.getPlatformHierarchy(params);
  }

  @ApiOperation({ summary: 'Add Device Type to Platform', tags: ['Device - Hierarchy'] })
  @ApiOkResponse({ type: PlatformHierarchyDto })
  @Put('hierarchy/platforms/:platformId/device-types/:deviceTypeId')
  @RequireRole(ApiRole.MANAGE_DISCOVERY)
  addDeviceTypeToPlatform(@Param() params: PlatformDeviceTypeParams) {
    this.logger.debug(`Adding device type: '${params.deviceTypeId}' to platform: '${params.platformId}'`);
    return this.hierarchyService.addDeviceTypeToPlatform(params);
  }

  @ApiOperation({ summary: 'Remove Device Type from Platform', tags: ['Device - Hierarchy'] })
  @ApiOkResponse({ type: PlatformHierarchyDto })
  @Delete('hierarchy/platforms/:platformId/device-types/:deviceTypeId')
  @RequireRole(ApiRole.MANAGE_DISCOVERY)
  removeDeviceTypeFromPlatform(@Param() params: PlatformDeviceTypeParams) {
    this.logger.debug(`Removing device type: '${params.deviceTypeId}' to platform: '${params.platformId}'`);
    return this.hierarchyService.removeDeviceTypeFromPlatform(params);
  }

  @Get('/device-types')
  @ApiOperation({ summary: 'Get all device types', tags: ['Device Types'] })
  @ApiOkResponse({ type: DeviceTypeDto, isArray: true })
  @ApiQuery({ name: 'query', required: false, description: 'Query to search device types', type: String })
  getDeviceTypes(@Query('query') query?: string) {
    this.logger.debug(`Getting all device types with query: ${query}`);
    return this.hierarchyService.getDeviceTypes(query);
  }

  @Post('/device-types')
  @RequireRole(ApiRole.MANAGE_DISCOVERY)
  @ApiOperation({ summary: 'Create Device Type', tags: ['Device Types']  })
  @ApiCreatedResponse({ type: DeviceTypeDto })
  createDeviceType(@Body() dto: CreateDeviceTypeDto) {
    this.logger.debug(`Creating device type with data: ${JSON.stringify(dto)}`);
    return this.hierarchyService.createDeviceType(dto);
  }

  @ApiOperation({ summary: 'Get Device Type by name', tags: ['Device Types']  })
  @ApiOkResponse({ type: DeviceTypeDto })
  @Get('/device-types/:deviceTypeId')
  getDeviceType(@Param() params: DeviceTypeParams) {
    this.logger.debug(`Getting device type by name: ${params.deviceTypeId}`);
    return this.hierarchyService.getDeviceType(params);
  }

  @ApiOperation({ summary: 'Update Device Type', tags: ['Device Types']  })
  @ApiOkResponse({ type: DeviceTypeDto })
  @ApiBody({ type: UpdateDeviceTypeDto })
  @Put('/device-types/:deviceTypeId')
  @RequireRole(ApiRole.MANAGE_DISCOVERY)
  updateDeviceType(@Param() params: DeviceTypeParams, @Body() dto: UpdateDeviceTypeDto) {
    this.logger.debug(`Updating device type: ${params.deviceTypeId} with data: ${JSON.stringify(dto)}`);
    return this.hierarchyService.updateDeviceType(params, dto);
  }

  @ApiOperation({ summary: 'Delete Device Type', tags: ['Device Types']  })
  @ApiOkResponse()
  @Delete('/device-types/:deviceTypeId')
  @RequireRole(ApiRole.MANAGE_DISCOVERY)
  deleteDeviceType(@Param() params: DeviceTypeParams) {
    this.logger.debug(`Deleting device type: ${params.deviceTypeId}`);
    return this.hierarchyService.deleteDeviceType(params);
  }

  @Get('hierarchy/device-types/:deviceTypeId/tree')
  @ApiOperation({ summary: 'Get all projects for a device type', tags: ['Device - Hierarchy'] })
  @ApiOkResponse({ type: DeviceTypeHierarchyDto })
  getDeviceTypeHierarchy(@Param() params: DeviceTypeParams ) {
    this.logger.debug(`Getting full hierarchy tree for device type: '${params.deviceTypeId}'`);
    return this.hierarchyService.getDeviceTypeHierarchy(params);
  }

  @UseInterceptors(UserContextInterceptor)
  @RequireRole(ApiRole.LINK_PROJECT_DEVICE_TYPE)
  @ApiOperation({ summary: 'Add Project to Device Type', tags: ['Device - Hierarchy'] })
  @ApiOkResponse({ type: DeviceTypeHierarchyDto })
  @Put('hierarchy/device-types/:deviceTypeId/projects/:projectIdentifier')
  addProjectToDeviceType(@Param() params: DeviceTypeProjectParams) {
    this.logger.debug(`Adding project: '${params.projectIdentifier}' to device type: '${params.deviceTypeId}'`);
    return this.hierarchyService.addProjectToDeviceType(params);
  }

  @UseInterceptors(UserContextInterceptor)
  @RequireRole(ApiRole.LINK_PROJECT_DEVICE_TYPE)
  @ApiOperation({ summary: 'Remove Project from Device Type', tags: ['Device - Hierarchy'] })
  @ApiOkResponse({ type: DeviceTypeHierarchyDto })
  @Delete('hierarchy/device-types/:deviceTypeId/projects/:projectIdentifier')
  removeProjectFromDeviceType(@Param() params: DeviceTypeProjectParams) {
    this.logger.debug(`Removing project: '${params.projectIdentifier}' from device type: '${params.deviceTypeId}'`);
    return this.hierarchyService.removeProjectFromDeviceType(params);
  }

}