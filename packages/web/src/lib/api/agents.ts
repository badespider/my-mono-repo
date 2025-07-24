import { api } from '../api';
import type {
  Agent,
  AgentType,
  AgentStatus,
  UpdateAgentRequest,
  AgentMetrics,
  DetailedAgentMetrics,
} from '../types';

export interface AgentQueryParams {
  type?: AgentType;
  status?: AgentStatus;
}

/**
 * Agents API client with strongly-typed endpoints
 */
export const agentsApi = {
  /**
   * Get all agents with optional filtering
   */
  getAll: async (params?: AgentQueryParams): Promise<Agent[]> => {
    return api.get<Agent[]>('/agents', params);
  },

  /**
   * Get agent by ID
   */
  getById: async (id: string): Promise<Agent> => {
    return api.get<Agent>(`/agents/${id}`);
  },

  /**
   * Update agent by ID
   */
  update: async (id: string, updates: UpdateAgentRequest): Promise<Agent> => {
    return api.put<Agent>(`/agents/${id}`, updates);
  },

  /**
   * Get agent performance metrics
   */
  getPerformance: async (id: string): Promise<AgentMetrics> => {
    return api.get<AgentMetrics>(`/agents/${id}/performance`);
  },

  /**
   * Start an agent
   */
  start: async (id: string): Promise<Agent> => {
    return api.put<Agent>(`/agents/${id}`, { status: 'active' });
  },

  /**
   * Stop an agent
   */
  stop: async (id: string): Promise<Agent> => {
    return api.put<Agent>(`/agents/${id}`, { status: 'inactive' });
  },

  /**
   * Restart an agent
   */
  restart: async (id: string): Promise<Agent> => {
    // First stop, then start
    await api.put<Agent>(`/agents/${id}`, { status: 'inactive' });
    return api.put<Agent>(`/agents/${id}`, { status: 'active' });
  },

  /**
   * Get all active agents
   */
  getActive: async (): Promise<Agent[]> => {
    return api.get<Agent[]>('/agents', { status: 'active' });
  },

  /**
   * Get agents by type
   */
  getByType: async (type: AgentType): Promise<Agent[]> => {
    return api.get<Agent[]>('/agents', { type });
  },

  /**
   * Get detailed metrics for monitoring dashboard
   * Note: This is mock data for now, should be implemented in backend
   */
  getDetailedMetrics: async (id: string): Promise<DetailedAgentMetrics> => {
    // This is a mock implementation for now
    // In the future, this should call a real endpoint
    const mockData: Record<string, DetailedAgentMetrics> = {
      'mon-001': {
        cpu: 34,
        memory: 67,
        latency: 45,
        errorRate: 0.3,
        throughput: 156,
        logs: [
          { time: '14:32:15', level: 'INFO', message: 'Portfolio sync completed successfully' },
          { time: '14:31:58', level: 'INFO', message: 'Monitoring 8 wallet addresses' },
          { time: '14:31:42', level: 'WARN', message: 'High transaction volume detected' },
          { time: '14:31:25', level: 'INFO', message: 'Price feed updated for SOL' },
          { time: '14:31:08', level: 'INFO', message: 'Balance check completed' },
        ],
      },
      'ana-001': {
        cpu: 78,
        memory: 43,
        latency: 23,
        errorRate: 1.2,
        throughput: 89,
        logs: [
          { time: '14:32:01', level: 'INFO', message: 'Risk analysis completed for portfolio' },
          { time: '14:31:44', level: 'WARN', message: 'High volatility detected in RAY' },
          { time: '14:31:28', level: 'INFO', message: 'Correlation analysis updated' },
          { time: '14:31:12', level: 'ERROR', message: 'Failed to fetch market data for ORCA' },
          { time: '14:30:55', level: 'INFO', message: 'VaR calculation completed' },
        ],
      },
    };

    return Promise.resolve(mockData[id] || {
      cpu: 0,
      memory: 0,
      latency: 0,
      errorRate: 0,
      throughput: 0,
      logs: [],
    });
  },

  /**
   * Bulk operations for multiple agents
   */
  startAll: async (): Promise<Agent[]> => {
    const agents = await agentsApi.getAll();
    const updatePromises = agents.map(agent => 
      agentsApi.start(agent.id)
    );
    return Promise.all(updatePromises);
  },

  stopAll: async (): Promise<Agent[]> => {
    const agents = await agentsApi.getAll();
    const updatePromises = agents.map(agent => 
      agentsApi.stop(agent.id)
    );
    return Promise.all(updatePromises);
  },

  restartAll: async (): Promise<Agent[]> => {
    const agents = await agentsApi.getAll();
    const updatePromises = agents.map(agent => 
      agentsApi.restart(agent.id)
    );
    return Promise.all(updatePromises);
  },
};

export default agentsApi;
