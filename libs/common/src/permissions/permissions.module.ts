import { Module, DynamicModule, Global } from '@nestjs/common';
import { PermissionsService } from './services/permissions.service';
import { PermissionsGuard } from './guards/permissions.guard';

/**
 * Module for role-based permissions
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
}
