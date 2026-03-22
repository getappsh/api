import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { lastValueFrom } from 'rxjs';
import { MicroserviceClient, MicroserviceName } from '@app/common/microservice-client';
import { SbomTopics } from '@app/common/microservice-client/topics';
import { SbomFormat, SbomTargetType } from '@app/common/dto/sbom';

export class CreateScanPayload {
  @ApiProperty({ description: 'Scan target (image name, file path, registry URL, etc.)', example: 'nginx:latest' })
  @IsString()
  @IsNotEmpty()
  target: string;

  @ApiProperty({
    description: 'Type of the scan target',
    enum: SbomTargetType,
    example: SbomTargetType.DOCKER_IMAGE,
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(Object.values(SbomTargetType))
  targetType: SbomTargetType;

  @ApiPropertyOptional({
    description: 'SBOM output format',
    enum: SbomFormat,
    default: SbomFormat.CYCLONEDX_JSON,
  })
  @IsOptional()
  @IsString()
  @IsIn(Object.values(SbomFormat))
  format?: SbomFormat;

  @ApiPropertyOptional({ description: 'Who or what triggered this scan (user ID, service name, etc.)' })
  @IsOptional()
  @IsString()
  triggeredBy?: string;

  @ApiPropertyOptional({
    description:
      'Set to true when `target` is a raw object key inside the MinIO bucket ' +
      '(e.g. upload/release/1/file.msi). sbom-generator will generate a fresh presigned URL ' +
      'at execution time. Required for file retries to work correctly.',
  })
  @IsOptional()
  @IsBoolean()
  isStoredInBucket?: boolean;
}

@Injectable()
export class SbomService implements OnModuleInit {
  private readonly logger = new Logger(SbomService.name);

  constructor(
    @Inject(MicroserviceName.SBOM_GENERATOR_SERVICE) private readonly sbomClient: MicroserviceClient,
  ) {}

  async onModuleInit() {
    this.sbomClient.subscribeToResponseOf([
      SbomTopics.SCAN_REQUEST,
      SbomTopics.RETRY_SCAN,
      SbomTopics.GET_SCAN_STATUS,
      SbomTopics.GET_SCAN_RESULT,
      SbomTopics.GET_SCANS,
      SbomTopics.DELETE_SCAN,
      SbomTopics.CHECK_HEALTH,
    ]);
    await this.sbomClient.connect();
  }

  requestScan(dto: CreateScanPayload): Promise<{ scanId: string; status: string }> {
    this.logger.log(`Requesting SBOM scan for target: ${dto.target}`);
    return lastValueFrom(this.sbomClient.send(SbomTopics.SCAN_REQUEST, dto));
  }

  getScanStatus(scanId: string): Promise<any> {
    this.logger.log(`Get scan status: ${scanId}`);
    return lastValueFrom(this.sbomClient.send(SbomTopics.GET_SCAN_STATUS, { scanId }));
  }

  getScanResult(scanId: string): Promise<{ url: string }> {
    this.logger.log(`Get scan result URL: ${scanId}`);
    return lastValueFrom(this.sbomClient.send(SbomTopics.GET_SCAN_RESULT, { scanId }));
  }

  listScans(limit?: number, offset?: number): Promise<any[]> {
    return lastValueFrom(this.sbomClient.send(SbomTopics.GET_SCANS, { limit, offset }));
  }

  deleteScan(scanId: string): Promise<{ message: string }> {
    this.logger.log(`Delete scan: ${scanId}`);
    return lastValueFrom(this.sbomClient.send(SbomTopics.DELETE_SCAN, { scanId }));
  }

  retryScan(scanId: string): Promise<{ scanId: string; status: string }> {
    this.logger.log(`Retry scan: ${scanId}`);
    return lastValueFrom(this.sbomClient.send(SbomTopics.RETRY_SCAN, { scanId }));
  }
}
