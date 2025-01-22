import { Controller, Post, Body, Logger, Get, Param, Put, Query, UsePipes, } from '@nestjs/common';
import { DeviceService } from './device.service';
import { DeviceRegisterDto, DeviceContentResDto, DeviceMapDto, DevicesStatisticInfo } from '@app/common/dto/device';
import { ApiBearerAuth, ApiBody, ApiExcludeEndpoint, ApiExtraModels, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { DeviceDto } from '@app/common/dto/device/dto/device.dto';
import { Unprotected } from '../../../utils/sso/sso.decorators';
import { DevicePutDto } from '@app/common/dto/device/dto/device-put.dto';
import { DEVICE } from '@app/common/utils/paths';
import { AndroidConfigDto, BaseConfigDto, DeviceConfigValidator, WindowsConfigDto } from '@app/common/dto/device/dto/device-config.dto';
import { DeviceSoftwareDto } from '@app/common/dto/device/dto/device-software.dto';

@ApiTags("Device")
@ApiBearerAuth()
@Controller(DEVICE)
export class DeviceController {
  private readonly logger = new Logger(DeviceController.name);

  constructor(private readonly deviceService: DeviceService) { }

  @Post('register')
  @ApiOperation({
    summary: "Register Device",
    description: "This service message allows the device registration process for GetApp services."
  })
  register(@Body() deviceRegister: DeviceRegisterDto) {
    this.logger.debug(`Register, device: ${deviceRegister}`);
    return this.deviceService.register(deviceRegister);
  }

  @Get("/devices/software/info")
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

  @Get("devices")
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
    console.log(group)
    this.logger.debug(`Get device config - group: ${group}`)
    return this.deviceService.getDeviceConfig(group);
  }


  @Put("config")
  @ApiOperation({
    summary: "Set Device Configurations",
    description: "This service message returns an object of device configurations.",
  })
  @ApiExtraModels(AndroidConfigDto, WindowsConfigDto)
  @ApiBody({
    schema: { title: "ConfigDto", oneOf: [{ $ref: getSchemaPath(AndroidConfigDto) }, { $ref: getSchemaPath(WindowsConfigDto) }] }
  })
  @ApiOkResponse({
    schema: {title: "ConfigDto", oneOf: [{ $ref: getSchemaPath(AndroidConfigDto) }, { $ref: getSchemaPath(WindowsConfigDto) }] }
  })
  @UsePipes(DeviceConfigValidator)
  setDeviceConfig(@Body() config: AndroidConfigDto | BaseConfigDto) {
    this.logger.debug('Set device config')
    return this.deviceService.setDeviceConfig(config);
  }

  @Put(":deviceId")
  @ApiOperation({ summary: "Set Device Name", description: "This service message allow to update props of device" })
  @ApiOkResponse({ type: DevicePutDto })
  putDeviceName(@Param("deviceId") deviceId: string, @Body() body: DevicePutDto) {
    this.logger.debug(`Put properties for device ${deviceId}`)
    return this.deviceService.putDeviceName(deviceId, body)
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
    description: "This service message allows retrieval of all software on a process in a given device."
  })
  @ApiOkResponse({ type: DeviceSoftwareDto })
  getDeviceSoftwares(@Param("deviceId") deviceId: string) {
    this.logger.debug(`Get all softwares of device ${deviceId}`);
    return this.deviceService.getDeviceSoftwares(deviceId);
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
}
