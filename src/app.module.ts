import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { UsersModule } from './users/users.module';
import GraphQLUpload from 'graphql-upload/public/GraphQLUpload.js';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      typePaths: ['./**/*.gql'], // Barcha .gql fayllarni avtomatik o'qiydi
      definitions: {
        path: join(process.cwd(), 'src/graphql.ts'), // TypeScript tiplarini generatsiya qiladi
      },
      resolvers: { Upload: GraphQLUpload },
      csrfPrevention: false,
    }),
    UsersModule,
  ],
})
export class AppModule { }
