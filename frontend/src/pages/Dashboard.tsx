import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  BarChart3,
  Users,
  Plus,
  Trash2,
  Filter,
  Search,
  Bell,
  PanelLeftClose,
  PanelLeft,
  Activity,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Server,
  TrendingUp,
  Mail,
  ShieldCheck
} from 'lucide-react';

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  dueDate?: string | null;
  isOverdue?: boolean;
  tags?: string[];
  assignee?: {
    name: string;
    avatar?: string;
  };
}

export interface ActivityItem {
  id: string;
  user: string;
  action: string;
  time: string;
  type: 'task' | 'system' | 'member';
}

const INITIAL_TASKS: Task[] = [
  {
    id: 'PLS-901',
    title: 'Migrate Relational Schema to Prisma v6 Engine',
    description: 'Ensure clean migrations and update data access wrappers across API routes.',
    status: 'IN_PROGRESS',
    priority: 'CRITICAL',
    dueDate: new Date().toISOString(),
    tags: ['Backend', 'Prisma', 'Database'],
    assignee: { name: 'Aditya Agarwal' },
  },
  {
    id: 'PLS-904',
    title: 'Integrate WebSockets Engine for Dynamic Feeds',
    description: 'Establish Socket.io event channels for real-time task status updates.',
    status: 'TODO',
    priority: 'HIGH',
    dueDate: new Date().toISOString(),
    tags: ['WebSockets', 'Node.js'],
    assignee: { name: 'Aditya Agarwal' },
  },
  {
    id: 'PLS-882',
    title: 'Implement Dark Palette Tailwind Layout',
    description: 'Refactor UI components to clean industrial zinc themes.',
    status: 'DONE',
    priority: 'MEDIUM',
    dueDate: new Date().toISOString(),
    tags: ['Frontend', 'React'],
    assignee: { name: 'Aditya Agarwal' },
  },
];

const INITIAL_ACTIVITIES: ActivityItem[] = [
  { id: 'act-101', user: 'Aditya Agarwal', action: 'merged PR #402 into main branch', time: 'Just now', type: 'task' },
  { id: 'act-102', user: 'Socket Server', action: 'Broadcast payload dispatched to clients', time: 'Just now', type: 'system' },
  { id: 'act-103', user: 'Aditya Agarwal', action: 'updated task status to IN_PROGRESS', time: '5 mins ago', type: 'task' },
];

