import { Module, DynamicModule, Global } from '@nestjs/common';
import { PermissionsService } from './services/permissions.service';
import { PermissionsGuard } from './guards/permissions.guard';
import { PermissionsConfig } from './types/permissions-config.interface';

/**
 * Module for role-based permissions
 * Can be imported as-is or with custom configuration
 */
@Global()
@Module({})
export class PermissionsModule {
  /**
   * Register permissions module with default configuration
   */
  static forRoot(): DynamicModule {
    return {
      module: PermissionsModule,
      providers: [PermissionsService, PermissionsGuard],
      exports: [PermissionsService, PermissionsGuard],
    };
  }

  /**
   * Register permissions module with custom configuration
   */
  static forRootWithConfig(config: Partial<PermissionsConfig>): DynamicModule {
    return {
      module: PermissionsModule,
      providers: [
        {
          provide: PermissionsService,
          useFactory: () => new PermissionsService(config),
        },
        PermissionsGuard,
      ],
      exports: [PermissionsService, PermissionsGuard],
    };
  }
}
