import { Global, Module } from '@nestjs/common';
import { SecurityService } from './security.service';
import { JwtModule } from '@nestjs/jwt';
@Global()
@Module({
  imports: [JwtModule.register({})],
  providers: [SecurityService],
  exports: [SecurityService],
})
export class SecurityModule {}
