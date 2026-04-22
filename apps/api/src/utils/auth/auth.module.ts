import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { SecretKeyGuard } from './secret-key.guard';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'local-jwt-secret-change-me',
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN ?? '86400s' },
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: SecretKeyGuard,
    },
  ],
  exports: [JwtModule],
})
export class AuthModule {}
