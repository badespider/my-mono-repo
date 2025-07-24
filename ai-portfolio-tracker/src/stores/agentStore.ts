import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { Agent, AgentMetrics } from "../services/types/api";
import type { AgentStatusUpdate } from "../services/websocket";

export interface AgentState {
  agents: Agent[];
  activeAgents: Agent[];
  agentMetrics: Record<string, AgentMetrics>;
  isLoading: boolean;
  error: string | null;
  lastUpdate: string | null;

  // Actions
  setAgents: (agents: Agent[]) => void;
  updateAgent: (id: string, updates: Partial<Agent>) => void;
  updateAgentStatus: (update: AgentStatusUpdate) => void;
  updateAgentMetrics: (agentId: string, metrics: Partial<AgentMetrics>) => void;
  addAgent: (agent: Agent) => void;
  removeAgent: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  getAgent: (id: string) => Agent | undefined;
  getActiveAgents: () => Agent[];
  getAgentsByType: (type: Agent["type"]) => Agent[];
  getAgentsByStatus: (status: Agent["status"]) => Agent[];
}

// Sample agents for testing
const sampleAgents: Agent[] = [
  {
    id: "agent-rebalancer",
    name: "Portfolio Rebalancer",
    type: "rebalancing",
    status: "active",
    description: "Automatically rebalances portfolio to target allocations",
    config: {
      enabled: true,
      interval: 3600000, // 1 hour
      parameters: {
        targetAllocations: { SOL: 0.4, USDC: 0.3, RAY: 0.3 },
        rebalanceThreshold: 0.05,
      },
      notifications: {
        email: true,
        webhook: false,
        inApp: true,
      },
    },
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    updatedAt: new Date().toISOString(),
    lastExecuted: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    metrics: {
      executionCount: 42,
      successRate: 95.2,
      averageExecutionTime: 5000,
      uptime: 99.1,
    },
  },
  {
    id: "agent-analyzer",
    name: "Portfolio Analyzer",
    type: "analysis",
    status: "active",
    description: "Analyzes portfolio performance and risk metrics",
    config: {
      enabled: true,
      interval: 1800000, // 30 minutes
      parameters: {
        analysisTypes: ["risk", "performance", "diversification"],
      },
      notifications: {
        email: false,
        webhook: true,
        inApp: true,
      },
    },
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    updatedAt: new Date().toISOString(),
    lastExecuted: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    metrics: {
      executionCount: 78,
      successRate: 98.7,
      averageExecutionTime: 3000,
      uptime: 99.8,
    },
  },
];

export const useAgentStore = create<AgentState>()(
  devtools(
    persist(
      (set, get) => ({
        agents: sampleAgents,
        activeAgents: sampleAgents.filter(agent => agent.status === "active"),
        agentMetrics: sampleAgents.reduce((acc, agent) => {
          acc[agent.id] = agent.metrics;
          return acc;
        }, {} as Record<string, AgentMetrics>),
        isLoading: false,
        error: null,
        lastUpdate: null,

        setAgents: agents => {
          set({
            agents,
            activeAgents: agents.filter(agent => agent.status === "active"),
            lastUpdate: new Date().toISOString(),
          });
        },

        updateAgent: (id, updates) => {
          set(state => {
            const updatedAgents = state.agents.map(agent =>
              agent.id === id ? { ...agent, ...updates } : agent
            );

            return {
              agents: updatedAgents,
              activeAgents: updatedAgents.filter(
                agent => agent.status === "active"
              ),
              lastUpdate: new Date().toISOString(),
            };
          });
        },

        updateAgentStatus: (update: AgentStatusUpdate) => {
          set(state => {
            const updatedAgents = state.agents.map(agent => {
              if (agent.id === update.agentId) {
                const updatedAgent = {
                  ...agent,
                  status: update.status,
                  updatedAt: update.timestamp,
                };

                // Update metrics if provided
                if (update.metrics) {
                  updatedAgent.metrics = {
                    ...agent.metrics,
                    ...update.metrics,
                  };
                }

                return updatedAgent;
              }
              return agent;
            });

            // Update metrics store
            const updatedMetrics = { ...state.agentMetrics };
            if (update.metrics) {
              updatedMetrics[update.agentId] = {
                ...updatedMetrics[update.agentId],
                ...update.metrics,
              };
            }

            return {
              agents: updatedAgents,
              activeAgents: updatedAgents.filter(
                agent => agent.status === "active"
              ),
              agentMetrics: updatedMetrics,
              lastUpdate: update.timestamp,
            };
          });
        },

        updateAgentMetrics: (agentId, metrics) => {
          set(state => ({
            agentMetrics: {
              ...state.agentMetrics,
              [agentId]: {
                ...state.agentMetrics[agentId],
                ...metrics,
              },
            },
            lastUpdate: new Date().toISOString(),
          }));
        },

        addAgent: agent => {
          set(state => {
            const updatedAgents = [...state.agents, agent];
            return {
              agents: updatedAgents,
              activeAgents: updatedAgents.filter(a => a.status === "active"),
              lastUpdate: new Date().toISOString(),
            };
          });
        },

        removeAgent: id => {
          set(state => {
            const updatedAgents = state.agents.filter(agent => agent.id !== id);
            const updatedMetrics = { ...state.agentMetrics };
            delete updatedMetrics[id];

            return {
              agents: updatedAgents,
              activeAgents: updatedAgents.filter(
                agent => agent.status === "active"
              ),
              agentMetrics: updatedMetrics,
              lastUpdate: new Date().toISOString(),
            };
          });
        },

        setLoading: loading => {
          set({ isLoading: loading });
        },

        setError: error => {
          set({ error });
        },

        getAgent: id => {
          return get().agents.find(agent => agent.id === id);
        },

        getActiveAgents: () => {
          return get().agents.filter(agent => agent.status === "active");
        },

        getAgentsByType: type => {
          return get().agents.filter(agent => agent.type === type);
        },

        getAgentsByStatus: status => {
          return get().agents.filter(agent => agent.status === status);
        },
      }),
      {
        name: "agent-storage",
        partialize: state => ({
          agents: state.agents,
          agentMetrics: state.agentMetrics,
        }),
      }
    ),
    { name: "agent-store" }
  )
);
