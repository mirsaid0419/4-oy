import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const Roles:string[] = this.reflector.get('roles', context.getHandler());
    const req=context.switchToHttp().getRequest()
    if(!Roles.includes(req.user.role)){
        throw new ForbiddenException("Sizga bu api ga ruxsat yo'q")
    }
    return true;
  }
}
