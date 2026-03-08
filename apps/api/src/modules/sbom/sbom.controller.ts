import { Body, Controller, Get, Logger, Param, Post, Query, Redirect, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { lastValueFrom } from 'rxjs';
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
    return lastValueFrom(this.sbomService.requestScan(dto));
  }
  @Get('scans')
  @ApiOperation({ summary: 'List recent SBOM scan jobs' })
  @ApiOkResponse({ description: 'Array of scan status objects' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async listScans(@Query('limit') limit?: number, @Query('offset') offset?: number) {
    return lastValueFrom(this.sbomService.listScans(limit, offset));
  }

  @Get('scans/:id')
  @ApiOperation({ summary: 'Get scan status and metadata by ID' })
  @ApiParam({ name: 'id', description: 'Scan job UUID' })
  async getScanStatus(@Param('id') id: string) {
    return lastValueFrom(this.sbomService.getScanStatus(id));
  }

  @Get('scans/:id/report')
  @ApiOperation({ summary: 'Get presigned download URL for a completed SBOM report' })
  @ApiParam({ name: 'id', description: 'Scan job UUID' })
  async getScanReportUrl(@Param('id') id: string, @Res() res: Response) {
    const result = await lastValueFrom(this.sbomService.getScanResult(id));
    res.redirect(302, result.url);
  }
}
