import { Module } from '@nestjs/common';
import { OfferingService } from './offering.service';
import { OfferingController } from './offering.controller';
import { OfferingController as OfferingControllerV2 } from './offering.controller.v2';
import { MicroserviceModule, MicroserviceName, MicroserviceType } from '@app/common/microservice-client';
import { OfferingPolicyController } from './offering-policy.controller';


@Module({
  imports: [
    MicroserviceModule.register({
      name: MicroserviceName.OFFERING_SERVICE,
      type: MicroserviceType.OFFERING,
      id: 'api',
    })
  ],
  controllers: [OfferingController, OfferingControllerV2, OfferingPolicyController],
  providers: [OfferingService]
})
export class OfferingModule {}
