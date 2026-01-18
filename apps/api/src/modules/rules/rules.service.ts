import { Injectable, Logger, Inject } from '@nestjs/common';
import { MicroserviceClient, MicroserviceName } from '@app/common/microservice-client';
import { UploadTopics, DeviceTopics } from '@app/common/microservice-client/topics';
import { firstValueFrom } from 'rxjs';

// Import only DTOs and types, not the full module
import { RuleQueryDto, RestrictionQueryDto, CombinedRulesQueryDto } from '@app/common/rules/dto';
import { RuleDefinition } from '@app/common/rules/types/rule.types';
import { RuleType } from '@app/common/rules/enums/rule.enums';

@Injectable()
export class RulesService {
  private readonly logger = new Logger(RulesService.name);

  constructor(
    @Inject(MicroserviceName.UPLOAD_SERVICE) private readonly uploadClient: MicroserviceClient,
    @Inject(MicroserviceName.DEVICE_SERVICE) private readonly deviceClient: MicroserviceClient,
  ) {}

  /**
   * Gets all policies from upload service
   */
  async getPolicies(query?: RuleQueryDto): Promise<RuleDefinition[]> {
    this.logger.log('Fetching policies from upload service');
    try {
      const response = await firstValueFrom(
        this.uploadClient.send(UploadTopics.GET_POLICIES, query || {}),
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
  async getRestrictions(query?: RestrictionQueryDto): Promise<RuleDefinition[]> {
    this.logger.log('Fetching restrictions from discovery service');
    try {
      const response = await firstValueFrom(
        this.deviceClient.send(DeviceTopics.GET_RESTRICTIONS, query || {}),
      );
      return response;
    } catch (error) {
      this.logger.error('Error fetching restrictions', error);
      throw error;
    }
  }

  /**
   * Gets all rules (policies + restrictions) based on the query
   * If type is specified, only fetches that type
   * Otherwise fetches both types
   */
  async getAllRules(query?: CombinedRulesQueryDto): Promise<RuleDefinition[]> {
    this.logger.log('Fetching all rules (policies and restrictions)');
    
    const { type, ...baseQuery } = query || {};

    // If type is specified, only fetch that type
    if (type === RuleType.POLICY) {
      const policyQuery: RuleQueryDto = {
        projectIdentifier: baseQuery.projectIdentifier,
        isActive: baseQuery.isActive,
        releaseId: baseQuery.releaseId,
      };
      return this.getPolicies(policyQuery).catch(err => {
        this.logger.error('Error fetching policies', err);
        return [];
      });
    }

    if (type === RuleType.RESTRICTION) {
      const restrictionQuery: RestrictionQueryDto = {
        projectIdentifier: baseQuery.projectIdentifier,
        isActive: baseQuery.isActive,
        deviceTypeName: baseQuery.deviceTypeName,
        deviceId: baseQuery.deviceId,
        osType: baseQuery.osType,
      };
      return this.getRestrictions(restrictionQuery).catch(err => {
        this.logger.error('Error fetching restrictions', err);
        return [];
      });
    }

    // If no type is specified, fetch both
    const policyQuery: RuleQueryDto = {
      projectIdentifier: baseQuery.projectIdentifier,
      isActive: baseQuery.isActive,
      releaseId: baseQuery.releaseId,
    };

    const restrictionQuery: RestrictionQueryDto = {
      projectIdentifier: baseQuery.projectIdentifier,
      isActive: baseQuery.isActive,
      deviceTypeName: baseQuery.deviceTypeName,
      deviceId: baseQuery.deviceId,
      osType: baseQuery.osType,
    };

    const [policies, restrictions] = await Promise.all([
      this.getPolicies(policyQuery).catch(err => {
        this.logger.error('Error fetching policies', err);
        return [];
      }),
      this.getRestrictions(restrictionQuery).catch(err => {
        this.logger.error('Error fetching restrictions', err);
        return [];
      }),
    ]);

    return [...policies, ...restrictions];
  }
}
