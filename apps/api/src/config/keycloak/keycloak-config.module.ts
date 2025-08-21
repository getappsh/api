import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard, KeycloakConnectModule, ResourceGuard, RoleGuard } from 'nest-keycloak-connect';
import { KeycloakConfigService } from './keycloak-config.service';

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
    })
  ],
  providers:[
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    // {
    //   provide: APP_GUARD,
    //   useClass: ResourceGuard,
    // },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
  ]
})
export class KeyCloakModole{}
