import { Controller, Post, Body, Logger, ParseArrayPipe, Version } from '@nestjs/common';
import { DiscoveryService } from './discovery.service';
import { MTlsStatusDto } from '@app/common/dto/device';
import { ApiBearerAuth, ApiCreatedResponse, ApiExcludeEndpoint, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DEVICE } from '@app/common/utils/paths';
import { DiscoveryMessageV2Dto, DiscoveryResDto } from '@app/common/dto/discovery';
import { DiscoveryMessageDto } from '@app/common/dto/discovery';
import { DeviceDiscoverDto, DeviceDiscoverResDto } from '@app/common/dto/im';
import { DeviceComponentsOfferingDto, OfferingMapResDto } from '@app/common/dto/offering';
@ApiTags("Device - discovery")
@ApiBearerAuth()
@Controller(DEVICE)
export class DiscoveryController {
  private readonly logger = new Logger(DiscoveryController.name);

  constructor(private readonly deviceService: DiscoveryService) { }

  @Post("discover")
  @ApiOperation({
    summary: "Discover Catalog",
    description: "This service message allows a device to post the discovery context for getting offers, software, and maps for the GetApp agent."
  })
  @ApiOkResponse({ type: DiscoveryResDto })
  discoveryCatalog(@Body() discoveryMessageDto: DiscoveryMessageDto) {
    this.logger.debug(`Discovery: ${discoveryMessageDto}`);
    return this.deviceService.discoveryCatalog(discoveryMessageDto);
  }

  @Post("discover/component")
  @ApiExcludeEndpoint()
  @Version("1")
  discoverComponent(@Body() body: any) {
    this.logger.warn(`**Deprecated** Device component discovery v1 : ${JSON.stringify(body)}`);
    let comp = {
      "catalogId": process.env.TC_CATALOG_ID,
      "name": process.env.TC_NAME,
      "versionNumber": process.env.TC_VERSION,
      "latest": process.env.TC_LATEST == "true",
      "uploadDate": "2025-04-30T11:45:59.682Z",
      // "releaseNotes": "string",
      // "virtualSize": 0,
      // "category": "string",
      // "baseVersion": "string",
      // "prevVersion": "string",
      // "subComponents": [
      //   "string"
      // ]
    }
    const push: Array<{
      catalogId: string | undefined;
      name: string | undefined;
      versionNumber: string | undefined;
      latest: boolean;
      uploadDate: string;
    }> = [];
    if (comp.catalogId && comp.name && comp.versionNumber) {
      this.logger.debug(`Returning comp as offering: ${JSON.stringify(comp)}`);
      push.push(comp);
    }
    return { offer: [], push: push }
  }

  @Post("discover/map")
  @ApiOperation({
    summary: "Discover Device map",
    description: "This service message allows a device to post the discovery context for getting device maps offers."
  })
  @ApiOkResponse({ type: OfferingMapResDto })
  deviceMapDiscovery(@Body() discoveryMessageDto: DiscoveryMessageV2Dto) {
    this.logger.debug(`Device map discovery: ${discoveryMessageDto}`);
    return this.deviceService.deviceMapDiscovery(discoveryMessageDto);
  }

  @Post("discover/deviceContext")
  @ApiOperation({
    summary: "Discover Device Context",
    description: "This service message allows a device to post the discovery context."
  })
  @ApiOkResponse({ type: DiscoveryMessageV2Dto })
  async deviceContext(@Body() discoveryMessageDto: DiscoveryMessageV2Dto): Promise<DiscoveryMessageV2Dto> {
    return this.deviceService.sendDeviceContextV2(discoveryMessageDto);
  }

  @Post("im/push/discovery")
  @ApiOperation({
    summary: "IM Push Discovery Devices",
    description: "This service message allows an IM device to push the discovery context of other agents."
  })
  async imPushDiscoveryDevices(@Body(new ParseArrayPipe({ items: DeviceDiscoverDto })) devicesDiscovery: DeviceDiscoverDto[]) {
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
  @ApiOkResponse({ type: [DeviceDiscoverResDto] })
  imPullDiscoveryDevices(@Body(new ParseArrayPipe({ items: DeviceDiscoverDto })) devicesDiscovery: DeviceDiscoverDto[]) {
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

