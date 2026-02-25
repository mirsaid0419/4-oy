import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import slugify from 'slugify'; //bu kutubxona categoryni url da qidirish uchun qulay holatga keltiradi
import { PrismaService } from 'src/core/db/prisma/prisma.service';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) { }
  
  async create(dto: CreateCategoryDto) {
    const name = dto.name.trim();

    if (!name) {
      throw new BadRequestException('Category name is required');
    }

    let slug = dto.slug
      ? dto.slug.trim()
      : slugify(name, { lower: true, strict: true });

    if (!slug) {
      throw new BadRequestException('Invalid slug');
    }

    const existingName = await this.prisma.category.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },
      },
    });

    if (existingName) {
      throw new ConflictException('Category name already exists');
    }

    const existingSlug = await this.prisma.category.findUnique({
      where: { slug },
    });

    if (existingSlug) {
      throw new ConflictException('Category slug already exists');
    }

    const category = await this.prisma.category.create({
      data: {
        name,
        slug,
        description: dto.description?.trim() || null,
      },
    });

    return {
      success: true,
      message: 'Category created successfully',
      data: category,
    };
  }

  async findAll() {
    return { success: true, data: await this.prisma.category.findMany() };
  }

  async findOne(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { movies: true },
    });

    if (!category) throw new NotFoundException('Category not found');
    return { success: true, data: category };
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const existCategory = await this.prisma.category.findUnique({
      where: { id },
    });
    if (!existCategory) throw new NotFoundException('Category not found');

    let slug: string | undefined = undefined;
    if (updateCategoryDto.name) {
      slug = slugify(updateCategoryDto.name, { lower: true, strict: true });
    }

    if (slug) {
      const slugExists = await this.prisma.category.findFirst({
        where: { slug, NOT: { id } },
      });
      if (slugExists) {
        throw new BadRequestException('Category slug already exists');
      }
    }

    const updatedCategory = await this.prisma.category.update({
      where: { id },
      data: {
        ...updateCategoryDto,
        slug: slug || updateCategoryDto.slug,
      },
    });

    return { success: true, data: updatedCategory };
  }
  async remove(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });
    if (!category) throw new NotFoundException('Category not found');

    const relatedMovies = await this.prisma.movieCategory.findFirst({
      where: { categoryId: id },
    });
    if (relatedMovies) {
      throw new BadRequestException(
        'Cannot delete category with related movies. Remove or reassign them first.',
      );
    }

    await this.prisma.category.delete({
      where: { id },
    });

    return { success: true, message: 'Category deleted successfully' };
  }
}
