export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'PROJECT_MANAGER' | 'DEVELOPER';
}

export interface Task {
  id: string;
  title: string;
  status: 'TO_DO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
  priority: string;
  isOverdue: boolean;
}

export interface ActivityLog {
  id: string;
  message: string;
  createdAt: string;
}