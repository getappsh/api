import { ProxyHttpConfigService } from "@app/common/http-config/http-config.service";
import { DEVICE, TLS_STATUS } from "@app/common/utils/paths";
import { HttpService } from "@nestjs/axios";
import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class HttpClientService {
  private readonly logger = new Logger(HttpClientService.name);
  
  constructor(
    httpConfig: ProxyHttpConfigService,
    private httpService: HttpService
  ) {  
    httpService = httpConfig.httpService
  }

  async setTlsStatus(body: any): Promise<any> {
    try {
      this.logger.debug(`update mTls status for device id: ${body.deviceId}`);
      const url = `${DEVICE}${TLS_STATUS}`;
      return await this.httpService.axiosRef.post(url, body);
    } catch (error) {
      this.logger.error(error)
    }
  }
}