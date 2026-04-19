import { createParamDecorator, ExecutionContext, SetMetadata } from "@nestjs/common";

export const Unprotected = (unprotected: boolean = true) => SetMetadata("out-of-auth", unprotected);

export const AuthUser = createParamDecorator((data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
})

