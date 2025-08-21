import { CreateDevicesGroupDto, EditDevicesGroupDto, SetDevicesInGroupDto } from "@app/common/dto/devices-group";
import { MicroserviceClient, MicroserviceName } from "@app/common/microservice-client";
import { DevicesGroupTopics } from "@app/common/microservice-client/topics";
import { Inject, Injectable, Logger } from "@nestjs/common";

@Injectable()
export class GroupService {

  private readonly logger = new Logger(GroupService.name);

  constructor(
    @Inject(MicroserviceName.DEVICE_SERVICE) private readonly deviceClient: MicroserviceClient) {}


    createGroup(group: CreateDevicesGroupDto){
      return this.deviceClient.send(DevicesGroupTopics.CREATE_GROUP, group);
    }


    editGroup(group: EditDevicesGroupDto){
      return this.deviceClient.send(DevicesGroupTopics.EDIT_GROUP, group);
    }


    getGroups(){
      return this.deviceClient.send(DevicesGroupTopics.GET_GROUPS, {});
    }


    getGroupDevices(groupId: string){
      return this.deviceClient.send(DevicesGroupTopics.GET_GROUP_DEVICES, groupId);
    }


    setDevicesInGroup(devices: SetDevicesInGroupDto){
      return this.deviceClient.send(DevicesGroupTopics.SET_GROUP_DEVICES, devices);
    }


}