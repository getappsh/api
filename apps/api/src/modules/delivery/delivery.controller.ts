import { Controller, Get, Param, Post, Body, Logger, Put, Delete, Query } from '@nestjs/common';
import { DELIVERY } from '@app/common/utils/paths';
import { DeliveryService } from './delivery.service';
import { ApiBearerAuth, ApiExcludeEndpoint, ApiOkResponse, ApiOperation, ApiParam, ApiTags, ApiQuery } from '@nestjs/swagger';
import { DeliveryStatusDto, PrepareDeliveryResDto, PrepareDeliveryReqDto } from '@app/common/dto/delivery';
import { Unprotected } from '../../utils/sso/sso.decorators';
import { CacheConfigDto } from '@app/common/dto/delivery/dto/cache-config.dto';
import { oneOfValidationPipe } from '@app/common/validators/oneOf.pipe';
import { DeleteFromCacheDto } from '@app/common/dto/delivery/dto/delete-cache.dto';
import { CacheConfigResDto } from '@app/common/dto/delivery/dto/cache-config-get.dto';

@ApiTags("Delivery")
@ApiBearerAuth()
@Controller(DELIVERY)
export class DeliveryController {

  private readonly logger = new Logger(DeliveryController.name);

  constructor(
    private readonly deliveryService: DeliveryService,
  ) { }

  @Post('updateDownloadStatus')
  @ApiOperation({
    summary: "Update Delivery Status",
    description: "This service message allows the consumer to report the delivery status"
  })
  @ApiOkResponse()
  updateDownloadStatus(@Body() deliveryStatusDto: DeliveryStatusDto) {
    this.logger.log(`Update delivery status from device: "${deliveryStatusDto.deviceId}" for component: "${deliveryStatusDto.catalogId}"`)
    this.deliveryService.updateDownloadStatus(deliveryStatusDto);
  }

  // Delivery
  @Post('prepareDelivery')
  @ApiOperation({
    summary: "Prepare Delivery",
    description: "Prepare delivery"
  })
  // 'source' on server do nothing yet, only for openapi spec consistency for agent
  @ApiQuery({ name: 'source', required: false, description: "Delivery source: 'remote' for direct download from artifact, 'cache' for download from delivery server cache" })
  @ApiOkResponse({ type: PrepareDeliveryResDto })
  prepareDelivery(@Body() prepDlv: PrepareDeliveryReqDto, @Query('source') _source?: string) {
    this.logger.log(`Prepare delivery for catalogId ${prepDlv.catalogId}`);
    return this.deliveryService.prepareDelivery(prepDlv);
  }


  @Get('preparedDelivery/:catalogId')
  @ApiOperation({
    summary: "Get Prepared Delivery Status",
    description: "Get status of prepared delivery"
  })
  @ApiParam({ name: 'catalogId', type: String })
  // 'source' on server do nothing yet, only for openapi spec consistency for agent
  @ApiQuery({ name: 'source', required: false, description: "Delivery source: 'remote' for direct download from artifact, 'cache' for download from delivery server cache" })
  @ApiOkResponse({ type: PrepareDeliveryResDto })
  getPreparedDeliveryStatus(@Param('catalogId') catalogId: string, @Query('source') _source?: string) {
    this.logger.log(`Get prepared delivery status by catalogId: ${catalogId}`);
    return this.deliveryService.getPreparedDeliveryStatus(catalogId);
  }

  // #####################Cache managing##############################

  // Delete
  @Delete("cache/delete")
  @ApiOperation({
    summary: "Enable to delete artifacts from cache by size or date or a given id or ids",
    description: "It is possible to pass only one type to delete - size or date or id.  <br /> " +
      "Size - delete all order by createDate DESC until arriving free space of the given size.  <br /> " +
      "Date - must be a string it `MM/DD/YY` or with backslash or `MM.DD.YY`, end it delete all until the given date in DESC order.  <br /> " +
      "Id - delete the given catalog id"
  })
  deleteFromCache(@Body(new oneOfValidationPipe<DeleteFromCacheDto>(["size", "date", "catalogId"])) deleteCacheDto: DeleteFromCacheDto) {
    this.deliveryService.deleteFromCache(deleteCacheDto)
  }

  // Config
  @Get("cache/config")
  @ApiOperation({
    summary: "Get Delivery Cache Configurations",
    description: "This service message returns an object of delivery cache configurations."
  })
  @ApiOkResponse({ type: CacheConfigResDto })
  getCacheConfig() {
    this.logger.debug(`Get delivery cache configurations`);
    return this.deliveryService.getCacheConfig();
  }

  @Put("cache/config")
  @ApiOperation({
    summary: "Set Delivery Cache Configurations",
    description: "This service message sets an object of delivery cache configurations."
  })
  setCacheConfig(@Body() configs: CacheConfigDto) {
    this.logger.debug(`Set delivery cache configurations`);
    return this.deliveryService.setCacheConfig(configs);
  }

  @Get('checkHealth')
  @Unprotected()
  @ApiExcludeEndpoint()
  checkHealth() {
    this.logger.log("Delivery service - Health checking")
    return this.deliveryService.checkHealth()
  }
}
