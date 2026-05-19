import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { MicroserviceModule, MicroserviceName, MicroserviceType } from '@app/common/microservice-client';
import { ReleasesController } from './releases.controller';
import { ReleasesService } from './releases.service';
import { PoliciesController } from './policies.controller';
import { PoliciesService } from './policies.service';
import { ConfigService } from './config.service';
import { ConfigController } from './config.controller';
import { ConfigMapController } from './config-map.controller';

@Module({
  imports: [
    MicroserviceModule.register({
      name: MicroserviceName.UPLOAD_SERVICE,
      type: MicroserviceType.UPLOAD,
      id: "api",
    })
    // MulterModule.register(),
  ],
  providers: [
    UploadService,
    ReleasesService,
    PoliciesService,
    ConfigService,
  ],
  controllers: [PoliciesController, ReleasesController, UploadController, ConfigController, ConfigMapController],
  exports: [ConfigService],
})
export class UploadModule { }