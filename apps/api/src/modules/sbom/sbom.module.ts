import { Module } from '@nestjs/common';
import { MicroserviceModule, MicroserviceName, MicroserviceType } from '@app/common/microservice-client';
import { SbomController } from './sbom.controller';
import { SbomService } from './sbom.service';

@Module({
  imports: [
    MicroserviceModule.register({
      name: MicroserviceName.SBOM_GENERATOR_SERVICE,
      type: MicroserviceType.SBOM_GENERATOR,
      id: 'api',
    }),
  ],
  providers: [SbomService],
  controllers: [SbomController],
})
export class SbomModule {}
