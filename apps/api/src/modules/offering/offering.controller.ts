import { Controller, Get, Logger, Param } from '@nestjs/common';
import { OfferingService } from './offering.service';
import { OFFERING } from './../../utils/paths';
import { ApiBearerAuth, ApiExcludeEndpoint, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ComponentDto } from '@app/common/dto/discovery';
import { Unprotected } from '../../utils/sso/sso.decorators';

@ApiTags("Offering")
@Controller(OFFERING)
export class OfferingController {
  private readonly logger = new Logger(OfferingController.name);

  constructor(private readonly offeringService: OfferingService) { }

  @Get("component/:catalogId")
  @ApiOperation({ 
    summary: "Get Offering of Component", 
    description: "This service message allows retrieval of the offering of a specific component by catalog ID." 
  })
  @ApiBearerAuth()
  @ApiOkResponse({ type: ComponentDto })
  getOfferingOfComp(@Param("catalogId") catalogId: string) {
    this.logger.debug(`get offering of ${catalogId}`);
    return this.offeringService.getOfferingOfComp(catalogId);
  }

  @Get('checkHealth')
  @Unprotected()
  @ApiExcludeEndpoint()
  checkHealth() {
    this.logger.log("Offering service - Health checking");
    return this.offeringService.checkHealth();
  }
}

