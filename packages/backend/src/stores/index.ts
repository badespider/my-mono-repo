/**
 * In-memory stores for workflow data
 * Later will be replaced with persistent storage (database)
 */

import { Agent, Task, Portfolio, WorkflowConfig } from '../types/workflow';
import { getWebSocketService } from '../services/websocket';

// Global workflow configuration
export let workflowConfig: WorkflowConfig = {
  isRunning: false,
  cycleInterval: 5000, // 5 seconds
  maxConcurrentTasks: 10,
};

// Agents store with initial data
export let agentsStore: Agent[] = [
  {
    id: 'monitoring-agent',
    name: 'Portfolio Monitor',
    type: 'monitoring',
    status: 'inactive',
    description: 'Monitors portfolio performance and tracks asset prices',
    config: { 
      interval: 60000, 
      assets: ['SOL', 'BTC', 'ETH'],
      priceThresholds: { SOL: 0.05, BTC: 0.03, ETH: 0.04 }
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
    performance: {
      tasksCompleted: 0,
      successRate: 100,
      averageExecutionTime: 2500,
    },
  },
  {
    id: 'analysis-agent',
    name: 'Market Analyzer',
    type: 'analysis',
    status: 'inactive',
    description: 'Analyzes market trends and generates insights',
    config: { 
      strategies: ['momentum', 'mean_reversion'], 
      lookback: 30,
      indicators: ['RSI', 'MACD', 'BB']
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
    performance: {
      tasksCompleted: 0,
      successRate: 95,
      averageExecutionTime: 8000,
    },
  },
  {
    id: 'rebalancing-agent',
    name: 'Auto Rebalancer',
    type: 'rebalancing',
    status: 'inactive',
    description: 'Automatically rebalances portfolio based on target allocations',
    config: { 
      threshold: 0.05, 
      targetAllocations: { SOL: 0.4, BTC: 0.4, ETH: 0.2 },
      rebalanceFrequency: 'weekly'
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
    performance: {
      tasksCompleted: 0,
      successRate: 98,
      averageExecutionTime: 15000,
    },
  },
  {
    id: 'alerts-agent',
    name: 'Alert Manager',
    type: 'alerts',
    status: 'inactive',
    description: 'Sends notifications for price changes and portfolio events',
    config: { 
      priceChangeThreshold: 0.1, 
      channels: ['email', 'push'],
      alertTypes: ['price_alert', 'rebalance_alert', 'risk_alert']
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
    performance: {
      tasksCompleted: 0,
      successRate: 99,
      averageExecutionTime: 1200,
    },
  },
];

// Tasks store (starts empty)
export let tasksStore: Task[] = [];

// Portfolio store with mock data
export let portfolioStore: Portfolio = {
  id: 'main-portfolio',
  totalValue: 125000.50,
  assets: [
    {
      symbol: 'SOL',
      amount: 1250.5,
      value: 50000.25,
      percentage: 40.0,
      priceChange24h: 2.5,
      lastUpdated: new Date(),
    },
    {
      symbol: 'BTC',
      amount: 1.85,
      value: 49500.10,
      percentage: 39.6,
      priceChange24h: -1.2,
      lastUpdated: new Date(),
    },
    {
      symbol: 'ETH',
      amount: 10.2,
      value: 25500.15,
      percentage: 20.4,
      priceChange24h: 3.8,
      lastUpdated: new Date(),
    },
  ],
  performance: {
    totalReturn: 15.7,
    dailyChange: 1.8,
    weeklyChange: 4.2,
    monthlyChange: 12.3,
  },
  riskMetrics: {
    volatility: 0.285,
    sharpeRatio: 1.45,
    maxDrawdown: -0.125,
  },
  targetAllocations: {
    SOL: 0.4,
    BTC: 0.4,
    ETH: 0.2,
  },
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date(),
};

// Helper functions to manage stores
export const updateWorkflowConfig = (updates: Partial<WorkflowConfig>): void => {
  workflowConfig = { ...workflowConfig, ...updates };
};

export const findAgentById = (id: string): Agent | undefined => {
  return agentsStore.find(agent => agent.id === id);
};

export const updateAgent = (id: string, updates: Partial<Omit<Agent, 'id'>>): Agent | null => {
  const agentIndex = agentsStore.findIndex(agent => agent.id === id);
  if (agentIndex === -1) return null;
  
  agentsStore[agentIndex] = {
    ...agentsStore[agentIndex],
    ...updates,
    updatedAt: new Date(),
  };
  
  // Broadcast agent update via WebSocket
  try {
    const wsService = getWebSocketService();
    wsService.broadcastAgentUpdate(agentsStore[agentIndex]);
  } catch (error) {
    // WebSocket service might not be initialized in test environment
    console.log('WebSocket service not available for agent update broadcast');
  }
  
  return agentsStore[agentIndex];
};

export const addTask = (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task => {
  const newTask: Task = {
    ...task,
    id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  tasksStore.unshift(newTask); // Add to beginning for latest first
  
  // Broadcast task creation via WebSocket
  try {
    const wsService = getWebSocketService();
    wsService.broadcastTaskUpdate(newTask);
  } catch (error) {
    // WebSocket service might not be initialized in test environment
    console.log('WebSocket service not available for task creation broadcast');
  }
  
  return newTask;
};

export const updateTask = (id: string, updates: Partial<Omit<Task, 'id'>>): Task | null => {
  const taskIndex = tasksStore.findIndex(task => task.id === id);
  if (taskIndex === -1) return null;
  
  tasksStore[taskIndex] = {
    ...tasksStore[taskIndex],
    ...updates,
    updatedAt: new Date(),
  };
  
  // Broadcast task update via WebSocket
  try {
    const wsService = getWebSocketService();
    wsService.broadcastTaskUpdate(tasksStore[taskIndex]);
  } catch (error) {
    // WebSocket service might not be initialized in test environment
    console.log('WebSocket service not available for task update broadcast');
  }
  
  return tasksStore[taskIndex];
};

export const updatePortfolio = (updates: Partial<Omit<Portfolio, 'id'>>): Portfolio => {
  portfolioStore = {
    ...portfolioStore,
    ...updates,
    updatedAt: new Date(),
  };
  
  return portfolioStore;
};

// Utility function to generate unique IDs
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
