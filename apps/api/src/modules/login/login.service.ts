import { Injectable, UnauthorizedException } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from '@nestjs/config';
import { ILoginBody } from "./interfaces/body-login.interface";
import { IResDate as IResData } from "./interfaces/res-login.interface";
import { Observable, map, from } from 'rxjs';
import { TokensDto } from "./dto/tokens.dto";
import { JwtService } from "@nestjs/jwt";



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

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) { }

  getToken(username: string, password: string): Observable<TokensDto> {
    if (this.configService.get<string>('AUTH_MODE') === 'local') {
      return from(this.getLocalToken(username, password));
    }

    const data: ILoginBody = {
      ...this.data, grant_type: "password", username, password
    }
    return this.httpService.post(this.url, data, this.config).pipe(map(res => {
      let tokens = this.extractTokensFormRes(res)
      return tokens
    }))
  }

  getRefreshToken(refresh_token: string): Observable<TokensDto> {
    if (this.configService.get<string>('AUTH_MODE') === 'local') {
      return from(this.refreshLocalToken(refresh_token));
    }

    const data: ILoginBody = {
      ...this.data, grant_type: "refresh_token", refresh_token
    }
    return this.httpService.post(this.url, data, this.config).pipe(map(res => {
      return this.extractTokensFormRes(res)
    }))
  }

  private async getLocalToken(username: string, password: string, skipValidation = false): Promise<TokensDto> {
    if (!skipValidation) {
      const localUsers = this.configService.get<string>('LOCAL_USERS') ?? '';
      const validUser = localUsers.split(',').map(e => e.trim()).find(entry => {
        const [u, p] = entry.split(':');
        return u === username && p === password;
      });

      if (!validUser) {
        throw new UnauthorizedException('Invalid username or password');
      }
    }

    const expiresInSeconds = parseInt(this.configService.get<string>('JWT_EXPIRES_IN') ?? '86400', 10);
    const now = new Date();
    const expireAt = new Date(now.getTime() + expiresInSeconds * 1000);

    const payload = { sub: username, username };
    const accessToken = await this.jwtService.signAsync(payload, { expiresIn: expiresInSeconds });

    // For local mode, refresh token is just a longer-lived token
    const refreshExpiresInSeconds = expiresInSeconds * 7;
    const refreshExpireAt = new Date(now.getTime() + refreshExpiresInSeconds * 1000);
    const refreshToken = await this.jwtService.signAsync(
      { ...payload, type: 'refresh' },
      { expiresIn: refreshExpiresInSeconds },
    );

    return { accessToken, expireAt, refreshToken, refreshExpireAt };
  }

  private async refreshLocalToken(refreshToken: string): Promise<TokensDto> {
    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (payload?.type !== 'refresh') {
      throw new UnauthorizedException('Provided token is not a refresh token');
    }

    return this.getLocalToken(payload.username, '', true);
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