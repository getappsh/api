import { Controller, Post, Body, Logger, Get, Param, ParseArrayPipe } from '@nestjs/common';
import { DiscoveryService } from './discovery.service';
import { DeviceRegisterDto, DeviceContentResDto, MTlsStatusDto } from '@app/common/dto/device';
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { DEVICE } from '@app/common/utils/paths';
import { DiscoveryResDto } from '@app/common/dto/discovery';
import { DiscoveryMessageDto } from '@app/common/dto/discovery';
import { DeviceDiscoverDto, DeviceDiscoverResDto } from '@app/common/dto/im';
import { DeviceDto } from '@app/common/dto/device/dto/device.dto';
import { DeviceComponentsOfferingDto, OfferingMapResDto } from '@app/common/dto/offering';
@ApiTags("Device - discovery")
@ApiBearerAuth()
@Controller(DEVICE)
export class DiscoveryController {
  private readonly logger = new Logger(DiscoveryController.name);

  constructor(private readonly deviceService: DiscoveryService) {}

  @Post("discover")
  @ApiOperation({ 
    summary: "Discover Catalog", 
    description: "This service message allows a device to post the discovery context for getting offers, software, and maps for the GetApp agent." 
  })
  @ApiOkResponse({type: DiscoveryResDto})
  discoveryCatalog(@Body() discoveryMessageDto: DiscoveryMessageDto) {
    this.logger.debug(`Discovery: ${discoveryMessageDto}`);
    return this.deviceService.discoveryCatalog(discoveryMessageDto);
  }

  @Post("discover/component")
  @ApiOperation({ 
    summary: "Discover Device Component", 
    description: "This service message allows a device to post the discovery context for getting device software offers." 
  })
  @ApiOkResponse({type: DeviceComponentsOfferingDto})
  deviceComponentDiscovery(@Body() discoveryMessageDto: DiscoveryMessageDto) {
    this.logger.debug(`Device component discovery: ${discoveryMessageDto}`);
    return this.deviceService.deviceComponentDiscovery(discoveryMessageDto);
  }

  @Post("discover/map")
  @ApiOperation({ 
    summary: "Discover Device map", 
    description: "This service message allows a device to post the discovery context for getting device maps offers." 
  })
  @ApiOkResponse({type: OfferingMapResDto})
  deviceMapDiscovery(@Body() discoveryMessageDto: DiscoveryMessageDto) {
    this.logger.debug(`Device map discovery: ${discoveryMessageDto}`);
    return this.deviceService.deviceMapDiscovery(discoveryMessageDto);
  }

  @Post("discover/deviceContext")
  @ApiOperation({ 
    summary: "Discover Device Context", 
    description: "This service message allows a device to post the discovery context." 
  })
  @ApiCreatedResponse()
  deviceContext(@Body() discoveryMessageDto: DiscoveryMessageDto){
    this.deviceService.sendDeviceContext(discoveryMessageDto);
  }

  @Post("im/push/discovery")
  @ApiOperation({ 
    summary: "IM Push Discovery Devices", 
    description: "This service message allows an IM device to push the discovery context of other agents." 
  })
  async imPushDiscoveryDevices(@Body(new ParseArrayPipe({items: DeviceDiscoverDto})) devicesDiscovery: DeviceDiscoverDto[]){
    this.logger.debug("IM Push Discovery Devices");
    this.logger.verbose(JSON.stringify(devicesDiscovery));
    await this.deviceService.imPushDiscoveryDevices(devicesDiscovery);
    return;
  }

  @Post("im/pull/discovery")
  @ApiOperation({ 
    summary: "IM Pull Discovery Devices", 
    description: "This service message allows an IM device to pull the discovery context of other agents." 
  })
  @ApiOkResponse({type: [DeviceDiscoverResDto]})
  imPullDiscoveryDevices(@Body(new ParseArrayPipe({items: DeviceDiscoverDto})) devicesDiscovery: DeviceDiscoverDto[]){
    this.logger.debug("IM Pull Discovery Devices");
    return this.deviceService.imPullDiscoveryDevices(devicesDiscovery);
  }


  @Post("mTlsStatus")
  // @ApiOperation({ description: "This service message allow to device post the discovery context for getting offers softwares and maps for GetApp agent. " })
  // @ApiOkResponse({type: DiscoveryResDto})
  updateMTlsStatus(@Body() mTlsStatus: MTlsStatusDto) {
    this.logger.debug(`mTls status for device Id:${mTlsStatus.deviceId} = ${mTlsStatus.status}`)
    return this.deviceService.mTlsStatus(mTlsStatus);
  }
}

