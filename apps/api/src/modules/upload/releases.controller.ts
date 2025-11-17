import { Body, Controller, Delete, Get, Patch, Logger, Param, Post, Res, UploadedFile, UseInterceptors } from "@nestjs/common";
import { Response } from 'express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiCreatedResponse, ApiFoundResponse, ApiHeader, ApiOkResponse, ApiOperation, ApiParam, ApiProduces, ApiTags } from "@nestjs/swagger";
import { ReleasesService } from "./releases.service";
import { ReleaseDto, SetReleaseDto, SetReleaseArtifactResDto, SetReleaseArtifactDto, ReleaseParams, RegulationStatusParams, SetRegulationCompliancyDto, SetRegulationStatusDto, RegulationStatusDto, ReleaseArtifactParams, DetailedReleaseDto, ReleaseArtifactNameParams, UpdateFileMetaDataDto } from "@app/common/dto/upload";
import { AuthOrProject, Unprotected } from '../../utils/sso/sso.decorators';
import { UserContextInterceptor } from "../../utils/interceptor/user-context.interceptor";
import { UPLOAD_RELEASES } from "@app/common/utils/paths";
import { ProjectIdentifierParams } from "@app/common/dto/project-management";
import { FileInterceptor } from "@nestjs/platform-express";
import axios from 'axios';



@ApiHeader({
  name: 'X-Project-Token',
  required: false
})
@ApiBearerAuth()
@ApiTags('Catalog - Upload') // Releases
@AuthOrProject()
@UseInterceptors(UserContextInterceptor)
@Controller(UPLOAD_RELEASES)
export class ReleasesController {

  private readonly logger = new Logger(ReleasesController.name);

  constructor(private readonly releasesService: ReleasesService) { }


  @Post('project/:projectIdentifier')
  @ApiOperation({
    summary: "Set a Release",
    description: "This service message allows creation of a release."
  })
  @ApiCreatedResponse({ type: DetailedReleaseDto })
  setRelease(@Body() release: SetReleaseDto, @Param() params: ProjectIdentifierParams) {
    this.logger.debug(`Setting release for project: ${params.projectIdentifier}, version: ${release.version}`);
    return this.releasesService.setRelease(release, params);
  }


  @Get('project/:projectIdentifier')
  @ApiOperation({
    summary: "Get Releases",
    description: "This service message allows retrieval of releases."
  })
  @ApiOkResponse({ type: ReleaseDto, isArray: true })
  getReleases(@Param() params: ProjectIdentifierParams) {
    this.logger.debug(`Getting releases for project: ${params.projectIdentifier}`);
    return this.releasesService.getReleases(params);
  }


  @Get('project/:projectIdentifier/version/:version')
  @ApiOperation({
    summary: "Get Release",
    description: "This service message allows retrieval of a release."
  })
  @ApiOkResponse({ type: DetailedReleaseDto })
  getRelease(@Param() params: ReleaseParams) {
    this.logger.debug(`Getting release for project: ${params.projectIdentifier}, version: ${params.version}`);
    return this.releasesService.getRelease(params);
  }


  @Delete('project/:projectIdentifier/version/:version')
  @ApiOperation({
    summary: "Delete Release",
    description: "This service message allows deletion of a release."
  })
  @ApiOkResponse({ description: "Release deleted." })
  deleteRelease(@Param() params: ReleaseParams) {
    this.logger.debug(`Deleting release for project: ${params.projectIdentifier}, version: ${params.version}`);
    return this.releasesService.deleteRelease(params);
  }


  @Post('project/:projectIdentifier/version/:version/artifact')
  @ApiOperation({
    summary: "Set Release Artifact",
    description: "This service message allows creation of a release artifact."
  })
  @ApiCreatedResponse({ type: SetReleaseArtifactResDto })
  setReleaseArtifact(@Body() artifact: SetReleaseArtifactDto, @Param() params: ReleaseParams) {
    this.logger.debug(`Setting release artifact for project: ${params.projectIdentifier}, version: ${params.version}, artifactName: ${artifact.artifactName}`);
    return this.releasesService.setReleaseArtifact(artifact, params);

  }

  @Delete('project/:projectIdentifier/version/:version/artifact/:artifactId')
  @ApiOperation({
    summary: "Delete Release Artifact",
    description: "This service message allows deletion of a release artifact."
  })
  @ApiOkResponse({ description: "Release artifact deleted." })
  deleteReleaseArtifact(@Param() params: ReleaseArtifactParams) {
    this.logger.debug(`Deleting release artifact for project: ${params.projectIdentifier}, version: ${params.version}`);
    return this.releasesService.deleteReleaseArtifact(params);
  }

  @Patch('project/:projectIdentifier/version/:version/artifact/:artifactId')
  @ApiOperation({
    summary: "Update file metadata",
    description: "This route enables to chagne the metadata to an artifact"
  })
  @ApiOkResponse({ description: "Release artifact metadata update" })
  updateFileMetadata(@Param() params: ReleaseArtifactParams, @Body() body: UpdateFileMetaDataDto) {
    body.id = params.artifactId;
    this.logger.debug(`update metadata fo artifact for project: ${params.projectIdentifier}, version: ${params.version} ,artifactId: ${params.artifactId}`);
    return this.releasesService.updateFileMetadata(body);
  }

