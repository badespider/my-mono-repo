import { create } from 'zustand';
import { Agent, Task, Alert } from '../types/agents';

interface AgentStore {
  agents: Agent[];
  tasks: Task[];
  alerts: Alert[];
  selectedAgent: Agent | null;
  
  // Actions
  setAgents: (agents: Agent[]) => void;
  updateAgent: (agentId: string, updates: Partial<Agent>) => void;
  setTasks: (tasks: Task[]) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  addAlert: (alert: Alert) => void;
  markAlertAsRead: (alertId: string) => void;
  setSelectedAgent: (agent: Agent | null) => void;
  
  // Computed
  getUnreadAlertCount: () => number;
  getCriticalAlertCount: () => number;
  getAgentsByType: (type: string) => Agent[];
  getTasksByStatus: (status: string) => Task[];
}

export const useAgentStore = create<AgentStore>((set, get) => ({
  agents: [],
  tasks: [],
  alerts: [],
  selectedAgent: null,

  setAgents: (agents) => set({ agents }),
  
  updateAgent: (agentId, updates) =>
    set((state) => ({
      agents: state.agents.map((agent) =>
        agent.id === agentId ? { ...agent, ...updates } : agent
      ),
    })),

  setTasks: (tasks) => set({ tasks }),
  
  updateTask: (taskId, updates) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId ? { ...task, ...updates } : task
      ),
    })),

  addAlert: (alert) =>
    set((state) => ({
      alerts: [alert, ...state.alerts],
    })),

  markAlertAsRead: (alertId) =>
    set((state) => ({
      alerts: state.alerts.map((alert) =>
        alert.id === alertId ? { ...alert, read: true } : alert
      ),
    })),

  setSelectedAgent: (agent) => set({ selectedAgent: agent }),

  getUnreadAlertCount: () => get().alerts.filter((alert) => !alert.read).length,
  
  getCriticalAlertCount: () =>
    get().alerts.filter((alert) => alert.type === 'critical' && !alert.read).length,

  getAgentsByType: (type) => get().agents.filter((agent) => agent.type === type),
  
  getTasksByStatus: (status) => get().tasks.filter((task) => task.status === status),
}));