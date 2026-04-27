import * as dotenv from 'dotenv';
dotenv.config();
import apm from 'nestjs-elastic-apm';

import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ApiModule } from './api.module';
import { CustomRpcExceptionFilter } from './rpc-exception.filter';
import { GET_APP_LOGGER } from '@app/common/logger/logger.module';
import { API } from '@app/common/utils/paths';
import * as fs from "fs";
import { HttpsOptions } from '@nestjs/common/interfaces/external/https-options.interface';
import { OfferingModule } from './modules/offering/offering.module';
import { DeliveryModule } from './modules/delivery/delivery.module';
import { DeployModule } from './modules/deploy/deploy.module';
import { DeviceModule } from './modules/device/device.module';
import { GetMapModule } from './modules/get-map/get-map.module';
import { Login } from './modules/login/login.module';
import { RulesModule } from './modules/rules/rules.module';


async function setupSwagger(app: INestApplication) {
  // Helper function to add version prefix to operationIds for non-v1 versions
  const prefixOperationIds = (document: any) => {
    const modifiedPaths: any = {};
    
    Object.keys(document.paths).forEach(path => {
      const pathItem = { ...document.paths[path] };
      
      // Extract version from path (e.g., /v2/...)
      const versionMatch = path.match(/\/v(\d+)\//);
      if (versionMatch) {
        const version = versionMatch[1];
        
        // Add version prefix to operationId for non-v1 versions
        if (version !== '1') {
          const httpMethods = ['get', 'post', 'put', 'delete', 'patch', 'options', 'head'];
          httpMethods.forEach(method => {
            if (pathItem[method]?.operationId) {
              pathItem[method] = {
                ...pathItem[method],
                operationId: `v${version}_${pathItem[method].operationId}`
              };
            }
          });
        }
      }
      
      modifiedPaths[path] = pathItem;
    });
    
    return {
      ...document,
      paths: modifiedPaths
    };
  };

  // Helper function to filter document by version
  const filterByVersion = (document: any, version: string) => {
    const filteredPaths: any = {};
    const filteredSchemas: any = {};
    const usedSchemas = new Set<string>();

    // Collect all schemas referenced in the filtered paths
    const collectSchemas = (obj: any) => {
      if (typeof obj === 'object' && obj !== null) {
        if (obj.$ref && typeof obj.$ref === 'string') {
          const schemaName = obj.$ref.split('/').pop();
          if (schemaName && !usedSchemas.has(schemaName)) {
            usedSchemas.add(schemaName);
            if (document.components?.schemas?.[schemaName]) {
              filteredSchemas[schemaName] = document.components.schemas[schemaName];
              // Recursively collect nested schemas
              collectSchemas(document.components.schemas[schemaName]);
            }
          }
        }
        Object.values(obj).forEach(collectSchemas);
      }
    };

    // Filter paths that match the version (e.g., /v1/..., /v2/...)
    Object.keys(document.paths).forEach(path => {
      if (path.includes(`/v${version}/`)) {
        const pathItem = { ...document.paths[path] };
        
        // Add version prefix to operationId for non-v1 versions
        if (version !== '1') {
          const httpMethods = ['get', 'post', 'put', 'delete', 'patch', 'options', 'head'];
          httpMethods.forEach(method => {
            if (pathItem[method]?.operationId) {
              pathItem[method] = {
                ...pathItem[method],
                operationId: `v${version}_${pathItem[method].operationId}`
              };
            }
          });
        }
        
        filteredPaths[path] = pathItem;
        collectSchemas(pathItem);
      }
    });

    return { 
      ...document, 
      paths: filteredPaths,
      components: {
        ...document.components,
        schemas: filteredSchemas
      }
    };
  };

  // All endpoints (no filter)
  const config = new DocumentBuilder()
    .setTitle('Get-App')
    .setDescription('The Get-App API swagger')
    .setVersion('0.5.4')
    .addBearerAuth()
    .build();
  const fullDocument = SwaggerModule.createDocument(app, config);
  const document = prefixOperationIds(fullDocument);
  SwaggerModule.setup('docs', app, document, { swaggerOptions: { docExpansion: 'none' } });

  // Device endpoints (no filter)
  const fullDeviceDocs = SwaggerModule.createDocument(app, config, {
    include: [DeliveryModule, DeployModule, DeviceModule, GetMapModule, Login, OfferingModule, RulesModule],
  });
  const deviceDocs = prefixOperationIds(fullDeviceDocs);
  SwaggerModule.setup('docs/device', app, deviceDocs, { swaggerOptions: { docExpansion: 'none' } });

  // All endpoints with Device-Auth header (no filter)
  const configAuth = new DocumentBuilder()
    .setTitle('Get-App')
    .setDescription('The Get-App API swagger')
    .setVersion('0.5.4')
    .addGlobalParameters({
      in: 'header',
      required: false,
      name: 'Device-Auth'
    })
    .addBearerAuth()
    .build();
  const fullDocumentAuth = SwaggerModule.createDocument(app, configAuth);
  const documentAuth = prefixOperationIds(fullDocumentAuth);
  SwaggerModule.setup('docs/auth', app, documentAuth, { swaggerOptions: { docExpansion: 'none' } });

  // V2 - All endpoints
  const configV2 = new DocumentBuilder()
    .setTitle('Get-App V2')
    .setDescription('The Get-App API swagger - Version 2')
    .setVersion('2.0.0')
    .addBearerAuth()
    .build();
  const fullDocumentV2 = SwaggerModule.createDocument(app, configV2, {
    include: [Login, DeviceModule, OfferingModule, DeliveryModule, DeployModule],
  });
  const documentV2 = filterByVersion(fullDocumentV2, '2');
  SwaggerModule.setup('docs/v2', app, documentV2, { swaggerOptions: { docExpansion: 'none' } });

  // V2 - Device endpoints
  const configV2Device = new DocumentBuilder()
    .setTitle('Get-App V2 Device')
    .setDescription('The Get-App API swagger - Version 2 (Device endpoints)')
    .setVersion('2.0.0')
    .addBearerAuth()
    .build();
  const fullDocumentV2Device = SwaggerModule.createDocument(app, configV2Device, {
    include: [Login, DeviceModule, OfferingModule, DeliveryModule, DeployModule],
  });
  const documentV2Device = filterByVersion(fullDocumentV2Device, '2');
  SwaggerModule.setup('docs/v2/device', app, documentV2Device, { swaggerOptions: { docExpansion: 'none' } });

  // V2 - All endpoints with Device-Auth header
  const configV2Auth = new DocumentBuilder()
    .setTitle('Get-App V2 with Auth')
    .setDescription('The Get-App API swagger - Version 2 (with Device-Auth)')
    .setVersion('2.0.0')
    .addGlobalParameters({
      in: 'header',
      required: false,
      name: 'Device-Auth'
    })
    .addBearerAuth()
    .build();
  const fullDocumentV2Auth = SwaggerModule.createDocument(app, configV2Auth, {
    include: [DeviceModule, OfferingModule, DeliveryModule, DeployModule],
  });
  const documentV2Auth = filterByVersion(fullDocumentV2Auth, '2');
  SwaggerModule.setup('docs/v2/auth', app, documentV2Auth, { swaggerOptions: { docExpansion: 'none' } });
}


async function bootstrap() {

  const isSecureMode = process.env.HTTP_PROTOCOL === "true"

  let httpsOptions: HttpsOptions | undefined

  if (isSecureMode) {
    console.log("Server launch in secure mode")
    const key = fs.readFileSync(process.env.SERVER_KEY_PATH || "")
    const cert = fs.readFileSync(process.env.SERVER_CERT_PATH || "")
    const ca = fs.readFileSync(process.env.CA_CERT_PATH || "")

    httpsOptions = {
      key,
      cert,
      ca,
      requestCert: true, // Request client certificate
      rejectUnauthorized: false, // Reject connections with invalid certificates
    };
  } else {
    console.log("Server launch in unsecure mode")
  }

  const app = await NestFactory.create(ApiModule, {
    httpsOptions,
    bodyParser: false,
    bufferLogs: true
  });

  app.useLogger(app.get(GET_APP_LOGGER))
  app.enableCors();
  app.useGlobalFilters(new CustomRpcExceptionFilter());
  app.setGlobalPrefix(API);
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',

  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  setupSwagger(app);

  await app.listen(Number(process.env.SERVER_PORT ?? 3000))
}

// Prevent unhandled promise rejections (e.g. RxJS TimeoutError from background Kafka send()
// calls) from crashing the Node.js process in v15+. The NestJS exception filter covers HTTP
// request contexts; this guard covers everything else.
process.on('unhandledRejection', (reason: unknown) => {
  console.error('[process] Unhandled promise rejection (non-fatal):', reason);
});

// Guard against synchronous throws that escape all try/catch boundaries.
process.on('uncaughtException', (error: Error) => {
  console.error('[process] Uncaught exception (non-fatal):', error);
});

bootstrap();
