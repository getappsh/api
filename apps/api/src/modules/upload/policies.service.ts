import { Injectable, Logger, Inject } from '@nestjs/common';
import { MicroserviceClient, MicroserviceName } from '@app/common/microservice-client';
import { UploadTopics } from '@app/common/microservice-client/topics';
import { firstValueFrom } from 'rxjs';
import { CreatePolicyDto, UpdateRuleDto, RuleQueryDto, CreateRuleFieldDto } from '@app/common/rules/dto';
import { RuleDefinition } from '@app/common/rules/types/rule.types';

@Injectable()
export class PoliciesService {
  private readonly logger = new Logger(PoliciesService.name);

  constructor(@Inject(MicroserviceName.UPLOAD_SERVICE) private readonly microserviceClient: MicroserviceClient) {}

  async createPolicy(createPolicyDto: CreatePolicyDto): Promise<RuleDefinition> {
    this.logger.log('Creating policy');
    return firstValueFrom(
      this.microserviceClient.send(UploadTopics.CREATE_POLICY, createPolicyDto),
    );
  }

  async getPolicies(query: RuleQueryDto): Promise<RuleDefinition[]> {
    this.logger.log('Getting policies');
    return firstValueFrom(
      this.microserviceClient.send(UploadTopics.GET_POLICIES, query || {}),
    );
  }

  async getPolicy(id: string): Promise<RuleDefinition> {
    this.logger.log(`Getting policy ${id}`);
    return firstValueFrom(
      this.microserviceClient.send(UploadTopics.GET_POLICY, id),
    );
  }

  async updatePolicy(id: string, updateRuleDto: UpdateRuleDto): Promise<RuleDefinition> {
    this.logger.log(`Updating policy ${id}`);
    return firstValueFrom(
      this.microserviceClient.send(UploadTopics.UPDATE_POLICY, { id, data: updateRuleDto }),
    );
  }

  async deletePolicy(id: string): Promise<void> {
    this.logger.log(`Deleting policy ${id}`);
    return firstValueFrom(
      this.microserviceClient.send(UploadTopics.DELETE_POLICY, id),
    );
  }

  async getAvailableFields() {
    this.logger.log('Getting available rule fields');
    return firstValueFrom(
      this.microserviceClient.send(UploadTopics.GET_RULE_FIELDS, {}),
    );
  }

  async addRuleField(createFieldDto: CreateRuleFieldDto) {
    this.logger.log('Adding rule field');
    return firstValueFrom(
      this.microserviceClient.send(UploadTopics.ADD_RULE_FIELD, createFieldDto),
    );
  }

  async removeRuleField(name: string) {
    this.logger.log(`Removing rule field ${name}`);
    return firstValueFrom(
      this.microserviceClient.send(UploadTopics.REMOVE_RULE_FIELD, name),
    );
  }
}
