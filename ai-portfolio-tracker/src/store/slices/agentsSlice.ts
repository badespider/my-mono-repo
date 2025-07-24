import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface AgentConfig {
  enabled: boolean;
  interval: number; // in milliseconds
  threshold?: number;
  parameters?: Record<string, any>;
}

export interface AgentMetrics {
  totalTasks: number;
  successfulTasks: number;
  failedTasks: number;
  averageExecutionTime: number;
  lastExecutionTime?: number;
  uptime: number;
}

export interface Agent {
  id: string;
  name: string;
  type: "monitor" | "analyzer" | "rebalancer" | "alerter";
  status: "active" | "idle" | "error" | "disabled";
  lastActiveAt: number;
  createdAt: number;
  config: AgentConfig;
  metrics: AgentMetrics;
  currentTask?: string;
  errorMessage?: string;
}

interface AgentsState {
  byId: Record<string, Agent>;
  allIds: string[];
  loading: boolean;
  error: string | null;
}

const initialState: AgentsState = {
  byId: {},
  allIds: [],
  loading: false,
  error: null,
};

export const agentsSlice = createSlice({
  name: "agents",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    addAgent: (state, action: PayloadAction<Agent>) => {
      const agent = action.payload;
      state.byId[agent.id] = agent;
      if (!state.allIds.includes(agent.id)) {
        state.allIds.push(agent.id);
      }
    },
    updateAgent: (
      state,
      action: PayloadAction<Partial<Agent> & { id: string }>
    ) => {
      const { id, ...updates } = action.payload;
      if (state.byId[id]) {
        state.byId[id] = { ...state.byId[id], ...updates };
      }
    },
    updateAgentStatus: (
      state,
      action: PayloadAction<{
        id: string;
        status: Agent["status"];
        errorMessage?: string;
      }>
    ) => {
      const { id, status, errorMessage } = action.payload;
      if (state.byId[id]) {
        state.byId[id].status = status;
        state.byId[id].lastActiveAt = Date.now();
        if (errorMessage) {
          state.byId[id].errorMessage = errorMessage;
        } else {
          delete state.byId[id].errorMessage;
        }
      }
    },
    updateAgentMetrics: (
      state,
      action: PayloadAction<{ id: string; metrics: Partial<AgentMetrics> }>
    ) => {
      const { id, metrics } = action.payload;
      if (state.byId[id]) {
        state.byId[id].metrics = { ...state.byId[id].metrics, ...metrics };
      }
    },
    updateAgentConfig: (
      state,
      action: PayloadAction<{ id: string; config: Partial<AgentConfig> }>
    ) => {
      const { id, config } = action.payload;
      if (state.byId[id]) {
        state.byId[id].config = { ...state.byId[id].config, ...config };
      }
    },
    setAgentCurrentTask: (
      state,
      action: PayloadAction<{ id: string; taskId?: string }>
    ) => {
      const { id, taskId } = action.payload;
      if (state.byId[id]) {
        state.byId[id].currentTask = taskId;
      }
    },
    removeAgent: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      delete state.byId[id];
      state.allIds = state.allIds.filter(agentId => agentId !== id);
    },
    clearAgents: state => {
      state.byId = {};
      state.allIds = [];
    },
  },
});

export const {
  setLoading,
  setError,
  addAgent,
  updateAgent,
  updateAgentStatus,
  updateAgentMetrics,
  updateAgentConfig,
  setAgentCurrentTask,
  removeAgent,
  clearAgents,
} = agentsSlice.actions;
