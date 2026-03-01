import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { KeycloakConnectModule, RoleGuard } from 'nest-keycloak-connect';
import { KeycloakConfigService } from './keycloak-config.service';
import { AuthGuard } from '../../utils/auth/auth.guard';

@Module({
  providers: [KeycloakConfigService],
  exports: [KeycloakConfigService],
})
class KeycloakConfigModule { }

@Module({
  imports:[
    KeycloakConnectModule.registerAsync({
      useExisting: KeycloakConfigService,
      imports: [KeycloakConfigModule]
    }),
  ],
  providers:[
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
      // useValue: kcAuthGuard
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
  ]
})
export class authModule{}
