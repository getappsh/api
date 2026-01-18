import { Injectable, Logger } from '@nestjs/common';
import { MicroserviceClient, MicroserviceName } from '@app/common/microservice-client';
import { Inject } from '@nestjs/common';
import { DeviceTopics, DeviceTopicsEmit } from '@app/common/microservice-client/topics';
import { 
  AcceptPendingVersionDto, 
  ListPendingVersionsQueryDto, 
  PendingVersionListDto, 
  RejectPendingVersionDto 
} from '@app/common/dto/discovery';

@Injectable()
export class PendingVersionService {
  private readonly logger = new Logger(PendingVersionService.name);

  constructor(
    @Inject(MicroserviceName.DEVICE_SERVICE) private readonly deviceClient: MicroserviceClient,
  ) {}

  async listPendingVersions(query: ListPendingVersionsQueryDto): Promise<PendingVersionListDto> {
    this.logger.log(`Fetching pending versions with status: ${query.status || 'all'}`);
    return this.deviceClient.send(DeviceTopics.LIST_PENDING_VERSIONS, query);
  }

  async acceptPendingVersion(dto: AcceptPendingVersionDto): Promise<void> {
    this.logger.log(`Accepting pending version: ${dto.projectName}@${dto.version}`);
    this.deviceClient.emit(DeviceTopicsEmit.ACCEPT_PENDING_VERSION, dto);
  }

  async rejectPendingVersion(dto: RejectPendingVersionDto): Promise<void> {
    this.logger.log(`Rejecting pending version: ${dto.projectName}@${dto.version}`);
    this.deviceClient.emit(DeviceTopicsEmit.REJECT_PENDING_VERSION, dto);
  }
}
