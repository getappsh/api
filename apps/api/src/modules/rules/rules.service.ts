import { Injectable, Logger, Inject } from '@nestjs/common';
import { MicroserviceClient, MicroserviceName } from '@app/common/microservice-client';
import { UploadTopics, DeviceTopics } from '@app/common/microservice-client/topics';
import { firstValueFrom } from 'rxjs';
import { ClsService } from 'nestjs-cls';

// Import only DTOs and types, not the full module
import { PolicyQueryDto, RestrictionQueryDto, CombinedRulesQueryDto, EvaluateRuleDto, EvaluateRuleResultDto, DeviceContextDto, GetDeviceContextDto } from '@app/common/rules/dto';
import { RuleDefinition } from '@app/common/rules/types/rule.types';
import { RuleType } from '@app/common/rules/enums/rule.enums';

@Injectable()
export class RulesService {
  private readonly logger = new Logger(RulesService.name);

  constructor(
    @Inject(MicroserviceName.UPLOAD_SERVICE) private readonly uploadClient: MicroserviceClient,
    @Inject(MicroserviceName.DEVICE_SERVICE) private readonly deviceClient: MicroserviceClient,
    private readonly clsService: ClsService,
  ) {}

  /**
   * Gets all policies from upload service
   */
  async getPolicies(query?: PolicyQueryDto): Promise<RuleDefinition[]> {
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
   * Evaluates a rule (restriction or policy) against all devices.
   * Delegates entirely to the discovery service.
   */
  async evaluateRule(dto: EvaluateRuleDto): Promise<EvaluateRuleResultDto> {
    this.logger.log('Evaluating rule via discovery service');
    try {
      return await firstValueFrom(
        this.deviceClient.send(DeviceTopics.EVALUATE_RESTRICTION, dto),
      );
    } catch (error) {
      this.logger.error('Error evaluating rule', error);
      throw error;
    }
  }

  /**
   * Returns the evaluation context built from the latest discovery message for a device.
   */
  async getDeviceContext(dto: GetDeviceContextDto): Promise<DeviceContextDto> {
    this.logger.log(`Fetching device context`);
    try {
      return await firstValueFrom(
        this.deviceClient.send(DeviceTopics.GET_DEVICE_CONTEXT, dto),
      );
    } catch (error) {
      this.logger.error('Error fetching device context', error);
      throw error;
    }
  }

  /**
   * Gets all rules (policies + restrictions) based on the query
   * If type is specified, only fetches that type
   * Otherwise fetches both types
   * Throws error if any microservice fails to respond
   */
  async getAllRules(query?: CombinedRulesQueryDto): Promise<RuleDefinition[]> {
    this.logger.log('Fetching all rules (policies and restrictions)');
    
    const { type, ...baseQuery } = query || {};

    try {
      // If type is specified, only fetch that type
      if (type === RuleType.POLICY) {
        const policyQuery: PolicyQueryDto = {
          projectIdentifier: baseQuery.projectIdentifier,
          isActive: baseQuery.isActive,
          releaseId: baseQuery.releaseId,
        };
        return await this.getPolicies(policyQuery);
      }

      if (type === RuleType.RESTRICTION) {
        const restrictionQuery: RestrictionQueryDto = {
          projectIdentifier: baseQuery.projectIdentifier,
          isActive: baseQuery.isActive,
          deviceTypeName: baseQuery.deviceTypeName,
          deviceId: baseQuery.deviceId,
          osType: baseQuery.osType,
        };
        return await this.getRestrictions(restrictionQuery);
      }

      // If no type is specified, fetch both
      const policyQuery: PolicyQueryDto = {
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
        this.getPolicies(policyQuery),
        this.getRestrictions(restrictionQuery),
      ]);

      return [...policies, ...restrictions];
    } catch (error) {
      this.logger.error('Error fetching rules from microservices', error);
      throw error;
    }
  }
}
