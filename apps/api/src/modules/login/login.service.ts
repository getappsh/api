import { Injectable, Logger } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from '@nestjs/config';
import { ILoginBody } from "./interfaces/body-login.interface";
import { IResDate as IResData } from "./interfaces/res-login.interface";
import { Observable, catchError, map, timeout } from 'rxjs';
import { TokensDto } from "@app/common/dto/login/dto/tokens.dto";


@Injectable()
export class LoginService {

  private readonly logger = new Logger(LoginService.name);


  url: string = this.configService.get<string>("AUTH_SERVER_URL") + "/realms/" + this.configService.get<string>("REALM") + "/protocol/openid-connect/token"
  data: ILoginBody = {
    grant_type: "",
    client_secret: this.configService.get<string>("SECRET_KEY") || "",
    client_id: this.configService.get<string>("CLIENT_ID") || "",
  }
  config = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }

  constructor(private httpService: HttpService, private configService: ConfigService) { }

  getToken(username: string, password: string): Observable<TokensDto> {
    this.logger.log(`Req token form soo server for user ${username}`)
    const data: ILoginBody = {
      ...this.data, grant_type: "password", username, password
    }
    return this.httpService.post(this.url, data, this.config).pipe(
      this.errorHandlerPipe(),
      map(res => {
        let tokens = this.extractTokensFormRes(res)
        return tokens
      }))
  }

  getRefreshToken(refresh_token: string): Observable<TokensDto> {
    this.logger.log(`Req refresh token form soo server`)
    const data: ILoginBody = {
      ...this.data, grant_type: "refresh_token", refresh_token
    }
    return this.httpService.post(this.url, data, this.config).pipe(
      this.errorHandlerPipe(),
      map(res => {
        return this.extractTokensFormRes(res)
      }))
  }

  errorHandlerPipe() {
    return (source: Observable<any>) => source.pipe(
      timeout(5000),
      catchError(error => {
        if (error.name === 'TimeoutError') {
          this.logger.error(`Connection to SSO server failed with time out error, check the SSO server if it is OK`)
          throw error;
        }
        this.logger.error("SSO server error", error.toString())
        throw error;
      })
    );
  }

  extractTokensFormRes(res: any): TokensDto {
    if (res?.data) {
      const resData: IResData = res.data
      const currentDate = new Date()
      return {
        accessToken: resData.access_token,
        expireAt: new Date(currentDate.getTime() + (resData.expires_in * 1000)),
        refreshToken: resData.refresh_token,
        refreshExpireAt: new Date(currentDate.getTime() + (resData.refresh_expires_in * 1000)),

      } as TokensDto
    }
    else {
      throw new Error("something wrong")
    }
  }
}