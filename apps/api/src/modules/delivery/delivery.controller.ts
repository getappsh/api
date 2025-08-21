import { Controller, Get, Param, Post, Body, Logger } from '@nestjs/common';
import { DELIVERY } from '../../utils/paths';
import { DeliveryService } from './delivery.service';
import { ApiBearerAuth, ApiExcludeEndpoint, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { DeliveryStatusDto, PrepareDeliveryResDto, PrepareDeliveryReqDto } from '@app/common/dto/delivery';
import { Unprotected } from '../../utils/sso/sso.decorators';

@ApiTags("Delivery")
@ApiBearerAuth()
@Controller(DELIVERY)
export class DeliveryController {

  private readonly logger = new Logger(DeliveryController.name);

  constructor(
    private readonly deliveryService: DeliveryService,
  ) {}

  @Post('updateDownloadStatus')
  @ApiOperation({ 
    summary: "Update Delivery Status", 
    description: "This service message allows the consumer to report the delivery status"
  })
  @ApiOkResponse()
  updateDownloadStatus(@Body() deliveryStatusDto: DeliveryStatusDto){
    this.logger.log(`Update delivery status from device: "${deliveryStatusDto.deviceId}" for component: "${deliveryStatusDto.catalogId}"`)
    this.deliveryService.updateDownloadStatus(deliveryStatusDto);
  }
  
  @Post('prepareDelivery')
  @ApiOperation({ 
    summary: "Prepare Delivery", 
    description: "Prepare delivery"
  })
  @ApiOkResponse({type: PrepareDeliveryResDto})
  prepareDelivery(@Body() prepDlv: PrepareDeliveryReqDto){
    this.logger.log(`Prepare delivery for catalogId ${prepDlv.catalogId}`);
    return this.deliveryService.prepareDelivery(prepDlv);
  }

  
  @Get('preparedDelivery/:catalogId')
  @ApiOperation({ 
    summary: "Get Prepared Delivery Status", 
    description: "Get status of prepared delivery"
  })
  @ApiParam({name: 'catalogId', type: String})
  @ApiOkResponse({type: PrepareDeliveryResDto})
  getPreparedDeliveryStatus(@Param('catalogId') catalogId: string){
    this.logger.log(`Get prepared delivery status by catalogId: ${catalogId}`);
    return this.deliveryService.getPreparedDeliveryStatus(catalogId);
  }

  @Get('checkHealth')
  @Unprotected()
  @ApiExcludeEndpoint()
  checkHealth(){
    this.logger.log("Delivery service - Health checking")
    return this.deliveryService.checkHealth()
  }
}
