// Main API exports
export { api, apiClient, type ApiResponse, type PaginationParams, type PaginatedResponse } from '../api';

// API clients
export { agentsApi, type AgentQueryParams } from './agents';
export { portfolioApi } from './portfolio';
export { tasksApi } from './tasks';

// Types
export * from '../types';

// Re-export the main API client for direct access
export { default as api } from '../api';
