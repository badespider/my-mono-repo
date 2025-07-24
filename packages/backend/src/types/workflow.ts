/**
 * Backend workflow types for multi-agent AI portfolio tracker
 */

import { BaseEntity } from '@org/shared';

export interface Agent extends BaseEntity {
  name: string;
  type: 'monitoring' | 'analysis' | 'rebalancing' | 'alerts';
  status: 'active' | 'inactive' | 'error';
  description: string;
  lastRun?: Date;
  nextRun?: Date;
  config: Record<string, any>;
  performance?: {
    tasksCompleted: number;
    successRate: number;
    averageExecutionTime: number;
  };
}

export interface Task extends BaseEntity {
  agentId: string;
  type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  completedAt?: Date;
  result?: any;
  error?: string;
  metadata?: Record<string, any>;
  executionTime?: number; // in milliseconds
}

export interface Portfolio extends BaseEntity {
  totalValue: number;
  assets: {
    symbol: string;
    amount: number;
    value: number;
    percentage: number;
    priceChange24h?: number;
    lastUpdated: Date;
  }[];
  performance: {
    totalReturn: number;
    dailyChange: number;
    weeklyChange: number;
    monthlyChange: number;
  };
  riskMetrics: {
    volatility: number;
    sharpeRatio: number;
    maxDrawdown: number;
  };
  lastRebalanced?: Date;
  targetAllocations: Record<string, number>;
}

export interface WorkflowConfig {
  isRunning: boolean;
  startedAt?: Date;
  stoppedAt?: Date;
  cycleInterval: number; // in milliseconds
  maxConcurrentTasks: number;
}

// Request/Response types
export interface CreateTaskRequest {
  agentId: string;
  type: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
}

export interface UpdateAgentRequest {
  name?: string;
  description?: string;
  config?: Record<string, any>;
  status?: 'active' | 'inactive' | 'error';
}

export interface TasksQueryParams {
  page?: number;
  limit?: number;
  agentId?: string;
  status?: Task['status'];
  priority?: Task['priority'];
  sortBy?: 'createdAt' | 'priority' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedTasksResponse {
  tasks: Task[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
