import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkConnection() {
  try {
    // Attempt a lightweight database call
    await prisma.$connect();
    console.log('✅ Success: Database connection established!');

    // Fetch user count or initial test record
    const userCount = await prisma.user.count();
    console.log(`📊 Total Users in DB: ${userCount}`);
  } catch (error) {
    console.error('❌ Database Connection Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkConnection();