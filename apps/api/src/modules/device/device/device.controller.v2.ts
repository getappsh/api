import { Controller, Post, Body, Logger, Get, Param, Version } from '@nestjs/common';
import { DeviceService } from './device.service';
import { DeviceDataDto, DeviceOrchestrationResDto } from '@app/common/dto/device';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { DEVICE } from '@app/common/utils/paths';

@ApiTags("Device")
@ApiBearerAuth()
@Controller(DEVICE)
export class DeviceControllerV2 {
  private readonly logger = new Logger(DeviceControllerV2.name);

  constructor(private readonly deviceService: DeviceService) {}
  
  @Get(":deviceId/metadata")
  @Version('2')
  @ApiOperation({ summary: "Get Device Metadata", description: "Returns the persistent metadata stored on the device, including orchestrated_by, platformId and any additional agent-reported fields." })
  @ApiParam({ name: 'deviceId', type: String })
  @ApiOkResponse({ type: DeviceDataDto })
  getDeviceMetadata(@Param("deviceId") deviceId: string) {
    this.logger.debug(`Get metadata for device ${deviceId}`);
    return this.deviceService.getDeviceMetadata(deviceId);
  }

  @Post(":deviceId/metadata")
  @Version('2')
  @ApiOperation({ summary: "Set Device Metadata", description: "Stores metadata on the device. Body follows the agent-zone metadata structure." })
  @ApiParam({ name: 'deviceId', type: String })
  @ApiBody({ type: DeviceDataDto })
  @ApiOkResponse({ type: DeviceOrchestrationResDto })
  setDeviceMetadata(@Param("deviceId") deviceId: string, @Body() body: DeviceDataDto) {
    this.logger.debug(`Set metadata for device ${deviceId}`);
    return this.deviceService.setDeviceMetadata(deviceId, body);
  }
}
