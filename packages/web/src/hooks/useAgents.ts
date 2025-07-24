import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { agentsApi, type AgentQueryParams } from '@/lib/api/agents';
import type { Agent, UpdateAgentRequest, AgentType } from '@/lib/types';

// Query Keys
export const agentKeys = {
  all: ['agents'] as const,
  lists: () => [...agentKeys.all, 'list'] as const,
  list: (params?: AgentQueryParams) => [...agentKeys.lists(), params] as const,
  details: () => [...agentKeys.all, 'detail'] as const,
  detail: (id: string) => [...agentKeys.details(), id] as const,
  performance: (id: string) => [...agentKeys.detail(id), 'performance'] as const,
  metrics: (id: string) => [...agentKeys.detail(id), 'metrics'] as const,
  active: () => [...agentKeys.lists(), 'active'] as const,
  byType: (type: AgentType) => [...agentKeys.lists(), 'type', type] as const,
};

// Hooks for fetching agents
export const useAgents = (params?: AgentQueryParams) => {
  return useQuery({
    queryKey: agentKeys.list(params),
    queryFn: () => agentsApi.getAll(params),
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
  });
};

export const useAgent = (id: string) => {
  return useQuery({
    queryKey: agentKeys.detail(id),
    queryFn: () => agentsApi.getById(id),
    enabled: !!id,
    staleTime: 30000,
    gcTime: 300000,
  });
};

export const useAgentPerformance = (id: string) => {
  return useQuery({
    queryKey: agentKeys.performance(id),
    queryFn: () => agentsApi.getPerformance(id),
    enabled: !!id,
    staleTime: 15000, // 15 seconds for performance data
    gcTime: 300000,
  });
};

export const useAgentMetrics = (id: string) => {
  return useQuery({
    queryKey: agentKeys.metrics(id),
    queryFn: () => agentsApi.getDetailedMetrics(id),
    enabled: !!id,
    staleTime: 10000, // 10 seconds for real-time metrics
    gcTime: 60000, // 1 minute
    refetchInterval: 15000, // Auto-refresh every 15 seconds
  });
};

export const useActiveAgents = () => {
  return useQuery({
    queryKey: agentKeys.active(),
    queryFn: () => agentsApi.getActive(),
    staleTime: 30000,
    gcTime: 300000,
  });
};

export const useAgentsByType = (type: AgentType) => {
  return useQuery({
    queryKey: agentKeys.byType(type),
    queryFn: () => agentsApi.getByType(type),
    staleTime: 30000,
    gcTime: 300000,
  });
};

// Mutation hooks for agent operations
export const useUpdateAgent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateAgentRequest }) =>
      agentsApi.update(id, updates),
    onSuccess: (updatedAgent, { id }) => {
      // Invalidate and update related queries
      queryClient.invalidateQueries({ queryKey: agentKeys.all });
      queryClient.setQueryData(agentKeys.detail(id), updatedAgent);
    },
  });
};

export const useStartAgent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => agentsApi.start(id),
    onSuccess: (updatedAgent, id) => {
      queryClient.invalidateQueries({ queryKey: agentKeys.all });
      queryClient.setQueryData(agentKeys.detail(id), updatedAgent);
    },
  });
};

export const useStopAgent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => agentsApi.stop(id),
    onSuccess: (updatedAgent, id) => {
      queryClient.invalidateQueries({ queryKey: agentKeys.all });
      queryClient.setQueryData(agentKeys.detail(id), updatedAgent);
    },
  });
};

export const useRestartAgent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => agentsApi.restart(id),
    onSuccess: (updatedAgent, id) => {
      queryClient.invalidateQueries({ queryKey: agentKeys.all });
      queryClient.setQueryData(agentKeys.detail(id), updatedAgent);
    },
  });
};

// Bulk operations
export const useStartAllAgents = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => agentsApi.startAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentKeys.all });
    },
  });
};

export const useStopAllAgents = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => agentsApi.stopAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentKeys.all });
    },
  });
};

export const useRestartAllAgents = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => agentsApi.restartAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentKeys.all });
    },
  });
};

// Custom hooks for common use cases
export const useAgentStatusCounts = () => {
  const { data: agents, ...rest } = useAgents();

  const statusCounts = agents?.reduce(
    (acc, agent) => {
      acc[agent.status] = (acc[agent.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return {
    data: statusCounts,
    agents: agents,
    ...rest,
  };
};

export const useAgentTypeCounts = () => {
  const { data: agents, ...rest } = useAgents();

  const typeCounts = agents?.reduce(
    (acc, agent) => {
      acc[agent.type] = (acc[agent.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return {
    data: typeCounts,
    agents: agents,
    ...rest,
  };
};
