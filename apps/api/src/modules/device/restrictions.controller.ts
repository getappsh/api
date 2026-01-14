import { Controller, Get, Post, Put, Delete, Body, Param, Query, Logger, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { MicroserviceClient, MicroserviceName } from '@app/common/microservice-client';
import { DeviceTopics } from '@app/common/microservice-client/topics';
import { firstValueFrom } from 'rxjs';

// Import only DTOs, not the full module
import { CreateRestrictionDto, UpdateRuleDto, RestrictionQueryDto, CreateRuleFieldDto } from '@app/common/rules/dto';
import { RuleDefinition } from '@app/common/rules/types/rule.types';

@ApiTags('Restrictions')
@ApiBearerAuth()
@Controller('device/restrictions')
export class RestrictionsController {
  private readonly logger = new Logger(RestrictionsController.name);

  constructor(
    @Inject(MicroserviceName.DEVICE_SERVICE) private readonly deviceClient: MicroserviceClient
  ) {}

  /**
   * Create a new restriction
   */
  @Post()
  @ApiOperation({
    summary: 'Create a new restriction',
    description: 'Creates a new restriction (device/os-associated rule) in the discovery service',
  })
  @ApiBody({ type: CreateRestrictionDto })
  @ApiOkResponse({ description: 'Restriction created successfully', type: Object })
  async createRestriction(@Body() createRestrictionDto: CreateRestrictionDto): Promise<RuleDefinition> {
    this.logger.log('REST: Creating restriction');
    return firstValueFrom(
      this.deviceClient.send(DeviceTopics.CREATE_RESTRICTION, createRestrictionDto),
    );
  }


  /**
   * Get all restrictions
   */
  @Get()
  @ApiOperation({
    summary: 'Get all restrictions',
    description: 'Fetches all restrictions (device/os-associated rules) from the discovery service',
  })
  @ApiOkResponse({ description: 'List of restrictions', type: [Object] })
  async getRestrictions(@Query() query: RestrictionQueryDto): Promise<RuleDefinition[]> {
    this.logger.log('REST: Getting restrictions');
    return firstValueFrom(
      this.deviceClient.send(DeviceTopics.GET_RESTRICTIONS, query || {}),
    );
  }

  /**
   * Get a specific restriction by ID
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get restriction by ID',
    description: 'Fetches a specific restriction by its ID',
  })
  @ApiParam({ name: 'id', description: 'Restriction ID' })
  @ApiOkResponse({ description: 'Restriction details', type: Object })
  async getRestriction(@Param('id') id: string): Promise<RuleDefinition> {
    this.logger.log(`REST: Getting restriction ${id}`);
    return firstValueFrom(
      this.deviceClient.send(DeviceTopics.GET_RESTRICTION, id),
    );
  }

  /**
   * Update a restriction
   */
  @Put(':id')
  @ApiOperation({
    summary: 'Update a restriction',
    description: 'Updates an existing restriction. Version is auto-incremented when rule is modified.',
  })
  @ApiParam({ name: 'id', description: 'Restriction ID' })
  @ApiBody({ type: UpdateRuleDto })
  @ApiOkResponse({ description: 'Restriction updated successfully', type: Object })
  async updateRestriction(
    @Param('id') id: string,
    @Body() updateRuleDto: UpdateRuleDto,
  ): Promise<RuleDefinition> {
    this.logger.log(`REST: Updating restriction ${id}`);
    return firstValueFrom(
      this.deviceClient.send(DeviceTopics.UPDATE_RESTRICTION, { id, data: updateRuleDto }),
    );
  }

  /**
   * Delete a restriction
   */
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a restriction',
    description: 'Deletes an existing restriction',
  })
  @ApiParam({ name: 'id', description: 'Restriction ID' })
  @ApiOkResponse({ description: 'Restriction deleted successfully' })
  async deleteRestriction(@Param('id') id: string): Promise<void> {
    this.logger.log(`REST: Deleting restriction ${id}`);
    return firstValueFrom(
      this.deviceClient.send(DeviceTopics.DELETE_RESTRICTION, id),
    );
  }

  /**
   * Get available rule fields
   */
  @Get('fields/available')
  @ApiOperation({
    summary: 'Get available rule fields',
    description: 'Fetches all available fields that can be used in rules',
  })
  @ApiOkResponse({ description: 'List of available fields', type: [Object] })
  async getAvailableFields() {
    this.logger.log('REST: Getting available rule fields');
    return firstValueFrom(
      this.deviceClient.send(DeviceTopics.GET_RULE_FIELDS, {}),
    );
  }

  /**
   * Add a new rule field
   */
  @Post('fields')
  @ApiOperation({
    summary: 'Add a new rule field',
    description: 'Adds a new field that can be used in rules',
  })
  @ApiBody({ type: CreateRuleFieldDto })
  @ApiOkResponse({ description: 'Field added successfully', type: Object })
  async addRuleField(@Body() createFieldDto: CreateRuleFieldDto) {
    this.logger.log('REST: Adding rule field');
    return firstValueFrom(
      this.deviceClient.send(DeviceTopics.ADD_RULE_FIELD, createFieldDto),
    );
  }

  /**
   * Remove a rule field
   */
  @Delete('fields/:name')
  @ApiOperation({
    summary: 'Remove a rule field',
    description: 'Removes a field from the available fields list',
  })
  @ApiParam({ name: 'name', description: 'Field name (e.g., $.battery.level)' })
  @ApiOkResponse({ description: 'Field removed successfully' })
  async removeRuleField(@Param('name') name: string) {
    this.logger.log(`REST: Removing rule field ${name}`);
    return firstValueFrom(
      this.deviceClient.send(DeviceTopics.REMOVE_RULE_FIELD, name),
    );
  }
}
