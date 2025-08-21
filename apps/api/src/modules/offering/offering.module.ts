import { Module } from '@nestjs/common';
import { OfferingService } from './offering.service';
import { OfferingController } from './offering.controller';
import { MicroserviceModule, MicroserviceName, MicroserviceType } from '@app/common/microservice-client';


@Module({
  imports: [
    MicroserviceModule.register({
      name: MicroserviceName.OFFERING_SERVICE,
      type: MicroserviceType.OFFERING,
    })
  ],
  controllers: [OfferingController],
  providers: [OfferingService]
})
export class OfferingModule {}
