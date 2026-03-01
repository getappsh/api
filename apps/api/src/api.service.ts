import { DeviceBugReportTopics, DeviceTopics, DevicesGroupTopics, DevicesHierarchyTopics, GetMapTopics } from '@app/common/microservice-client/topics';
import { MicroserviceClient, MicroserviceName } from '@app/common/microservice-client';
import { getKafkaConnection } from '@app/common/microservice-client/clients/kafka/connection';
import { Inject, Injectable, Logger, OnApplicationBootstrap, OnModuleInit } from '@nestjs/common';
import { Kafka, KafkaConfig } from 'kafkajs';
import { ApmService } from 'nestjs-elastic-apm';
import * as fs from 'fs';

@Injectable()

export class ApiService implements OnModuleInit, OnApplicationBootstrap {
  private readonly logger = new Logger(ApiService.name);


  constructor(
    @Inject(MicroserviceName.GET_MAP_SERVICE) private readonly getMapClient: MicroserviceClient,
    @Inject(MicroserviceName.DEVICE_SERVICE) private readonly deviceClient: MicroserviceClient,
    private readonly apmService: ApmService
  ) { }


  readImageVersion() {
    let version = 'unknown'
    try {
      version = fs.readFileSync('api_image_version.txt', 'utf8');
    } catch (error) {
      this.logger.error(`Unable to read image version - error: ${error}`)
    }
    return version
  }
  async subscribeToGetMapClient() {
    this.getMapClient.subscribeToResponseOf(Object.values(GetMapTopics));
    await this.getMapClient.connect();
  }

  async subscribeToDeviceClient() {
    this.deviceClient.subscribeToResponseOf(Object.values(DeviceTopics));
    this.deviceClient.subscribeToResponseOf(Object.values(DevicesGroupTopics));
    this.deviceClient.subscribeToResponseOf(Object.values(DeviceBugReportTopics));
    this.deviceClient.subscribeToResponseOf(Object.values(DevicesHierarchyTopics));

    await this.deviceClient.connect();
  }

  async onModuleInit() {
    await this.subscribeToGetMapClient()
    await this.subscribeToDeviceClient()
  }

  async createMapTopicsIfNotExist() {
    const admin = new Kafka(getKafkaConnection() as KafkaConfig).admin();
    await admin.connect();

    const topicList = await admin.listTopics();
    const topicsToCreate: { topic: string }[] = [];

    const addTopicsIfNotExists = (enumValues: string[]) => {
      enumValues.forEach((value: string) => {
        if (!topicList.includes(value)) {
          topicsToCreate.push({ topic: value });
          this.logger.debug(`Topic to create: ${value}`);
        }
      });
    };

    addTopicsIfNotExists(Object.values(GetMapTopics));

    await admin.createTopics({
      topics: topicsToCreate,
      waitForLeaders: true,
    });

  }
  onApplicationBootstrap() {
    if (this.getMapClient.isKafka()) {
      this.logger.log("Using Kafka client");
      // this.createMapTopicsIfNotExist().catch(error => this.logger.error(error))
    } else {
      this.logger.log("Does not using Kafka client");
    }
  }

}
