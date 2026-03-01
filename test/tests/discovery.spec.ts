import { SuperAgentTest } from "supertest";
import { ConfigOption, createAndGetProjectTest, getProjectConfigOptionTest } from "./projectCreating.spec";
import { DELIVERY, DEPLOY, DEVICE, DEVICES_CATALOG_ID, DEVICES_PLATFORM, DEVICES_PROJECT_ID, DISCOVER, INSTALLED, PREPARED_DELIVERY, PREPARE_DELIVERY, PROJECT_MANAGEMENT, UPDATE_DEPLOY_STATUS, UPDATE_DOWNLOAD_STATUS } from "@app/common/utils/paths";
import { OfferingResponseDto } from "@app/common/dto/offering";
import { PrepareDeliveryReqDto, PrepareDeliveryResDto } from "@app/common/dto/delivery";
import { DeliveryStatusEnum, DeployStatusEnum, ItemTypeEnum, PrepareStatusEnum } from "@app/common/database/entities";
import { ComponentDto } from "@app/common/dto/discovery";
import { DeviceResDto } from "@app/common/dto/project-management";



export const discoveryUntilDeployTest = async (request: SuperAgentTest) => {
  const { currentProject, configOptionByProject } = await createAndGetProjectTest(request);
  let discoverData = getDiscoveryData(configOptionByProject);
  const deviceId = getDeviceId(discoverData)
  const offering: OfferingResponseDto = await discoveryTest(request, discoverData)
  const comps = offering.platform?.components
  const comp = comps[comps.length - 1]
  const catalogId = comp.catalogId



  await deliveryTest(request, catalogId, deviceId)
  await deployTest(request, catalogId, deviceId)

  discoverData = getDiscoveryData(configOptionByProject, [comp]);
  await discoveryTest(request, discoverData)

  await deviceInstalledTest(request, deviceId)

  await deviceInstalledCatalogIdTest(request, catalogId, deviceId)
  await deviceInstalledProjectIdTest(request, currentProject.id, deviceId)
  await deviceOfPlatformTest(request, configOptionByProject.platforms, deviceId)
}

export const discoveryTest = async (request: SuperAgentTest, discoverData: any) => {
  const res = (await request.post(`${DEVICE}${DISCOVER}`).send(discoverData).expect(201)).body
  expect(res).toHaveProperty("map")
  expect(res).toHaveProperty("software")
  return res.software
}

const deliveryTest = async (request: SuperAgentTest, catalogId: string, deviceId: string) => {
  const body: PrepareDeliveryReqDto = {
    catalogId,
    deviceId,
    itemType: ItemTypeEnum.SOFTWARE
  }

  await prepareDeliveryTest(request, body);
  await preparedDeliveryTest(request, body);
  await updateDeliveryStatusTest(request, deviceId, body.catalogId);
}

const deployTest = async (request: SuperAgentTest, catalogId: string, deviceId: string) => {
  const statusData = getDeployStatusData(deviceId, catalogId);
  await request.post(`${DEPLOY}${UPDATE_DEPLOY_STATUS}`).send(statusData).expect(201)
}

const prepareDeliveryTest = async (request: SuperAgentTest, body: PrepareDeliveryReqDto) => {
  const prepareRes: PrepareDeliveryResDto = (await request.post(`${DELIVERY}${PREPARE_DELIVERY}`).send(body).expect(201)).body
  expect(prepareRes).toBeValidWithClassValidator(PrepareDeliveryResDto)
  if (prepareRes.status == PrepareStatusEnum.DONE) {
    expect(prepareRes).toHaveProperty("url")
  }
}

const preparedDeliveryTest = async (request: SuperAgentTest, body: PrepareDeliveryReqDto) => {
  const preparedRes = (await request.get(`${DELIVERY}${PREPARED_DELIVERY}/${body.catalogId}`).send(body).expect(200)).body
  expect(preparedRes).toBeValidWithClassValidator(PrepareDeliveryResDto)
  if (preparedRes.status == PrepareStatusEnum.DONE) {
    expect(preparedRes).toHaveProperty("url")
  }
}

const updateDeliveryStatusTest = async (request: SuperAgentTest, deviceId: string, catalogId: string) => {
  const statusData = getDeliveryStatusData(deviceId, catalogId);
  await request.post(`${DELIVERY}${UPDATE_DOWNLOAD_STATUS}`).send(statusData).expect(201)
}

