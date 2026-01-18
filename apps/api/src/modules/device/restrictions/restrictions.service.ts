import { Injectable, Logger, Inject } from '@nestjs/common';
import { MicroserviceClient, MicroserviceName } from '@app/common/microservice-client';
import { DeviceTopics } from '@app/common/microservice-client/topics';
import { firstValueFrom } from 'rxjs';
import { CreateRestrictionDto, UpdateRuleDto, RestrictionQueryDto, CreateRuleFieldDto } from '@app/common/rules/dto';
import { RuleDefinition } from '@app/common/rules/types/rule.types';

@Injectable()
export class RestrictionsService {
  private readonly logger = new Logger(RestrictionsService.name);

  constructor(
    @Inject(MicroserviceName.DEVICE_SERVICE) private readonly deviceClient: MicroserviceClient
  ) {}

  async createRestriction(createRestrictionDto: CreateRestrictionDto): Promise<RuleDefinition> {
    this.logger.log('Creating restriction');
    return firstValueFrom(
      this.deviceClient.send(DeviceTopics.CREATE_RESTRICTION, createRestrictionDto),
    );
  }

  async getRestrictions(query: RestrictionQueryDto): Promise<RuleDefinition[]> {
    this.logger.log('Getting restrictions');
    return firstValueFrom(
      this.deviceClient.send(DeviceTopics.GET_RESTRICTIONS, query || {}),
    );
  }

  async getRestriction(id: string): Promise<RuleDefinition> {
    this.logger.log(`Getting restriction ${id}`);
    return firstValueFrom(
      this.deviceClient.send(DeviceTopics.GET_RESTRICTION, id),
    );
  }

  async updateRestriction(id: string, updateRuleDto: UpdateRuleDto): Promise<RuleDefinition> {
    this.logger.log(`Updating restriction ${id}`);
    return firstValueFrom(
      this.deviceClient.send(DeviceTopics.UPDATE_RESTRICTION, { id, data: updateRuleDto }),
    );
  }

  async deleteRestriction(id: string): Promise<void> {
    this.logger.log(`Deleting restriction ${id}`);
    return firstValueFrom(
      this.deviceClient.send(DeviceTopics.DELETE_RESTRICTION, id),
    );
  }

  async getAvailableFields() {
    this.logger.log('Getting available rule fields');
    return firstValueFrom(
      this.deviceClient.send(DeviceTopics.GET_RULE_FIELDS, {}),
    );
  }

  async addRuleField(createFieldDto: CreateRuleFieldDto) {
    this.logger.log('Adding rule field');
    return firstValueFrom(
      this.deviceClient.send(DeviceTopics.ADD_RULE_FIELD, createFieldDto),
    );
  }

  async removeRuleField(name: string) {
    this.logger.log(`Removing rule field ${name}`);
    return firstValueFrom(
      this.deviceClient.send(DeviceTopics.REMOVE_RULE_FIELD, name),
    );
  }
}
