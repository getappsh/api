import { DeviceDto } from "@app/common/dto/device/dto/device.dto";
import { CreateDevicesGroupDto, EditDevicesGroupDto, SetChildInGroupDto } from "@app/common/dto/devices-group";
import { MicroserviceClient, MicroserviceName } from "@app/common/microservice-client";
import { DevicesGroupTopics, DeviceTopics } from "@app/common/microservice-client/topics";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { OrgIdDto, OrgIdPutDto } from "@app/common/dto/devices-group/dto/org-id.dto";

@Injectable()
export class GroupService {

  private readonly logger = new Logger(GroupService.name);

  constructor(
    @Inject(MicroserviceName.DEVICE_SERVICE) private readonly deviceClient: MicroserviceClient) { }


  createGroup(group: CreateDevicesGroupDto) {
    return this.deviceClient.send(DevicesGroupTopics.CREATE_GROUP, group);
  }


  editGroup(group: EditDevicesGroupDto) {
    return this.deviceClient.send(DevicesGroupTopics.EDIT_GROUP, group);
  }


  getGroups(groupId?: string) {
    return this.deviceClient.send(DevicesGroupTopics.GET_GROUPS, groupId);
  }


  getGroupDevices(groupId: string) {
    return this.deviceClient.send(DevicesGroupTopics.GET_GROUP_DEVICES, groupId);
  }

  getOrgDevicesData() {
    return this.deviceClient.send(DevicesGroupTopics.GET_ORG_DEVICES, {});
  }

  getOrgDeviceData(deviceId: string) {
    return this.deviceClient.sendAndValidate(DeviceTopics.GET_DEVICE, deviceId, DeviceDto);
  }


  setDevicesInGroup(devices: SetChildInGroupDto) {
    return this.deviceClient.send(DevicesGroupTopics.SET_GROUP_DEVICES, devices);
  }

  deleteGroup(groupId: string) {
    return this.deviceClient.send(DevicesGroupTopics.DELETE_GROUP, groupId);
  }

  createOrgIds(orgIds: OrgIdDto) {
    return this.deviceClient.send(DevicesGroupTopics.CREATE_ORG_IDS, orgIds);
  }

  getOrgIds(group?: number, emptyGroup?: boolean, emptyDevice?: boolean) {
    return this.deviceClient.send(DevicesGroupTopics.GET_ORG_IDS, { group, emptyGroup, emptyDevice });
  }

  getOrgId(orgId: number) {
    return this.deviceClient.send(DevicesGroupTopics.GET_ORG_ID, orgId);
  }

  editOrgIds(orgId: number, orgIds: OrgIdPutDto) {
    orgIds.orgId = orgId;
    return this.deviceClient.send(DevicesGroupTopics.EDIT_ORG_IDS, orgIds);
  }

  deleteOrgIds(orgId: number) {
    return this.deviceClient.send(DevicesGroupTopics.DELETE_ORG_IDS, orgId);
  }

}