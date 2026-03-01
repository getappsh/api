import { Body, Controller, Delete, Get, Logger, Param, Post, Put, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from "@nestjs/swagger";
import { CreateDevicesGroupDto, ChildGroupDto, EditDevicesGroupDto, SetChildInGroupDto, GroupResponseDto } from "@app/common/dto/devices-group";
import { GroupService } from "./group.service";
import { DEVICE_GROUP } from "@app/common/utils/paths";
import { DeviceDto } from "@app/common/dto/device/dto/device.dto";
import { DeviceOrgDto } from "@app/common/dto/device/dto/device-org.dto";
import { switchMap } from "rxjs";
import { OrgIdDto, OrgIdPutDto, OrgIdRefDto } from "@app/common/dto/devices-group/dto/org-id.dto";


@ApiTags("Organization Groups")
@ApiBearerAuth()
@Controller(DEVICE_GROUP)
export class GroupController {
  private readonly logger = new Logger(GroupController.name);

  constructor(private readonly groupService: GroupService) { }


  @Post("groups")
  @ApiOperation({ summary: "Create organization group of devices" })
  @ApiCreatedResponse({ type: ChildGroupDto })
  createGroup(@Body() group: CreateDevicesGroupDto) {
    this.logger.debug(`Create organization group of devices: ${group}`);
    return this.groupService.createGroup(group);
  }

  @Get("groups")
  @ApiOperation({ summary: "Get all root groups with their child groups" })
  // TODO return type is not documented well, need to be Record<number, ChildGroupDto>
  @ApiOkResponse({ type: GroupResponseDto, description: 'Returns root group IDs and a mapping of all groups by ID' })
  getGroups() {
    this.logger.debug(`Get all root groups`);
    return this.groupService.getGroups();
  }

  @Post("groups/childs")
  @ApiOperation({ summary: "Set groups and devices in group" })
  @ApiCreatedResponse({ type: ChildGroupDto })
  setDevicesInGroup(@Body() devices: SetChildInGroupDto) {
    this.logger.debug(`Set devices in a group: ${devices}`);
    return this.groupService.setDevicesInGroup(devices);
  }

  @Get("groups/:groupId/")
  @ApiOperation({ summary: "Retrieve a group by its ID, including all its child groups and associated devices" })
  @ApiParam({ name: 'groupId', type: String })
  @ApiOkResponse({ type: ChildGroupDto })
  getGroupById(@Param("groupId") groupId: string) {
    this.logger.debug(`Get group with id ${groupId}`);
    return this.groupService.getGroups(groupId);
  }

  @Put("groups/:groupId/")
  @ApiOperation({ summary: "Edit organization group of devices" })
  @ApiParam({ name: 'groupId', type: String })
  @ApiOkResponse({ type: ChildGroupDto })
  editGroup(@Param("groupId") groupId: string, @Body() group: EditDevicesGroupDto) {
    this.logger.debug(`Edit organization group: ${group}`);
    group.id = parseInt(groupId, 10);
    return this.groupService.editGroup(group);
  }

  @Delete("groups/:groupId/")
  @ApiOperation({ summary: "Delete organization group of devices by ID" })
  @ApiParam({ name: 'groupId', type: String })
  @ApiOkResponse({ type: ChildGroupDto, description: 'Group deleted successfully' })
  deleteGroup(@Param("groupId") groupId: string) {
    this.logger.debug(`Delete group with id ${groupId}`);
    return this.groupService.deleteGroup(groupId);
  }

  @Get("devices")
  @ApiOperation({ summary: "Get org devices data" })
  @ApiOkResponse({ type: DeviceOrgDto, isArray: true })
  getOrgDevicesData() {
    this.logger.debug(`Get devices organization data`);
    return this.groupService.getOrgDevicesData().pipe(
      switchMap(async (promise: Promise<DeviceDto[]>) => {
        const dvcDtos = await promise;
        return dvcDtos.map(dvcDto => DeviceOrgDto.fromDeviceDto(dvcDto));
      })
    );
  }

  @Get("devices/:deviceId")
  @ApiOperation({ summary: "Get organization device data by ID" })
  @ApiOkResponse({ type: DeviceOrgDto })
  getOrgDeviceData(@Param("deviceId") deviceId: string) {
    this.logger.debug(`Get device data, ID:  ${deviceId}`);
    return this.groupService.getOrgDeviceData(deviceId).pipe(
      switchMap(async (promise: Promise<DeviceDto>) => {
        const dvcDto = await promise;
        return DeviceOrgDto.fromDeviceDto(dvcDto);
      })
    );
  }

  @Post("orgIds")
  @ApiOperation({ summary: "Create Organization ID" })
  @ApiCreatedResponse({ type: OrgIdRefDto })
  createOrgIds(@Body() orgIds: OrgIdDto) {
    this.logger.debug(`Create organization IDs : ${orgIds}`);
    return this.groupService.createOrgIds(orgIds);
  }

  @Get("orgIds")
  @ApiOperation({ summary: "Get Organization IDs details" })
  @ApiOkResponse({ type: [OrgIdRefDto], description: 'Returns a list of organization IDs, according to the specified filters' })
  @ApiQuery({ name: 'group', required: false, type: Number, description: 'Filter by group ID' })
  @ApiQuery({ name: 'emptyGroup', required: false, type: Boolean, description: 'If true: (with group) also include IDs without group; (without group) only IDs without group' })
  @ApiQuery({ name: 'emptyDevice', required: false, type: Boolean, description: 'If true, only IDs without device' })
  getOrgIds(
    @Query("group") group?: number,
    @Query("emptyGroup") emptyGroup?: boolean,
    @Query("emptyDevice") emptyDevice?: boolean,
  ) {
    this.logger.debug(`Get org IDs: group=${group}, emptyGroup=${emptyGroup}, emptyDevice=${emptyDevice}`);
    return this.groupService.getOrgIds(group, emptyGroup, emptyDevice);
  }

  @Get("orgIds/:orgId")
  @ApiOperation({ summary: "Get Organization IDs details" })
  @ApiOkResponse({ type: OrgIdRefDto })
  getOrgId(@Param("orgId") orgId: number) {
    this.logger.debug(`Get organization IDs : ${orgId}`);
    return this.groupService.getOrgId(orgId);
  }

  @Put("orgIds/:orgId")
  @ApiOperation({ summary: "Edit Organization ID" })
  @ApiOkResponse({ type: OrgIdRefDto })
  editOrgIds(@Param("orgId") orgId: number, @Body() orgIds: OrgIdPutDto) {
    this.logger.debug(`Edit organization IDs : ${orgId}`);
    return this.groupService.editOrgIds(orgId, orgIds);
  }

  @Delete("orgIds/:orgId")
  @ApiOperation({ summary: "Delete Organization ID" })
  @ApiOkResponse({ type: OrgIdRefDto })
  deleteOrgIds(@Param("orgId") orgId: number) {
    this.logger.debug(`Delete organization IDs : ${orgId}`);
    return this.groupService.deleteOrgIds(orgId);
  }
}