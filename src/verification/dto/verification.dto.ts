import { IsMobilePhone, IsString } from 'class-validator';

export class SendOtpDto {
  @IsString()
  @IsMobilePhone('uz-UZ')
  phone: string;
}

export class VerifyOtpDto extends SendOtpDto {
  otp: string;
}
