import { Controller, Get, Query, Logger, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RulesService } from './rules.service';
import { UserContextInterceptor } from '../../utils/interceptor/user-context.interceptor';

// Import only DTOs and types, not the full module
import { RuleQueryDto, RestrictionQueryDto, CombinedRulesQueryDto } from '@app/common/rules/dto';
import { RuleDefinition } from '@app/common/rules/types/rule.types';

@ApiTags('Rules')
@ApiBearerAuth()
@UseInterceptors(UserContextInterceptor)
@Controller('rules')
export class RulesController {
  private readonly logger = new Logger(RulesController.name);

  constructor(private readonly rulesService: RulesService) {}

  /**
   * Get all policies (release-associated rules)
   */
  @Get('policies')
  @ApiOperation({
    summary: 'Get all policies',
    description: 'Fetches all policies (release-associated rules) from the upload service',
  })
  @ApiOkResponse({ description: 'List of policies', type: [Object] })
  async getPolicies(@Query() query: RuleQueryDto): Promise<RuleDefinition[]> {
    this.logger.log('REST: Getting policies');
    return this.rulesService.getPolicies(query);
  }

  /**
   * Get all restrictions (device/os-associated rules)
   */
  @Get('restrictions')
  @ApiOperation({
    summary: 'Get all restrictions',
    description: 'Fetches all restrictions (device/os-associated rules) from the discovery service',
  })
  @ApiOkResponse({ description: 'List of restrictions', type: [Object] })
  async getRestrictions(@Query() query: RestrictionQueryDto): Promise<RuleDefinition[]> {
    this.logger.log('REST: Getting restrictions');
    return this.rulesService.getRestrictions(query);
  }

  /**
   * Get all rules (policies + restrictions)
   * Queries both microservices and combines results
   */
  @Get()
  @ApiOperation({
    summary: 'Get all rules',
    description: 'Fetches all rules (both policies and restrictions) from upload and discovery services. Supports filtering by type to query only policies or restrictions.',
  })
  @ApiOkResponse({ description: 'List of all rules', type: [Object] })
  async getAllRules(@Query() query: CombinedRulesQueryDto): Promise<RuleDefinition[]> {
    this.logger.log('REST: Getting all rules');
    return this.rulesService.getAllRules(query);
  }
}
