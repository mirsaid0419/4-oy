// import { PrismaClient } from '@prisma/client';
// import { Staff } from 'src/modules/staffs/entities/staff.entity';
// import * as bcrypt from "bcrypt"
// const prisma = new PrismaClient();
// async function main() {
//   const existSuper = await prisma.staff.findFirst({
//     where: { role: 'superadmin' },
//   });
//   if (existSuper) {console.log('Super admin already exist')}else{
//     const pass=await bcrypt.hash(process.env.SUPER_PASS,10)
//     await prisma.staff.create({data:{first_name:"Mirsaid",last_name:"Abduqulov",username:"mirsaid",password: }})
//   }
// }
