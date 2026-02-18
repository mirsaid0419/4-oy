import { MailerModule } from '@nestjs-modules/mailer';
import { Global, Module } from '@nestjs/common';
import { EmailServise } from './email.service';
import { config } from 'dotenv';
config();
@Global()
@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        service: 'gmail',
        auth: {
          user: process.env.EMAIL,
          pass: process.env.PASS,
        },
      },
      defaults: {
        from: `"CRM" <${process.env.EMAIL}>`,
      },
    }),
  ],
  providers: [EmailServise],
  exports: [EmailServise],
})
export class EmailModule {}
