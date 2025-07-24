import { apiClient } from "../client/apiClient";
import type {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskFilters,
  PaginationParams,
  PaginatedResponse,
} from "../types/api";

/**
 * Service for managing tasks executed by AI agents
 * Handles task creation, monitoring, and execution tracking
 */
export class TasksService {
  private readonly basePath = "/tasks";

  /**
   * Get all tasks with optional filtering and pagination
   */
  async getTasks(
    filters?: TaskFilters,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<Task>> {
    const params = new URLSearchParams();

    // Add filters
    if (filters?.agentId) {
      params.append("agentId", filters.agentId);
    }

    if (filters?.type) {
      const types = Array.isArray(filters.type) ? filters.type : [filters.type];
      types.forEach(type => params.append("type", type));
    }

    if (filters?.status) {
      const statuses = Array.isArray(filters.status)
        ? filters.status
        : [filters.status];
      statuses.forEach(status => params.append("status", status));
    }

    if (filters?.priority) {
      const priorities = Array.isArray(filters.priority)
        ? filters.priority
        : [filters.priority];
      priorities.forEach(priority => params.append("priority", priority));
    }

    if (filters?.portfolioId) {
      params.append("portfolioId", filters.portfolioId);
    }

    if (filters?.dateFrom) {
      params.append("dateFrom", filters.dateFrom);
    }

    if (filters?.dateTo) {
      params.append("dateTo", filters.dateTo);
    }

    if (filters?.search) {
      params.append("search", filters.search);
    }

    // Add pagination
    if (pagination?.page) {
      params.append("page", pagination.page.toString());
    }

    if (pagination?.limit) {
      params.append("limit", pagination.limit.toString());
    }

    if (pagination?.sortBy) {
      params.append("sortBy", pagination.sortBy);
    }

    if (pagination?.sortOrder) {
      params.append("sortOrder", pagination.sortOrder);
    }

    const url = `${this.basePath}${params.toString() ? `?${params.toString()}` : ""}`;
    return apiClient.getPaginated<Task>(url);
  }

  /**
   * Get a specific task by ID
   */
  async getTask(id: string): Promise<Task> {
    return apiClient.get<Task>(`${this.basePath}/${id}`);
  }

  /**
   * Create a new task
   */
  async createTask(data: CreateTaskRequest): Promise<Task> {
    return apiClient.post<Task>(this.basePath, data);
  }

  /**
   * Update an existing task
   */
  async updateTask(id: string, data: UpdateTaskRequest): Promise<Task> {
    return apiClient.patch<Task>(`${this.basePath}/${id}`, data);
  }

  /**
   * Delete a task
   */
  async deleteTask(id: string): Promise<void> {
    return apiClient.delete<void>(`${this.basePath}/${id}`);
  }

  /**
   * Cancel a running or pending task
   */
  async cancelTask(id: string, reason?: string): Promise<Task> {
    return apiClient.post<Task>(`${this.basePath}/${id}/cancel`, { reason });
  }

  /**
   * Retry a failed task
   */
  async retryTask(
    id: string,
    options?: { resetProgress?: boolean }
  ): Promise<Task> {
    return apiClient.post<Task>(`${this.basePath}/${id}/retry`, options);
  }

  /**
   * Get task execution logs
   */
  async getTaskLogs(
    id: string,
    options?: {
      level?: "error" | "warn" | "info" | "debug";
      limit?: number;
      offset?: number;
    }
  ): Promise<{
    logs: Array<{
      timestamp: string;
      level: string;
      message: string;
      metadata?: Record<string, any>;
    }>;
    total: number;
  }> {
    const params = new URLSearchParams();

    if (options?.level) params.append("level", options.level);
    if (options?.limit) params.append("limit", options.limit.toString());
    if (options?.offset) params.append("offset", options.offset.toString());

    const url = `${this.basePath}/${id}/logs${params.toString() ? `?${params.toString()}` : ""}`;
    return apiClient.get(url);
  }

  /**
   * Get task execution timeline and progress updates
   */
  async getTaskTimeline(id: string): Promise<{
    events: Array<{
      timestamp: string;
      type:
        | "created"
        | "started"
        | "progress"
        | "paused"
        | "resumed"
        | "completed"
        | "failed"
        | "cancelled";
      message: string;
      progress?: number;
      metadata?: Record<string, any>;
    }>;
    milestones: Array<{
      name: string;
      timestamp?: string;
      completed: boolean;
      description: string;
    }>;
  }> {
    return apiClient.get(`${this.basePath}/${id}/timeline`);
  }

  /**
   * Bulk operations on tasks
   */
  async bulkUpdateTasks(
    taskIds: string[],
    update: {
      status?: Task["status"];
      priority?: Task["priority"];
    }
  ): Promise<{
    updated: Task[];
    failed: Array<{ id: string; error: string }>;
  }> {
    return apiClient.post(`${this.basePath}/bulk-update`, {
      taskIds,
      update,
    });
  }

  /**
   * Cancel multiple tasks
   */
  async bulkCancelTasks(
    taskIds: string[],
    reason?: string
  ): Promise<{
    cancelled: Task[];
    failed: Array<{ id: string; error: string }>;
  }> {
    return apiClient.post(`${this.basePath}/bulk-cancel`, {
      taskIds,
      reason,
    });
  }

  /**
   * Get task statistics and analytics
   */
  async getTaskStats(filters?: {
    agentId?: string;
    portfolioId?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<{
    total: number;
    byStatus: Record<Task["status"], number>;
    byType: Record<Task["type"], number>;
    byPriority: Record<Task["priority"], number>;
    executionMetrics: {
      averageExecutionTime: number;
      successRate: number;
      totalExecutionTime: number;
      tasksTrend: Array<{
        date: string;
        completed: number;
        failed: number;
        cancelled: number;
      }>;
    };
    performance: {
      fastestTask: { id: string; executionTime: number };
      slowestTask: { id: string; executionTime: number };
      mostRetriedTask: { id: string; retryCount: number };
    };
  }> {
    const params = new URLSearchParams();

    if (filters?.agentId) params.append("agentId", filters.agentId);
    if (filters?.portfolioId) params.append("portfolioId", filters.portfolioId);
    if (filters?.dateFrom) params.append("dateFrom", filters.dateFrom);
    if (filters?.dateTo) params.append("dateTo", filters.dateTo);

    const url = `${this.basePath}/stats${params.toString() ? `?${params.toString()}` : ""}`;
    return apiClient.get(url);
  }

  /**
   * Get task queue status
   */
  async getTaskQueue(agentId?: string): Promise<{
    pending: Task[];
    running: Task[];
    queueDepth: number;
    estimatedWaitTime: number;
    processingCapacity: {
      current: number;
      maximum: number;
      available: number;
    };
  }> {
    const params = agentId ? `?agentId=${agentId}` : "";
    return apiClient.get(`${this.basePath}/queue${params}`);
  }

  /**
   * Reorder tasks in the queue
   */
  async reorderTaskQueue(
    agentId: string,
    taskOrder: Array<{
      taskId: string;
      priority: Task["priority"];
      position?: number;
    }>
  ): Promise<{
    reordered: Task[];
    newQueue: Task[];
  }> {
    return apiClient.post(`${this.basePath}/queue/reorder`, {
      agentId,
      taskOrder,
    });
  }

  /**
   * Pause task execution
   */
  async pauseTask(id: string, reason?: string): Promise<Task> {
    return apiClient.post<Task>(`${this.basePath}/${id}/pause`, { reason });
  }

  /**
   * Resume paused task execution
   */
  async resumeTask(id: string): Promise<Task> {
    return apiClient.post<Task>(`${this.basePath}/${id}/resume`);
  }

  /**
   * Get task dependencies
   */
  async getTaskDependencies(id: string): Promise<{
    dependencies: Array<{
      taskId: string;
      type: "prerequisite" | "resource" | "data";
      status: "satisfied" | "pending" | "failed";
      description: string;
    }>;
    dependents: Array<{
      taskId: string;
      relationship: "blocks" | "triggers" | "provides_data";
      description: string;
    }>;
  }> {
    return apiClient.get(`${this.basePath}/${id}/dependencies`);
  }

  /**
   * Create task from template
   */
  async createTaskFromTemplate(
    templateId: string,
    customization: {
      agentId: string;
      title?: string;
      description?: string;
      priority?: Task["priority"];
      inputOverrides?: Record<string, any>;
    }
  ): Promise<Task> {
    return apiClient.post(
      `${this.basePath}/from-template/${templateId}`,
      customization
    );
  }

  /**
   * Get available task templates
   */
  async getTaskTemplates(agentType?: string): Promise<
    Array<{
      id: string;
      name: string;
      type: Task["type"];
      description: string;
      agentTypes: string[];
      defaultInput: CreateTaskRequest["input"];
      tags: string[];
    }>
  > {
    const params = agentType ? `?agentType=${agentType}` : "";
    return apiClient.get(`${this.basePath}/templates${params}`);
  }

  /**
   * Export task results
   */
  async exportTaskResults(
    taskIds: string[],
    format: "json" | "csv" | "xlsx"
  ): Promise<{
    downloadUrl: string;
    expiresAt: string;
    format: string;
    size: number;
  }> {
    return apiClient.post(`${this.basePath}/export`, {
      taskIds,
      format,
    });
  }

  /**
   * Get task execution metrics for monitoring
   */
  async getTaskMetrics(
    id: string,
    options?: {
      includeSystemMetrics?: boolean;
      timeRange?: string;
    }
  ): Promise<{
    execution: {
      startTime: string;
      currentTime: string;
      estimatedCompletion?: string;
      progress: number;
      throughput?: number;
    };
    resources: {
      cpu: number;
      memory: number;
      network: number;
      storage: number;
    };
    performance: {
      operationsPerSecond: number;
      errorRate: number;
      latency: {
        p50: number;
        p95: number;
        p99: number;
      };
    };
  }> {
    const params = new URLSearchParams();

    if (options?.includeSystemMetrics) {
      params.append("includeSystemMetrics", "true");
    }

    if (options?.timeRange) {
      params.append("timeRange", options.timeRange);
    }

    const url = `${this.basePath}/${id}/metrics${params.toString() ? `?${params.toString()}` : ""}`;
    return apiClient.get(url);
  }
}

// Create singleton instance
export const tasksService = new TasksService();

// Export individual methods for convenience
export const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  cancelTask,
  retryTask,
  getTaskLogs,
  getTaskTimeline,
  bulkUpdateTasks,
  bulkCancelTasks,
  getTaskStats,
  getTaskQueue,
  reorderTaskQueue,
  pauseTask,
  resumeTask,
  getTaskDependencies,
  createTaskFromTemplate,
  getTaskTemplates,
  exportTaskResults,
  getTaskMetrics,
} = tasksService;
