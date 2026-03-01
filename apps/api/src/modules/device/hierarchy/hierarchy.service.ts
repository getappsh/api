import { CreateDeviceTypeDto, CreatePlatformDto, DeviceTypeParams, DeviceTypeProjectParams, PlatformDeviceTypeParams, PlatformParams, UpdateDeviceTypeDto, UpdatePlatformDto } from "@app/common/dto/devices-hierarchy";
import { MicroserviceName, MicroserviceClient } from "@app/common/microservice-client";
import { DevicesHierarchyTopics } from "@app/common/microservice-client/topics";
import { Injectable, Inject, Logger } from "@nestjs/common";


@Injectable()
export class HierarchyService {
  private readonly logger = new Logger(HierarchyService.name);

  constructor(
    @Inject(MicroserviceName.DEVICE_SERVICE) private readonly deviceClient: MicroserviceClient
  ) {}

  createPlatform(dto: CreatePlatformDto){
    return this.deviceClient.send(
      DevicesHierarchyTopics.CREATE_PLATFORM,
      dto
    )
  }

  getPlatforms(query?: string){
    return this.deviceClient.send(
      DevicesHierarchyTopics.GET_PLATFORMS,
      query
    )
  }
  
  getPlatform(params: PlatformParams){
    return this.deviceClient.send(
      DevicesHierarchyTopics.GET_PLATFORM_BY_NAME,
      params
    )
  }


  updatePlatform(params: PlatformParams, dto: UpdatePlatformDto){
    dto.id = params.platformId;
    return this.deviceClient.send(
      DevicesHierarchyTopics.UPDATE_PLATFORM,
      dto
    )
  }

  deletePlatform(params: PlatformParams){
    return this.deviceClient.send(
      DevicesHierarchyTopics.DELETE_PLATFORM,
      params
    )
  }


  addDeviceTypeToPlatform(params: PlatformDeviceTypeParams) {
    return this.deviceClient.send(
      DevicesHierarchyTopics.ADD_DEVICE_TYPE_TO_PLATFORM,
      params
    );
  }


  removeDeviceTypeFromPlatform(params: PlatformDeviceTypeParams) {
    return this.deviceClient.send(
      DevicesHierarchyTopics.REMOVE_DEVICE_TYPE_FROM_PLATFORM,
      params
    );
  } 

  getDeviceTypes(query?: string) {
    return this.deviceClient.send(
      DevicesHierarchyTopics.GET_DEVICE_TYPES,
      query
    );
  }

  createDeviceType(dto: CreateDeviceTypeDto) {
    return this.deviceClient.send(
      DevicesHierarchyTopics.CREATE_DEVICE_TYPE,
      dto
    );
  }

  getDeviceType(params: DeviceTypeParams) {
    return this.deviceClient.send(
      DevicesHierarchyTopics.GET_DEVICE_TYPE_BY_NAME,
      params
    );
  }

  getPlatformHierarchy(params: PlatformParams) {
    return this.deviceClient.send(
      DevicesHierarchyTopics.GET_PLATFORM_HIERARCHY_TREE,
      params
    );
  }

  getDeviceTypeHierarchy(params: DeviceTypeParams) {
    return this.deviceClient.send(
      DevicesHierarchyTopics.GET_DEVICE_TYPE_HIERARCHY_TREE,
      params
    );
  }

  updateDeviceType(params: DeviceTypeParams, dto: UpdateDeviceTypeDto) {
    dto.id = params.deviceTypeId;
    return this.deviceClient.send(
      DevicesHierarchyTopics.UPDATE_DEVICE_TYPE,
      dto
    );
  }

  deleteDeviceType(params: DeviceTypeParams) {
    return this.deviceClient.send(
      DevicesHierarchyTopics.DELETE_DEVICE_TYPE,
      params
    );
  }
  
  addProjectToDeviceType(params: DeviceTypeProjectParams) {
    return this.deviceClient.send(
      DevicesHierarchyTopics.ADD_PROJECT_TO_DEVICE_TYPE,
      params
    );
  }
  removeProjectFromDeviceType(params: DeviceTypeProjectParams) {
    return this.deviceClient.send(
      DevicesHierarchyTopics.REMOVE_PROJECT_FROM_DEVICE_TYPE,
      params
    );
  }

}