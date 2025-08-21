import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { AxiosError, AxiosResponse } from "axios";
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ILoginBody } from "./interfaces/body-login.interface";
import { IResDate as IResData } from "./interfaces/res-login.interface";
import { Observable, map, of } from 'rxjs';
import { TokensDto } from "./dto/tokens.dto";





@Injectable()
export class LoginService {

  url: string = this.configService.get<string>("AUTH_SERVER_URL") + "/realms/" + this.configService.get<string>("REALM") + "/protocol/openid-connect/token"
  data: ILoginBody = {
    grant_type: "",
    client_secret: this.configService.get<string>("SECRET_KEY"),
    client_id: this.configService.get<string>("CLIENT_ID"),
  }
  config = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }

  constructor(private httpService: HttpService, private configService: ConfigService) { }

  getToken(username: string, password: string): Observable<TokensDto> {
    const data: ILoginBody = {
      ...this.data, grant_type: "password", username, password
    }
    return this.httpService.post(this.url, data, this.config).pipe(map(res => {
      let tokens = this.extractTokensFormRes(res)
      return tokens
    }))
  }

  getRefreshToken(refresh_token: string): Observable<TokensDto> {
    const data: ILoginBody = {
      ...this.data, grant_type: "refresh_token", refresh_token
    }
    return this.httpService.post(this.url, data, this.config).pipe(map(res => {
      return this.extractTokensFormRes(res)
    }))
  }

  extractTokensFormRes(res:any): TokensDto{
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
    else{
      throw new Error("something wrong")
    }
  }
}