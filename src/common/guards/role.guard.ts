import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) { }
  canActivate(context: ExecutionContext): boolean {
    const Roles: string[] = this.reflector.get('roles', context.getHandler());
    const req = context.switchToHttp().getRequest();
    const { id } = req.params;
    const user = req.user;

    // Har qanday admin yoki foydalanuvchi inactive bo'lsa, u faqat o'ziga tegishli (user) huquqlar bilan qolishi kerak.
    // Agar so'ralgan rollar orasida admin yoki superadmin bo'lsa va user inactive bo'lsa, rad etiladi.
    const isAdminRoleRequired = Roles.some(role => role === 'admin' || role === 'superadmin');

    if (isAdminRoleRequired && !user.isActive) {
      throw new ForbiddenException("Hisobingiz faol emas. Admin huquqlaridan foydalana olmaysiz.");
    }

    if (Roles.includes(user.role)) {
      return true;
    }

    if (id && id == user.id) {
      return true;
    }

    throw new ForbiddenException("Sizda bunday huquq mavjud emas");
  }
}
