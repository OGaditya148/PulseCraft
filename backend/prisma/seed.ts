import { PrismaClient, Role, Status, Priority } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  await prisma.notification.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: { name: 'Admin User', email: 'admin@test.com', password: hashedPassword, role: Role.ADMIN }
  });

  const pm1 = await prisma.user.create({
    data: { name: 'PM One', email: 'pm1@test.com', password: hashedPassword, role: Role.PROJECT_MANAGER }
  });
  const pm2 = await prisma.user.create({
    data: { name: 'PM Two', email: 'pm2@test.com', password: hashedPassword, role: Role.PROJECT_MANAGER }
  });

  const dev1 = await prisma.user.create({
    data: { name: 'Dev One', email: 'dev1@test.com', password: hashedPassword, role: Role.DEVELOPER }
  });
  const dev2 = await prisma.user.create({
    data: { name: 'Dev Two', email: 'dev2@test.com', password: hashedPassword, role: Role.DEVELOPER }
  });
  const dev3 = await prisma.user.create({
    data: { name: 'Dev Three', email: 'dev3@test.com', password: hashedPassword, role: Role.DEVELOPER }
  });
  const dev4 = await prisma.user.create({
    data: { name: 'Dev Four', email: 'dev4@test.com', password: hashedPassword, role: Role.DEVELOPER }
  });

  const client = await prisma.client.create({
    data: { name: 'Acme Corp', email: 'contact@acme.com' }
  });

  const proj1 = await prisma.project.create({
    data: { title: 'E-commerce App', description: 'Storefront', clientId: client.id, createdById: pm1.id }
  });
  const proj2 = await prisma.project.create({
    data: { title: 'Mobile App', description: 'iOS and Android', clientId: client.id, createdById: pm1.id }
  });
  const proj3 = await prisma.project.create({
    data: { title: 'CRM Portal', description: 'Internal tool', clientId: client.id, createdById: pm2.id }
  });

  const task1 = await prisma.task.create({
    data: { title: 'Setup Auth', priority: Priority.HIGH, status: Status.IN_PROGRESS, dueDate: new Date(Date.now() - 86400000), isOverdue: true, projectId: proj1.id, developerId: dev1.id }
  });
  const task2 = await prisma.task.create({
    data: { title: 'Design Schema', priority: Priority.CRITICAL, status: Status.DONE, dueDate: new Date(Date.now() - 172800000), isOverdue: true, projectId: proj1.id, developerId: dev2.id }
  });

  await prisma.activityLog.createMany({
    data: [
      { message: 'Dev One moved task Setup Auth to IN_PROGRESS', userId: dev1.id, taskId: task1.id, projectId: proj1.id },
      { message: 'Dev Two moved task Design Schema to DONE', userId: dev2.id, taskId: task2.id, projectId: proj1.id }
    ]
  });

  console.log('Seed completed successfully');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});