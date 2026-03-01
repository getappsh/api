import { Inject, Injectable } from '@nestjs/common';
import { DeliveryTopics, DeliveryTopicsEmit } from '@app/common/microservice-client/topics';
import { DeliveryStatusDto, PrepareDeliveryReqDto } from '@app/common/dto/delivery';
import { MicroserviceClient, MicroserviceName } from '@app/common/microservice-client';
import { CacheConfigDto } from '@app/common/dto/delivery/dto/cache-config.dto';
import { DeleteFromCacheDto } from '@app/common/dto/delivery/dto/delete-cache.dto';

@Injectable()
export class DeliveryService {

  constructor(@Inject(MicroserviceName.DELIVERY_SERVICE) private readonly deliveryClient: MicroserviceClient) { }

  updateDownloadStatus(deliveryStatusDto: DeliveryStatusDto) {
    return this.deliveryClient.emit(DeliveryTopicsEmit.UPDATE_DOWNLOAD_STATUS, deliveryStatusDto);
  }

  // Delivery
  prepareDelivery(prepDlv: PrepareDeliveryReqDto) {
    return this.deliveryClient.send(DeliveryTopics.PREPARE_DELIVERY, prepDlv);
  }

  getPreparedDeliveryStatus(catalogId: string) {
    return this.deliveryClient.send(DeliveryTopics.PREPARED_DELIVERY_STATUS, catalogId);
  }
  
  // #####################Cache managing##############################

  // Delete
  deleteFromCache(deleteCacheDto: DeleteFromCacheDto) {
    return this.deliveryClient.emit(DeliveryTopicsEmit.DELETE_CACHE_ITEMS, deleteCacheDto);
  }

  // Config
  getCacheConfig() {
    return this.deliveryClient.send(DeliveryTopics.GET_CACHE_CONFIG, {});
  }

  setCacheConfig(configs: CacheConfigDto) {
    return this.deliveryClient.send(DeliveryTopics.SET_CACHE_CONFIG, configs);
  }

  checkHealth() {
    return this.deliveryClient.send(DeliveryTopics.CHECK_HEALTH, {})
  }

  async onModuleInit() {
    this.deliveryClient.subscribeToResponseOf(Object.values(DeliveryTopics))
    await this.deliveryClient.connect()
  }
}
