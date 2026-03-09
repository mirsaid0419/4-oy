import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleGuard } from 'src/common/guards/role.guard';
import { TokenGuard } from 'src/common/guards/token.guard';
import { Role } from '@prisma/client';
import { Roles } from 'src/common/decorators/role';

@ApiBearerAuth()
@ApiTags('review')
@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) { }

  @ApiOperation({ summary: `${Role.user}` })
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.user)
  @Post()
  create(@Body() createReviewDto: CreateReviewDto, @Req() req: any) {
    return this.reviewService.create(createReviewDto, req.user.id);
  }

  @ApiOperation({ summary: 'Get all reviews (Admin only)' })
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.admin, Role.superadmin)
  @Get()
  findAll() {
    return this.reviewService.findAll();
  }

  @ApiOperation({ summary: 'Get reviews by movie' })
  @Get('movie/:movieId')
  findByMovie(@Param('movieId') movieId: string) {
    return this.reviewService.findByMovieId(+movieId);
  }

  @ApiOperation({ summary: 'Get single review' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reviewService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update review' })
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.user, Role.admin, Role.superadmin)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReviewDto: UpdateReviewDto) {
    return this.reviewService.update(+id, updateReviewDto);
  }

  @ApiOperation({ summary: 'Remove review' })
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.user, Role.admin, Role.superadmin)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reviewService.remove(+id);
  }
}
