import { Inject, Injectable } from '@nestjs/common';
import { DeliveryTopics, DeliveryTopicsEmit } from '@app/common/microservice-client/topics';
import { DeliveryStatusDto, PrepareDeliveryReqDto } from '@app/common/dto/delivery';
import { MicroserviceClient, MicroserviceName } from '@app/common/microservice-client';

@Injectable()
export class DeliveryService {

  constructor(@Inject(MicroserviceName.DELIVERY_SERVICE) private readonly deliveryClient: MicroserviceClient) { }

  updateDownloadStatus(deliveryStatusDto: DeliveryStatusDto) {
    return this.deliveryClient.emit(DeliveryTopicsEmit.UPDATE_DOWNLOAD_STATUS, deliveryStatusDto);
  }

  prepareDelivery(prepDlv: PrepareDeliveryReqDto) {
    return this.deliveryClient.send(DeliveryTopics.PREPARE_DELIVERY, prepDlv);
  }

  getPreparedDeliveryStatus(catalogId: string) {
    return this.deliveryClient.send(DeliveryTopics.PREPARED_DELIVERY_STATUS, catalogId);
  }

  checkHealth() {
    return this.deliveryClient.send(DeliveryTopics.CHECK_HEALTH, {})
  }

  async onModuleInit() {
    this.deliveryClient.subscribeToResponseOf(Object.values(DeliveryTopics))
    await this.deliveryClient.connect()
  }
}
