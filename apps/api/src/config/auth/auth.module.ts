import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { SecretKeyGuard } from './secret-key.guard';

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: SecretKeyGuard,
    },
  ],
})
export class AuthModule {}
