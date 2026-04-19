import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { AuthModule } from './config/auth/auth.module';
import { Login } from './modules/login/login.module';
import { UploadModule } from './modules/upload/upload.module';
import { DeliveryModule } from './modules/delivery/delivery.module';
import { OfferingModule } from './modules/offering/offering.module';
import { ProjectManagementModule } from './modules/project-management/project-management.module';
import { GetMapModule } from './modules/get-map/get-map.module';
import { DeployModule } from './modules/deploy/deploy.module';
import { DeviceModule } from './modules/device/device.module';
import { MicroserviceModule, MicroserviceName, MicroserviceType } from '@app/common/microservice-client';
import { LoggerModule } from '@app/common/logger/logger.module';
import { ApmModule } from 'nestjs-elastic-apm';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRoot({httpCls: true, jsonLogger: process.env.LOGGER_FORMAT === 'JSON', name: "API"}),
    ApmModule.register(),
    AuthModule,
    MicroserviceModule.register({
      name: MicroserviceName.GET_MAP_SERVICE,
      type: MicroserviceType.GET_MAP,
    }),
    MicroserviceModule.register({
      name: MicroserviceName.DEVICE_SERVICE,
      type: MicroserviceType.DEVICE,
    }),
    Login,
    UploadModule,
    DeliveryModule,
    OfferingModule,
    ProjectManagementModule,
    GetMapModule,
    DeployModule,
    DeviceModule,
  ],
  controllers: [ApiController],
  providers: [
    ApiService
  ],
})
export class ApiModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
  }
 }
