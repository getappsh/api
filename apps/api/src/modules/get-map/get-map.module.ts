import { Module } from '@nestjs/common';
import { GetMapController } from './get-map.controller';
import { GetMapService } from './get-map.service';
import { DeviceService } from '../device/device/device.service';

@Module({
    controllers: [GetMapController],
    providers: [GetMapService, DeviceService],
})
export class GetMapModule {}
