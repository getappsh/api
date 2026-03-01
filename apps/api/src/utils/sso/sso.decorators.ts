import { applyDecorators, createParamDecorator, ExecutionContext, SetMetadata } from "@nestjs/common";
import { Roles, Public } from "nest-keycloak-connect";

export function AllowedRoles(roles: [string]) {
    // TODO add a role guard and decorator for auth cy certificates    
    return applyDecorators(Roles({ roles: roles }))
}

// export function Unprotected() {
//     return applyDecorators(Public())
// }

export const AuthUser = createParamDecorator((data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
})

export const Unprotected = (unprotected: boolean = true) =>  SetMetadata("out-of-auth", unprotected) 

export const AuthOrProject = () => SetMetadata("auth-or-project", true)