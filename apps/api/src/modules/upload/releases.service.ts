import { ProjectIdentifierParams } from "@app/common/dto/project-management";
import { ReleaseParams, SetReleaseDto, RegulationStatusParams, SetRegulationCompliancyDto, SetRegulationStatusDto, SetReleaseArtifactDto, GetReleaseArtifactResDto, UpdateFileMetaDataDto } from "@app/common/dto/upload";
import { MicroserviceClient, MicroserviceName } from "@app/common/microservice-client";
import { UploadTopics } from "@app/common/microservice-client/topics";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { lastValueFrom } from "rxjs";


@Injectable()
export class ReleasesService {
  private readonly logger = new Logger(ReleasesService.name)

  constructor(
    @Inject(MicroserviceName.UPLOAD_SERVICE) private uploadClient: MicroserviceClient
  ) { }

  setRelease(dto: SetReleaseDto, params: ProjectIdentifierParams) {
    dto.projectIdentifier = params.projectIdentifier;
    return this.uploadClient.send(UploadTopics.SET_RELEASE, dto);
  }

  getReleases(params: ProjectIdentifierParams) {
    return this.uploadClient.send(UploadTopics.GET_RELEASES, params);
  }

  getRelease(params: ReleaseParams) {
    return this.uploadClient.send(UploadTopics.GET_RELEASE_BY_VERSION, params);
  }


  deleteRelease(params: ReleaseParams) {
    return this.uploadClient.send(UploadTopics.DELETE_RELEASE, params);
  }

  setReleaseArtifact(dto: SetReleaseArtifactDto, params: ReleaseParams) {
    dto.projectIdentifier = params.projectIdentifier;
    dto.version = params.version;
    return this.uploadClient.send(UploadTopics.SET_RELEASE_ARTIFACT, dto);
  }


  deleteReleaseArtifact(params: ReleaseParams) {
    return this.uploadClient.send(UploadTopics.DELETE_RELEASE_ARTIFACT, params);
  }

  async getArtifactDownloadUrl(params: ReleaseParams, fileName: string): Promise<GetReleaseArtifactResDto> {
    return lastValueFrom(this.uploadClient.send(UploadTopics.GET_ARTIFACT_DOWNLOAD_URL, { ...params, fileName }));
  }

  getVersionRegulationStatus(params: RegulationStatusParams) {
    return this.uploadClient.send(
      UploadTopics.GET_VERSION_REGULATION_STATUS_BY_ID,
      params
    )
  }

  getVersionRegulationsStatuses(params: ReleaseParams) {
    return this.uploadClient.send(
      UploadTopics.GET_VERSION_REGULATIONS_STATUSES,
      params
    )
  }

  setRegulationStatus(params: RegulationStatusParams, setRegulationStatusDto: SetRegulationStatusDto) {
    setRegulationStatusDto.regulation = params.regulation;
    setRegulationStatusDto.version = params.version;
    setRegulationStatusDto.projectIdentifier = params.projectIdentifier;
    return this.uploadClient.send(
      UploadTopics.SET_VERSION_REGULATION_STATUS,
      setRegulationStatusDto
    )
  }

  setRegulationCompliancy(params: RegulationStatusParams, setRegulationCompliancyDto: SetRegulationCompliancyDto) {
    setRegulationCompliancyDto.regulation = params.regulation;
    setRegulationCompliancyDto.version = params.version;
    setRegulationCompliancyDto.projectIdentifier = params.projectIdentifier;
    return this.uploadClient.send(
      UploadTopics.SET_VERSION_REGULATION_COMPLIANCE,
      setRegulationCompliancyDto
    )
  }


  deleteVersionRegulationStatus(params: RegulationStatusParams) {
    return this.uploadClient.send(
      UploadTopics.DELETE_VERSION_REGULATION_STATUS,
      params
    )
  }

  updateFileMetadata(body: UpdateFileMetaDataDto){
    return this.uploadClient.send(
      UploadTopics.UPDATE_FILE_METADATA,
      body
    )
  }

}