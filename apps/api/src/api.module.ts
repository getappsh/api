import { MiddlewareConsumer, Module, NestModule, RequestMethod, VERSION_NEUTRAL } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { authModule } from './config/keycloak/keycloak-config.module';
import { Login } from './modules/login/login.module';
import { UploadModule } from './modules/upload/upload.module';
import { DeliveryModule } from './modules/delivery/delivery.module';
import { OfferingModule } from './modules/offering/offering.module';
import { ProjectManagementModule } from './modules/project-management/project-management.module';
import { GetMapModule } from './modules/get-map/get-map.module';
import { DeployModule } from './modules/deploy/deploy.module';
import { DeviceModule } from './modules/device/device.module';
import { MicroserviceModule, MicroserviceName, MicroserviceType } from '@app/common/microservice-client';
import { VersionManagementMiddleware } from './utils/middleware/version-management.middleware';
import { LoggerModule } from '@app/common/logger/logger.module';
import { ApmModule } from 'nestjs-elastic-apm';

import { LogRequestBodyMiddleware } from './utils/middleware/log-request-body.middleware';
import { JsonBodyMiddleware } from './utils/middleware/json-body.middleware';
import { ProxyMiddleware } from './utils/middleware/proxy.middleware';
import { ApiEndpoints, DeliveryEndpoints } from '@app/common/utils/paths';
import { HttpModule } from '@nestjs/axios';
import { HttpClientService } from './utils/middleware/http-client.service';
import { HttpConfigModule } from '@app/common/http-config/http-config.module';
import { AnalyticsProxy } from './utils/middleware/analytics-proxy.middleware';
import { ClsMiddleware } from 'nestjs-cls';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRoot({ httpCls: true, jsonLogger: process.env.LOGGER_FORMAT === 'JSON', name: "API" }),
    ApmModule.register(),
    HttpModule,
    authModule,
    MicroserviceModule.register({
      name: MicroserviceName.GET_MAP_SERVICE,
      type: MicroserviceType.GET_MAP,
      id: "api",
    }),
    MicroserviceModule.register({
      name: MicroserviceName.DEVICE_SERVICE,
      type: MicroserviceType.DEVICE,
      id: "api",
    }),
    Login,
    UploadModule,
    OfferingModule,
    DeliveryModule,
    ProjectManagementModule,
    GetMapModule,
    DeployModule,
    DeviceModule,
    HttpConfigModule
  ],
  controllers: [ApiController],
  providers: [
    ApiService,
    HttpClientService,
  ],
})
export class ApiModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ClsMiddleware).forRoutes('*');
    if (process.env.ANALYTICS_SERVER_URL) {      
      consumer.apply(AnalyticsProxy).forRoutes(`*/analytics`);
    }

    if (process.env.IS_PROXY === "true") {
      consumer.apply(ProxyMiddleware)
        .exclude(
          { path: `(.*)${ApiEndpoints.checkHealth}`, method: RequestMethod.ALL },
          { path: `(.*)${DeliveryEndpoints.preparedDelivery}`, method: RequestMethod.ALL },
          { path: `(.*)${DeliveryEndpoints.getPreparedByCatalogId}(.*)`, method: RequestMethod.ALL },
          { path: `(.*)${DeliveryEndpoints.cacheConfig}`, method: RequestMethod.ALL },
          { path: `(.*)${DeliveryEndpoints.cacheDelete}`, method: RequestMethod.ALL },
          { path: `(.*)${DeliveryEndpoints.checkHealth}`, method: RequestMethod.ALL },
        )
        .forRoutes('*')
    }

    consumer.apply(VersionManagementMiddleware).forRoutes('/');
    consumer.apply(JsonBodyMiddleware).forRoutes('*')
    consumer.apply(LogRequestBodyMiddleware).forRoutes('*');
  }
}
