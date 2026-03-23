import { Body, Controller, Get, Logger, Post, Version } from '@nestjs/common';
import { DeployService } from './deploy.service';
import { ApiBearerAuth, ApiExcludeEndpoint, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DeployStatusDto } from '@app/common/dto/deploy';
import { Unprotected } from '../../utils/sso/sso.decorators';
import { RequireRole, ApiRole } from '@app/common';
import { DEPLOY } from '@app/common/utils/paths';


@ApiTags("Deploy")
@Controller(DEPLOY)
@ApiBearerAuth()
export class DeployController {
  private readonly logger = new Logger(DeployController.name);

  constructor(private readonly deployService: DeployService) {}

  @Post('updateDeployStatus')
  @Version(['1', '2'])
  @ApiOperation({ 
    summary: "Update Deploy Status", 
    description: "This service message allows the consumer to report the deploy status. When deploy is done, the device content relevant service will notify. Another option on this service is to update delete content on the device."
  })
  @ApiOkResponse()
  updateDeployStatus(@Body() deployStatusDto: DeployStatusDto){
    this.logger.log(`Update deploy status from device: "${deployStatusDto.deviceId}" for component: "${deployStatusDto.catalogId}"`)
    this.deployService.updateDeployStatus(deployStatusDto);
  }

  @Get('checkHealth')
  @Unprotected()
  @ApiExcludeEndpoint()
  checkHealth(){
    this.logger.log("Deploy service - Health checking")
    return this.deployService.checkHealth()
  }
}
