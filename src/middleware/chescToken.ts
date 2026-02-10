import { Injectable, NestMiddleware, UnauthorizedException } from "@nestjs/common";
import { NextFunction, Response,Request } from "express";
@Injectable()
export class TokenMiddleware implements NestMiddleware{
    use(req: Request, res: Response, next: NextFunction) {
    console.log("Serverga shu user so'rov jo'natdi: ",req.headers["user-agent"])
    next()         
    }
}