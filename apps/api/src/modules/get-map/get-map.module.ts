import { Module } from '@nestjs/common';
import { GetMapController } from './get-map.controller';
import { GetMapService } from './get-map.service';

@Module({
    controllers: [GetMapController],
    providers: [GetMapService],
})
export class GetMapModule {}
