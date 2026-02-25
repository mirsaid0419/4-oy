import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards,Req } from '@nestjs/common';
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
  constructor(private readonly reviewService: ReviewService) {}

  @ApiOperation({ summary: `${Role.user}` })
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.user)
  @Post()
  create(@Body() createReviewDto: CreateReviewDto,@Req() req: Request) {
    return this.reviewService.create(createReviewDto,req["user"]["id"]);
  }

  @Get()
  findAll() {
    return this.reviewService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reviewService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReviewDto: UpdateReviewDto) {
    return this.reviewService.update(+id, updateReviewDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reviewService.remove(+id);
  }
}
