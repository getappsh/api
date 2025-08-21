import { Module } from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import { DeliveryController } from './delivery.controller';
import { MicroserviceModule, MicroserviceName, MicroserviceType } from '@app/common/microservice-client';

@Module({
  imports: [
    MicroserviceModule.register({
      name: MicroserviceName.DELIVERY_SERVICE,
      type: MicroserviceType.DELIVERY,
    })
  ],
  controllers: [DeliveryController],
  providers: [DeliveryService]
})
export class DeliveryModule { }
