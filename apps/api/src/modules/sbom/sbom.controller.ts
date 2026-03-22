import { Body, Controller, Delete, Get, Logger, Param, Post, Query, Redirect, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConflictResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { ApiRole, RequireRole } from '@app/common';
import { ScanStatusResponseDto } from '@app/common/dto/sbom';
import { SbomService, CreateScanPayload } from './sbom.service';

@ApiTags('SBOM')
@ApiBearerAuth()
@Controller('sbom')
export class SbomController {
  private readonly logger = new Logger(SbomController.name);

  constructor(private readonly sbomService: SbomService) {}

  @Post('scans')
  @RequireRole(ApiRole.CREATE_SBOM_SCAN)
  @ApiOperation({ summary: 'Queue a new SBOM scan for a docker image, binary file, or directory' })
  @ApiBody({ type: CreateScanPayload })
  @ApiCreatedResponse({ description: 'Scan queued successfully, returns scanId' })
  async requestScan(@Body() dto: CreateScanPayload) {
    return this.sbomService.requestScan(dto);
  }
  @Get('scans')
  @RequireRole(ApiRole.VIEW_SBOM_SCAN)
  @ApiOperation({ summary: 'List recent SBOM scan jobs' })
  @ApiOkResponse({ type: [ScanStatusResponseDto], description: 'Array of scan status objects' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async listScans(@Query('limit') limit?: number, @Query('offset') offset?: number) {
    return this.sbomService.listScans(limit, offset);
  }

  @Get('scans/:id')
  @RequireRole(ApiRole.VIEW_SBOM_SCAN)
  @ApiOperation({ summary: 'Get scan status and metadata by ID' })
  @ApiParam({ name: 'id', description: 'Scan job UUID' })
  @ApiOkResponse({ type: ScanStatusResponseDto, description: 'Scan status and metadata' })
  @ApiNotFoundResponse({ description: 'Scan not found' })
  async getScanStatus(@Param('id') id: string) {
    return this.sbomService.getScanStatus(id);
  }

  @Get('scans/:id/report')
  @RequireRole(ApiRole.VIEW_SBOM_SCAN)
  @ApiOperation({ summary: 'Get presigned download URL for a completed SBOM report' })
  @ApiParam({ name: 'id', description: 'Scan job UUID' })
  async getScanReportUrl(@Param('id') id: string, @Res() res: Response) {
    const result = await this.sbomService.getScanResult(id);
    res.redirect(302, result.url);
  }

  @Delete('scans/:id')
  @RequireRole(ApiRole.DELETE_SBOM_SCAN)
  @ApiOperation({ summary: 'Delete a scan by ID. Cancels it if still queued.' })
  @ApiParam({ name: 'id', description: 'Scan job UUID' })
  async deleteScan(@Param('id') id: string) {
    return this.sbomService.deleteScan(id);
  }

  @Post('scans/:id/retry')
  @RequireRole(ApiRole.RETRY_SBOM_SCAN)
  @ApiOperation({
    summary: 'Retry a failed or completed SBOM scan',
    description:
      'Re-queues the scan under the same ID. For file-based scans that originated ' +
      'from a MinIO upload, a fresh presigned download URL is automatically regenerated ' +
      'from the stored source object key so expired links are never reused.',
  })
  @ApiParam({ name: 'id', description: 'Scan job UUID to retry' })
  @ApiCreatedResponse({ description: 'Scan re-queued successfully, returns scanId and status' })
  @ApiNotFoundResponse({ description: 'Scan not found' })
  @ApiConflictResponse({ description: 'Scan is already queued or running' })
  async retryScan(@Param('id') id: string) {
    return this.sbomService.retryScan(id);
  }
}
