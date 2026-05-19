import {
  Controller,
  Get,
  Param,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { RequireRole, ApiRole } from '@app/common';
import { GET_CONFIG } from '@app/common/utils/paths';
import { UserContextInterceptor } from '../../utils/interceptor/user-context.interceptor';
import { ConfigService } from '../upload/config.service';
import {
  ConfigMapForProjectDto,
} from '@app/common/dto/project-management';

@ApiTags('Get Config: Config Management')
@ApiBearerAuth()
@UseInterceptors(UserContextInterceptor)
@Controller(`${GET_CONFIG}/:configIdentifier/config`)
export class ConfigProjectController {
  constructor(private readonly configService: ConfigService) {}

  @Get('config-maps')
  @RequireRole(ApiRole.VIEW_CONFIG_MAP)
  @ApiOperation({ summary: 'List all ConfigMap projects that apply to this CONFIG project (via device type or global)' })
  @ApiParam({ name: 'configIdentifier', description: 'Config project ID or name' })
  @ApiOkResponse({ type: [ConfigMapForProjectDto] })
  getConfigMapsForProject(@Param('configIdentifier') configIdentifier: string) {
    return this.configService.getConfigMapsForProject(configIdentifier);
  }
}


