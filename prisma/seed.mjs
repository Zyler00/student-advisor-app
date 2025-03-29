import { PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'

const prisma = new PrismaClient()

async function main() {
  const existingAdmin = await prisma.user.findFirst({
    where: {
      role: 'admin',
      username: 'admin'
    }
  })

  if (!existingAdmin) {
    const admin = await prisma.user.create({
      data: {
        id: randomUUID(),
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123',
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