export function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [activities, setActivities] = useState<ActivityItem[]>(INITIAL_ACTIVITIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tasks' | 'analytics' | 'team'>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [newTag, setNewTag] = useState('');
  const [tagsList, setTagsList] = useState<string[]>(['Frontend', 'React']);

  // Load tasks from backend DB on mount
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/tasks');
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            setTasks(data);
          }
        }
      } catch (error) {
        console.warn('Backend server unreachable, using initial local state.', error);
      }
    };

    fetchTasks();
  }, []);

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.tags && task.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesStatus = selectedStatus === 'ALL' || task.status === selectedStatus;
    const matchesPriority = selectedPriority === 'ALL' || task.priority === selectedPriority;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const totalTasks = tasks.length;
  const inDevTasks = tasks.filter((t) => t.status === 'IN_PROGRESS' || t.status === 'TODO').length;
  const completedTasks = tasks.filter((t) => t.status === 'DONE').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handleAddTag = () => {
    if (newTag.trim() && !tagsList.includes(newTag.trim())) {
      setTagsList([...tagsList, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTagsList(tagsList.filter((t) => t !== tagToRemove));
  };

  // Submit task with valid Prisma ISO DateTime string
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    // Generate valid Prisma DateTime ISO format
    const isoDueDate = new Date().toISOString();

    const newTaskPayload = {
      title: newTitle,
      description: newDescription || null,
      priority: newPriority,
      status: 'TODO',
      dueDate: isoDueDate,
      tags: tagsList,
    };

    try {
      const response = await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTaskPayload),
      });

      if (response.ok) {
        const savedTask = await response.json();
        setTasks((prev) => [savedTask, ...prev]);
      } else {
        const fallbackTask: Task = {
          id: `PLS-${Math.floor(100 + Math.random() * 900)}`,
          title: newTitle,
          description: newDescription || 'No description',
          status: 'TODO',
          priority: newPriority,
          dueDate: isoDueDate,
          tags: tagsList,
          assignee: { name: 'Aditya Agarwal' },
        };
        setTasks((prev) => [fallbackTask, ...prev]);
      }
    } catch (error) {
      console.warn('Network error saving task:', error);
      const fallbackTask: Task = {
        id: `PLS-${Math.floor(100 + Math.random() * 900)}`,
        title: newTitle,
        description: newDescription || 'No description',
        status: 'TODO',
        priority: newPriority,
        dueDate: isoDueDate,
        tags: tagsList,
        assignee: { name: 'Aditya Agarwal' },
      };
      setTasks((prev) => [fallbackTask, ...prev]);
    }

    setActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        user: 'Aditya Agarwal',
        action: `created task: ${newTitle}`,
        time: 'Just now',
        type: 'task',
      },
      ...prev,
    ]);

    setNewTitle('');
    setNewDescription('');
    setNewPriority('MEDIUM');
    setTagsList(['Frontend', 'React']);
    setIsModalOpen(false);
  };

  const handleUpdateStatus = (taskId: string, newStatus: Task['status']) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    setActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        user: 'Aditya Agarwal',
        action: `updated status on ${taskId} to ${newStatus}`,
        time: 'Just now',
        type: 'task',
      },
      ...prev,
    ]);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <header className="h-14 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur px-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
            title="Toggle Sidebar"
          >
            {isSidebarCollapsed ? <PanelLeft className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center font-bold text-white shadow-sm">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base tracking-tight text-white">PulseCraft</span>
            <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded border border-zinc-700 font-mono">
              Workspace
            </span>
          </div>
        </div>

        {/* Global Search */}
        <div className="hidden md:flex items-center relative w-72">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3" />
          <input
            type="text"
            placeholder="Search tasks, tags, IDs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-md text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-blue-600 transition-colors"
          />
        </div>

        {/* Top Header Actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 px-2.5 py-1 rounded-full font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>17ms</span>
          </div>

          <button className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
          </button>

          <div className="h-4 w-[1px] bg-zinc-800"></div>

          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-xs border border-blue-500">
              AA
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-zinc-200 leading-none">Aditya Agarwal</div>
              <div className="text-[10px] text-zinc-500 leading-tight mt-0.5">Student Developer</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`${
            isSidebarCollapsed ? 'w-16' : 'w-56'
          } border-r border-zinc-800 bg-zinc-900/50 flex flex-col justify-between transition-all duration-200 z-20 shrink-0`}
        >
          <div className="p-3 space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span>Dashboard</span>}
            </button>

            <button
              onClick={() => setActiveTab('tasks')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'tasks'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              <CheckSquare className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && (
                <div className="flex items-center justify-between w-full">
                  <span>Tasks</span>
                  <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.2 rounded">
                    {totalTasks}
                  </span>
                </div>
              )}
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'analytics'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              <BarChart3 className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span>Analytics</span>}
            </button>

            <button
              onClick={() => setActiveTab('team')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'team'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              <Users className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && (
                <div className="flex items-center justify-between w-full">
                  <span>Team</span>
                  <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.2 rounded">14</span>
                </div>
              )}
            </button>
          </div>

          {!isSidebarCollapsed && (
            <div className="p-3 m-3 bg-zinc-950 border border-zinc-800 rounded-md">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-zinc-400">PostgreSQL</span>
                <span className="text-[10px] text-emerald-400 font-mono">Connected</span>
              </div>
              <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-full"></div>
              </div>
              <div className="text-[10px] text-zinc-500 mt-2 flex justify-between">
                <span>Prisma Engine</span>
                <span>Port: 5432</span>
              </div>
            </div>
          )}
        </aside>

        {/* Dynamic Views Rendering based on activeTab */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {activeTab === 'dashboard' && (
            <>
              {/* Header Banner */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/60 border border-zinc-800 rounded-lg p-5">
                <div>
                  <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 px-2.5 py-0.5 rounded-md mb-2">
                    <Activity className="w-3.5 h-3.5" />
                    Active Sprint Overview
                  </div>
                  <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                    Task Execution & Real-time Progress
                  </h1>
                  <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
                    Track active software deliverables, component updates, and team activity streams in one central dashboard.
                  </p>
                </div>

                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md text-xs font-semibold shadow-sm transition-colors shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  New Deliverable
                </button>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-zinc-900/40 border border-zinc-800 rounded-lg p-4">
                  <div className="flex items-center justify-between text-zinc-400 mb-2">
                    <span className="text-xs font-medium uppercase tracking-wider">Team Active</span>
                    <Users className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">14</div>
                  <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>Active socket connection</span>
                  </div>
                </div>

                <div className="bg-zinc-900/40 border border-zinc-800 rounded-lg p-4">
                  <div className="flex items-center justify-between text-zinc-400 mb-2">
                    <span className="text-xs font-medium uppercase tracking-wider">In Development</span>
                    <Clock className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">{inDevTasks}</div>
                  <div className="flex items-center justify-between mt-2 text-[11px] text-zinc-400">
                    <span>{tasks.filter((t) => t.status === 'IN_PROGRESS').length} In Dev</span>
                    <span>{tasks.filter((t) => t.status === 'REVIEW').length} In Review</span>
                  </div>
                </div>

                <div className="bg-zinc-900/40 border border-zinc-800 rounded-lg p-4">
                  <div className="flex items-center justify-between text-zinc-400 mb-2">
                    <span className="text-xs font-medium uppercase tracking-wider">Completed Rate</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">{completionRate}%</div>
                  <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-300"
                      style={{ width: `${completionRate}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-zinc-900/40 border border-zinc-800 rounded-lg p-4">
                  <div className="flex items-center justify-between text-zinc-400 mb-2">
                    <span className="text-xs font-medium uppercase tracking-wider">System Uptime</span>
                    <Server className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">99.9%</div>
                  <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>All services operational</span>
                  </div>
                </div>
              </div>

              {/* Board Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-zinc-900/40 border border-zinc-800 rounded-lg p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                      <div>
                        <h2 className="text-sm font-bold text-white">Tasks & Deliverables ({filteredTasks.length})</h2>
                        <p className="text-xs text-zinc-400">Manage task state and priorities</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 px-2.5 py-1 rounded-md text-xs text-zinc-300">
                          <Filter className="w-3.5 h-3.5 text-zinc-500" />
                          <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="bg-transparent text-zinc-300 focus:outline-none cursor-pointer"
                          >
                            <option value="ALL" className="bg-zinc-900 text-white">All Statuses</option>
                            <option value="TODO" className="bg-zinc-900 text-white">Todo</option>
                            <option value="IN_PROGRESS" className="bg-zinc-900 text-white">In Progress</option>
                            <option value="REVIEW" className="bg-zinc-900 text-white">In Review</option>
                            <option value="DONE" className="bg-zinc-900 text-white">Done</option>
                          </select>
                        </div>

                        <button
                          onClick={() => setIsModalOpen(true)}
                          className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Task</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {filteredTasks.length === 0 ? (
                        <div className="p-8 text-center border border-dashed border-zinc-800 rounded-lg">
                          <AlertCircle className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                          <p className="text-xs text-zinc-400">No tasks found matching your filter criteria.</p>
                        </div>
                      ) : (
                        filteredTasks.map((task) => (
                          <div
                            key={task.id}
                            className="bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-lg p-3.5 transition-colors group"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] font-mono text-zinc-500 font-bold">{task.id}</span>
                                  <span
                                    className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase tracking-wider ${
                                      task.priority === 'CRITICAL'
                                        ? 'bg-red-950/60 border-red-800/60 text-red-400'
                                        : task.priority === 'HIGH'
                                        ? 'bg-amber-950/60 border-amber-800/60 text-amber-400'
                                        : task.priority === 'MEDIUM'
                                        ? 'bg-blue-950/60 border-blue-800/60 text-blue-400'
                                        : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                                    }`}
                                  >
                                    {task.priority}
                                  </span>
                                </div>

                                <h3 className="text-sm font-semibold text-zinc-100 group-hover:text-blue-400 transition-colors">
                                  {task.title}
                                </h3>
                                {task.description && (
                                  <p className="text-xs text-zinc-400 line-clamp-2">{task.description}</p>
                                )}
                              </div>

                              <div className="flex items-center gap-1 shrink-0 bg-zinc-900 border border-zinc-800 p-1 rounded-md">
                                {(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'] as const).map((st) => (
                                  <button
                                    key={st}
                                    onClick={() => handleUpdateStatus(task.id, st)}
                                    className={`text-[10px] px-2 py-0.5 rounded font-mono transition-colors ${
                                      task.status === st
                                        ? 'bg-blue-600 text-white font-bold'
                                        : 'text-zinc-500 hover:text-zinc-300'
                                    }`}
                                  >
                                    {st === 'IN_PROGRESS' ? 'DEV' : st}
                                  </button>
                                ))}

                                <button
                                  onClick={() => handleDeleteTask(task.id)}
                                  className="p-1 text-zinc-600 hover:text-red-400 transition-colors ml-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-zinc-900 text-xs text-zinc-500">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {task.tags &&
                                  task.tags.map((tag) => (
                                    <span
                                      key={tag}
                                      className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-400 px-2 py-0.5 rounded"
                                    >
                                      #{tag}
                                    </span>
                                  ))}
                              </div>

                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                                  <Calendar className="w-3 h-3 text-zinc-500" />
                                  <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Upcoming'}</span>
                                </div>

                                <div className="flex items-center gap-1.5">
                                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                                    AA
                                  </div>
                                  <span className="text-[11px] text-zinc-300 hidden sm:inline">Aditya Agarwal</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Activity Feed */}
                <div className="space-y-4">
                  <div className="bg-zinc-900/40 border border-zinc-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-blue-500" />
                        <h2 className="text-sm font-bold text-white">Activity Log</h2>
                      </div>
                      <span className="text-[10px] bg-zinc-950 text-emerald-400 border border-zinc-800 px-2 py-0.5 rounded font-mono">
                        Live
                      </span>
                    </div>

                    <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                      {activities.map((act) => (
                        <div
                          key={act.id}
                          className="bg-zinc-950 border border-zinc-800/80 rounded-md p-2.5 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-blue-400">{act.user}</span>
                            <span className="text-[10px] text-zinc-500 font-mono">{act.time}</span>
                          </div>
                          <p className="text-zinc-300 text-[11px] leading-snug">{act.action}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: TASKS VIEW */}
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-zinc-900/60 border border-zinc-800 p-5 rounded-lg">
                <div>
                  <h1 className="text-xl font-bold text-white">All Deliverables ({filteredTasks.length})</h1>
                  <p className="text-xs text-zinc-400">Complete list of registered project scope items</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-md text-xs font-semibold flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Add Deliverable
                </button>
              </div>

              <div className="bg-zinc-900/40 border border-zinc-800 rounded-lg p-4 space-y-3">
                {filteredTasks.map((task) => (
                  <div key={task.id} className="bg-zinc-950 border border-zinc-800 rounded-md p-3.5 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-zinc-500 font-bold">{task.id}</span>
                        <span className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded uppercase font-bold">
                          {task.status}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-zinc-100">{task.title}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ANALYTICS VIEW */}
          {activeTab === 'analytics' && (
            <div className="space-y-4">
              <div className="bg-zinc-900/60 border border-zinc-800 p-5 rounded-lg">
                <h1 className="text-xl font-bold text-white">Sprint Metrics & Diagnostics</h1>
                <p className="text-xs text-zinc-400">Live operational data and task completion trends</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-200">Completion Health</span>
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-3xl font-bold text-white">{completionRate}%</div>
                  <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full" style={{ width: `${completionRate}%` }}></div>
                  </div>
                </div>

                <div className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-200">Database Driver</span>
                    <ShieldCheck className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">Prisma ORM</div>
                  <p className="text-xs text-zinc-400">Connected to PostgreSQL on localhost:5432</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TEAM VIEW */}
          {activeTab === 'team' && (
            <div className="space-y-4">
              <div className="bg-zinc-900/60 border border-zinc-800 p-5 rounded-lg">
                <h1 className="text-xl font-bold text-white">Team Roster (14 Active)</h1>
                <p className="text-xs text-zinc-400">Collaborators connected through WebSockets</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { name: 'Aditya Agarwal', role: 'Full-Stack Developer', lead: true },
                  { name: 'Sarah Jenkins', role: 'Backend Engineer', lead: false },
                  { name: 'Michael Chen', role: 'DevOps / Infrastructure', lead: false },
                ].map((member, i) => (
                  <div key={i} className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-lg flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0">
                      {member.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{member.name}</div>
                      <div className="text-xs text-zinc-400">{member.role}</div>
                      <div className="flex items-center gap-1 text-[10px] text-emerald-400 mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>Connected</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* New Task Creator Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800 bg-zinc-950">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-500" />
                Create New Deliverable
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-500 hover:text-white transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 font-medium mb-1.5">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement WebSocket Reconnection Handler"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-medium mb-1.5">Technical Description</label>
                <textarea
                  rows={3}
                  placeholder="Detail implementation requirements, dependencies, and verification steps..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-600 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 font-medium mb-1.5">Priority Level</label>
                  <select
                    value={newPriority}
                    onChange={(e) =>
                      setNewPriority(e.target.value as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL')
                    }
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md text-zinc-200 focus:outline-none focus:border-blue-600"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 font-medium mb-1.5">Assignee</label>
                  <input
                    type="text"
                    disabled
                    value="Aditya Agarwal"
                    className="w-full px-3 py-2 bg-zinc-950/50 border border-zinc-800 rounded-md text-zinc-400 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 font-medium mb-1.5">Tags</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Add tag (e.g. React, Prisma)"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-md text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-600"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {tagsList.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 bg-zinc-950 border border-zinc-800 text-zinc-300 px-2 py-0.5 rounded text-[11px]"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-zinc-500 hover:text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-md transition-colors"
                >
                  Save Task to Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;