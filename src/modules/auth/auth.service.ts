import { Injectable } from '@nestjs/common';
import { PrismaServise } from 'src/core/db/prisma.service';
import { StaffsService } from '../staffs/staffs.service';
import { CreateStaffDto } from '../staffs/dto/create-staff.dto';

@Injectable()
export class AuthService {
    constructor(private prisma:PrismaServise,private staffServi:StaffsService){}
    async StaffRegister(payload:CreateStaffDto){
        try {
            const result = await this.staffServi.create(payload)
            return {success:true,staff:result} 
        } catch (error) {
            throw error
        }
    }
}
