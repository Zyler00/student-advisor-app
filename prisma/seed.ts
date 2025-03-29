import { PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'

const prisma = new PrismaClient()

async function main() {
  // ตรวจสอบว่ามี admin อยู่แล้วหรือไม่
  const existingAdmin = await prisma.user.findFirst({
    where: {
      role: 'admin',
      username: 'admin'
    }
  })

  if (!existingAdmin) {
    // สร้าง admin account
    const admin = await prisma.user.create({
      data: {
        id: randomUUID(),
        username: 'admin',
        email: 'admin@admin.com',
        password: 'admin123', // ในระบบจริงควรเข้ารหัสรหัสผ่าน
        firstName: 'ผู้ดูแล',
        lastName: 'ระบบ',
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
    console.log('Created admin account:', admin)
  } else {
    console.log('Admin account already exists')
  }

  // สร้างข้อมูลทดสอบอื่นๆ ตามต้องการ
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
