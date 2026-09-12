import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { login } from './controllers/authController';
import { getTasks, updateTaskStatus, getActivityFeed } from './controllers/taskController';
import { authenticateToken } from './middleware/auth';

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.post('/api/auth/login', login);
app.get('/api/tasks', authenticateToken, getTasks);
app.patch('/api/tasks/:taskId/status', authenticateToken, updateTaskStatus);
app.get('/api/activity', authenticateToken, getActivityFeed);

export default app;