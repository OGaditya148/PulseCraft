import { Response } from 'express';
import { PrismaClient, Role, Status } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { getIO } from '../utils/socket';

const prisma = new PrismaClient();

export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, role } = req.user!;
    let filter: any = {};

    if (role === Role.PROJECT_MANAGER) filter.project = { createdById: userId };
    else if (role === Role.DEVELOPER) filter.developerId = userId;

    const tasks = await prisma.task.findMany({
      where: filter,
      include: { project: true, developer: true }
    });

    return res.json(tasks);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

export const updateTaskStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;
    const { userId } = req.user!;

    const task = await prisma.task.findUnique({ where: { id: taskId }, include: { project: true } });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const updatedTask = await prisma.task.update({ where: { id: taskId }, data: { status } });
    const user = await prisma.user.findUnique({ where: { id: userId } });

    const activity = await prisma.activityLog.create({
      data: {
        message: `${user?.name} moved Task '${task.title}' to ${status}`,
        userId,
        taskId: task.id,
        projectId: task.projectId
      }
    });

    getIO().emit('activity_feed', { activity, roleAccess: { projectId: task.projectId, developerId: task.developerId, pmId: task.project.createdById } });
    return res.json(updatedTask);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update task' });
  }
};

export const getActivityFeed = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, role } = req.user!;
    let filter: any = {};

    if (role === Role.PROJECT_MANAGER) filter.project = { createdById: userId };
    else if (role === Role.DEVELOPER) filter.task = { developerId: userId };

    const logs = await prisma.activityLog.findMany({
      where: filter,
      take: 20,
      orderBy: { createdAt: 'desc' }
    });

    return res.json(logs);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch activity feed' });
  }
};