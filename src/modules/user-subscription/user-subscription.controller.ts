import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UserSubscriptionService } from './user-subscription.service';
import { CreateUserSubscriptionDto } from './dto/create-user-subscription.dto';
import { UpdateUserSubscriptionDto } from './dto/update-user-subscription.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/role';
import { Role } from '@prisma/client';
import { TokenGuard } from 'src/common/guards/token.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
@ApiBearerAuth()
@ApiTags('user-subscription')
@Controller('user-subscription')
export class UserSubscriptionController {
  constructor(
    private readonly userSubscriptionService: UserSubscriptionService,
  ) {}

  @ApiOperation({ summary: `${Role.user}` })
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.user)
  @Post()
  create(
    @Body() createUserSubscriptionDto: CreateUserSubscriptionDto,
    @Req() req: Request,
  ) {
    return this.userSubscriptionService.create(
      createUserSubscriptionDto,
      req['user'],
    );
  }

  @ApiOperation({ summary: `${Role.superadmin},${Role.admin}` })
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.superadmin, Role.admin)
  @Get('all/active')
  findAllActive() {
    return this.userSubscriptionService.findAllActive();
  }

  @ApiOperation({ summary: `${Role.superadmin},${Role.admin}` })
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.superadmin, Role.admin)
  @Get('all/expired')
  findAllExpired() {
    return this.userSubscriptionService.findAllExpired();
  }

  @ApiOperation({ summary: `${Role.user}` })
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.user)
  @Get('me')
  findOneSubscriptionsMe(@Req() req: Request) {
    return this.userSubscriptionService.findOneSubscriptionsMe(+req['user'].id);
  }

  @ApiOperation({ summary: `${Role.superadmin},${Role.admin}` })
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.superadmin, Role.admin)
  @Get('user/:id')
  findOneSubscriptionsUser(@Param('id') id: string) {
    return this.userSubscriptionService.findOneSubscriptionsUser(+id);
  }

  @ApiOperation({ summary: `${Role.user}` })
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.user)
  @Patch('me')
  updateOneSubscriptionMe(
    @Req() req: Request,
    @Body() updateUserSubscriptionDto: UpdateUserSubscriptionDto,
  ) {
    return this.userSubscriptionService.updateOneSubscriptionMe(
      Number(req['user']!.id),
      updateUserSubscriptionDto,
    );
  }

  @ApiOperation({ summary: `${Role.superadmin},${Role.admin}` })
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(Role.superadmin, Role.admin)
  @Patch('user/:id')
  updateOneSubscriptionUser(
    @Param('id') id: string,
    @Body() updateUserSubscriptionDto: UpdateUserSubscriptionDto,
  ) {
    return this.userSubscriptionService.updateOneSubscriptionUser(
      +id,
      updateUserSubscriptionDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userSubscriptionService.remove(+id);
  }
}
