import { applyDecorators, createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Roles, Public} from "nest-keycloak-connect";

export function AllowedRoles(roles: [string]){
    return applyDecorators(Roles({roles: roles}))
}

export function Unprotected(){
    return applyDecorators(Public())
}

export const AuthUser = createParamDecorator((data: string, ctx: ExecutionContext)=>{
    const request = ctx.switchToHttp().getRequest();
    return request.user;
})

