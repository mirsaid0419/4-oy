import { Controller, Get, Param } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';

@Controller('cloudinary')
export class CloudinaryController {
  constructor(private cloudinaryService: CloudinaryService) {}

  @Get('resources/:folderName')
  async getResources(@Param('folderName') folderName: string) {
    return this.cloudinaryService.getResourcesByFolder(folderName);
  }
}