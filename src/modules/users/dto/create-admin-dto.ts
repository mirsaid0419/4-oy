import { IsEnum, IsOptional } from "class-validator";
import { CreateUserDto } from "./create-user.dto";
import { Role } from "@prisma/client";
import { ApiProperty } from "@nestjs/swagger";

export class CreateAdminDto extends CreateUserDto {
  @ApiProperty({ example: Role.admin ,enum:Role})
  @IsEnum(Object.values(Role))
  @IsOptional()
  role?: Role;
}