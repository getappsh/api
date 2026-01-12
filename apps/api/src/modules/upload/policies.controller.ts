import { Controller, Get, Post, Put, Delete, Body, Param, Query, Logger, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { MicroserviceClient, MicroserviceName } from '@app/common/microservice-client';
import { UploadTopics } from '@app/common/microservice-client/topics';
import { firstValueFrom } from 'rxjs';

// Import only DTOs, not the full module
import { CreateRuleDto, UpdateRuleDto, RuleQueryDto, CreateRuleFieldDto } from '@app/common/rules/dto';
import { RuleDefinition } from '@app/common/rules/types/rule.types';

@ApiTags('Policies')
@ApiBearerAuth()
@Controller('upload/policies')
export class PoliciesController {
  private readonly logger = new Logger(PoliciesController.name);

  constructor(@Inject(MicroserviceName.UPLOAD_SERVICE) private readonly microserviceClient: MicroserviceClient) {}

  /**
   * Create a new policy
   */
  @Post()
  @ApiOperation({
    summary: 'Create a new policy',
    description: 'Creates a new policy (release-associated rule) in the upload service',
  })
  @ApiBody({ type: CreateRuleDto })
  @ApiOkResponse({ description: 'Policy created successfully', type: Object })
  async createPolicy(@Body() createRuleDto: CreateRuleDto): Promise<RuleDefinition> {
    this.logger.log('REST: Creating policy');
    return firstValueFrom(
      this.microserviceClient.send('getapp-upload.create-policy', createRuleDto),
    );
  }

  /**
   * Get all policies
   */
  @Get()
  @ApiOperation({
    summary: 'Get all policies',
    description: 'Fetches all policies (release-associated rules) from the upload service',
  })
  @ApiOkResponse({ description: 'List of policies', type: [Object] })
  async getPolicies(@Query() query: RuleQueryDto): Promise<RuleDefinition[]> {
    this.logger.log('REST: Getting policies');
    return firstValueFrom(
      this.microserviceClient.send(UploadTopics.GET_POLICIES, query || {}),
    );
  }

  /**
   * Get a specific policy by ID
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get policy by ID',
    description: 'Fetches a specific policy by its ID',
  })
  @ApiParam({ name: 'id', description: 'Policy ID' })
  @ApiOkResponse({ description: 'Policy details', type: Object })
  async getPolicy(@Param('id') id: string): Promise<RuleDefinition> {
    this.logger.log(`REST: Getting policy ${id}`);
    return firstValueFrom(
      this.microserviceClient.send('getapp-upload.get-policy', id),
    );
  }

  /**
   * Update a policy
   */
  @Put(':id')
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
    return firstValueFrom(
      this.microserviceClient.send('getapp-upload.update-policy', { id, data: updateRuleDto }),
    );
  }

  /**
   * Delete a policy
   */
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a policy',
    description: 'Deletes an existing policy',
  })
  @ApiParam({ name: 'id', description: 'Policy ID' })
  @ApiOkResponse({ description: 'Policy deleted successfully' })
  async deletePolicy(@Param('id') id: string): Promise<void> {
    this.logger.log(`REST: Deleting policy ${id}`);
    return firstValueFrom(
      this.microserviceClient.send('getapp-upload.delete-policy', id),
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
      this.microserviceClient.send('getapp-upload.get-rule-fields', {}),
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
      this.microserviceClient.send('getapp-upload.add-rule-field', createFieldDto),
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
      this.microserviceClient.send('getapp-upload.remove-rule-field', name),
    );
  }
}
