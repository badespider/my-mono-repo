import { apiClient } from "../client/apiClient";
import type {
  Agent,
  AgentConfig,
  CreateAgentRequest,
  UpdateAgentRequest,
  AgentFilters,
  PaginationParams,
  PaginatedResponse,
} from "../types/api";

/**
 * Service for managing AI agents in the portfolio tracker
 * Handles monitoring, analysis, rebalancing, and alert agents
 */
export class AgentsService {
  private readonly basePath = "/agents";

  /**
   * Get all agents with optional filtering and pagination
   */
  async getAgents(
    filters?: AgentFilters,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<Agent>> {
    const params = new URLSearchParams();

    // Add filters
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
    return apiClient.getPaginated<Agent>(url);
  }

  /**
   * Get a specific agent by ID
   */
  async getAgent(id: string): Promise<Agent> {
    return apiClient.get<Agent>(`${this.basePath}/${id}`);
  }

  /**
   * Create a new agent
   */
  async createAgent(data: CreateAgentRequest): Promise<Agent> {
    return apiClient.post<Agent>(this.basePath, data);
  }

  /**
   * Update an existing agent
   */
  async updateAgent(id: string, data: UpdateAgentRequest): Promise<Agent> {
    return apiClient.patch<Agent>(`${this.basePath}/${id}`, data);
  }

  /**
   * Delete an agent
   */
  async deleteAgent(id: string): Promise<void> {
    return apiClient.delete<void>(`${this.basePath}/${id}`);
  }

  /**
   * Start an agent
   */
  async startAgent(id: string): Promise<Agent> {
    return apiClient.post<Agent>(`${this.basePath}/${id}/start`);
  }

  /**
   * Stop an agent
   */
  async stopAgent(id: string): Promise<Agent> {
    return apiClient.post<Agent>(`${this.basePath}/${id}/stop`);
  }

  /**
   * Restart an agent
   */
  async restartAgent(id: string): Promise<Agent> {
    return apiClient.post<Agent>(`${this.basePath}/${id}/restart`);
  }

  /**
   * Get agent metrics and performance data
   */
  async getAgentMetrics(
    id: string,
    timeRange?: string
  ): Promise<{
    executionHistory: Array<{
      timestamp: string;
      duration: number;
      status: "success" | "failure";
      error?: string;
    }>;
    performance: {
      successRate: number;
      averageExecutionTime: number;
      totalExecutions: number;
      uptime: number;
    };
    resourceUsage: {
      cpu: number;
      memory: number;
      network: number;
    };
  }> {
    const params = timeRange ? `?timeRange=${timeRange}` : "";
    return apiClient.get(`${this.basePath}/${id}/metrics${params}`);
  }

  /**
   * Get agent logs
   */
  async getAgentLogs(
    id: string,
    options?: {
      level?: "error" | "warn" | "info" | "debug";
      limit?: number;
      offset?: number;
      timeRange?: string;
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
    if (options?.timeRange) params.append("timeRange", options.timeRange);

    const url = `${this.basePath}/${id}/logs${params.toString() ? `?${params.toString()}` : ""}`;
    return apiClient.get(url);
  }

  /**
   * Test agent configuration
   */
  async testAgentConfig(data: CreateAgentRequest): Promise<{
    valid: boolean;
    issues?: Array<{
      field: string;
      message: string;
      severity: "error" | "warning";
    }>;
    estimatedPerformance?: {
      expectedExecutionTime: number;
      resourceRequirements: Record<string, any>;
    };
  }> {
    return apiClient.post(`${this.basePath}/test-config`, data);
  }

  /**
   * Bulk operations on agents
   */
  async bulkUpdateAgents(
    agentIds: string[],
    update: {
      status?: Agent["status"];
      config?: Partial<UpdateAgentRequest["config"]>;
    }
  ): Promise<{
    updated: Agent[];
    failed: Array<{ id: string; error: string }>;
  }> {
    return apiClient.post(`${this.basePath}/bulk-update`, {
      agentIds,
      update,
    });
  }

  /**
   * Get available agent templates
   */
  async getAgentTemplates(): Promise<
    Array<{
      id: string;
      name: string;
      type: Agent["type"];
      description: string;
      defaultConfig: CreateAgentRequest["config"];
      tags: string[];
    }>
  > {
    return apiClient.get(`${this.basePath}/templates`);
  }

  /**
   * Create agent from template
   */
  async createAgentFromTemplate(
    templateId: string,
    customization: {
      name: string;
      description?: string;
      configOverrides?: Record<string, any>;
    }
  ): Promise<Agent> {
    return apiClient.post(
      `${this.basePath}/from-template/${templateId}`,
      customization
    );
  }

  /**
   * Get agent execution schedule
   */
  async getAgentSchedule(id: string): Promise<{
    nextExecution: string;
    schedule: {
      type: "interval" | "cron";
      value: string | number;
      timezone?: string;
    };
    executionHistory: Array<{
      scheduledTime: string;
      actualTime: string;
      status: "completed" | "failed" | "skipped";
    }>;
  }> {
    return apiClient.get(`${this.basePath}/${id}/schedule`);
  }

  /**
   * Update agent schedule
   */
  async updateAgentSchedule(
    id: string,
    schedule: {
      type: "interval" | "cron";
      value: string | number;
      timezone?: string;
      enabled?: boolean;
    }
  ): Promise<Agent> {
    return apiClient.patch(`${this.basePath}/${id}/schedule`, schedule);
  }

  /**
   * Update agent configuration
   */
  async updateAgentConfig(
    id: string,
    config: Partial<AgentConfig>
  ): Promise<Agent> {
    return apiClient.put(`${this.basePath}/${id}/config`, config);
  }

  /**
   * Execute agent manually (outside of schedule)
   */
  async executeAgent(
    id: string,
    options?: {
      parameters?: Record<string, any>;
      dryRun?: boolean;
    }
  ): Promise<{
    executionId: string;
    status: "started" | "queued";
    estimatedCompletion?: string;
  }> {
    return apiClient.post(`${this.basePath}/${id}/execute`, options);
  }

  /**
   * Get agent dependencies and relationships
   */
  async getAgentDependencies(id: string): Promise<{
    dependencies: Array<{
      id: string;
      name: string;
      type: "agent" | "portfolio" | "external";
      relationship: "requires" | "triggers" | "monitors";
    }>;
    dependents: Array<{
      id: string;
      name: string;
      type: "agent" | "task";
      relationship: "triggered_by" | "monitors" | "depends_on";
    }>;
  }> {
    return apiClient.get(`${this.basePath}/${id}/dependencies`);
  }
}

// Create singleton instance
export const agentsService = new AgentsService();

// Export individual methods for convenience
export const {
  getAgents,
  getAgent,
  createAgent,
  updateAgent,
  deleteAgent,
  startAgent,
  stopAgent,
  restartAgent,
  getAgentMetrics,
  getAgentLogs,
  testAgentConfig,
  bulkUpdateAgents,
  getAgentTemplates,
  createAgentFromTemplate,
  getAgentSchedule,
  updateAgentSchedule,
  updateAgentConfig,
  executeAgent,
  getAgentDependencies,
} = agentsService;
