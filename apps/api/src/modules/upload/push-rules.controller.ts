import { Controller, Get, Post, Put, Delete, Body, Param, Query, Logger, UseInterceptors } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { CreatePushRuleDto, UpdateRuleDto, PushRuleQueryDto, CreateRuleFieldDto, PushRuleDefinitionDto, PushRuleFieldDefinitionDto } from '@app/common/rules/dto';
import { RequireRole, ApiRole } from '@app/common';
import { UserContextInterceptor } from '../../utils/interceptor/user-context.interceptor';
import { PushRulesService } from './push-rules.service';

@ApiTags('Push Rules')
@ApiBearerAuth()
@UseInterceptors(UserContextInterceptor)
@ApiUnauthorizedResponse({ description: 'Missing or invalid authentication token' })
@ApiForbiddenResponse({ description: 'Authenticated user lacks the required role' })
@Controller('upload/push-rules')
export class PushRulesController {
  private readonly logger = new Logger(PushRulesController.name);

  constructor(private readonly pushRulesService: PushRulesService) {}

  /**
   * Create a new push rule
   */
  @Post()
  @RequireRole(ApiRole.PUSH_RELEASE)
  @ApiOperation({
    summary: 'Create a new push rule',
    description:
      'Creates a new push rule associated with one or more releases. ' +
      'Push rules may reference push-only fields that are unavailable in policies or restrictions.',
  })
  @ApiBody({ type: CreatePushRuleDto })
  @ApiCreatedResponse({ description: 'Push rule created successfully', type: PushRuleDefinitionDto })
  async createPushRule(@Body() createPushRuleDto: CreatePushRuleDto): Promise<PushRuleDefinitionDto> {
    this.logger.log('REST: Creating push rule');
    return this.pushRulesService.createPushRule(createPushRuleDto);
  }

  /**
   * Get all push rules
   */
  @Get()
  @RequireRole(ApiRole.PUSH_RELEASE)
  @ApiOperation({
    summary: 'List push rules',
    description:
      'Returns all push rules the authenticated user has access to. ' +
      'Results can be filtered by release, active status, or project.',
  })
  @ApiOkResponse({ description: 'List of push rules', type: [PushRuleDefinitionDto] })
  async getPushRules(@Query() query: PushRuleQueryDto): Promise<PushRuleDefinitionDto[]> {
    this.logger.log('REST: Getting push rules');
    return this.pushRulesService.getPushRules(query);
  }

  /**
   * Get available push rule fields — must come before :id to avoid route collision
   */
  @Get('fields/available')
  @RequireRole(ApiRole.PUSH_RELEASE)
  @ApiOperation({
    summary: 'List available push rule fields',
    description:
      'Returns all rule fields that can be referenced inside push rule conditions, ' +
      'including push-only fields that are excluded from the standard policy fields endpoint.',
  })
  @ApiOkResponse({ description: 'List of available push rule fields', type: [PushRuleFieldDefinitionDto] })
  async getPushRuleFields(): Promise<PushRuleFieldDefinitionDto[]> {
    this.logger.log('REST: Getting push rule fields');
    return this.pushRulesService.getPushRuleFields();
  }

  /**
   * Add a new push-only rule field
   */
  @Post('fields')
  @RequireRole(ApiRole.PUSH_RELEASE)
  @ApiOperation({
    summary: 'Add a push-only rule field',
    description:
      'Registers a new field that is exclusively available in push rules. ' +
      'The field will be stored with isPushOnly=true and will not appear in the standard rule fields list.',
  })
  @ApiBody({ type: CreateRuleFieldDto })
  @ApiCreatedResponse({ description: 'Push-only field added successfully', type: PushRuleFieldDefinitionDto })
  async addPushRuleField(@Body() createFieldDto: CreateRuleFieldDto): Promise<PushRuleFieldDefinitionDto> {
    this.logger.log('REST: Adding push rule field');
    return this.pushRulesService.addPushRuleField(createFieldDto);
  }

  /**
   * Remove a push-only rule field
   */
  @Delete('fields/:name')
  @RequireRole(ApiRole.PUSH_RELEASE)
  @ApiOperation({
    summary: 'Remove a push rule field',
    description: 'Removes a field from the push rule fields registry by its JSONPath name.',
  })
  @ApiParam({ name: 'name', description: 'JSONPath field name to remove (e.g., $.push.topic)', example: '$.push.topic' })
  @ApiOkResponse({ description: 'Field removed successfully', schema: { properties: { success: { type: 'boolean' }, message: { type: 'string' } } } })
  @ApiNotFoundResponse({ description: 'Field not found' })
  async removePushRuleField(@Param('name') name: string) {
    this.logger.log(`REST: Removing push rule field ${name}`);
    return this.pushRulesService.removePushRuleField(name);
  }

  /**
   * Get a specific push rule by ID
   */
  @Get(':id')
  @RequireRole(ApiRole.PUSH_RELEASE)
  @ApiOperation({
    summary: 'Get push rule by ID',
    description: 'Fetches the full definition of a specific push rule including its release associations.',
  })
  @ApiParam({ name: 'id', description: 'Push rule UUID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiOkResponse({ description: 'Push rule details', type: PushRuleDefinitionDto })
  @ApiNotFoundResponse({ description: 'Push rule not found' })
  async getPushRule(@Param('id') id: string): Promise<PushRuleDefinitionDto> {
    this.logger.log(`REST: Getting push rule ${id}`);
    return this.pushRulesService.getPushRule(id);
  }

  /**
   * Update a push rule
   */
  @Put(':id')
  @RequireRole(ApiRole.PUSH_RELEASE)
  @ApiOperation({
    summary: 'Update a push rule',
    description:
      'Updates an existing push rule. All fields are optional — only supplied fields are changed. ' +
      'The version number is auto-incremented whenever the rule condition object is modified.',
  })
  @ApiParam({ name: 'id', description: 'Push rule UUID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiBody({ type: UpdateRuleDto })
  @ApiOkResponse({ description: 'Push rule updated successfully', type: PushRuleDefinitionDto })
  @ApiNotFoundResponse({ description: 'Push rule not found' })
  async updatePushRule(
    @Param('id') id: string,
    @Body() updateRuleDto: UpdateRuleDto,
  ): Promise<PushRuleDefinitionDto> {
    this.logger.log(`REST: Updating push rule ${id}`);
    return this.pushRulesService.updatePushRule(id, updateRuleDto);
  }

  /**
   * Delete a push rule
   */
  @Delete(':id')
  @RequireRole(ApiRole.PUSH_RELEASE)
  @ApiOperation({
    summary: 'Delete a push rule',
    description: 'Permanently deletes a push rule and removes it from all associated releases.',
  })
  @ApiParam({ name: 'id', description: 'Push rule UUID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiOkResponse({ description: 'Push rule deleted successfully', schema: { properties: { success: { type: 'boolean' }, message: { type: 'string' } } } })
  @ApiNotFoundResponse({ description: 'Push rule not found' })
  async deletePushRule(@Param('id') id: string): Promise<void> {
    this.logger.log(`REST: Deleting push rule ${id}`);
    return this.pushRulesService.deletePushRule(id);
  }
}

