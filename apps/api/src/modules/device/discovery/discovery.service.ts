import { DeviceTopics, DeviceTopicsEmit, GetMapTopics } from '@app/common/microservice-client/topics';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Observable, lastValueFrom } from 'rxjs';
import { DiscoveryMessageDto } from '@app/common/dto/discovery';
import { DiscoveryResDto } from '@app/common/dto/discovery';
import { MicroserviceClient, MicroserviceName } from '@app/common/microservice-client';
import { DeviceDiscoverDto } from '@app/common/dto/im';
import { MapOfferingStatus, OfferingMapResDto } from '@app/common/dto/offering';
const gjv = require("geojson-validation");

@Injectable()
export class DiscoveryService {
  private readonly logger = new Logger(DiscoveryService.name);

  constructor(
    @Inject(MicroserviceName.DEVICE_SERVICE) private readonly deviceClient: MicroserviceClient,
    @Inject(MicroserviceName.GET_MAP_SERVICE) private readonly getMapClient: MicroserviceClient,) { }


  async discoveryCatalog(discoveryMessageDto: DiscoveryMessageDto): Promise<DiscoveryResDto> {
    let discoveryRes = new DiscoveryResDto();

    this.logger.log("send discovery software data")
    const softObservable = this.deviceClient.emit(DeviceTopics.DISCOVERY_SOFTWARE, discoveryMessageDto)

    let mapObservable: Observable<Promise<OfferingMapResDto>>
    if (discoveryMessageDto.mapData) {
      this.logger.log("send discovery map data to get-map");
      mapObservable = this.getMapClient.sendAndValidate(GetMapTopics.DISCOVERY_MAP, discoveryMessageDto.mapData, OfferingMapResDto)
    }

    const [mapResult] = await Promise.allSettled([lastValueFrom(mapObservable)])
    // const [softResult, mapResult] = await Promise.allSettled([lastValueFrom(softObservable), lastValueFrom(mapObservable)])

    if (discoveryMessageDto.mapData) {
      if (mapResult.status === 'fulfilled') {
        discoveryRes.map = mapResult.value

        if (discoveryRes.map.status == MapOfferingStatus.ERROR) {
          this.logger.error(`get-map offering error ${discoveryRes.map.error.message}`)
        } else {
          this.logger.debug(`get-map responded with ${discoveryRes.map.products?.length} maps`)
        }
      } else {
        this.logger.error(`Error getting discovery map data: ${mapResult.reason}`);
        throw mapResult.reason
      }
    }


    // if (softResult.status === 'fulfilled') {
    //   discoveryRes.software = softResult.value
    //   this.logger.debug(`software discovery response, is new version: ${discoveryRes.software.isNewVersion}`)

    // } else {
    //   this.logger.error(`Error getting discovery software data: ${softResult.reason}`);

    //   if (!discoveryMessageDto.mapData) {
    //     throw softResult.reason
    //   }
    // }
    return discoveryRes;
  }


  async imPushDiscoveryDevices(devicesDiscovery: DeviceDiscoverDto[]) {
    this.deviceClient.emit(DeviceTopicsEmit.IM_PUSH_DISCOVERY, devicesDiscovery);
  }

  imPullDiscoveryDevices(devicesDiscovery: DeviceDiscoverDto[]) {
    return this.deviceClient.send(DeviceTopics.IM_PULL_DISCOVERY, devicesDiscovery);
  }

}
