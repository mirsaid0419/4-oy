import { ApiProperty, PartialType } from "@nestjs/swagger";
import { CreateAdminDto } from "./create-admin-dto";
import { IsBoolean, IsOptional } from "class-validator";

export class UpdateAdminDto extends PartialType(CreateAdminDto) {
    @ApiProperty({ example: true })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
