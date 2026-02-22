// import { MailerService } from '@nestjs-modules/mailer';
// import { Injectable } from '@nestjs/common';
// @Injectable()
// export class EmailServise {
//   constructor(private readonly emailService: MailerService) {}
//   async sendEmail(email: string, password: string, username: string) {
//     await this.emailService.sendMail({
//       to: email,
//       from: process.env.EMAIL,
//       subject: `CRM tizimidan foydalanish uchun login va parol`,
//       html: `<p>Tizimga kirish ma'lumotlaringiz:</p>
//     <p><b>Login:</b> ${username}</p>
//     <p><b>Parol:</b> ${password}</p>
//     <p>Iltimos, kirgandan so'ng parolni o'zgartiring.</p>`,
//     });
//   }
// }
