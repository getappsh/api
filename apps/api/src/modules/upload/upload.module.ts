import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { MicroserviceModule, MicroserviceName, MicroserviceType } from '@app/common/microservice-client';
import { ReleasesController } from './releases.controller';
import { ReleasesService } from './releases.service';
import { PoliciesController } from './policies.controller';

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
  ],
  controllers: [UploadController, ReleasesController, PoliciesController]
})
export class UploadModule { }