import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: "Email noto'g'ri formatda" })
  @IsNotEmpty({ message: "Email bo'sh bo'lmasligi kerak" })
  email: string;

  @IsString()
  @IsNotEmpty({ message: "Ism bo'sh bo'lmasligi kerak" })
  name: string;

  @IsString()
  @IsNotEmpty()
  user_name: string;

  @IsString()
  @IsStrongPassword({ minSymbols: 0 })
  @IsNotEmpty({ message: "Parol bo'sh bo'lmasligi kerak" })
  password: string;
}
