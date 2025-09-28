import { Body, Controller, Get, Logger, Param, Post, Put, Version } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiExcludeEndpoint, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { GET_MAP } from "@app/common/utils/paths";
import { GetMapService } from "./get-map.service";
import { CreateImportDto, CreateImportResDto, ImportStatusResDto, InventoryUpdatesReqDto, InventoryUpdatesReqV2Dto, InventoryUpdatesResDto, InventoryUpdatesResV2Dto, MapDto } from "@app/common/dto/map";
import { Unprotected } from "../../utils/sso/sso.decorators";
import { OfferingMapProductsResDto } from "@app/common/dto/offering";
import { ImportResPayload, ImportResPayloadDto } from "@app/common/dto/libot/dto/import-res-payload";
import { MapConfigDto } from "@app/common/dto/map/dto/map-config.dto";
import { MapPutDto } from "@app/common/dto/map/dto/map-put.dto";
import { DeviceService } from "../device/device/device.service";
import { lastValueFrom } from "rxjs";
import { MapDevicesDto } from "@app/common/dto/map/dto/all-maps.dto";

@ApiTags("Get-Map")
@ApiBearerAuth()
@Controller(GET_MAP)
export class GetMapController {
  private readonly logger = new Logger(GetMapController.name);

  constructor(private readonly getMapServices: GetMapService, private readonly deviceService: DeviceService) { }

  // Import
  @Get("offering")
  @ApiOperation({
    summary: "Get Map Offerings",
    description: "This service message allows retrieval of all map offerings."
  })
  @ApiOkResponse({ type: [OfferingMapProductsResDto] })
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
    description: "This service message allows Libot to notify when a map is completed or has failed.",
  })
  @ApiBody({ type: ImportResPayloadDto })
  exportNotification(@Body() body: any) {
    const importRes = ImportResPayload.fromImportRes(body.data);
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
    this.logger.debug(`Get inventory updates, data: ${inventoryUpdatesReqDto}`);
    return this.getMapServices.getInventoryUpdates(inventoryUpdatesReqDto);
  }

  @Version("2")
  @Post("inventory/updates")
  @ApiOperation({
    summary: "Get Inventory Updates (Version 2)",
    description: "This service message gets a list of map request IDs and responds if there is new data map-product for them."
  })
  @ApiOkResponse({ type: InventoryUpdatesResV2Dto })
  getInventoryUpdatesV2(@Body() inventoryUpdatesReqDto: InventoryUpdatesReqV2Dto) {
    this.logger.debug(`Get inventory updates V2, data: ${inventoryUpdatesReqDto}`);
    return this.getMapServices.getInventoryUpdatesV2(inventoryUpdatesReqDto);
  }


  // Configs
  @Get("configs/:deviceId")
  @ApiOperation({
    summary: "Get Map Configurations",
    description: "This service message returns an object of map configurations.",
    deprecated: true,
  })
  @ApiParam({ name: 'deviceId', type: String })
  @ApiOkResponse({ type: MapConfigDto })
  async getMapConfig(@Param('deviceId') deviceId: string) {
    this.logger.debug(`Get map configurations for device ${deviceId}`);
    let res = await lastValueFrom(this.deviceService.getDeviceConfig("android"));
    return MapConfigDto.fromDeviceConfigDto(res)
  }

  @Put("configs")
  @ApiOperation({
    summary: "Set Map Configurations",
    description: "This service message sets an object of map configurations.",
    deprecated: true,
  })
  async setMapConfig(@Body() configs: MapConfigDto) {
    this.logger.debug(`Set map configurations`);
    let res = await lastValueFrom(this.deviceService.setDeviceConfig({ group: "android", ...configs }));
    return MapConfigDto.fromDeviceConfigDto(res)

  }

  // Admin dashboard 
  @Get("maps")
  @ApiOperation({
    summary: "Get All Maps",
    description: "This service message allows retrieval of all requested maps."
  })
  @ApiOkResponse({ type: [MapDto] })
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
  @ApiOkResponse({ type: MapDevicesDto })
  getMap(@Param('catalogId') catalogId: string) {
    this.logger.debug(`Get map with catalog id ${catalogId}`);
    return this.getMapServices.getMap(catalogId);
  }

  @Put(":mapId")
  @ApiOperation({ summary: "Set Device Name", description: "This service message allow to update props for a map" })
  @ApiOkResponse({ type: MapPutDto })
  putDeviceName(@Param("mapId") mapId: string, @Body() body: MapPutDto) {
    this.logger.debug(`Put properties for map with catalog id ${mapId}`)
    return this.getMapServices.putMapName(mapId, body)
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
