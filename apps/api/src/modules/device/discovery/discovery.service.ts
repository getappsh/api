import { DeviceTopics, DeviceTopicsEmit, GetMapTopics } from '@app/common/microservice-client/topics';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { DeviceRegisterDto, MTlsStatusDto } from '@app/common/dto/device';
import { Observable, lastValueFrom } from 'rxjs';
import { DiscoveryMessageDto } from '@app/common/dto/discovery';
import { DiscoveryResDto } from '@app/common/dto/discovery';
import { MicroserviceClient, MicroserviceName } from '@app/common/microservice-client';
import { DeviceDiscoverDto } from '@app/common/dto/im';
import { MapOfferingStatus, OfferingMapProductsResDto, OfferingMapResDto } from '@app/common/dto/offering';
import { OfferingService } from '../../offering/offering.service';
import { ErrorCode, ErrorDto } from '@app/common/dto/error';

@Injectable()
export class DiscoveryService{
  private readonly logger = new Logger(DiscoveryService.name);

  constructor(
    @Inject(MicroserviceName.DEVICE_SERVICE) private readonly deviceClient: MicroserviceClient,
    @Inject(MicroserviceName.GET_MAP_SERVICE) private readonly getMapClient: MicroserviceClient,
    private readonly offeringService: OfferingService) { 
      
    }
    

  async deviceComponentDiscovery(discoveryMessageDto: DiscoveryMessageDto) : Promise<any>{
    this.sendDeviceContext(discoveryMessageDto);
    return this.offeringService.getDeviceComponentOffering(discoveryMessageDto.general.physicalDevice.ID);
  }

  async deviceMapDiscovery(discoveryMessageDto: DiscoveryMessageDto) : Promise<OfferingMapResDto>{
    this.sendDeviceContext(discoveryMessageDto);


    let productsObservable = this.getMapClient.sendAndValidate(GetMapTopics.DISCOVERY_MAP, discoveryMessageDto?.mapData, OfferingMapProductsResDto);
    let offeringObservable = this.offeringService.getDeviceMapOffering(discoveryMessageDto.general.physicalDevice.ID);
    const [offeringResults, productsResults] = await Promise.allSettled([lastValueFrom(offeringObservable), lastValueFrom(productsObservable)])

    let mapOffering = new OfferingMapResDto();

    if (productsResults.status ==='fulfilled'){
      mapOffering = productsResults.value as OfferingMapResDto;

      if (mapOffering.status == MapOfferingStatus.ERROR){
        this.logger.error(`get-map offering error ${mapOffering.error.message}`)
      }else{
        this.logger.debug(`get-map responded with ${mapOffering.products?.length} products`)
      }

    }else{
      this.logger.error(`Error getting discovery map data: ${productsResults.reason}`);
      mapOffering.products = [];
      mapOffering.status = MapOfferingStatus.ERROR;
      mapOffering.error = {errorCode: ErrorCode.MAP_OTHER, message: productsResults.reason?.message};
    }

    if (offeringResults.status ==='fulfilled'){
      mapOffering.push = offeringResults.value.push;
      this.logger.debug(`map push offering response with ${mapOffering.push.length} maps`);

    }else{
      this.logger.error(`Error getting map push offering software data: ${offeringResults.reason}`);
      mapOffering.push = [];
    }

   
    return mapOffering
  }
    

  async sendDeviceContext(discoveryMessageDto: DiscoveryMessageDto){
    this.logger.log(`emit device context, deviceId: ${discoveryMessageDto.general.physicalDevice.ID}`);
    this.deviceClient.emit(DeviceTopicsEmit.DISCOVER_DEVICE_CONTEXT, discoveryMessageDto);
  }

  
  async discoveryCatalog(discoveryMessageDto: DiscoveryMessageDto): Promise<DiscoveryResDto>{
    let discoveryRes = new DiscoveryResDto();

    this.logger.log("send discovery software data")
    const softObservable = this.deviceClient.send(DeviceTopics.DISCOVERY_SOFTWARE, discoveryMessageDto)

    let mapObservable: Observable<Promise<OfferingMapResDto>>
    if (discoveryMessageDto.mapData) {
      this.logger.log("send discovery map data to get-map");
      mapObservable = this.getMapClient.sendAndValidate(GetMapTopics.DISCOVERY_MAP, discoveryMessageDto.mapData, OfferingMapResDto)
    }

    const [softResult, mapResult] = await Promise.allSettled([lastValueFrom(softObservable), lastValueFrom(mapObservable)])

    if (discoveryMessageDto.mapData){
      if (mapResult.status ==='fulfilled'){
        discoveryRes.map = mapResult.value

        if (discoveryRes.map.status == MapOfferingStatus.ERROR){
            this.logger.error(`get-map offering error ${discoveryRes.map.error.message}`)
          }else{
            this.logger.debug(`get-map responded with ${discoveryRes.map.products?.length} maps`)
          }
      }else{
        this.logger.error(`Error getting discovery map data: ${mapResult.reason}`);
        throw mapResult.reason
      }
    }
    

    if (softResult.status ==='fulfilled'){
      discoveryRes.software = softResult.value
      this.logger.debug(`software discovery response, is new version: ${discoveryRes.software.isNewVersion}`)

    }else{
      this.logger.error(`Error getting discovery software data: ${softResult.reason}`);

      if (!discoveryMessageDto.mapData){
        throw softResult.reason
      }
    }
    return discoveryRes;
  }


  async imPushDiscoveryDevices(devicesDiscovery: DeviceDiscoverDto[]){
    this.deviceClient.emit(DeviceTopicsEmit.IM_PUSH_DISCOVERY, devicesDiscovery);
  }

  imPullDiscoveryDevices(devicesDiscovery: DeviceDiscoverDto[]){
    return this.deviceClient.send(DeviceTopics.IM_PULL_DISCOVERY, devicesDiscovery);
  }


  mTlsStatus(mTlsStatus: MTlsStatusDto) {    
    this.deviceClient.emit(DeviceTopicsEmit.UPDATE_TLS_STATUS, mTlsStatus)
  }
}
