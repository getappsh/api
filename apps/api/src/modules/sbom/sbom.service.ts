import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Observable } from 'rxjs';
import { MicroserviceClient, MicroserviceName } from '@app/common/microservice-client';
import { SbomTopics } from '@app/common/microservice-client/topics';

export class CreateScanPayload {
  @ApiProperty({ description: 'Scan target (image name, file path, registry URL, etc.)', example: 'nginx:latest' })
  @IsString()
  @IsNotEmpty()
  target: string;

  @ApiProperty({
    description: 'Type of the scan target',
    enum: ['docker', 'registry', 'file', 'dir', 'oci-archive'],
    example: 'docker',
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['docker', 'registry', 'file', 'dir', 'oci-archive'])
  targetType: string;

  @ApiPropertyOptional({
    description: 'SBOM output format',
    enum: ['syft-json', 'spdx-json', 'cyclonedx-json', 'table', 'text'],
    default: 'cyclonedx-json',
  })
  @IsOptional()
  @IsString()
  @IsIn(['syft-json', 'spdx-json', 'cyclonedx-json', 'table', 'text'])
  format?: string;

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

  requestScan(dto: CreateScanPayload): Observable<{ scanId: string; status: string }> {
    this.logger.log(`Requesting SBOM scan for target: ${dto.target}`);
    return this.sbomClient.send(SbomTopics.SCAN_REQUEST, dto);
  }

  getScanStatus(scanId: string): Observable<any> {
    this.logger.log(`Get scan status: ${scanId}`);
    return this.sbomClient.send(SbomTopics.GET_SCAN_STATUS, { scanId });
  }

  getScanResult(scanId: string): Observable<{ url: string }> {
    this.logger.log(`Get scan result URL: ${scanId}`);
    return this.sbomClient.send(SbomTopics.GET_SCAN_RESULT, { scanId });
  }

  listScans(limit?: number, offset?: number): Observable<any[]> {
    return this.sbomClient.send(SbomTopics.GET_SCANS, { limit, offset });
  }

  deleteScan(scanId: string): Observable<{ message: string }> {
    this.logger.log(`Delete scan: ${scanId}`);
    return this.sbomClient.send(SbomTopics.DELETE_SCAN, { scanId });
  }

  retryScan(scanId: string): Observable<{ scanId: string; status: string }> {
    this.logger.log(`Retry scan: ${scanId}`);
    return this.sbomClient.send(SbomTopics.RETRY_SCAN, { scanId });
  }
}
