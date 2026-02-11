import { HttpModule } from "@nestjs/axios/dist";
import { Module } from "@nestjs/common";
import { LoginController } from './login.controller';
import { LoginController as LoginControllerV2 } from './login.controller.v2';
import { LoginService } from './login.service';

@Module({
  imports:[HttpModule], 
  controllers:[LoginController, LoginControllerV2],
  providers:[LoginService],
  exports: [Login]
})
export class Login {}