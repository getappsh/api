import { Body, Controller, Get, Logger, Param, Post, Put } from "@nestjs/common";
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { DEVICE_GROUP } from "../../../utils/paths";
import { CreateDevicesGroupDto, DevicesGroupDto, EditDevicesGroupDto, SetDevicesInGroupDto } from "@app/common/dto/devices-group";
import { GroupService } from "./group.service";


@ApiTags("Device - group")
@ApiBearerAuth()
@Controller(DEVICE_GROUP)
export class GroupController {
  private readonly logger = new Logger(GroupController.name);

  constructor(private readonly groupService: GroupService) {}


  @Post()
  @ApiOperation({ summary: "Create Devices Group" })  
  @ApiCreatedResponse({type: DevicesGroupDto})
  createGroup(@Body() group: CreateDevicesGroupDto){
    this.logger.debug(`Create devices group: ${group}`);
    return this.groupService.createGroup(group);
  }


  @Put()
  @ApiOperation({ summary: "Edit Devices Group" })  
  @ApiOkResponse({type: DevicesGroupDto})
  editGroup(@Body() group: EditDevicesGroupDto){
    this.logger.debug(`Edit devices group: ${group}`);
    return this.groupService.editGroup(group);
  }


  @Get()
  @ApiOperation({ summary: "Get Devices Groups and children groups" })  
  @ApiOkResponse({type: DevicesGroupDto, isArray: true})
  getGroups(){
    this.logger.debug(`Get devices group`);
    return this.groupService.getGroups();
  }


  @Get("/:groupId/devices")
  @ApiOperation({ summary: "Get Devices in a group" })  
  @ApiParam({ name: 'groupId', type: String})
  @ApiOkResponse({type: DevicesGroupDto})
  getGroupDevices(@Param("groupId") groupId: string){
    this.logger.debug(`Get devices in a group id: ${groupId}`);
    return this.groupService.getGroupDevices(groupId)
  }


  @Post("devices")
  @ApiOperation({ summary: "Set Devices in a Group" })  
  @ApiCreatedResponse({type: DevicesGroupDto})
  setDevicesInGroup(@Body() devices: SetDevicesInGroupDto){
    this.logger.debug(`Set devices in a group: ${devices}`);
    return this.groupService.setDevicesInGroup(devices);
  }

  

}