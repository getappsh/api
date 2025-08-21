import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { MicroserviceModule, MicroserviceName, MicroserviceType } from '@app/common/microservice-client';

@Module({
  imports: [
    MicroserviceModule.register({
      name: MicroserviceName.UPLOAD_SERVICE,
      type: MicroserviceType.UPLOAD,
    })
    // MulterModule.register(),
  ],
  providers: [
    UploadService,
  ],
  controllers: [UploadController]
})
export class UploadModule { }
