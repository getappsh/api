import { Body, Controller, Get, Logger, Param, Post, Query } from '@nestjs/common';
import { OfferingService } from './offering.service';
import { ApiBearerAuth, ApiCreatedResponse, ApiExcludeEndpoint, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OFFERING } from '@app/common/utils/paths';
import { Unprotected } from '../../utils/sso/sso.decorators';
import { PushOfferingDto } from '@app/common/dto/offering';
import { DeviceTypeOfferingDto, DeviceTypeOfferingParams, GetProjectsOfferingDto, PlatformOfferingDto, ProjectOfferingFilterQuery, PlatformOfferingParams, ProjectRefOfferingDto, DeviceTypeOfferingFilterQuery, OfferingQueryParams } from '@app/common/dto/offering/dto/offering.dto';
import { ProjectIdentifierParams } from '@app/common/dto/project-management';
import { ComponentV2Dto } from '@app/common/dto/upload';
import { ApiOkResponsePaginated } from '@app/common/dto/pagination.dto';

@ApiBearerAuth()
@ApiTags("Catalog - Offering") // Offering
@Controller(OFFERING)
export class OfferingController {
  private readonly logger = new Logger(OfferingController.name);

  constructor(private readonly offeringService: OfferingService) { }

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

  @Get('projects')
  @ApiOperation({
    summary: "Get Offering of All Projects",
    description: "This service message allows retrieval of the offering of all projects."
  })
  @ApiOkResponsePaginated(ProjectRefOfferingDto)
  getOfferingForProjects(@Query() dto: GetProjectsOfferingDto) {
    this.logger.debug(`get offering for all projects, query: ${JSON.stringify(dto)}`)
    return this.offeringService.getOfferingForProjects(dto);
  }

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

  @Get("component/:catalogId")
  @ApiOperation({ 
    summary: "Get Offering of Component", 
    description: "This service message allows retrieval of the offering of a specific component by catalog ID." 
  })
  @ApiOkResponse({ type: ComponentV2Dto })
  getOfferingOfComp(@Param("catalogId") catalogId: string) {
    this.logger.debug(`get offering of ${catalogId}`);
    return this.offeringService.getOfferingOfComp(catalogId);
  }


  @Post('push')
  @ApiOperation({ 
    summary: "Push offering of component or map", 
    description: "This service message allows to push component or map by `catalog ID`, to devices or groups of devices" 
  })
  @ApiCreatedResponse()
  pushOffering(@Body() po: PushOfferingDto){
    this.logger.debug(`Push offering of catalogId: ${po.catalogId}, type: ${po.itemType}`)
    this.offeringService.pushOffering(po);
  }

  @Get('checkHealth')
  @Unprotected()
  @ApiExcludeEndpoint()
  checkHealth() {
    this.logger.log("Offering service - Health checking");
    return this.offeringService.checkHealth();
  }

  
}

