import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterStaffDto } from './dto/register-staff';
import { CreateStaffDto } from '../staffs/dto/create-staff.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService:AuthService){}
    @Post("staff")
    async StaffRegister(@Body() data: CreateStaffDto){
        const result=await this.authService.StaffRegister(data)
        return {
            succes:true,
            staff:result
        }
    }
    // @Post("student")
    // async StudentRegister(@Body() data: RegisterStudentDto){
    //     const result = await this.authService.Register(data)
    // }
}
