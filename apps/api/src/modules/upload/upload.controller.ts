import { Body, Controller, Get, Logger, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiCreatedResponse, ApiExcludeEndpoint, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { UploadArtifactDto, UpdateUploadStatusDto, UploadManifestDto } from '@app/common/dto/upload';
import { UploadService } from './upload.service';
import { UPLOAD } from '@app/common/utils/paths';
import { Unprotected } from '../../utils/sso/sso.decorators';
import { FileInterceptor } from '@nestjs/platform-express';
import { ComponentDto } from '@app/common/dto/discovery';

@ApiTags('Upload')
@Controller(UPLOAD)
export class UploadController {
  private readonly logger = new Logger(UploadController.name);

  constructor(
    private readonly uploadService: UploadService){}

  @Post('artifact')
  @ApiOperation({ 
    summary: "Upload Artifact", 
    description: "This service message allows uploading an artifact." 
  })
  @Unprotected()
  uploadArtifact(@Body() uploadVersionDto: UploadArtifactDto): {}{
    return this.uploadService.uploadArtifact(uploadVersionDto)
  }

  @Post('manifest')
  @ApiOperation({ 
    summary: "Upload Manifest", 
    description: "This service message allows uploading a manifest file and an upload token." 
  })
  @Unprotected()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'File and upload token',
    type: UploadManifestDto,
  })
  @UseInterceptors(FileInterceptor('file'))
  uploadManifest(@UploadedFile() file: Express.Multer.File, @Body() body: UploadManifestDto) {
    return this.uploadService.uploadManifest(file, body);
  }

  @Post('updateUploadStatus')
  @ApiOperation({ 
    summary: "Update Upload Status", 
    description: "This service message allows updating the upload status." 
  })
  @Unprotected()
  @ApiCreatedResponse({description: "return 201 with no body"})
  updateUploadStatus(@Body() updateUploadStatusDto: UpdateUploadStatusDto): {}{
    return this.uploadService.updateUploadStatus(updateUploadStatusDto)
  }

  @Get('lastVersion/:projectId')
  @ApiOperation({ 
    summary: "Get Last Version", 
    description: "This service message allows retrieval of the last version by project ID." 
  })
  @ApiBearerAuth()
  @ApiOkResponse({type: ComponentDto})
  @ApiParam({name: 'projectId', type: Number})
  getLastVersion(@Param() params: {projectId: number}){
    return this.uploadService.getLastVersion(params);
  }

  @Get('checkHealth')
  @ApiOperation({ 
    summary: "Check Health", 
    description: "This service message checks the health of the upload service." 
  })
  @Unprotected()
  @ApiExcludeEndpoint()
  checkHealth(){
    this.logger.log("Upload service - Health checking")
    return this.uploadService.checkHealth()
  }
}
