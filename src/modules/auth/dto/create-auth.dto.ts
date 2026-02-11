import { IsNotEmpty,IsString,IsStrongPassword } from "class-validator";

export class SignInDto {
    @IsString()
      @IsNotEmpty({ message: "User name bo'sh bo'lmasligi kerak" })
      user_name: string;
    
      @IsString()
      @IsStrongPassword({minSymbols:0})
      @IsNotEmpty({ message: "Parol bo'sh bo'lmasligi kerak" })
      password: string;
}
