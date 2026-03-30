import { Injectable, Logger, Inject } from '@nestjs/common';
import { MicroserviceClient, MicroserviceName } from '@app/common/microservice-client';
import { UploadTopics } from '@app/common/microservice-client/topics';
import { firstValueFrom } from 'rxjs';
import { CreatePushRuleDto, UpdateRuleDto, PushRuleQueryDto, CreateRuleFieldDto, PushRuleDefinitionDto, PushRuleFieldDefinitionDto } from '@app/common/rules/dto';

@Injectable()
export class PushRulesService {
  private readonly logger = new Logger(PushRulesService.name);

  constructor(@Inject(MicroserviceName.UPLOAD_SERVICE) private readonly microserviceClient: MicroserviceClient) {}

  async createPushRule(createPushRuleDto: CreatePushRuleDto): Promise<PushRuleDefinitionDto> {
    this.logger.log('Creating push rule');
    return firstValueFrom(
      this.microserviceClient.send(UploadTopics.CREATE_PUSH_RULE, createPushRuleDto),
    );
  }

  async getPushRules(query: PushRuleQueryDto): Promise<PushRuleDefinitionDto[]> {
    this.logger.log('Getting push rules');
    return firstValueFrom(
      this.microserviceClient.send(UploadTopics.GET_PUSH_RULES, query || {}),
    );
  }

  async getPushRule(id: string): Promise<PushRuleDefinitionDto> {
    this.logger.log(`Getting push rule ${id}`);
    return firstValueFrom(
      this.microserviceClient.send(UploadTopics.GET_PUSH_RULE, id),
    );
  }

  async updatePushRule(id: string, updateRuleDto: UpdateRuleDto): Promise<PushRuleDefinitionDto> {
    this.logger.log(`Updating push rule ${id}`);
    return firstValueFrom(
      this.microserviceClient.send(UploadTopics.UPDATE_PUSH_RULE, { id, data: updateRuleDto }),
    );
  }

  async deletePushRule(id: string): Promise<void> {
    this.logger.log(`Deleting push rule ${id}`);
    return firstValueFrom(
      this.microserviceClient.send(UploadTopics.DELETE_PUSH_RULE, id),
    );
  }

  async getPushRuleFields(): Promise<PushRuleFieldDefinitionDto[]> {
    this.logger.log('Getting push rule fields');
    return firstValueFrom(
      this.microserviceClient.send(UploadTopics.GET_PUSH_RULE_FIELDS, {}),
    );
  }

  async addPushRuleField(createFieldDto: CreateRuleFieldDto): Promise<PushRuleFieldDefinitionDto> {
    this.logger.log('Adding push rule field');
    return firstValueFrom(
      this.microserviceClient.send(UploadTopics.ADD_PUSH_RULE_FIELD, createFieldDto),
    );
  }

  async removePushRuleField(name: string) {
    this.logger.log(`Removing push rule field ${name}`);
    return firstValueFrom(
      this.microserviceClient.send(UploadTopics.REMOVE_PUSH_RULE_FIELD, name),
    );
  }
}
