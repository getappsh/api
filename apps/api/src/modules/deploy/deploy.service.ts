import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { DeployTopics, DeployTopicsEmit } from '@app/common/microservice-client/topics';
import { DeployStatusDto } from '@app/common/dto/deploy';
import { MicroserviceClient } from '@app/common/microservice-client/microservice-client.service';
import { MicroserviceName } from '@app/common/microservice-client';

@Injectable()
export class DeployService implements OnModuleInit{

  constructor(
    @Inject(MicroserviceName.DEPLOY_SERVICE) private readonly deployClient: MicroserviceClient) {}

  updateDeployStatus(deployStatusDto: DeployStatusDto) {
    return this.deployClient.emit(DeployTopicsEmit.UPDATE_DEPLOY_STATUS, deployStatusDto);
  }

  checkHealth() {
    return this.deployClient.send(DeployTopics.CHECK_HEALTH, {})
  }

  async onModuleInit() {
    this.deployClient.subscribeToResponseOf(Object.values(DeployTopics));
    await this.deployClient.connect()
  }
    
}
