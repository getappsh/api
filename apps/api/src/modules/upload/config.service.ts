import { UploadTopics } from "@app/common/microservice-client/topics";
import { Inject, Injectable } from "@nestjs/common";
import {
  UpsertConfigGroupDto,
  DeleteConfigGroupDto,
  ApplyConfigRevisionDto,
  GetConfigRevisionsQueryDto,
  GetConfigRevisionQueryDto,
  AddConfigMapAssociationDto,
  GetDeviceConfigByVersionDto,
} from "@app/common/dto/project-management";
import { MicroserviceClient, MicroserviceName } from "@app/common/microservice-client";

@Injectable()
export class ConfigService {
  constructor(
    @Inject(MicroserviceName.UPLOAD_SERVICE) private readonly uploadClient: MicroserviceClient,
  ) {}

  upsertConfigGroup(projectIdentifier: string | number, dto: UpsertConfigGroupDto) {
    return this.uploadClient.send(UploadTopics.CONFIG_UPSERT_GROUP, { projectIdentifier, ...dto });
  }

  deleteConfigGroup(projectIdentifier: string | number, dto: DeleteConfigGroupDto) {
    return this.uploadClient.send(UploadTopics.CONFIG_DELETE_GROUP, { projectIdentifier, ...dto });
  }

  applyConfigRevision(projectIdentifier: string | number, dto: ApplyConfigRevisionDto) {
    return this.uploadClient.send(UploadTopics.CONFIG_APPLY_REVISION, { projectIdentifier, ...dto });
  }

  createDraftRevision(projectIdentifier: string | number) {
    return this.uploadClient.send(UploadTopics.CONFIG_CREATE_DRAFT_REVISION, { projectIdentifier });
  }

  deleteDraftRevision(projectIdentifier: string | number) {
    return this.uploadClient.send(UploadTopics.CONFIG_DELETE_DRAFT_REVISION, { projectIdentifier });
  }

  getConfigRevisions(projectIdentifier: string | number, query: GetConfigRevisionsQueryDto) {
    return this.uploadClient.send(UploadTopics.CONFIG_GET_REVISIONS, { projectIdentifier, ...query });
  }

  getConfigRevisionById(revisionId: number, query: GetConfigRevisionQueryDto) {
    return this.uploadClient.send(UploadTopics.CONFIG_GET_REVISION_BY_ID, { revisionId, ...query });
  }

  addConfigMapAssociation(configMapProjectIdentifier: string | number, dto: AddConfigMapAssociationDto) {
    return this.uploadClient.send(UploadTopics.CONFIG_ADD_MAP_ASSOCIATION, { configMapProjectIdentifier, ...dto });
  }

  removeConfigMapAssociation(associationId: number) {
    return this.uploadClient.send(UploadTopics.CONFIG_REMOVE_MAP_ASSOCIATION, { associationId });
  }

  getConfigMapAssociations(configMapProjectIdentifier: string | number) {
    return this.uploadClient.send(UploadTopics.CONFIG_GET_MAP_ASSOCIATIONS, { configMapProjectIdentifier });
  }

  getConfigMapsForProject(projectIdentifier: string | number) {
    return this.uploadClient.send(UploadTopics.CONFIG_GET_CONFIG_MAPS_FOR_PROJECT, { projectIdentifier });
  }

  getDeviceConfig(deviceId: string) {
    return this.uploadClient.send(UploadTopics.CONFIG_GET_DEVICE_CONFIG, { deviceId });
  }

  getDeviceConfigByVersion(dto: GetDeviceConfigByVersionDto) {
    return this.uploadClient.send(UploadTopics.CONFIG_GET_DEVICE_CONFIG_BY_VERSION, dto);
  }
}
