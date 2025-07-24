import { api, PaginatedResponse } from '../api';
import type {
  Task,
  CreateTaskRequest,
  TasksQueryParams,
  TaskStats,
  TaskStatus,
  TaskPriority,
} from '../types';

/**
 * Tasks API client with strongly-typed endpoints
 */
export const tasksApi = {
  /**
   * Get tasks with pagination and filtering
   */
  getAll: async (params?: TasksQueryParams): Promise<PaginatedResponse<Task>> => {
    return api.get<PaginatedResponse<Task>>('/tasks', params);
  },

  /**
   * Get task by ID
   */
  getById: async (id: string): Promise<Task> => {
    return api.get<Task>(`/tasks/${id}`);
  },

  /**
   * Create a new task
   */
  create: async (taskData: CreateTaskRequest): Promise<Task> => {
    return api.post<Task>('/tasks', taskData);
  },

  /**
   * Get task statistics
   */
  getStats: async (): Promise<TaskStats> => {
    return api.get<TaskStats>('/tasks/stats');
  },

  /**
   * Get tasks for a specific agent
   */
  getByAgent: async (agentId: string, params?: Omit<TasksQueryParams, 'agentId'>): Promise<PaginatedResponse<Task>> => {
    return api.get<PaginatedResponse<Task>>('/tasks', { ...params, agentId });
  },

  /**
   * Get tasks by status
   */
  getByStatus: async (status: TaskStatus, params?: Omit<TasksQueryParams, 'status'>): Promise<PaginatedResponse<Task>> => {
    return api.get<PaginatedResponse<Task>>('/tasks', { ...params, status });
  },

  /**
   * Get tasks by priority
   */
  getByPriority: async (priority: TaskPriority, params?: Omit<TasksQueryParams, 'priority'>): Promise<PaginatedResponse<Task>> => {
    return api.get<PaginatedResponse<Task>>('/tasks', { ...params, priority });
  },

  /**
   * Get pending tasks
   */
  getPending: async (params?: Omit<TasksQueryParams, 'status'>): Promise<PaginatedResponse<Task>> => {
    return tasksApi.getByStatus('pending', params);
  },

  /**
   * Get running tasks
   */
  getRunning: async (params?: Omit<TasksQueryParams, 'status'>): Promise<PaginatedResponse<Task>> => {
    return tasksApi.getByStatus('running', params);
  },

  /**
   * Get completed tasks
   */
  getCompleted: async (params?: Omit<TasksQueryParams, 'status'>): Promise<PaginatedResponse<Task>> => {
    return tasksApi.getByStatus('completed', params);
  },

  /**
   * Get failed tasks
   */
  getFailed: async (params?: Omit<TasksQueryParams, 'status'>): Promise<PaginatedResponse<Task>> => {
    return tasksApi.getByStatus('failed', params);
  },

  /**
   * Get recent tasks (last 50)
   */
  getRecent: async (): Promise<PaginatedResponse<Task>> => {
    return api.get<PaginatedResponse<Task>>('/tasks', {
      limit: 50,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  },

  /**
   * Get critical priority tasks
   */
  getCritical: async (): Promise<PaginatedResponse<Task>> => {
    return tasksApi.getByPriority('critical');
  },

  /**
   * Get high priority tasks
   */
  getHighPriority: async (): Promise<PaginatedResponse<Task>> => {
    return tasksApi.getByPriority('high');
  },

  /**
   * Get task summary for dashboard
   */
  getSummary: async () => {
    const stats = await tasksApi.getStats();
    
    return {
      total: stats.total,
      pending: stats.byStatus.pending,
      running: stats.byStatus.running,
      completed: stats.byStatus.completed,
      failed: stats.byStatus.failed,
      completionRate: stats.completionRate,
      averageExecutionTime: stats.averageExecutionTime,
      criticalTasks: stats.byPriority.critical,
      highPriorityTasks: stats.byPriority.high,
    };
  },

  /**
   * Get live task metrics for real-time monitoring
   */
  getLiveMetrics: async () => {
    const [stats, recentTasks] = await Promise.all([
      tasksApi.getStats(),
      tasksApi.getRecent(),
    ]);

    // Calculate additional metrics
    const recentCompletedTasks = recentTasks.tasks.filter(task => task.status === 'completed');
    const recentFailedTasks = recentTasks.tasks.filter(task => task.status === 'failed');
    
    const recentSuccessRate = recentTasks.tasks.length > 0 
      ? (recentCompletedTasks.length / recentTasks.tasks.length) * 100 
      : 0;

    return {
      ...stats,
      recentTasks: recentTasks.tasks.slice(0, 10), // Last 10 tasks
      recentSuccessRate,
      activeTasksCount: stats.byStatus.running + stats.byStatus.pending,
      errorRate: recentTasks.tasks.length > 0 
        ? (recentFailedTasks.length / recentTasks.tasks.length) * 100 
        : 0,
    };
  },

  /**
   * Get tasks for a specific time period
   */
  getByDateRange: async (startDate: Date, endDate: Date, params?: Omit<TasksQueryParams, 'createdAt'>): Promise<PaginatedResponse<Task>> => {
    // Note: This would require backend support for date filtering
    // For now, we'll get all tasks and filter client-side (not recommended for production)
    const allTasks = await tasksApi.getAll(params);
    
    const filteredTasks = allTasks.tasks.filter(task => {
      const taskDate = new Date(task.createdAt);
      return taskDate >= startDate && taskDate <= endDate;
    });

    return {
      tasks: filteredTasks,
      pagination: {
        ...allTasks.pagination,
        total: filteredTasks.length,
        totalPages: Math.ceil(filteredTasks.length / (params?.limit || 20)),
      },
    };
  },

  /**
   * Get task execution trends
   */
  getExecutionTrends: async () => {
    const stats = await tasksApi.getStats();
    const recentTasks = await tasksApi.getRecent();

    // Group tasks by hour for the last 24 hours
    const hourlyTasks: Record<string, number> = {};
    const now = new Date();
    
    // Initialize with zeros for the last 24 hours
    for (let i = 23; i >= 0; i--) {
      const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
      const key = hour.getHours().toString().padStart(2, '0');
      hourlyTasks[key] = 0;
    }

    // Count tasks for each hour
    recentTasks.tasks.forEach(task => {
      const taskHour = new Date(task.createdAt).getHours().toString().padStart(2, '0');
      if (hourlyTasks[taskHour] !== undefined) {
        hourlyTasks[taskHour]++;
      }
    });

    return {
      hourlyData: Object.entries(hourlyTasks).map(([hour, count]) => ({
        hour: `${hour}:00`,
        count,
      })),
      totalExecutions: stats.total,
      avgPerHour: stats.total / 24, // Rough estimate
    };
  },
};

export default tasksApi;
