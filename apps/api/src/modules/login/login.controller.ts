import { Controller, Body, Post, Logger } from '@nestjs/common';
import { Unprotected } from '../../utils/sso/sso.decorators';
import { LoginService } from './login.service';
import { LOGIN, REFRESH } from '@app/common/utils/paths';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Observable } from 'rxjs';
import { RefreshTokenDto } from '@app/common/dto/login/dto/refresh-token-dto';
import { TokensDto } from '@app/common/dto/login/dto/tokens.dto';
import { UserLoginDto } from '@app/common/dto/login/dto/user-login.dto';


@ApiTags("Login")
@Controller(LOGIN)
@Unprotected()
export class LoginController {
  private readonly logger = new Logger(LoginController.name);

  constructor(private readonly loginService: LoginService) { }

  @Post()
  @ApiOperation({ 
    summary: "User Login", 
    description: "This service message allows a user to log in and receive a token." 
  })
  @ApiCreatedResponse({ type: TokensDto })
  getToken(@Body() userLoginDto: UserLoginDto): Observable<TokensDto> {
    this.logger.debug(`Login of user ${userLoginDto.username}`);
    return this.loginService.getToken(userLoginDto.username, userLoginDto.password);
  }

  @Post(REFRESH)
  @ApiOperation({ 
    summary: "Get Refresh Token", 
    description: "This service message allows a user to get a refresh token." 
  })
  @ApiCreatedResponse({ type: TokensDto })
  getRefreshToken(@Body() refreshToken: RefreshTokenDto): Observable<TokensDto> {
    this.logger.debug(`Get refresh token`);
    return this.loginService.getRefreshToken(refreshToken.refreshToken);
  }
}
