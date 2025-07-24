// Export API Client
export { ApiClient, apiClient, createApiClient } from "./client/apiClient";
export type { ApiClientConfig, AuthCredentials } from "./client/apiClient";

// Export Services
export { AgentsService, agentsService } from "./agents/agentsService";
export { TasksService, tasksService } from "./tasks/tasksService";
export {
  PortfolioService,
  portfolioService,
} from "./portfolio/portfolioService";

// Export individual service methods for convenience
export {
  // Agents service methods
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
  executeAgent,
  getAgentDependencies,
} from "./agents/agentsService";

export {
  // Tasks service methods
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
} from "./tasks/tasksService";

export {
  // Portfolio service methods
  getPortfolios,
  getPortfolio,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
  getPortfolioAnalytics,
  getRebalancingSuggestions,
  executeRebalancing,
  getAssetAllocation,
  getRiskAssessment,
  addAssets,
  removeAssets,
  updateAssetTargets,
  getTransactionHistory,
  compareWithBenchmarks,
  exportPortfolio,
  getPortfolioAlerts,
  updateAlertSettings,
  acknowledgeAlerts,
} from "./portfolio/portfolioService";

// Export Types
export type {
  // Base API types
  ApiResponse,
  PaginatedResponse,
  ApiError,
  PaginationParams,

  // Agent types
  Agent,
  AgentConfig,
  AgentMetrics,
  CreateAgentRequest,
  UpdateAgentRequest,
  AgentFilters,

  // Task types
  Task,
  TaskInput,
  TaskOutput,
  TaskError,
  TaskRecommendation,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskFilters,

  // Portfolio types
  Portfolio,
  PortfolioAsset,
  AssetAllocation,
  RiskProfile,
  RebalanceConfig,
  PortfolioPerformance,
  CreatePortfolioRequest,
  UpdatePortfolioRequest,
  PortfolioFilters,
} from "./types/api";

// Export Error Classes and Utils
export {
  ApiClientError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  ServerError,
  NetworkError,
  transformAxiosError,
  logError,
  withRetry,
  getErrorMessage,
  getErrorCode,
  isRetryableError,
  defaultRetryConfig,
} from "./utils/errors";
export type { RetryConfig } from "./utils/errors";

// Legacy exports for backward compatibility with existing api.ts
export { apiService, portfolioApi, priceApi } from "./api";

// Re-export WebSocket service
export { wsService, useWebSocket } from "./websocket";
export type { PriceUpdate, PortfolioUpdate } from "./websocket";
