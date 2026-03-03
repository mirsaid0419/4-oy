import { Body, Controller, Get, Post } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}
  @Post()
  create(@Body() payload: any) {
    return this.userService.create(payload);
  }

  @Get()
  get(@Body() req: any) {
    return this.userService.get(req.email);
  }
}
