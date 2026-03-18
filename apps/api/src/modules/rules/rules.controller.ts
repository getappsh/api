import { Controller, Get, Post, Body, Query, Logger, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RequireAnyRole, ApiRole } from '@app/common';
import { RulesService } from './rules.service';
import { UserContextInterceptor } from '../../utils/interceptor/user-context.interceptor';

import { CombinedRulesQueryDto, EvaluateRuleDto } from '@app/common/rules/dto';
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
  @ApiOkResponse({ description: 'Devices matching the rule, plus release context for policies' })
  async evaluateRule(@Body() dto: EvaluateRuleDto) {
    this.logger.log('REST: Evaluating rule');
    return this.rulesService.evaluateRule(dto);
  }
}
