import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  /**
   * Har qanday faylni (rasm yoki video) Cloudinaryga yuklaydi.
   * resource_type: 'auto' – Cloudinary o'zi rasm yoki videoligini aniqlaydi.
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'imtixon',
  ): Promise<{ url: string; publicId: string; resourceType: string }> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'auto', // 'auto' rasm va videolarni aniqlaydi
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else if (result) {
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
              resourceType: result.resource_type,
            });
          } else {
            reject(new Error('Upload failed: No result returned'));
          }
        },
      );

      upload.end(file.buffer);
    });
  }

  /**
   * Cloudinary dagi faylni o'chiradi.
   * resourceType: 'image' | 'video' | 'raw' – default 'image'
   */
  async deleteFile(
    publicId: string,
    resourceType: 'image' | 'video' | 'raw' = 'image',
  ) {
    try {
      await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
      });
    } catch (error) {
      throw new Error(`Cloudinary delete failed: ${error.message}`);
    }
  }

  /**
   * Cloudinary papkasidagi barcha resurslarni qaytaradi.
   */
  async getResourcesByFolder(folderName: string) {
    try {
      const resources = await cloudinary.search
        .expression(`folder="${folderName}"`)
        .max_results(500)
        .execute();

      return resources.resources.map((resource: any) => ({
        url: resource.secure_url,
        publicId: resource.public_id,
        type: resource.resource_type,
        format: resource.format,
        size: resource.bytes,
      }));
    } catch (error) {
      throw new Error(`Failed to get resources: ${error.message}`);
    }
  }
}