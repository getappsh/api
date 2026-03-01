import { Body, Controller, Get, Logger, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OFFERING } from '@app/common/utils/paths';
import { OfferingTreePolicyDto, OfferingTreePolicyParams, UpsertOfferingTreePolicyDto} from '@app/common/dto/offering';
import { OfferingService } from './offering.service';

@ApiTags("Catalog - Offering Policy")
@ApiBearerAuth()
@Controller(`${OFFERING}/policy`)
export class OfferingPolicyController {
  private readonly logger = new Logger(OfferingPolicyController.name);

  constructor(private readonly offeringService: OfferingService) {}

  @Put()
  @ApiOperation({
    summary: "Create/Update/Delete Offering Tree Policy",
    description: "Create/Update/Delete policy, for managing offering tree policy."
  })
  @ApiOkResponse({ type: OfferingTreePolicyDto })
  upsert(@Body() upsetDto: UpsertOfferingTreePolicyDto) {
    this.logger.debug(`Upsert policy: ${JSON.stringify(upsetDto)}`);
    return this.offeringService.upsert(upsetDto);
  }

  @Get()
  @ApiOperation({
    summary: "Get Offering tree Policies",
    description: "Retrieves all offering tree policy. Filter by platform, device-type and project."
  })
  @ApiOkResponse({ type: [OfferingTreePolicyDto] })
  findByProject(@Query() params: OfferingTreePolicyParams) {
    this.logger.debug(`Getting offering policies for: ${JSON.stringify(params)}`);
    return this.offeringService.findByProject(params);
  }

}
