import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import GraphQLUpload from 'graphql-upload/public/GraphQLUpload.js';
import { FileUpload } from 'graphql-upload';
import { UserService } from './users.service';

@Resolver('User')
export class UserResolver {
  constructor(private readonly userService: UserService) { }

  @Query('getUsers')
  async getUsers() {
    return this.userService.findAll();
  }

  @Mutation('createUser')
  async createUser(
    @Args('name') name: string,
    @Args('password') password: string,
    @Args({ name: 'age', type: () => Int, nullable: true }) age: number,
    @Args({ name: 'file', type: () => GraphQLUpload, nullable: true }) file: FileUpload,
  ) {
    return this.userService.create({ name, age, password, file });
  }
}
