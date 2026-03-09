import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class TokenGuard implements CanActivate {
  constructor(
    private config: ConfigService,
    private jwt: JwtService,
  ) { }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const req = context.switchToHttp().getRequest();
      let token = req.headers.authorization;

      // Also check query params for token (useful for video tags)
      if (!token && req.query.token) {
        token = `Bearer ${req.query.token}`;
      }

      if (!token || !token.startsWith('Bearer ')) {
        throw new UnauthorizedException('Token mavjud emas yoki buzilgan');
      }
      const user = await this.jwt.verifyAsync(token.split(' ')[1], {
        secret: this.config.get('JWT_KEY'),
      });
      req.user = user;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Token mavjud emas yoki buzilgan');
    }
  }
}
