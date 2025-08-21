import { Module } from '@nestjs/common';
import { ProjectManagementController } from './project-management.controller';
import { ProjectManagementService } from './project-management.service';
import { MicroserviceModule, MicroserviceName, MicroserviceType } from '@app/common/microservice-client';

@Module({
  imports: [
    MicroserviceModule.register({
        name: MicroserviceName.PROJECT_MANAGEMENT_SERVICE,
        type: MicroserviceType.PROJECT_MANAGEMENT,
      })
  ],
  providers: [ProjectManagementService],
  controllers: [ProjectManagementController]
})
export class ProjectManagementModule {}
