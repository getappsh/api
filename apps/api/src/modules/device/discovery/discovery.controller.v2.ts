import { Controller, Post, Body, Logger, Version } from '@nestjs/common';
import { DiscoveryService } from './discovery.service';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DEVICE } from '@app/common/utils/paths';
import { DiscoveryMessageV2Dto } from '@app/common/dto/discovery';
import { DeviceComponentsOfferingDto } from '@app/common/dto/offering';

@ApiTags("Device - discovery")
@ApiBearerAuth()
@Controller(DEVICE)
export class DiscoveryController {
  private readonly logger = new Logger(DiscoveryController.name);

  constructor(private readonly deviceService: DiscoveryService) { }

  @Post("discover/component")
  @Version("2")
  @ApiOperation({
    summary: "Discover Device Component",
    description: "This service message allows a device to post the discovery context for getting device software offers."
  })
  @ApiOkResponse({ type: DeviceComponentsOfferingDto })
  deviceComponentDiscovery(@Body() dto: DiscoveryMessageV2Dto) {
    this.logger.debug(`Device component discovery: ${JSON.stringify(dto)}`);
    return this.deviceService.deviceComponentDiscovery(dto);
  }
}

