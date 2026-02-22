import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const Roles: string[] = this.reflector.get('roles', context.getHandler());
    const req = context.switchToHttp().getRequest();
    const { id } = req.params;
    if (Roles.includes(req.user.role)) {
      return true;
    }
    if (id && id == req.user.id) {
      return true;
    }
    throw new ForbiddenException('Sizda bunday huquq mavjud emas');
  }
}
