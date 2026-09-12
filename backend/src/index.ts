import express from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// GET all tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: { id: 'desc' },
    });
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// POST create task
app.post('/api/tasks', async (req, res) => {
  try {
    const { title, description, priority, dueDate } = req.body;

    // Find any existing project or create one safely
    let defaultProject = await prisma.project.findFirst();
    if (!defaultProject) {
      defaultProject = await prisma.project.create({
        data: {} as any,
      });
    }

    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : new Date(),
        isOverdue: false,
        project: {
          connect: { id: defaultProject.id },
        },
      },
    });

    res.status(201).json(newTask);
  } catch (error: any) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task in database', details: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});