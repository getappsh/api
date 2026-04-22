import { HttpModule } from "@nestjs/axios/dist";
import { Module } from "@nestjs/common";
import { LoginController } from './login.controller';
import { LoginService } from './login.service';
import { AuthModule } from "../../utils/auth/auth.module";

@Module({
  imports:[HttpModule, AuthModule], 
  controllers:[LoginController],
  providers:[LoginService],
  exports: [Login]
})
export class Login {}