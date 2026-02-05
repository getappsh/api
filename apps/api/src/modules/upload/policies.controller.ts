import { Controller, Get, Post, Put, Delete, Body, Param, Query, Logger, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { CreatePolicyDto, UpdateRuleDto, PolicyQueryDto, CreateRuleFieldDto } from '@app/common/rules/dto';
import { RuleDefinition } from '@app/common/rules/types/rule.types';
import { RequireRole, ApiRole } from '@app/common';
import { UserContextInterceptor } from '../../utils/interceptor/user-context.interceptor';
import { PoliciesService } from './policies.service';

@ApiTags('Policies')
@ApiBearerAuth()
@UseInterceptors(UserContextInterceptor)
@Controller('upload/policies')
export class PoliciesController {
  private readonly logger = new Logger(PoliciesController.name);

  constructor(private readonly policiesService: PoliciesService) {}

  /**
   * Create a new policy
   */
  @Post()
  @RequireRole(ApiRole.CREATE_POLICY)
  @ApiOperation({
    summary: 'Create a new policy',
    description: 'Creates a new policy (release-associated rule) in the upload service',
  })
  @ApiBody({ type: CreatePolicyDto })
  @ApiOkResponse({ description: 'Policy created successfully', type: Object })
  async createPolicy(@Body() createPolicyDto: CreatePolicyDto): Promise<RuleDefinition> {
    this.logger.log('REST: Creating policy');
    return this.policiesService.createPolicy(createPolicyDto);
  }

  /**
   * Get all policies
   */
  @Get()
  @RequireRole(ApiRole.LIST_POLICIES)
  @ApiOperation({
    summary: 'Get all policies',
    description: 'Fetches all policies (release-associated rules) from the upload service',
  })
  @ApiOkResponse({ description: 'List of policies', type: [Object] })
  async getPolicies(@Query() query: PolicyQueryDto): Promise<RuleDefinition[]> {
    this.logger.log('REST: Getting policies');
    return this.policiesService.getPolicies(query);
  }

  /**
   * Get a specific policy by ID
   */
  @Get(':id')
  @RequireRole(ApiRole.VIEW_POLICY)
  @ApiOperation({
    summary: 'Get policy by ID',
    description: 'Fetches a specific policy by its ID',
  })
  @ApiParam({ name: 'id', description: 'Policy ID' })
  @ApiOkResponse({ description: 'Policy details', type: Object })
  async getPolicy(@Param('id') id: string): Promise<RuleDefinition> {
    this.logger.log(`REST: Getting policy ${id}`);
    return this.policiesService.getPolicy(id);
  }

  /**
   * Update a policy
   */
  @Put(':id')
  @RequireRole(ApiRole.UPDATE_POLICY)
  @ApiOperation({
    summary: 'Update a policy',
    description: 'Updates an existing policy. Version is auto-incremented when rule is modified.',
  })
  @ApiParam({ name: 'id', description: 'Policy ID' })
  @ApiBody({ type: UpdateRuleDto })
  @ApiOkResponse({ description: 'Policy updated successfully', type: Object })
  async updatePolicy(
    @Param('id') id: string,
    @Body() updateRuleDto: UpdateRuleDto,
  ): Promise<RuleDefinition> {
    this.logger.log(`REST: Updating policy ${id}`);
    return this.policiesService.updatePolicy(id, updateRuleDto);
  }

  /**
   * Delete a policy
   */
  @Delete(':id')
  @RequireRole(ApiRole.DELETE_POLICY)
  @ApiOperation({
    summary: 'Delete a policy',
    description: 'Deletes an existing policy',
  })
  @ApiParam({ name: 'id', description: 'Policy ID' })
  @ApiOkResponse({ description: 'Policy deleted successfully' })
  async deletePolicy(@Param('id') id: string): Promise<void> {
    this.logger.log(`REST: Deleting policy ${id}`);
    return this.policiesService.deletePolicy(id);
  }

  /**
   * Get available rule fields
   * Fields are managed by the upload service
   */
  @Get('fields/available')
  @RequireRole(ApiRole.VIEW_POLICY)
  @ApiOperation({
    summary: 'Get available rule fields',
    description: 'Fetches all available fields that can be used in rules from the upload service',
  })
  @ApiOkResponse({ description: 'List of available fields', type: [Object] })
  async getAvailableFields() {
    this.logger.log('REST: Getting available rule fields');
    return this.policiesService.getAvailableFields();
  }

  /**
   * Add a new rule field
   * Managed by the upload service
   */
  @Post('fields')
  @RequireRole(ApiRole.UPDATE_POLICY)
  @ApiOperation({
    summary: 'Add a new rule field',
    description: 'Adds a new field that can be used in rules (via upload service)',
  })
  @ApiBody({ type: CreateRuleFieldDto })
  @ApiOkResponse({ description: 'Field added successfully', type: Object })
  async addRuleField(@Body() createFieldDto: CreateRuleFieldDto) {
    this.logger.log('REST: Adding rule field');
    return this.policiesService.addRuleField(createFieldDto);
  }

  /**
   * Remove a rule field
   * Managed by the upload service
   */
  @Delete('fields/:name')
  @RequireRole(ApiRole.UPDATE_POLICY)
  @ApiOperation({
    summary: 'Remove a rule field',
    description: 'Removes a field from the available fields list (via upload service)',
  })
  @ApiParam({ name: 'name', description: 'Field name (e.g., $.battery.level)' })
  @ApiOkResponse({ description: 'Field removed successfully' })
  async removeRuleField(@Param('name') name: string) {
    this.logger.log(`REST: Removing rule field ${name}`);
    return this.policiesService.removeRuleField(name);
  }
}
