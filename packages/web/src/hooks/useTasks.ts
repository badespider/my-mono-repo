import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '@/lib/api/tasks';
import type { TasksQueryParams, CreateTaskRequest, TaskStatus, TaskPriority } from '@/lib/types';

// Query Keys
export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (params?: TasksQueryParams) => [...taskKeys.lists(), params] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
  stats: () => [...taskKeys.all, 'stats'] as const,
  summary: () => [...taskKeys.all, 'summary'] as const,
  liveMetrics: () => [...taskKeys.all, 'liveMetrics'] as const,
  trends: () => [...taskKeys.all, 'trends'] as const,
  byAgent: (agentId: string) => [...taskKeys.lists(), 'agent', agentId] as const,
  byStatus: (status: TaskStatus) => [...taskKeys.lists(), 'status', status] as const,
  byPriority: (priority: TaskPriority) => [...taskKeys.lists(), 'priority', priority] as const,
  recent: () => [...taskKeys.lists(), 'recent'] as const,
};

// Main tasks query with filtering and pagination
export const useTasks = (params?: TasksQueryParams) => {
  return useQuery({
    queryKey: taskKeys.list(params),
    queryFn: () => tasksApi.getAll(params),
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
  });
};

// Individual task query
export const useTask = (id: string) => {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: () => tasksApi.getById(id),
    enabled: !!id,
    staleTime: 30000,
    gcTime: 300000,
  });
};

// Task statistics
export const useTaskStats = () => {
  return useQuery({
    queryKey: taskKeys.stats(),
    queryFn: () => tasksApi.getStats(),
    staleTime: 30000,
    gcTime: 300000,
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });
};

// Task summary for dashboard
export const useTaskSummary = () => {
  return useQuery({
    queryKey: taskKeys.summary(),
    queryFn: () => tasksApi.getSummary(),
    staleTime: 30000,
    gcTime: 300000,
    refetchInterval: 30000,
  });
};

// Live task metrics for real-time monitoring
export const useTaskLiveMetrics = () => {
  return useQuery({
    queryKey: taskKeys.liveMetrics(),
    queryFn: () => tasksApi.getLiveMetrics(),
    staleTime: 15000, // 15 seconds
    gcTime: 60000, // 1 minute
    refetchInterval: 15000, // Auto-refresh every 15 seconds
  });
};

// Task execution trends
export const useTaskExecutionTrends = () => {
  return useQuery({
    queryKey: taskKeys.trends(),
    queryFn: () => tasksApi.getExecutionTrends(),
    staleTime: 60000, // 1 minute
    gcTime: 300000,
    refetchInterval: 60000, // Auto-refresh every minute
  });
};

// Tasks by agent
export const useTasksByAgent = (agentId: string, params?: Omit<TasksQueryParams, 'agentId'>) => {
  return useQuery({
    queryKey: taskKeys.byAgent(agentId),
    queryFn: () => tasksApi.getByAgent(agentId, params),
    enabled: !!agentId,
    staleTime: 30000,
    gcTime: 300000,
  });
};

// Tasks by status
export const useTasksByStatus = (status: TaskStatus, params?: Omit<TasksQueryParams, 'status'>) => {
  return useQuery({
    queryKey: taskKeys.byStatus(status),
    queryFn: () => tasksApi.getByStatus(status, params),
    staleTime: 30000,
    gcTime: 300000,
  });
};

// Tasks by priority
export const useTasksByPriority = (priority: TaskPriority, params?: Omit<TasksQueryParams, 'priority'>) => {
  return useQuery({
    queryKey: taskKeys.byPriority(priority),
    queryFn: () => tasksApi.getByPriority(priority, params),
    staleTime: 30000,
    gcTime: 300000,
  });
};

// Convenience hooks for common status queries
export const usePendingTasks = () => {
  return useQuery({
    queryKey: taskKeys.byStatus('pending'),
    queryFn: () => tasksApi.getPending(),
    staleTime: 15000, // More frequent for pending tasks
    gcTime: 300000,
    refetchInterval: 20000, // Auto-refresh every 20 seconds
  });
};

export const useRunningTasks = () => {
  return useQuery({
    queryKey: taskKeys.byStatus('running'),
    queryFn: () => tasksApi.getRunning(),
    staleTime: 15000,
    gcTime: 300000,
    refetchInterval: 20000,
  });
};

export const useCompletedTasks = () => {
  return useQuery({
    queryKey: taskKeys.byStatus('completed'),
    queryFn: () => tasksApi.getCompleted(),
    staleTime: 60000, // Less frequent for completed tasks
    gcTime: 300000,
  });
};

