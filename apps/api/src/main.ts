import * as dotenv from 'dotenv';
dotenv.config();
import apm from 'nestjs-elastic-apm';

import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ApiModule } from './api.module';
import { CustomRpcExceptionFilter } from './rpc-exception.filter';
import { API } from './utils/paths';
import { GET_APP_LOGGER } from '@app/common/logger/logger.module';

async function bootstrap() {
  const app = await NestFactory.create(ApiModule, {bufferLogs: true});
  app.useLogger(app.get(GET_APP_LOGGER))
  app.enableCors();
  app.useGlobalFilters(new CustomRpcExceptionFilter());
  app.setGlobalPrefix(API);
  // app.enableVersioning({
  //   type: VersioningType.URI,
  //   defaultVersion: '1'
  // });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  

  const config = new DocumentBuilder()
    .setTitle('Get-App')
    .setDescription('The Get-App API swagger')
    .setVersion('0.5.4')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // docs/auth — same as docs but with Device-Auth header pre-populated
  const configAuth = new DocumentBuilder()
    .setTitle('Get-App')
    .setDescription('The Get-App API swagger')
    .setVersion('0.5.4')
    .addGlobalParameters({
      in: 'header',
      required: false,
      name: 'Device-Auth',
    })
    .addBearerAuth()
    .build();
  const documentAuth = SwaggerModule.createDocument(app, configAuth);
  SwaggerModule.setup('docs/auth', app, documentAuth);

  await app.listen(3000);
}
bootstrap();
