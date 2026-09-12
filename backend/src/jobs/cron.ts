import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const initCronJobs = () => {
  cron.schedule('0 * * * *', async () => {
    try {
      const now = new Date();
      await prisma.task.updateMany({
        where: { dueDate: { lt: now }, status: { not: 'DONE' }, isOverdue: false },
        data: { isOverdue: true }
      });
    } catch (err) {
      console.error('Error running cron job:', err);
    }
  });
};