export const deviceInstalledTest = async (request: SuperAgentTest, deviceId: string) => {
  const installedRes = (await request.get(`${DEVICE}${INSTALLED}${deviceId}`).expect(200)).body
  expect(installedRes).toHaveProperty("maps")
  expect(installedRes).toHaveProperty("components")
  expect(installedRes.components[0]).toBeValidWithClassValidator(ComponentDto)
}

export const deviceInstalledCatalogIdTest = async (request: SuperAgentTest, catalogId: string, deviceId: string) => {
  const installedRes = (await request.get(`${PROJECT_MANAGEMENT}${DEVICES_CATALOG_ID}${catalogId}`).expect(200)).body
  expect(installedRes[0]).toBeValidWithClassValidator(DeviceResDto)
  expect(installedRes.some((item: DeviceResDto) => item.ID === deviceId)).toBe(true);
}

export const deviceInstalledProjectIdTest = async (request: SuperAgentTest, projectId: number, deviceId: string) => {
  const installedRes = (await request.get(`${PROJECT_MANAGEMENT}${DEVICES_PROJECT_ID}${projectId}`).expect(200)).body
  expect(installedRes[0]).toBeValidWithClassValidator(DeviceResDto)
  expect(installedRes.some((item: DeviceResDto) => item.ID === deviceId)).toBe(true);
}

export const deviceOfPlatformTest = async (request: SuperAgentTest, platform: string, deviceId: string) => {
  const installedRes = (await request.get(`${PROJECT_MANAGEMENT}${DEVICES_PLATFORM}${platform}`).expect(200)).body
  expect(installedRes[0]).toBeValidWithClassValidator(DeviceResDto)
  expect(installedRes.some((item: DeviceResDto) => item.ID === deviceId)).toBe(true);
}


export const getDiscoveryData = (details?: ConfigOption, comps?: ComponentDto[]) => {
  const data = {
    general: {
      personalDevice: {
        name: "my name",
        idNumber: "idNumber-123",
        personalNumber: "personalNumber-123"
      },
      situationalDevice: {
        weather: 23.2,
        bandwidth: 0,
        time: new Date(),
        operativeState: true,
        power: 38,
        location: {
          lat: "-8.5612",
          long: "-62.2928",
          alt: "500"
        }
      },
      physicalDevice: {
        MAC: "ee:e0:b0:bf:8b:38",
        ID: "51490b1c-3a44-4c11-aa96-66dda33d89c9",
        IP: "169.227.199.206",
        OS: details?.operationsSystem,
        serialNumber: "serialNumber-123",
        possibleBandwidth: "yes",
        availableStorage: "50mb"
      }
    },
    discoveryType: "get-app",
    softwareData: {
      formation: details?.formations,
      platform: {
        name: details?.platforms,
        platformNumber: "1.0.6",
        virtualSize: 12024,
        components: comps ?? []
      },
    },
    mapData: {
      productId: "string",
      productName: "string",
      productVersion: "string",
      productType: "string",
      description: "string",
      boundingBox: "string",
      crs: "string",
      imagingTimeStart: "string",
      imagingTimeEnd: "string",
      creationDate: "string",
      source: "string",
      classification: "string",
      compartmentalization: "string",
      region: "string",
      sensor: "string",
      precisionLevel: "string",
      resolution: "string"
    }
  }

  return data
}

export const getDeviceId = (generalData: any) => {
  return generalData.general.physicalDevice.ID
}

const getDeliveryStatusData = (deviceId: string, catalogId: string) => {
  return {
    deviceId: deviceId,
    catalogId: catalogId,
    deliveryStatus: DeliveryStatusEnum.DONE,
    type: ItemTypeEnum.SOFTWARE,
    downloadStart: null,
    downloadDone: null,
    downloadStop: null,
    bitNumber: 103100,
    downloadData: 56.901,
    downloadSpeed: 3.212,
    downloadEstimateTime: 343,
    currentTime: null,
  }
}

const getDeployStatusData = (deviceId: string, catalogId: string) => {
  return {
    deviceId: deviceId,
    catalogId: catalogId,
    deployStatus: DeployStatusEnum.DONE,
    type: ItemTypeEnum.SOFTWARE,
    deployStart: null,
    deployDone: null,
    deployStop: null,
    deployEstimateTime: 343,
    currentTime: null,
  }
}


