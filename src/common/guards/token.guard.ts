import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SecurityService } from '../security/security.service';

@Injectable()
export class TokenGuard implements CanActivate {
  constructor(private readonly secret: SecurityService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const host = context.switchToHttp();
      const req = host.getRequest();
      const token = req.headers.authorization;
      if (!token) throw new UnauthorizedException('Token not found');
      const data =await this.secret.verifyToken(token);
      req.user = data;
      return true;
    } catch (error) {
      throw error
    }
  }
}
