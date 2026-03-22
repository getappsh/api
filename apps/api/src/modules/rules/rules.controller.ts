import { Controller, Get, Post, Body, Query, Logger, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RequireAnyRole, ApiRole } from '@app/common';
import { RulesService } from './rules.service';
import { UserContextInterceptor } from '../../utils/interceptor/user-context.interceptor';

import { CombinedRulesQueryDto, EvaluateRuleDto, EvaluateRuleResultDto, DeviceContextDto, GetDeviceContextDto } from '@app/common/rules/dto';
import { RuleDefinition } from '@app/common/rules/types/rule.types';

@ApiTags('Rules')
@ApiBearerAuth()
@UseInterceptors(UserContextInterceptor)
@Controller('rules')
export class RulesController {
  private readonly logger = new Logger(RulesController.name);

  constructor(private readonly rulesService: RulesService) {}

  /**
   * Get all rules (policies + restrictions)
   * Queries both microservices and combines results
   */
  @Get()
  @RequireAnyRole([ApiRole.VIEW_POLICY, ApiRole.VIEW_RESTRICTION])
  @ApiOperation({
    summary: 'Get all rules',
    description: 'Fetches all rules (both policies and restrictions) from upload and discovery services. Supports filtering by type to query only policies or restrictions.',
  })
  @ApiOkResponse({ description: 'List of all rules', type: [Object] })
  async getAllRules(@Query() query: CombinedRulesQueryDto): Promise<RuleDefinition[]> {
    this.logger.log('REST: Getting all rules');
    return this.rulesService.getAllRules(query);
  }

  /**
   * Evaluate any rule (restriction or policy) against all devices.
   * Supply either a saved ruleId or an inline rule JSON.
   * For policy rules the response also includes the releases the rule is attached to.
   */
  @Post('evaluate')
  @RequireAnyRole([ApiRole.VIEW_POLICY, ApiRole.VIEW_RESTRICTION])
  @ApiOperation({
    summary: 'Evaluate a rule against all devices',
    description:
      'Tests a rule against every device using its latest discovery data. ' +
      'Supply either a saved ruleId or an inline rule JSON. ' +
      'For saved policy rules the response additionally contains the releases the policy is attached to.',
  })
  @ApiOkResponse({ description: 'Devices matching the rule, plus release context for policies', type: EvaluateRuleResultDto })
  async evaluateRule(@Body() dto: EvaluateRuleDto) {
    this.logger.log('REST: Evaluating rule');
    return this.rulesService.evaluateRule(dto);
  }

  /**
   * Get the evaluation context for a specific device.
   * Returns the same context structure that is built internally during rule evaluation,
   * along with the ID of the discovery message it was derived from.
   */
  @Get('device-context')
  @RequireAnyRole([ApiRole.VIEW_POLICY, ApiRole.VIEW_RESTRICTION])
  @ApiOperation({
    summary: 'Get device evaluation context',
    description:
      'Returns the evaluation context built from the latest discovery message for a device. ' +
      'Supply either deviceId (returns the latest message for that device) or discoveryMessageId ' +
      '(returns the context for that exact message, deviceId not required). ' +
      'The context structure is identical to what is used internally during rule evaluation.',
  })
  @ApiOkResponse({ description: 'Device context and the discovery message it was built from', type: DeviceContextDto })
  async getDeviceContext(@Query() dto: GetDeviceContextDto) {
    this.logger.log(`REST: Getting device context`);
    return this.rulesService.getDeviceContext(dto);
  }
}
