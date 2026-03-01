import { OfferingTopics, OfferingTopicsEmit } from '@app/common/microservice-client/topics';
import { Inject, Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { MicroserviceClient, MicroserviceName } from '@app/common/microservice-client';
import { ComponentOfferingRequestDto, OfferingTreePolicyParams, PushOfferingDto, UpsertOfferingTreePolicyDto } from '@app/common/dto/offering';
import { ProjectIdentifierParams } from '@app/common/dto/project-management';
import { DeviceTypeOfferingFilterQuery, DeviceTypeOfferingParams, GetProjectsOfferingDto, PlatformOfferingParams, ProjectOfferingFilterQuery } from '@app/common/dto/offering/dto/offering.dto';

@Injectable()
export class OfferingService implements OnModuleInit {
  private readonly logger = new Logger(OfferingService.name);

  constructor(@Inject(MicroserviceName.OFFERING_SERVICE) private readonly offeringClient: MicroserviceClient) { }

  getOfferingForPlatform(params: PlatformOfferingParams) {
    return this.offeringClient.send(OfferingTopics.GET_OFFERING_FOR_PLATFORM, params)
  }

  getOfferingForDeviceType(params: DeviceTypeOfferingParams, query: DeviceTypeOfferingFilterQuery) {
    query.deviceTypeIdentifier = params.deviceTypeIdentifier;
    return this.offeringClient.send(OfferingTopics.GET_OFFERING_FOR_DEVICE_TYPE, query);
  }

  getOfferingForProjects(dto: GetProjectsOfferingDto) {
    return this.offeringClient.send(OfferingTopics.GET_OFFERING_FOR_ALL_PROJECTS, dto);
  }
  
  getOfferingForProject(params: ProjectIdentifierParams, query: ProjectOfferingFilterQuery) {
    query.projectIdentifier = params.projectIdentifier;
    return this.offeringClient.send(OfferingTopics.GET_OFFERING_FOR_PROJECT, query);
  }

  getOfferingOfComp(catalogId: string) {
    return this.offeringClient.send(OfferingTopics.GET_OFFER_OF_COMP, catalogId)
  }

  checkHealth() {
    return this.offeringClient.send(OfferingTopics.CHECK_HEALTH, {})
  }

  getDeviceComponentsOffering(dto: ComponentOfferingRequestDto) {
    this.logger.debug(`Get components offering, dto: ${JSON.stringify(dto)}`)
    return this.offeringClient.send(OfferingTopics.DEVICE_COMPONENT_OFFERING, dto);
  }

  getDeviceMapOffering(deviceId: string) {
    this.logger.debug(`Get device map offering, deviceId: ${deviceId}`)
    return this.offeringClient.send(OfferingTopics.DEVICE_MAP_OFFERING, deviceId);
  }

  pushOffering(po: PushOfferingDto) {
    return this.offeringClient.emit(OfferingTopicsEmit.OFFERING_PUSH, po);
  }

  upsert(upsertDto: UpsertOfferingTreePolicyDto) {
    return this.offeringClient.send(OfferingTopics.UPSERT_OFFERING_TREE_POLICY, upsertDto);
  }

  findByProject(params: OfferingTreePolicyParams) {
    return this.offeringClient.send(OfferingTopics.GET_OFFERING_TREE_POLICIES, params);
  }


  async onModuleInit() {
    this.offeringClient.subscribeToResponseOf(Object.values(OfferingTopics))
    await this.offeringClient.connect()
  }
}
