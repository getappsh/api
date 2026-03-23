import { Controller, Post, Body, Logger, Get, Param, Put, Query, UsePipes, Delete, Version } from '@nestjs/common';
import { DeviceService } from './device.service';
import { DeviceRegisterDto, DeviceContentResDto, DeviceMapDto, DevicesStatisticInfo, OSDto } from '@app/common/dto/device';
import { ApiBearerAuth, ApiBody, ApiExcludeEndpoint, ApiExtraModels, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { DeviceDto } from '@app/common/dto/device/dto/device.dto';
import { Unprotected } from '../../../utils/sso/sso.decorators';
import { RequireRole, ApiRole } from '@app/common';
import { DevicePutDto } from '@app/common/dto/device/dto/device-put.dto';
import { DEVICE } from '@app/common/utils/paths';
import { AndroidConfigDto, BaseConfigDto, DeviceConfigValidator, WindowsConfigDto } from '@app/common/dto/device/dto/device-config.dto';
import { DeviceSoftwareDto } from '@app/common/dto/device/dto/device-software.dto';
import { RestrictionDto } from '@app/common/dto/discovery';

@ApiTags("Device")
@ApiBearerAuth()
@Controller(DEVICE)
export class DeviceController {
  private readonly logger = new Logger(DeviceController.name);

  constructor(private readonly deviceService: DeviceService) { }

  // devices
  @Get("devices")
  @RequireRole(ApiRole.VIEW_DISCOVERY)
  @ApiOperation({
    summary: "Get Registered Devices",
    description: "This service message allows retrieval of all registered devices."
  })
  @ApiQuery({ name: 'groups', type: [String], required: false, description: 'Array of groups IDs or a single group ID' })
  @ApiOkResponse({ type: DeviceDto, isArray: true })
  getRegisteredDevices(@Query('groups') groups: string | string[]) {
    this.logger.debug(`Get all registered devices, for groups ${groups}`);
    let arrGroups = groups === undefined ? undefined : (Array.isArray(groups) ? groups : [groups]);
    return this.deviceService.getRegisteredDevices(arrGroups);
  }


  @Get("/devices/software/info")
  @RequireRole(ApiRole.VIEW_METRICS)
  @ApiOperation({
    summary: "Get statistic info about Devices",
    description: "This service message allows retrieval of statistic info about devices."
  })
  @ApiQuery({ name: 'software', type: [String], required: false, description: 'Array of softwares IDs or a single software ID' })
  @ApiQuery({ name: 'groups', type: [String], required: false, description: 'Array of groups IDs or a single group ID' })
  @ApiOkResponse({ type: DevicesStatisticInfo })
  getDevicesSoftwareStatisticInfo(
    @Query('groups') groups: string | string[],
    @Query('software') software: string | string[],
  ) {
    let arrGroups = groups === undefined ? undefined : (Array.isArray(groups) ? groups : [groups]);
    let arrSoftware = software === undefined ? undefined : (Array.isArray(software) ? software : [software]);
    this.logger.debug(`Get devices statistic info, ${groups ? "- groups=" + groups : ""} ${software ? "- software=" + software : ""}`);
    return this.deviceService.getDevicesSoftwareStatisticInfo({ groups: arrGroups, software: arrSoftware });
  }

  @Get("/devices/map/info")
  @RequireRole(ApiRole.VIEW_METRICS)
  @ApiOperation({
    summary: "Get statistic info about Devices",
    description: "This service message allows retrieval of statistic info about devices."
  })
  @ApiQuery({ name: 'map', type: [String], required: false, description: 'Array of maps IDs or a single map ID' })
  @ApiQuery({ name: 'groups', type: [String], required: false, description: 'Array of groups IDs or a single group ID' })
  @ApiOkResponse({ type: DevicesStatisticInfo })
  getDevicesMapStatisticInfo(
    @Query('groups') groups: string | string[],
    @Query('map') map: string | string[]
  ) {
    let arrGroups = groups === undefined ? undefined : (Array.isArray(groups) ? groups : [groups]);
    let arrMap = map === undefined ? undefined : (Array.isArray(map) ? map : [map]);
    this.logger.debug(`Get devices statistic info, ${groups ? "- groups=" + groups : ""} ${map ? "map=" + map : ""}`);
    return this.deviceService.getDevicesMapStatisticInfo({ groups: arrGroups, map: arrMap });
  }

  @Get("os")
  @ApiOperation({
    summary: "Get Known Operating Systems",
    description: "This service message allows retrieval of all known operating systems that devices can report during discovery."
  })
  @ApiOkResponse({ 
    description: "Array of operating systems",
    type: OSDto,
    isArray: true
  })
  getOperatingSystems() {
    this.logger.debug('Get all known operating systems');
    return this.deviceService.getAllOperatingSystems();
  }

  // config
  @Get("config/:deviceId")
  @ApiQuery({ name: 'group', type: String })
  @ApiParam({ name: 'deviceId', type: String })
  @ApiOperation({
    summary: "Get Device Configurations",
    description: "This service message returns an object of device configurations.",
  })
  @ApiOkResponse({
    schema: { title: "ConfigDto", oneOf: [{ $ref: getSchemaPath(AndroidConfigDto) }, { $ref: getSchemaPath(WindowsConfigDto) }] }
  })
  getDeviceConfig(@Query('group') group: string) {
    this.logger.debug(`Get device config - group: ${group}`)
    return this.deviceService.getDeviceConfig(group);
  }

  @Put("config")
  @RequireRole(ApiRole.MANAGE_CONFIG)
  @ApiOperation({
    summary: "Set Device Configurations",
    description: "This service message returns an object of device configurations.",
  })
  @ApiExtraModels(AndroidConfigDto, WindowsConfigDto,)
  @ApiBody({
    schema: { title: "ConfigDto", oneOf: [{ $ref: getSchemaPath(AndroidConfigDto) }, { $ref: getSchemaPath(WindowsConfigDto) }] }
  })
  @ApiOkResponse({
    schema: { title: "ConfigDto", oneOf: [{ $ref: getSchemaPath(AndroidConfigDto) }, { $ref: getSchemaPath(WindowsConfigDto) }] }
  })
  @UsePipes(DeviceConfigValidator)
  setDeviceConfig(@Body() config: AndroidConfigDto | WindowsConfigDto | BaseConfigDto) {
    this.logger.debug('Set device config')
    return this.deviceService.setDeviceConfig(config);
  }

  // Miscellaneous
  @Post('register')
  @ApiOperation({
    summary: "Register Device",
    description: "This service message allows the device registration process for GetApp services."
  })
  register(@Body() deviceRegister: DeviceRegisterDto) {
    this.logger.debug(`Register, device: ${deviceRegister}`);
    return this.deviceService.register(deviceRegister);
  }

  @Get("info/installed/:deviceId")
  @ApiOperation({
    summary: "Get Installed Device Content",
    description: "This service message allows receiving information about the installations carried out on the device using GetApp services. This message is sent by the device during the initialization phase to check compatibility between the existing installations on this device."
  })
  @ApiParam({ name: 'deviceId', type: String })
  @ApiOkResponse({ type: DeviceContentResDto })
  getDeviceContentInstalled(@Param('deviceId') deviceId: string) {
    this.logger.debug(`Device content installed, deviceId: ${deviceId}`);
    return this.deviceService.getDeviceContentInstalled(deviceId);
  }

  @Get('checkHealth')
  @Unprotected()
  @ApiExcludeEndpoint()
  checkHealth() {
    this.logger.log("Device service - Health checking");
    return this.deviceService.checkHealth();
  }

  // :deviceId
  @Get(":deviceId")
  @ApiOperation({ summary: "Get Device meta data", description: "This service message allow to get device meta data and properties" })
  @ApiOkResponse({ type: DeviceDto })
  getDeviceDetails(@Param("deviceId") deviceId: string) {
    this.logger.debug(`get metadata for device ${deviceId}`)
    return this.deviceService.getDeviceDetails(deviceId)
  }

  @Put(":deviceId")
  @RequireRole(ApiRole.MANAGE_DISCOVERY)
  @ApiOperation({ summary: "Set Device Properties", description: "This service message allow to update props of device" })
  @ApiOkResponse({ type: DevicePutDto })
  putDeviceProps(@Param("deviceId") deviceId: string, @Body() body: DevicePutDto) {
    this.logger.debug(`Put properties for device ${deviceId}`)
    return this.deviceService.putDeviceProps(deviceId, body)
  }

  @Delete(":deviceId")
  @RequireRole(ApiRole.MANAGE_DISCOVERY)
  @ApiOperation({ summary: "Delete Device", description: "This service message allows de  letion of a device" })
  @ApiOkResponse({ description: "Device deleted successfully" })
  deleteDevice(@Param("deviceId") deviceId: string) {
    this.logger.debug(`Delete device ${deviceId}`);
    return this.deviceService.deleteDevice(deviceId);
  }

  @Get(":deviceId/maps")
  @ApiOperation({
    summary: "Get Device Maps",
    description: "This service message allows retrieval of all registered maps on the given device."
  })
  @ApiOkResponse({ type: DeviceMapDto })
  getDeviceMaps(@Param("deviceId") deviceId: string) {
    this.logger.debug(`Get all maps of device ${deviceId}`);
    return this.deviceService.getDeviceMaps(deviceId);
  }

  @Get(":deviceId/softwares")
  @ApiOperation({
    summary: "Get Device softwares",
    description: "This service message allows retrieval of all software on a process in a given device.",
  })
  @ApiOkResponse({ type: DeviceSoftwareDto })
  getDeviceSoftwares(@Param("deviceId") deviceId: string) {
    this.logger.debug(`Get all softwares of device ${deviceId}`);
    return this.deviceService.getDeviceSoftwares(deviceId);
  }

  @Get(":deviceId/restrictions")
  @Version(['1', '2'])
  @ApiOperation({
    summary: "Get Device Restrictions",
    description: "This service message retrieves all applicable restrictions for a device based on device ID, device type, OS, and other metadata collected during discovery.",
  })
  @ApiParam({ name: 'deviceId', type: String, description: 'The unique identifier of the device' })
  @ApiOkResponse({ 
    type: RestrictionDto,
    description: "Array of restriction rules applicable to the device",
    isArray: true
  })
  getDeviceRestrictions(@Param("deviceId") deviceId: string) {
    this.logger.debug(`Get restrictions for device ${deviceId}`);
    return this.deviceService.getDeviceRestrictions(deviceId);
  }

}
