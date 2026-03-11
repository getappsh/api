import { Body, Controller, Delete, Get, Logger, Param, Post, Query, Redirect, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConflictResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { SbomService, CreateScanPayload } from './sbom.service';

@ApiTags('SBOM')
@ApiBearerAuth()
@Controller('sbom')
export class SbomController {
  private readonly logger = new Logger(SbomController.name);

  constructor(private readonly sbomService: SbomService) {}

  @Post('scans')
  @ApiOperation({ summary: 'Queue a new SBOM scan for a docker image, binary file, or directory' })
  @ApiBody({ type: CreateScanPayload })
  @ApiCreatedResponse({ description: 'Scan queued successfully, returns scanId' })
  async requestScan(@Body() dto: CreateScanPayload) {
    return this.sbomService.requestScan(dto);
  }
  @Get('scans')
  @ApiOperation({ summary: 'List recent SBOM scan jobs' })
  @ApiOkResponse({ description: 'Array of scan status objects' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async listScans(@Query('limit') limit?: number, @Query('offset') offset?: number) {
    return this.sbomService.listScans(limit, offset);
  }

  @Get('scans/:id')
  @ApiOperation({ summary: 'Get scan status and metadata by ID' })
  @ApiParam({ name: 'id', description: 'Scan job UUID' })
  async getScanStatus(@Param('id') id: string) {
    return this.sbomService.getScanStatus(id);
  }

  @Get('scans/:id/report')
  @ApiOperation({ summary: 'Get presigned download URL for a completed SBOM report' })
  @ApiParam({ name: 'id', description: 'Scan job UUID' })
  async getScanReportUrl(@Param('id') id: string, @Res() res: Response) {
    const result = await this.sbomService.getScanResult(id);
    res.redirect(302, result.url);
  }

  @Delete('scans/:id')
  @ApiOperation({ summary: 'Delete a scan by ID. Cancels it if still queued.' })
  @ApiParam({ name: 'id', description: 'Scan job UUID' })
  async deleteScan(@Param('id') id: string) {
    return this.sbomService.deleteScan(id);
  }

  @Post('scans/:id/retry')
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
