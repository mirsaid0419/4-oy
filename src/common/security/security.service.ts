import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcrypt';

@Injectable()
export class SecurityService {
  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}
  async hashPassword(params: string): Promise<string> {
    return await hash(params, 10);
  }
  async comparePassword(
    password: string,
    hashPassword: string,
  ): Promise<boolean> {
    return await compare(password, hashPassword);
  }
  async verifyToken(token: string) {
    try {
      return await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_SECRET'),
      });
    } catch (error) {
      throw new UnauthorizedException("Token hato yoki muddati o'tgan");
    }
  }
  async generateToken(payload: any): Promise<string> {
    return await this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: '1h',
    });
  }
}
