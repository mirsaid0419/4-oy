import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import {Pool} from "pg"
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy, OnModuleInit
{
    constructor(){
        const connectionString = process.env.DATABASE_URL;
        const pool = new Pool({connectionString})
        const adapter = new PrismaPg(pool)
        super({
            adapter,
            log:["error","warn"]
        }) 
    }
    async onModuleInit() {
        await this.$connect()
    }
    async onModuleDestroy() {
        await this.$disconnect()
    }
}