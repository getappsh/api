import { Module } from '@nestjs/common';
import { DeployService } from './deploy.service';
import { DeployController } from './deploy.controller';
import { MicroserviceModule, MicroserviceName, MicroserviceType } from '@app/common/microservice-client';
@Module({
  imports: [
    MicroserviceModule.register({
      name: MicroserviceName.DEPLOY_SERVICE,
      type: MicroserviceType.DEPLOY,
      id: "api",
    })
  ],
  controllers: [DeployController],
  providers: [DeployService]
})
export class DeployModule {}
