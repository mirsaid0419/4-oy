import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UserDto {
  @Field()
  name: string;

  @Field()
  age: number;

  @Field()
  id: number;
}
