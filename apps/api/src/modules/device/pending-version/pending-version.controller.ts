import { Controller, Get, Post, Body, Query, Logger } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PendingVersionService } from './pending-version.service';
import { 
  AcceptPendingVersionDto, 
  PendingVersionListDto, 
  RejectPendingVersionDto 
} from '@app/common/dto/discovery';
import { PendingVersionStatus } from '@app/common/database/entities/pending-version.entity';

@ApiTags('Pending Versions')
@ApiBearerAuth()
@Controller('pending-versions')
export class PendingVersionController {
  private readonly logger = new Logger(PendingVersionController.name);

  constructor(private readonly pendingVersionService: PendingVersionService) {}

  @Get()
  @ApiOperation({ 
    summary: 'List all pending versions',
    description: 'Returns a list of project versions that were reported by devices but do not exist in the system'
  })
  @ApiQuery({ name: 'status', enum: PendingVersionStatus, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false, description: 'Number of results to return (default: 100)' })
  @ApiQuery({ name: 'offset', type: Number, required: false, description: 'Offset for pagination (default: 0)' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of pending versions retrieved successfully', 
    type: PendingVersionListDto 
  })
  async listPendingVersions(
    @Query('status') status?: PendingVersionStatus,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number
  ): Promise<PendingVersionListDto> {
    this.logger.log(`Listing pending versions - status: ${status}, limit: ${limit}, offset: ${offset}`);
    return this.pendingVersionService.listPendingVersions({
      status,
      limit: limit ? Number(limit) : 100,
      offset: offset ? Number(offset) : 0
    });
  }

  @Post('accept')
  @ApiOperation({ 
    summary: 'Accept a pending version',
    description: 'Accepts a pending version and creates the project/version in the system. If the project does not exist, it will be created.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Version accepted successfully and will be created' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid request or version already processed' 
  })
  async acceptPendingVersion(
    @Body() dto: AcceptPendingVersionDto
  ): Promise<{ message: string }> {
    this.logger.log(`Accepting pending version: ${dto.projectName}@${dto.version}`);
    await this.pendingVersionService.acceptPendingVersion(dto);
    return { 
      message: `Version ${dto.projectName}@${dto.version} accepted and will be created${dto.isDraft ? ' as draft' : ''}` 
    };
  }

  @Post('reject')
  @ApiOperation({ 
    summary: 'Reject a pending version',
    description: 'Rejects a pending version. The version will be marked as rejected and will not be processed.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Version rejected successfully' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid request or version already processed' 
  })
  async rejectPendingVersion(
    @Body() dto: RejectPendingVersionDto
  ): Promise<{ message: string }> {
    this.logger.log(`Rejecting pending version: ${dto.projectName}@${dto.version}`);
    await this.pendingVersionService.rejectPendingVersion(dto);
    return { 
      message: `Version ${dto.projectName}@${dto.version} rejected` 
    };
  }
}