  @Get('project/:projectIdentifier/version/:version/artifact/download/:fileName')
  @ApiOperation({
    summary: "Download Release Artifact",
    description: "This service allows downloading a release artifact by file name."
  })
  @ApiProduces('application/octet-stream') // Specifies the response is a binary file
  // @ApiOkResponse({ description: "Release artifact file." })
  @ApiFoundResponse({ description: 'Redirects to a URL' })
  async downloadArtifact(
    @Param() params: ReleaseArtifactNameParams,
    @Res() res: Response
  ) {
    this.logger.debug(`Downloading release artifact for project: ${params.projectIdentifier}, version: ${params.version}, artifactName: ${params.fileName}`);

    const resDto = await this.releasesService.getArtifactDownloadUrl(params, params.fileName);

    // const response = await axios.get(resDto.downloadUrl, { responseType: 'stream' });

    // res.setHeader('Content-Length', response.headers['content-length']);
    // res.setHeader('Content-Type', response.headers['content-type']);
    // res.setHeader('Content-Disposition', `attachment; filename="${params.fileName}"`);
    // response.data.pipe(res);

    if (typeof resDto.downloadUrl === 'string') {
      res.redirect(302, resDto.downloadUrl);
    } else {
      this.logger.error('Download URL is undefined');
      res.status(500).send('Download URL is unavailable.');
    }
  }

  // @Post('project/:projectIdentifier/version/:version/artifact/upload/:fileName')
  // @ApiOperation({
  //   summary: "Upload Release Artifact",
  //   description: "This service allows uploading a release artifact."
  // })
  // @ApiConsumes('multipart/form-data')
  // @ApiBody({
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       file: { 
  //         type: 'string', 
  //         format: 'binary' 
  //       }
  //     }
  //   }
  // })
  // @UseInterceptors(FileInterceptor('file'))
  // async uploadArtifact(
  //   @Param() params: ReleaseArtifactParams,
  //   @Param('fileName') fileName: string,
  //   @UploadedFile() file: Express.Multer.File
  // ) {
  //   return this.releasesService.uploadReleaseArtifact(params, file, fileName);
  // }


  @Get('project/:projectIdentifier/version/:version/regulation-status')
  @ApiOperation({ summary: 'Get Version Regulation Statuses by Regulation ID' })
  @ApiOkResponse({ type: RegulationStatusDto, isArray: true })
  getVersionRegulationStatuses(@Param() params: ReleaseParams) {
    this.logger.debug(`Getting version regulation statuses by Project ID: ${params.projectIdentifier} and Version: ${params.version}`);
    return this.releasesService.getVersionRegulationsStatuses(params);
  }

  @Get('project/:projectIdentifier/version/:version/regulation-status/:regulation')
  @ApiOperation({ summary: 'Get Regulation Status by Regulation ID and Version ID' })
  @ApiOkResponse({ type: RegulationStatusDto })
  getRegulationStatus(@Param() params: RegulationStatusParams) {
    this.logger.debug(`Getting regulation status by Project ID: ${params.projectIdentifier}, Regulation: ${params.regulation}, and Version: ${params.version}`);
    return this.releasesService.getVersionRegulationStatus(params);
  }


  @Post('project/:projectIdentifier/version/:version/regulation-status/:regulation')
  @ApiOperation({ summary: 'Set Regulation Status' })
  @ApiOkResponse({ type: RegulationStatusDto })
  setRegulationStatus(@Param() params: RegulationStatusParams, @Body() setRegulationStatusDto: SetRegulationStatusDto) {
    this.logger.debug(`Setting regulation status for: ${JSON.stringify(params)}, with: ${JSON.stringify(setRegulationStatusDto)}`);
    return this.releasesService.setRegulationStatus(params, setRegulationStatusDto);
  }

  @Post('project/:projectIdentifier/version/:version/regulation-status/:regulation/compliancy')
  @ApiOperation({ summary: 'Set Regulation Compliancy' })
  @ApiOkResponse({ type: RegulationStatusDto })
  setRegulationCompliancy(@Param() params: RegulationStatusParams, @Body() setRegulationCompliancyDto: SetRegulationCompliancyDto) {
    this.logger.debug(`Setting regulation compliancy for: ${JSON.stringify(params)}, with: ${JSON.stringify(setRegulationCompliancyDto)}`);
    return this.releasesService.setRegulationCompliancy(params, setRegulationCompliancyDto);
  }

  @Delete('project/:projectIdentifier/version/:version/regulation-status/:regulation')
  @ApiOperation({ summary: 'Delete Regulation Status' })
  @ApiOkResponse({ description: 'Regulation status deleted' })
  deleteRegulationStatus(@Param() params: RegulationStatusParams) {
    this.logger.debug(`Deleting regulation status for Project: ${params.projectIdentifier}, Regulation: ${params.regulation}, and Version: ${params.version}`);
    return this.releasesService.deleteVersionRegulationStatus(params);
  }


}