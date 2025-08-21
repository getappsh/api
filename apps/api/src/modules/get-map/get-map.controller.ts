import { Body, Controller, Get, Logger, Param, Post, Put, UsePipes, ValidationPipe } from "@nestjs/common";
import { ApiBearerAuth, ApiExcludeEndpoint, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { GET_MAP } from "../../utils/paths";
import { GetMapService } from "./get-map.service";
import { CreateImportDto, CreateImportResDto, ImportStatusResDto, InventoryUpdatesReqDto, InventoryUpdatesResDto } from "@app/common/dto/map";
import { Unprotected } from "../../utils/sso/sso.decorators";
import { OfferingMapResDto } from "@app/common/dto/offering";
import { MapConfigDto } from "@app/common/dto/map/dto/map-config.dto";
import { ImportResPayload } from "@app/common/dto/libot/dto/import-res-payload";

@ApiTags("Get-Map")
@ApiBearerAuth()
@Controller(GET_MAP)
export class GetMapController {
  private readonly logger = new Logger(GetMapController.name);

  constructor(private readonly getMapServices: GetMapService) { }

  // Import

  @Get("offering")
  @ApiOperation({ 
    summary: "Get Map Offerings", 
    description: "This service message allows retrieval of all map offerings." 
  })
  @ApiOkResponse({ type: [OfferingMapResDto] })
  async getOffering(@Body() discoverMap: any) {
    this.logger.debug(`Get all offered maps`);
    return await this.getMapServices.getOfferedMaps(discoverMap);
  }

  @Post('import/create')
  @ApiOperation({ 
    summary: "Create Import", 
    description: "This service message allows the consumer to request the start of exporting a map stamp and tracking the packaging process." 
  })
  @ApiOkResponse({ type: CreateImportResDto })
  createImport(@Body() createImportDto: CreateImportDto) {
    this.logger.debug(`Create Import, data: ${createImportDto}`);
    return this.getMapServices.createImport(createImportDto);
  }

  @Get("import/status/:importRequestId")
  @ApiOperation({ 
    summary: "Get Import Status", 
    description: "This service message allows the consumer to get status information and tracking of the packaging process." 
  })
  @ApiOkResponse({ type: ImportStatusResDto })
  @ApiParam({ name: 'importRequestId', type: String })
  getImportStatus(@Param("importRequestId") importRequestId: string) {
    this.logger.debug(`Get import status for importRequestId: ${importRequestId}`);
    return this.getMapServices.getImportStatus(importRequestId);
  }

  @Unprotected()
  @Post("export-notification")
  @ApiOperation({ 
    summary: "Export Notification", 
    description: "This service message allows Libot to notify when a map is completed or has failed." 
  })
  exportNotification(@Body("data") body: any) {
    const importRes = ImportResPayload.fromImportRes(body);
    this.logger.debug(`Got export event for job Id: ${importRes.id}`);
    return this.getMapServices.exportNotification(importRes);
  }

  // Inventory
  @Post("inventory/updates")
  @ApiOperation({ 
    summary: "Get Inventory Updates", 
    description: "This service message gets a list of map request IDs and responds if there is new data map-product for them." 
  })
  @ApiOkResponse({ type: InventoryUpdatesResDto })
  getInventoryUpdates(@Body() inventoryUpdatesReqDto: InventoryUpdatesReqDto) {
    return this.getMapServices.getInventoryUpdates(inventoryUpdatesReqDto);
  }
  
  // Configs
  @Get("configs/:deviceId")
  @ApiOperation({ 
    summary: "Get Map Configurations", 
    description: "This service message returns an object of map configurations." 
  })
  @ApiParam({ name: 'deviceId', type: String })
  @ApiOkResponse({ type: MapConfigDto })
  getMapConfig(@Param('deviceId') deviceId: string) {
    this.logger.debug(`Get map configurations for device ${deviceId}`);
    return this.getMapServices.getMapConfig();
  }
  
  @Put("configs")
  @ApiOperation({ 
    summary: "Set Map Configurations", 
    description: "This service message sets an object of map configurations." 
  })
  setMapConfig(@Body() configs: MapConfigDto) {
    this.logger.debug(`Set map configurations`);
    return this.getMapServices.setMapConfig(configs);
  }
  
  // Admin dashboard 
  @Get("maps")
  @ApiOperation({ 
    summary: "Get All Maps", 
    description: "This service message allows retrieval of all requested maps." 
  })
  getAllMaps() {
    this.logger.debug(`Get all maps`);
    return this.getMapServices.getAllMapProperties();
  }
  
  @Get("map/:catalogId")
  @ApiOperation({ 
    summary: "Get Map by Catalog ID", 
    description: "This service message allows retrieval of a map by catalog ID with all its devices." 
  })
  @ApiParam({ name: 'catalogId', type: String })
  getMap(@Param('catalogId') catalogId: string) {
    this.logger.debug(`Get map with catalog id ${catalogId}`);
    return this.getMapServices.getMap(catalogId);
  }
  
  @Get("job/updates/start")
  @ApiOperation({ 
    summary: "Start Map Updates Cron Job", 
    description: "This service message starts the 'map updates' cron job." 
  })
  startMapUpdatedCronJob() {
    this.logger.log("Get start 'map updates' job");
    return this.getMapServices.startMapUpdatedCronJob();
  }

  // Utils
  @Get('checkHealth')
  @Unprotected()
  @ApiExcludeEndpoint()
  checkHealth() {
    this.logger.log("Get map service - Health checking");
    return this.getMapServices.checkHealth();
  }
}
