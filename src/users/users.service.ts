import { Injectable } from '@nestjs/common';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { FileUpload } from 'graphql-upload';
import { User } from './user.model';

@Injectable()
export class UserService {
  private users: User[] = [];

  async findAll() {
    return this.users;
  }

  async create(data: { name: string; age?: number; password?: string; file?: FileUpload }) {
    const { name, age, password, file } = data;
    let profileImage: string | null = null;

    if (file) {
      const { createReadStream, filename } = await file;

      // 1. Saqlash joyini aniqlaymiz
      const uploadDir = join(process.cwd(), 'public/uploads');
      if (!existsSync(uploadDir)) {
        mkdirSync(uploadDir, { recursive: true });
      }

      const uniqueName = `${Date.now()}-${filename}`;
      const filePath = join(uploadDir, uniqueName);

      // 2. Faylni diskka yozish (Stream)
      await new Promise((resolve, reject) => {
        createReadStream()
          .pipe(createWriteStream(filePath))
          .on('finish', resolve)
          .on('error', (err) => reject(err));
      });

      profileImage = `/uploads/${uniqueName}`;
    }

    const newUser: User = {
      id: this.users.length + 1,
      name,
      age,
      profileImage,
    };

    this.users.push(newUser);
    return newUser;
  }
}
