import { Controller, Get, Logger} from '@nestjs/common';
import { ApiService } from './api.service';
import { Unprotected } from './utils/sso/sso.decorators';
import { ApiExcludeEndpoint } from '@nestjs/swagger';


@Controller()
export class ApiController {
  private readonly logger = new Logger(ApiController.name);

  constructor(private readonly apiService: ApiService) { }


  @Get('checkHealth')
  @Unprotected()
  @ApiExcludeEndpoint()
  checkHealth() {
    const version =  this.apiService.readImageVersion()
    this.logger.log(`API service - Health checking, Version: ${version}`)
    return "API service is success, Version: " + version
  }
}
