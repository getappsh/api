import { Module } from '@nestjs/common';
import { ProjectManagementController } from './project-management.controller';
import { ProjectManagementService } from './project-management.service';
import { MicroserviceModule, MicroserviceName, MicroserviceType } from '@app/common/microservice-client';
import { UsersController } from './users.controller';
import { ConfigProjectController } from './config.controller';
import { ConfigMapController } from './config-map.controller';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [
    MicroserviceModule.register({
        name: MicroserviceName.PROJECT_MANAGEMENT_SERVICE,
        type: MicroserviceType.PROJECT_MANAGEMENT,
        id: "api",
      }),
    UploadModule,
  ],
  providers: [ProjectManagementService],
  controllers: [ProjectManagementController, UsersController, ConfigProjectController, ConfigMapController]
})
export class ProjectManagementModule {}
