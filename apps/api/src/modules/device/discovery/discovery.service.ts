import { DeviceTopics, DeviceTopicsEmit, GetMapTopics } from '@app/common/microservice-client/topics';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { DeviceRegisterDto, MTlsStatusDto } from '@app/common/dto/device';
import { Observable, lastValueFrom } from 'rxjs';
import { DiscoveryMessageDto, DiscoveryMessageV2Dto } from '@app/common/dto/discovery';
import { DiscoveryResDto } from '@app/common/dto/discovery';
import { MicroserviceClient, MicroserviceName } from '@app/common/microservice-client';
import { DeviceDiscoverDto } from '@app/common/dto/im';
import { ComponentOfferingRequestDto, DeviceComponentsOfferingDto, MapOfferingStatus, OfferingMapProductsResDto, OfferingMapResDto } from '@app/common/dto/offering';
import { OfferingService } from '../../offering/offering.service';
import { ErrorCode } from '@app/common/dto/error';
import { DeviceComponentStateEnum } from '@app/common/database/entities';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DiscoveryService {
  private readonly logger = new Logger(DiscoveryService.name);

  constructor(
    @Inject(MicroserviceName.DEVICE_SERVICE) private readonly deviceClient: MicroserviceClient,
    @Inject(MicroserviceName.GET_MAP_SERVICE) private readonly getMapClient: MicroserviceClient,
    private readonly offeringService: OfferingService,
    private readonly config: ConfigService
  ) {

  }


  async deviceComponentDiscovery(dto: DiscoveryMessageV2Dto): Promise<DeviceComponentsOfferingDto> {
    // Send device context and get restrictions
    const discoveryResponse = await this.sendDeviceContextV2(dto);

    const offeringDto = ComponentOfferingRequestDto.fromDiscoveryMessageDto(dto);
    offeringDto.components = dto.softwareData?.components
      ?.filter(comp => comp.state === DeviceComponentStateEnum.INSTALLED && comp?.error === undefined)
      ?.map(comp => comp.catalogId)
    
    // Execute offering and restrictions requests concurrently
    let offeringObservable = this.offeringService.getDeviceComponentsOffering(offeringDto);
    let restrictionsObservable = this.deviceClient.send(DeviceTopics.GET_DEVICE_RESTRICTIONS, dto.id);
    
    const [offeringResults, restrictionsResults] = await Promise.allSettled([
      lastValueFrom(offeringObservable), 
      lastValueFrom(restrictionsObservable)
    ]);

    let res = new DeviceComponentsOfferingDto();

    // Handle offering results
    if (offeringResults.status === 'fulfilled') {
      res = offeringResults.value as DeviceComponentsOfferingDto;
      if (this.config.get("ALLOW_OFFERING_BY_EXISTING_COMPS") !== 'true') {
        res.offer = []
      }
    } else {
      this.logger.error(`Error getting device components offering: ${offeringResults.reason}`);
      res.offer = [];
      res.push = [];
    }

    // Handle restrictions results
    if (restrictionsResults.status === 'fulfilled') {
      res.restrictions = restrictionsResults.value;
      this.logger.debug(`Retrieved ${res.restrictions?.length ?? 0} restrictions for device ${dto.id}`);
    } else {
      this.logger.error(`Error getting device restrictions: ${restrictionsResults.reason}`);
      res.restrictions = [];
    }
    
    return res;
  }

  async deviceMapDiscovery(discoveryMessageDto: DiscoveryMessageV2Dto): Promise<OfferingMapResDto> {
    // Send device context
    const discoveryResponse = await this.sendDeviceContextV2(discoveryMessageDto);


    let productsObservable = this.getMapClient.sendAndValidate(GetMapTopics.DISCOVERY_MAP, discoveryMessageDto?.mapData, OfferingMapProductsResDto);
    let offeringObservable = this.offeringService.getDeviceMapOffering(discoveryMessageDto.id);
    const [offeringResults, productsResults] = await Promise.allSettled([lastValueFrom(offeringObservable), lastValueFrom(productsObservable)])

    let mapOffering = new OfferingMapResDto();

    if (productsResults.status === 'fulfilled') {
      mapOffering = productsResults.value as OfferingMapResDto;

      if (mapOffering.status == MapOfferingStatus.ERROR) {
        this.logger.error(`get-map offering error ${mapOffering.error.message}`)
      } else {
        this.logger.debug(`get-map responded with ${mapOffering.products?.length} products`)
      }

    } else {
      this.logger.error(`Error getting discovery map data: ${productsResults.reason}`);
      mapOffering.products = [];
      mapOffering.status = MapOfferingStatus.ERROR;
      mapOffering.error = { errorCode: ErrorCode.MAP_OTHER, message: productsResults.reason?.message };
    }

    if (offeringResults.status === 'fulfilled') {
      mapOffering.push = offeringResults.value.push;
      this.logger.debug(`map push offering response with ${mapOffering.push.length} maps`);

    } else {
      this.logger.error(`Error getting map push offering software data: ${offeringResults.reason}`);
      mapOffering.push = [];
    }


    return mapOffering
  }


  async sendDeviceContext(discoveryMessageDto: DiscoveryMessageDto) {
    this.logger.log(`emit device context, deviceId: ${discoveryMessageDto.general.physicalDevice?.ID ?? 'unknown'}`);
    this.deviceClient.emit(DeviceTopicsEmit.DISCOVER_DEVICE_CONTEXT, discoveryMessageDto);
  }

  async sendDeviceContextV2(dto: DiscoveryMessageV2Dto): Promise<DiscoveryMessageV2Dto> {
    this.logger.log(`send device context, deviceId: ${dto.id}`);
    return lastValueFrom(this.deviceClient.sendAndValidate(DeviceTopics.DISCOVER_DEVICE_CONTEXT_V2, dto, DiscoveryMessageV2Dto));
  }


  async discoveryCatalog(discoveryMessageDto: DiscoveryMessageDto): Promise<DiscoveryResDto> {
    let discoveryRes = new DiscoveryResDto();

    this.logger.log("send discovery software data")
    this.sendDeviceContext(discoveryMessageDto)

    let mapObservable: Observable<Promise<OfferingMapResDto>> | undefined = undefined;
    if (discoveryMessageDto.mapData) {
      this.logger.log("send discovery map data to get-map");
      mapObservable = this.getMapClient.sendAndValidate(GetMapTopics.DISCOVERY_MAP, discoveryMessageDto.mapData, OfferingMapResDto)
    }

    try {
      if (mapObservable) {
        discoveryRes.map = await lastValueFrom(mapObservable)
        if (discoveryRes.map.status == MapOfferingStatus.ERROR) {
          this.logger.error(`get-map offering error ${discoveryRes.map.error.message}`)
        } else {
          this.logger.debug(`get-map responded with ${discoveryRes.map.products?.length} maps`)
        }
      }
    } catch (err) {
      this.logger.error(`Error getting discovery map data: ${err}`);
      throw err
    }
    return discoveryRes;
  }


  async imPushDiscoveryDevices(devicesDiscovery: DeviceDiscoverDto[]) {
    this.deviceClient.emit(DeviceTopicsEmit.IM_PUSH_DISCOVERY, devicesDiscovery);
  }

  imPullDiscoveryDevices(devicesDiscovery: DeviceDiscoverDto[]) {
    return this.deviceClient.send(DeviceTopics.IM_PULL_DISCOVERY, devicesDiscovery);
  }


  mTlsStatus(mTlsStatus: MTlsStatusDto) {
    this.deviceClient.emit(DeviceTopicsEmit.UPDATE_TLS_STATUS, mTlsStatus)
  }
}
