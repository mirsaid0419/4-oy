import { ApiProperty } from '@nestjs/swagger';
import { RoomStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateRoomDto {
  @ApiProperty()
  @IsString()
  name: string;
  
  @ApiProperty({ example: RoomStatus.active })
  @IsEnum(RoomStatus)
  @IsOptional()
  status?: RoomStatus;
}
