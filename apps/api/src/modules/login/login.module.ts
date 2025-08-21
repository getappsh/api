import { HttpModule } from "@nestjs/axios/dist";
import { Module } from "@nestjs/common";
import { LoginController } from './login.controller';
import { LoginService } from './login.service';

@Module({
  imports:[HttpModule], 
  controllers:[LoginController],
  providers:[LoginService],
  exports: [Login]
})
export class Login {}