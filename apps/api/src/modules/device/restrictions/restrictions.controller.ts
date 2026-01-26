import { Controller, Get, Post, Put, Delete, Body, Param, Query, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { CreateRestrictionDto, UpdateRuleDto, RestrictionQueryDto, CreateRuleFieldDto } from '@app/common/rules/dto';
import { RuleDefinition } from '@app/common/rules/types/rule.types';
import { RequireRole, ApiRole } from '@app/common';
import { RestrictionsService } from './restrictions.service';

@ApiTags('Restrictions')
@ApiBearerAuth()
@Controller('device/restrictions')
export class RestrictionsController {
  private readonly logger = new Logger(RestrictionsController.name);

  constructor(private readonly restrictionsService: RestrictionsService) {}

  /**
   * Create a new restriction
   */
  @Post()
  @RequireRole(ApiRole.CREATE_RESTRICTION)
  @ApiOperation({
    summary: 'Create a new restriction',
    description: 'Creates a new restriction (device/os-associated rule) in the discovery service',
  })
  @ApiBody({ type: CreateRestrictionDto })
  @ApiOkResponse({ description: 'Restriction created successfully', type: Object })
  async createRestriction(@Body() createRestrictionDto: CreateRestrictionDto): Promise<RuleDefinition> {
    this.logger.log('REST: Creating restriction');
    return this.restrictionsService.createRestriction(createRestrictionDto);
  }


  /**
   * Get all restrictions
   */
  @Get()
  @RequireRole(ApiRole.LIST_RESTRICTIONS)
  @ApiOperation({
    summary: 'Get all restrictions',
    description: 'Fetches all restrictions (device/os-associated rules) from the discovery service',
  })
  @ApiOkResponse({ description: 'List of restrictions', type: [Object] })
  async getRestrictions(@Query() query: RestrictionQueryDto): Promise<RuleDefinition[]> {
    this.logger.log('REST: Getting restrictions');
    return this.restrictionsService.getRestrictions(query);
  }

  /**
   * Get a specific restriction by ID
   */
  @Get(':id')
  @RequireRole(ApiRole.VIEW_RESTRICTION)
  @ApiOperation({
    summary: 'Get restriction by ID',
    description: 'Fetches a specific restriction by its ID',
  })
  @ApiParam({ name: 'id', description: 'Restriction ID' })
  @ApiOkResponse({ description: 'Restriction details', type: Object })
  async getRestriction(@Param('id') id: string): Promise<RuleDefinition> {
    this.logger.log(`REST: Getting restriction ${id}`);
    return this.restrictionsService.getRestriction(id);
  }

  /**
   * Update a restriction
   */
  @Put(':id')
  @RequireRole(ApiRole.UPDATE_RESTRICTION)
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
    return this.restrictionsService.updateRestriction(id, updateRuleDto);
  }

  /**
   * Delete a restriction
   */
  @Delete(':id')
  @RequireRole(ApiRole.DELETE_RESTRICTION)
  @ApiOperation({
    summary: 'Delete a restriction',
    description: 'Deletes an existing restriction',
  })
  @ApiParam({ name: 'id', description: 'Restriction ID' })
  @ApiOkResponse({ description: 'Restriction deleted successfully' })
  async deleteRestriction(@Param('id') id: string): Promise<void> {
    this.logger.log(`REST: Deleting restriction ${id}`);
    return this.restrictionsService.deleteRestriction(id);
  }

}
