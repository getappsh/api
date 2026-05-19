import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
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
  AddConfigMapAssociationDto,
  ConfigMapAssociationDto,
} from '@app/common/dto/project-management';

@ApiTags('Get Config: ConfigMap Management')
@ApiBearerAuth()
@UseInterceptors(UserContextInterceptor)
@Controller(`${GET_CONFIG}/:projectIdentifier/config-map`)
export class ConfigMapController {
  constructor(private readonly configService: ConfigService) {}

  @Get('associations')
  @RequireRole(ApiRole.VIEW_CONFIG_MAP)
  @ApiOperation({ summary: 'List device-type associations for a ConfigMap project' })
  @ApiParam({ name: 'projectIdentifier', description: 'ConfigMap project ID or name' })
  @ApiOkResponse({ type: [ConfigMapAssociationDto] })
  getAssociations(@Param('projectIdentifier') projectIdentifier: string) {
    return this.configService.getConfigMapAssociations(projectIdentifier);
  }

  @Post('associations')
  @RequireRole(ApiRole.MANAGE_CONFIG_MAP)
  @ApiOperation({ summary: 'Add device-type or device-id associations to a ConfigMap project' })
  @ApiParam({ name: 'projectIdentifier', description: 'ConfigMap project ID or name' })
  @ApiOkResponse({ type: [ConfigMapAssociationDto] })
  addAssociation(
    @Param('projectIdentifier') projectIdentifier: string,
    @Body() dto: AddConfigMapAssociationDto,
  ) {
    if (dto.deviceTypeId == null && (!dto.deviceIds || dto.deviceIds.length === 0)) {
      throw new BadRequestException('At least one association target must be provided: deviceTypeId or deviceIds');
    }
    return this.configService.addConfigMapAssociation(projectIdentifier, dto);
  }

  @Delete('associations/:associationId')
  @RequireRole(ApiRole.MANAGE_CONFIG_MAP)
  @ApiOperation({ summary: 'Remove a device-type association from a ConfigMap project' })
  @ApiParam({ name: 'projectIdentifier', description: 'ConfigMap project ID or name' })
  @ApiParam({ name: 'associationId', description: 'Association ID' })
  removeAssociation(@Param('associationId') associationId: number) {
    return this.configService.removeConfigMapAssociation(+associationId);
  }
}
