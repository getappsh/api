import { DeviceTopics, DeviceTopicsEmit, GetMapTopics } from '@app/common/microservice-client/topics';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { DeviceRegisterDto, MTlsStatusDto } from '@app/common/dto/device';
import { Observable, lastValueFrom } from 'rxjs';
import { DiscoveryMessageDto, DiscoveryMessageV2Dto } from '@app/common/dto/discovery';
import { DiscoveryResDto } from '@app/common/dto/discovery';
import { MicroserviceClient, MicroserviceName } from '@app/common/microservice-client';
import { DeviceDiscoverDto } from '@app/common/dto/im';
import { ComponentOfferingRequestDto, DeviceComponentsOfferingDto, MapOfferingStatus, OfferingMapProductsResDto, OfferingMapResDto, ReleaseOfferingDto, PlatformDeviceTypeTreeDto, DeviceTypeProjectRefDto } from '@app/common/dto/offering';
import { UNIVERSAL_PLATFORM_TOKEN } from '@app/common/dto/devices-hierarchy';
import { DeviceTypeOfferingDto, PlatformOfferingDto } from '@app/common/dto/offering/dto/offering.dto';
import { ComponentV2Dto } from '@app/common/dto/upload';
import { OfferingService } from '../../offering/offering.service';
import { ErrorCode } from '@app/common/dto/error';
import { DeviceComponentStateEnum } from '@app/common/database/entities';
import { ConfigService } from '@nestjs/config';
import { RuleDefinition } from '@app/common/rules/types/rule.types';

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
    this.sendDeviceContextV2(dto).catch(err => {
      this.logger.error(`Error sending device context for device ${dto.id}: ${err}`);
    });

    const offeringDto = ComponentOfferingRequestDto.fromDiscoveryMessageDto(dto);
    offeringDto.components = dto.softwareData?.components
      ?.filter(comp => comp.state === DeviceComponentStateEnum.INSTALLED && comp?.error === undefined)
      ?.map(comp => comp.catalogId)

    // Fetch offerings in parallel from multiple sources
    const promises: Promise<DeviceComponentsOfferingDto | DeviceTypeOfferingDto | PlatformOfferingDto | PlatformOfferingDto[] | RuleDefinition[] | null>[] = [];

    // 0. Get device restrictions
    promises.push(
      lastValueFrom(this.deviceClient.send(DeviceTopics.GET_DEVICE_RESTRICTIONS, dto.id))
        .catch(err => {
          this.logger.error(`Error getting device restrictions: ${err}`);
          return null;
        })
    );

    // 1. Get component offering (includes push)
    promises.push(
      lastValueFrom(this.offeringService.getDeviceComponentsOffering(offeringDto))
        .catch(err => {
          this.logger.error(`Error getting device components offering: ${err}`);
          return null;
        })
    );

    // 2. Get device type offerings (skip if universal platform token is present — all device types are covered by getAllDeviceTypesOffering)
    const hasUniversalPlatform = offeringDto.platforms?.some(p => p.toLowerCase() === UNIVERSAL_PLATFORM_TOKEN);
    if (hasUniversalPlatform) {
      this.logger.debug(`Skipping per-device-type offering fetch — 'universal' platform token detected, all device types will be covered by getAllDeviceTypesOffering`);
    } else if (offeringDto.deviceType && offeringDto.deviceType.length > 0) {
      this.logger.debug(`Fetching offerings for ${offeringDto.deviceType.length} device type(s): '${offeringDto.deviceType.join(', ')}'`);
      offeringDto.deviceType.forEach(deviceType => {
        promises.push(
          lastValueFrom(this.offeringService.getOfferingForDeviceType(
            { deviceTypeIdentifier: deviceType },
            { withDependencies: true }
          )).catch(err => {
            this.logger.error(`Error getting offering for device type ${deviceType}: ${err}`);
            return null;
          })
        );
      });
    }

    // 3. Get platform offerings (includes all device types under platform)
    if (offeringDto.platforms && offeringDto.platforms.length > 0) {
      if (hasUniversalPlatform) {
        // Universal token: fetch offerings for ALL platforms and ALL device types at once
        this.logger.debug(`'Universal' platform token detected — fetching all platforms and all device types offerings`);
        promises.push(
          lastValueFrom(this.offeringService.getAllPlatformsOffering({ withDependencies: true }))
            .catch(err => {
              this.logger.error(`Error getting all platforms offering: ${err}`);
              return null;
            })
        );
        promises.push(
          lastValueFrom(this.offeringService.getAllDeviceTypesOffering({ withDependencies: true }))
            .catch(err => {
              this.logger.error(`Error getting all device types offering: ${err}`);
              return null;
            })
        );
      } else {
        this.logger.debug(`Fetching offerings for ${offeringDto.platforms.length} platform(s): ${offeringDto.platforms.join(', ')}`);
        offeringDto.platforms.forEach(platform => {
          promises.push(
            lastValueFrom(this.offeringService.getOfferingForPlatform({ platformIdentifier: platform }, { withDependencies: true }))
              .catch(err => {
                this.logger.error(`Error getting offering for platform ${platform}: ${err}`);
                return null;
              })
          );
        });
      }
    }

    const results = await Promise.all(promises);
    const [restrictionsResult, componentOfferingResult, ...otherOfferingResults] = results;

    // Merge all results into unified ReleaseOfferingDto[]
    const flatOtherResults = (otherOfferingResults as any[]).flatMap(r => Array.isArray(r) ? r : [r]);
    const offeringResults = [componentOfferingResult, ...flatOtherResults];
    const releaseMap = this.mergeOfferingResults(offeringResults as (DeviceComponentsOfferingDto | DeviceTypeOfferingDto | PlatformOfferingDto | null)[]);

    const res = new DeviceComponentsOfferingDto();
    res.releases = Array.from(releaseMap.values());
    res.offer = []
    res.push = componentOfferingResult && 'push' in componentOfferingResult ? (componentOfferingResult as DeviceComponentsOfferingDto).push : [];
    // The types are not valid res.restrictions is expected to be RestrictionDto[] but the result from microservice call is RuleDefinition[] as any[]
    res.restrictions = restrictionsResult as RuleDefinition[] || [];

    this.logger.log(`Device component discovery complete: ${res.releases.length} releases`);
    return res;
  }

  private mergeOfferingResults(results: (DeviceComponentsOfferingDto | DeviceTypeOfferingDto | PlatformOfferingDto | null)[]): Map<string, ReleaseOfferingDto> {
    const releaseMap = new Map<string, ReleaseOfferingDto>();
    const allComponents: ComponentV2Dto[] = [];

    // First pass: collect all components and build the release map
    for (const result of results) {
      if (!result) continue;

      // Handle DeviceComponentsOfferingDto from getDeviceComponentsOffering
      if ('push' in result) {
        for (const component of result.push) {
          allComponents.push(component);
          const releaseDto: ReleaseOfferingDto = {
            release: component,
            isPush: true,
            hierarchyTrees: []
          };
          this.addOrMergeRelease(releaseMap, releaseDto);
        }
      }

      if ('offer' in result && this.config.get("ALLOW_OFFERING_BY_EXISTING_COMPS") === 'true') {
        for (const component of result.offer) {
          allComponents.push(component);
          const releaseDto: ReleaseOfferingDto = {
            release: component,
            isPush: false,
            hierarchyTrees: []
          };
          this.addOrMergeRelease(releaseMap, releaseDto);
        }
      }

      // Handle DeviceTypeOfferingDto from getOfferingForDeviceType
      if ('deviceTypeId' in result && result.projects) {
        for (const project of result.projects) {
          if (project.release) {
            allComponents.push(project.release);
            const releaseDto: ReleaseOfferingDto = {
              release: project.release,
              isPush: false,
              hierarchyTrees: [{
                deviceTypes: [{
                  deviceTypeId: result.deviceTypeId,
                  deviceTypeName: result.deviceTypeName,
                  projectId: project.projectId,
                  projectName: project.projectName,
                  projectDisplayName: project.displayName,
                  projectLabel: project.label
                }]
              }]
            };
            this.addOrMergeRelease(releaseMap, releaseDto);
          }
        }
      }

      // Handle PlatformOfferingDto from getOfferingForPlatform
      if ('platformId' in result && result.deviceTypes) {
        for (const deviceType of result.deviceTypes) {
          if (deviceType.projects) {
            for (const project of deviceType.projects) {
              if (project.release) {
                allComponents.push(project.release);
                const releaseDto: ReleaseOfferingDto = {
                  release: project.release,
                  isPush: false,
                  hierarchyTrees: [{
                    platformTypeId: result.platformId,
                    platformTypeName: result.platformName,
                    deviceTypes: [{
                      deviceTypeId: deviceType.deviceTypeId,
                      deviceTypeName: deviceType.deviceTypeName,
                      projectId: project.projectId,
                      projectName: project.projectName,
                      projectDisplayName: project.displayName,
                      projectLabel: project.label
                    }]
                  }]
                };
                this.addOrMergeRelease(releaseMap, releaseDto);
              }
            }
          }
        }
      }
    }

    // Extract all nested dependencies recursively from collected components
    const allComponentsWithDeps = this.extractAllDependenciesRecursively(allComponents);
    
    // Second pass: build direct dependency map from all components
    const directDependencyMap = this.buildDirectDependencyMap(allComponentsWithDeps);
    
    // Third pass: add nested dependencies as separate releases
    for (const component of allComponentsWithDeps) {
      if (!releaseMap.has(component.id)) {
        const releaseDto: ReleaseOfferingDto = {
          release: component,
          isPush: false,
          hierarchyTrees: []
        };
        this.addOrMergeRelease(releaseMap, releaseDto);
      }
    }
    
    // Fourth pass: update all releases with dependedOnBy information and remove dependencies
    for (const [catalogId, release] of releaseMap.entries()) {
      release.dependedOnBy = Array.from(directDependencyMap.get(catalogId) || []);
      // Remove dependencies field since we now have dependedOnBy
      delete release.release.dependencies;
    }

    return releaseMap;
  }

  private extractAllDependenciesRecursively(components: ComponentV2Dto[]): ComponentV2Dto[] {
    const allComponents = new Map<string, ComponentV2Dto>();
    const visited = new Set<string>();

    const extractRecursive = (component: ComponentV2Dto) => {
      if (visited.has(component.id)) {
        return;
      }
      visited.add(component.id);
      allComponents.set(component.id, component);

      if (component.dependencies && component.dependencies.length > 0) {
        for (const dep of component.dependencies) {
          extractRecursive(dep);
        }
      }
    };

    for (const component of components) {
      extractRecursive(component);
    }

    return Array.from(allComponents.values());
  }

  private buildDirectDependencyMap(components: ComponentV2Dto[]): Map<string, Set<string>> {
    const dependencyMap = new Map<string, Set<string>>();

    // Iterate through all components to extract direct dependencies
    for (const component of components) {
      if (component.dependencies && component.dependencies.length > 0) {
        // Process only the direct (first-level) dependencies
        for (const directDependency of component.dependencies) {
          const dependencyCatalogId = directDependency.id;
          
          if (!dependencyMap.has(dependencyCatalogId)) {
            dependencyMap.set(dependencyCatalogId, new Set<string>());
          }
          
          // Add this component as a parent of the dependency
          dependencyMap.get(dependencyCatalogId)!.add(component.id);
        }
      }
    }

    return dependencyMap;
  }

  private addOrMergeRelease(releaseMap: Map<string, ReleaseOfferingDto>, releaseDto: ReleaseOfferingDto): void {
    const catalogId = releaseDto.release.id;

    if (releaseMap.has(catalogId)) {
      const existing = releaseMap.get(catalogId);

      // Merge hierarchy trees
      if (existing && releaseDto.hierarchyTrees) {
        for (const newTree of releaseDto.hierarchyTrees) {
          this.mergeHierarchyTree(existing.hierarchyTrees, newTree);
        }
      }
    } else {
      releaseMap.set(catalogId, releaseDto);
    }
  }

  private mergeHierarchyTree(existingTrees: PlatformDeviceTypeTreeDto[], newTree: PlatformDeviceTypeTreeDto): void {
    // Find if we have a tree with the same platform
    const existingTree = existingTrees.find(t =>
      (t.platformTypeId === newTree.platformTypeId) ||
      (!t.platformTypeId && !newTree.platformTypeId)
    );

    if (existingTree) {
      // Merge device types into existing tree
      for (const newDeviceType of newTree.deviceTypes) {
        const existingDeviceType = existingTree.deviceTypes.find(dt =>
          dt.deviceTypeId === newDeviceType.deviceTypeId &&
          dt.projectId === newDeviceType.projectId
        );

        if (!existingDeviceType) {
          existingTree.deviceTypes.push(newDeviceType);
        }
      }
    } else {
      // Add new tree
      existingTrees.push(newTree);
    }
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
