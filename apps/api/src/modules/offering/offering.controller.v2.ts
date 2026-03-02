import { Controller, Get, Logger, Param, Query, Version } from '@nestjs/common';
import { OfferingService } from './offering.service';
import { ApiBearerAuth, ApiExcludeEndpoint, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OFFERING } from '@app/common/utils/paths';
import { DeviceTypeOfferingDto, DeviceTypeOfferingParams, PlatformOfferingDto, ProjectOfferingFilterQuery, PlatformOfferingParams, ProjectRefOfferingDto, DeviceTypeOfferingFilterQuery, OfferingQueryParams } from '@app/common/dto/offering/dto/offering.dto';
import { ProjectIdentifierParams } from '@app/common/dto/project-management';

@ApiBearerAuth()
@ApiTags("Catalog - Offering") // Offering
@Controller(OFFERING)
export class OfferingController {
  private readonly logger = new Logger(OfferingController.name);

  constructor(private readonly offeringService: OfferingService) { }

  @Version("2")
  @Get('platform/:platformIdentifier')
  @ApiOperation({
    summary: "Get Offering of Platform",
    description: "This service message allows retrieval of the offering of a specific platform by platform ID."
  })
  @ApiOkResponse({ type: PlatformOfferingDto })
  getOfferingForPlatform(@Param() params: PlatformOfferingParams, @Query() query: OfferingQueryParams) {
    this.logger.debug(`get offering for platform: ${params.platformIdentifier}`)
    return this.offeringService.getOfferingForPlatform(params, query);
  }


  @Version("2")
  @Get('device-type/:deviceTypeIdentifier')
  @ApiOperation({
    summary: "Get Offering of Device Type",
    description: "This service message allows retrieval of the offering of a specific device type by device token and also optionally specify a specific platform."
  })
  @ApiOkResponse({ type: DeviceTypeOfferingDto })
  getOfferingForDeviceType(
    @Param() params: DeviceTypeOfferingParams,
    @Query() query: DeviceTypeOfferingFilterQuery
  ) {
    this.logger.debug(`get offering for device type: ${params.deviceTypeIdentifier}`)
    return this.offeringService.getOfferingForDeviceType(params, query);
  }

  @Version("2")
  @Get('projects/:projectIdentifier')
  @ApiOperation({
    summary: "Get Offering of Project",
    description: "This service message allows retrieval of the offering of a specific project by project identifier and also optionally specify a specific platform and device-type."
  })
  @ApiOkResponse({ type: ProjectRefOfferingDto })
  getOfferingForProject(
    @Param() params: ProjectIdentifierParams,
    @Query() query: ProjectOfferingFilterQuery
  ) {
    this.logger.debug(`get offering for project: ${params.projectIdentifier}, filterQuery: ${JSON.stringify(query)}`)
    return this.offeringService.getOfferingForProject(params, query);
  }

  // Suppressed old endpoint
  @ApiExcludeEndpoint() 
  @Get('project/:projectIdentifier')
  getOfferingForProjectOld(@Param() params: ProjectIdentifierParams) {
    this.getOfferingForProject(params, {});
  }
}

