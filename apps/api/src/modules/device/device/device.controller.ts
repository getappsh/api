import { Controller, Post, Body, Logger, Get, Param } from '@nestjs/common';
import { DeviceService } from './device.service';
import { DeviceRegisterDto, DeviceContentResDto, DeviceMapDto, DeviceIMEI } from '@app/common/dto/device';
import { ApiBearerAuth, ApiExcludeEndpoint, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { DEVICE } from '../../../utils/paths';
import { DeviceDto } from '@app/common/dto/device/dto/device.dto';
import { Unprotected } from '../../../utils/sso/sso.decorators';

@ApiTags("Device")
@ApiBearerAuth()
@Controller(DEVICE)
export class DeviceController {
  private readonly logger = new Logger(DeviceController.name);

  constructor(private readonly deviceService: DeviceService) { }

  @Post('register')
  @ApiOperation({ 
    summary: "Register Device", 
    description: "This service message allows the device registration process for GetApp services." 
  })
  register(@Body() deviceRegister: DeviceRegisterDto) {
    this.logger.debug(`Register, device: ${deviceRegister}`);
    return this.deviceService.register(deviceRegister);
  }

  @Get("devices")
  @ApiOperation({ 
    summary: "Get Registered Devices", 
    description: "This service message allows retrieval of all registered devices." 
  })
  @ApiOkResponse({ type: DeviceDto })
  getRegisteredDevices() {
    this.logger.debug(`Get all registered devices`);
    return this.deviceService.getRegisteredDevices();
  }
 
  @Get(":deviceId/maps")
  @ApiOperation({ 
    summary: "Get Device Maps", 
    description: "This service message allows retrieval of all registered maps on the given device." 
  })
  @ApiOkResponse({ type: DeviceMapDto })
  getDeviceMaps(@Param("deviceId") deviceId: string) {
    this.logger.debug(`Get all maps of device ${deviceId}`);
    return this.deviceService.getDeviceMaps(deviceId);
  }

  @Get("info/installed/:deviceId")
  @ApiOperation({ 
    summary: "Get Installed Device Content", 
    description: "This service message allows receiving information about the installations carried out on the device using GetApp services. This message is sent by the device during the initialization phase to check compatibility between the existing installations on this device." 
  })
  @ApiParam({ name: 'deviceId', type: String })
  @ApiOkResponse({ type: DeviceContentResDto })
  getDeviceContentInstalled(@Param('deviceId') deviceId: string) {
    this.logger.debug(`Device content installed, deviceId: ${deviceId}`);
    return this.deviceService.getDeviceContentInstalled(deviceId);
  }

  @Get('imei/:serialNumber')
  @ApiOperation({ 
    summary: "Get Device IMEI", 
    description: "This service message allows receiving device IMEI by providing serial-number" 
  })
  @ApiParam({ name: 'serialNumber', type: String })
  @ApiOkResponse({ type: DeviceIMEI })
  getDeviceIMEI(@Param('serialNumber') serialNumber: string){
    this.logger.debug(`Get device IMEI for serialNumber: ${serialNumber}`);
    return this.deviceService.getDeviceIMEI(serialNumber);
  }

  @Get('checkHealth')
  @Unprotected()
  @ApiExcludeEndpoint()
  checkHealth(){
    this.logger.log("Device service - Health checking");
    return this.deviceService.checkHealth();
  }
}
