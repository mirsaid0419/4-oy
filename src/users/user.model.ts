import { Field, ObjectType, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field(() => ID)
  id: number;

  @Field({ nullable: true })
  name?: string | null;

  @Field(() => Int, { nullable: true })
  age?: number | null;

  @Field({ nullable: true })
  profileImage?: string | null;
}