export const useFailedTasks = () => {
  return useQuery({
    queryKey: taskKeys.byStatus('failed'),
    queryFn: () => tasksApi.getFailed(),
    staleTime: 30000,
    gcTime: 300000,
  });
};

// Recent tasks
export const useRecentTasks = () => {
  return useQuery({
    queryKey: taskKeys.recent(),
    queryFn: () => tasksApi.getRecent(),
    staleTime: 15000,
    gcTime: 300000,
    refetchInterval: 20000,
  });
};

// Priority-based hooks
export const useCriticalTasks = () => {
  return useQuery({
    queryKey: taskKeys.byPriority('critical'),
    queryFn: () => tasksApi.getCritical(),
    staleTime: 15000,
    gcTime: 300000,
    refetchInterval: 15000, // Very frequent for critical tasks
  });
};

export const useHighPriorityTasks = () => {
  return useQuery({
    queryKey: taskKeys.byPriority('high'),
    queryFn: () => tasksApi.getHighPriority(),
    staleTime: 30000,
    gcTime: 300000,
    refetchInterval: 30000,
  });
};

// Mutation hooks
export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskData: CreateTaskRequest) => tasksApi.create(taskData),
    onSuccess: (newTask) => {
      // Invalidate and refetch task lists
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      
      // Add the new task to the cache
      queryClient.setQueryData(taskKeys.detail(newTask.id), newTask);
    },
  });
};

// Custom hooks for dashboard components
export const useTaskDashboard = () => {
  const stats = useTaskStats();
  const liveMetrics = useTaskLiveMetrics();
  const recentTasks = useRecentTasks();
  const criticalTasks = useCriticalTasks();

  return {
    stats: stats.data,
    liveMetrics: liveMetrics.data,
    recentTasks: recentTasks.data?.tasks.slice(0, 10) || [],
    criticalTasks: criticalTasks.data?.tasks || [],
    isLoading: stats.isLoading || liveMetrics.isLoading,
    isError: stats.isError || liveMetrics.isError,
    error: stats.error || liveMetrics.error,
    refetch: () => {
      stats.refetch();
      liveMetrics.refetch();
      recentTasks.refetch();
      criticalTasks.refetch();
    },
  };
};

// Hook for agent-specific task monitoring
export const useAgentTaskMonitoring = (agentId: string) => {
  const agentTasks = useTasksByAgent(agentId);
  const agentRunningTasks = useTasksByStatus('running', { agentId });
  const agentFailedTasks = useTasksByStatus('failed', { agentId });

  return {
    allTasks: agentTasks.data?.tasks || [],
    runningTasks: agentRunningTasks.data?.tasks || [],
    failedTasks: agentFailedTasks.data?.tasks || [],
    totalTasks: agentTasks.data?.pagination.total || 0,
    isLoading: agentTasks.isLoading,
    isError: agentTasks.isError,
    error: agentTasks.error,
    refetch: () => {
      agentTasks.refetch();
      agentRunningTasks.refetch();
      agentFailedTasks.refetch();
    },
  };
};

// Hook for task health monitoring
export const useTaskHealthMonitoring = () => {
  const { data: stats, isLoading, error } = useTaskStats();
  const { data: liveMetrics } = useTaskLiveMetrics();

  if (!stats || !liveMetrics) {
    return { isLoading, error, health: null };
  }

  const health = {
    totalTasks: stats.total,
    activeTasks: liveMetrics.activeTasksCount,
    completionRate: stats.completionRate,
    errorRate: liveMetrics.errorRate,
    recentSuccessRate: liveMetrics.recentSuccessRate,
    averageExecutionTime: stats.averageExecutionTime,
    criticalTasksCount: stats.byPriority.critical,
    failedTasksCount: stats.byStatus.failed,
    isHealthy: stats.completionRate > 90 && liveMetrics.errorRate < 5,
  };

  return {
    health,
    isLoading,
    error,
  };
};

// Hook for task filtering
export const useTaskFilters = () => {
  const createTasksQuery = (filters: TasksQueryParams) => {
    return useQuery({
      queryKey: taskKeys.list(filters),
      queryFn: () => tasksApi.getAll(filters),
      staleTime: 30000,
      gcTime: 300000,
      enabled: false, // Only run when manually triggered
    });
  };

  return {
    createTasksQuery,
    // You can add predefined filter combinations here
    getTasksWithFilters: (filters: TasksQueryParams) => createTasksQuery(filters),
  };
};
