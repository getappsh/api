import { Inject, Injectable, Logger } from "@nestjs/common";
import { GetMapTopics, DeviceTopics, GetMapTopicsEmit } from "@app/common/microservice-client/topics";
import { lastValueFrom } from 'rxjs';
import { ImportStatusResDto, CreateImportDto, CreateImportResDto, InventoryUpdatesReqDto, InventoryUpdatesResDto } from "@app/common/dto/map";
import { MicroserviceClient, MicroserviceName } from "@app/common/microservice-client";
import { DiscoveryMapDto } from "@app/common/dto/discovery";
import { OfferingMapResDto } from "@app/common/dto/offering";
import { MapConfigDto } from "@app/common/dto/map/dto/map-config.dto";
import { ImportResPayload } from "@app/common/dto/libot/dto/import-res-payload";


@Injectable()
export class GetMapService {

  private readonly logger = new Logger(GetMapService.name);

  constructor(
    @Inject(MicroserviceName.GET_MAP_SERVICE) private readonly getMapClient: MicroserviceClient,
    @Inject(MicroserviceName.DEVICE_SERVICE) private readonly deviceClient: MicroserviceClient) {
  }

  async getOfferedMaps(discoverMap: DiscoveryMapDto) {
    const importRes: OfferingMapResDto = await lastValueFrom(
      this.getMapClient.sendAndValidate(
        GetMapTopics.DISCOVERY_MAP,
        discoverMap,
        OfferingMapResDto
      ));

    this.logger.verbose(`Products offering ${JSON.stringify(importRes)}`);

    return importRes
  }

  async createImport(createImportDto: CreateImportDto): Promise<CreateImportResDto> {
    const importRes: CreateImportResDto = await lastValueFrom(
      this.getMapClient.sendAndValidate(
        GetMapTopics.CREATE_IMPORT,
        createImportDto,
        CreateImportResDto
      ));

    this.logger.verbose(`"Create map import" - response ${JSON.stringify(importRes)}`);
    return importRes
  }

  async getImportStatus(importRequestId: string) {
    const statusRes: ImportStatusResDto = await lastValueFrom(
      this.getMapClient.sendAndValidate(
        GetMapTopics.GET_IMPORT_STATUS,
        importRequestId,
        ImportStatusResDto
      ));
    this.logger.verbose(`Map import status ${JSON.stringify(statusRes)}`);
    return statusRes;
  }

  exportNotification(payload: ImportResPayload) {
    this.getMapClient.emit(GetMapTopics.EXPORT_NOTIFICATION, payload)
  }

  async getInventoryUpdates(inventoryUpdatesReqDto: InventoryUpdatesReqDto) {
    const inventoryRes: InventoryUpdatesResDto = await lastValueFrom(
      this.getMapClient.sendAndValidate(
        GetMapTopics.GET_INVENTORY_UPDATES,
        inventoryUpdatesReqDto,
        InventoryUpdatesResDto
      ));
    this.logger.verbose(`Map import status ${JSON.stringify(inventoryRes)}`);
    return inventoryRes;

  }

  async getMapConfig() {
    const configRes: MapConfigDto = await lastValueFrom(
      this.getMapClient.sendAndValidate(
        GetMapTopics.GET_MAP_CONFIG,
        {},
        MapConfigDto
      ));
    this.logger.verbose(`Map config res - ${JSON.stringify(configRes)}`);
    // this.deviceClient.emit(DeviceTopicsEmit.SAVE_MAP_DATA, statusRes)
    return configRes;

  }

  async setMapConfig(configs: MapConfigDto) {
    return this.getMapClient.send(GetMapTopics.SET_MAP_CONFIG, configs)
  }

  getAllMapProperties() {
    return this.deviceClient.send(DeviceTopics.All_MAPS, {});
  }

  getMap(catalogId: string) {
    return this.deviceClient.send(DeviceTopics.GET_MAP, catalogId);
  }
  
  startMapUpdatedCronJob() {
    return this.getMapClient.emit(GetMapTopicsEmit.MAP_UPDATES_JOB_START, {});
  }

  checkHealth() {
    return this.getMapClient.send(GetMapTopics.CHECK_HEALTH, {})
  }

}