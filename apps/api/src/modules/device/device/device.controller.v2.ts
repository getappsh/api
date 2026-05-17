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
  
  @Get(":deviceId/deviceData")
  @Version('2')
  @ApiOperation({ summary: "Get Device Data", description: "Returns the persistent deviceData stored on the device, including orchestrated_by, platformId and any additional agent-reported fields." })
  @ApiParam({ name: 'deviceId', type: String })
  @ApiOkResponse({ type: DeviceDataDto })
  getDeviceData(@Param("deviceId") deviceId: string) {
    this.logger.debug(`Get deviceData for device ${deviceId}`);
    return this.deviceService.getDeviceData(deviceId);
  }

  @Post(":deviceId/deviceData")
  @Version('2')
  @ApiOperation({ summary: "Set Device Data", description: "Stores deviceData on the device. Body follows the agent-zone data structure." })
  @ApiParam({ name: 'deviceId', type: String })
  @ApiBody({ type: DeviceDataDto })
  @ApiOkResponse({ type: DeviceOrchestrationResDto })
  setDeviceData(@Param("deviceId") deviceId: string, @Body() body: DeviceDataDto) {
    this.logger.debug(`Set deviceData for device ${deviceId}`);
    return this.deviceService.setDeviceData(deviceId, body);
  }
}
