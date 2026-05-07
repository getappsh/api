import { Controller, Get, Post, Res, Version } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { DIAGNOSTICS } from '@app/common/utils/paths';

const PROBE_PAYLOAD = Buffer.alloc(65_536, 0x78); // 64 KB of 'x'

@ApiTags("Diagnostics")
@ApiBearerAuth()
@Controller(DIAGNOSTICS)
export class DiagnosticsController {

  @Get("bandwidth/probe")
  @Version("2")
  @ApiOperation({
    summary: "Bandwidth Download Probe",
    description: "Returns a 64KB payload for agents to measure download bandwidth.",
  })
  @ApiOkResponse({ description: "64KB octet-stream payload" })
  downloadProbe(@Res() res: Response): void {
    res.set("Content-Type", "application/octet-stream");
    res.send(PROBE_PAYLOAD);
  }

  @Post("bandwidth/probe")
  @Version("2")
  @ApiOperation({
    summary: "Bandwidth Upload Probe",
    description: "Accepts any body (discarded) and returns 200 OK. Agents time the upload of a 64KB payload to estimate upload bandwidth.",
  })
  @ApiOkResponse({ description: "Empty 200 OK" })
  uploadProbe(): void {
    // body is intentionally discarded — only timing matters
  }
}
