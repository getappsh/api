import { Injectable, Logger } from '@nestjs/common';
import { MicroserviceClient } from '@app/common/microservice-client';
import { UploadTopics, DeviceTopics } from '@app/common/microservice-client/topics';
import { firstValueFrom } from 'rxjs';

// Import only DTOs and types, not the full module
import { CreateRuleDto, UpdateRuleDto, RuleQueryDto, CreateRuleFieldDto } from '@app/common/rules/dto';
import { RuleDefinition } from '@app/common/rules/types/rule.types';
import { RuleType } from '@app/common/rules/enums/rule.enums';

@Injectable()
export class RulesService {
  private readonly logger = new Logger(RulesService.name);

  constructor(private readonly microserviceClient: MicroserviceClient) {}

  /**
   * Gets all policies from upload service
   */
  async getPolicies(query?: RuleQueryDto): Promise<RuleDefinition[]> {
    this.logger.log('Fetching policies from upload service');
    try {
      const response = await firstValueFrom(
        this.microserviceClient.send(UploadTopics.GET_POLICIES, query || {}),
      );
      return response;
    } catch (error) {
      this.logger.error('Error fetching policies', error);
      throw error;
    }
  }

  /**
   * Gets all restrictions from discovery service
   */
  async getRestrictions(query?: RuleQueryDto): Promise<RuleDefinition[]> {
    this.logger.log('Fetching restrictions from discovery service');
    try {
      const response = await firstValueFrom(
        this.microserviceClient.send(DeviceTopics.GET_RESTRICTIONS, query || {}),
      );
      return response;
    } catch (error) {
      this.logger.error('Error fetching restrictions', error);
      throw error;
    }
  }

  /**
   * Gets all rules (policies + restrictions)
   */
  async getAllRules(query?: RuleQueryDto): Promise<RuleDefinition[]> {
    this.logger.log('Fetching all rules (policies and restrictions)');
    
    const [policies, restrictions] = await Promise.all([
      this.getPolicies(query).catch(err => {
        this.logger.error('Error fetching policies', err);
        return [];
      }),
      this.getRestrictions(query).catch(err => {
        this.logger.error('Error fetching restrictions', err);
        return [];
      }),
    ]);

    return [...policies, ...restrictions];
  }
}
