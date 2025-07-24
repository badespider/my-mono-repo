export type AgentType = 'monitoring' | 'analysis' | 'rebalancing' | 'alerts';

export type AgentStatus = 'active' | 'inactive' | 'error' | 'maintenance';

export type TaskStatus = 'backlog' | 'todo' | 'in-progress' | 'review' | 'done' | 'blocked';

export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  status: AgentStatus;
  successRate: number;
  executionCount: number;
  uptimeHours: number;
  lastHeartbeat: Date;
  metrics: {
    cpu: number;
    memory: number;
    latency: number;
  };
  config: Record<string, any>;
}

export interface Task {
  id: string;
  agentId: string;
  agentType: AgentType;
  description: string;
  status: TaskStatus;
  progress: number;
  startTime: Date;
  estimatedCompletion?: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface Portfolio {
  totalValue: number;
  change24h: number;
  unrealizedPnL: number;
  activePositions: number;
  holdings: Holding[];
}

export interface Holding {
  symbol: string;
  name: string;
  logo: string;
  quantity: number;
  currentPrice: number;
  change24h: number;
  allocation: number;
  targetAllocation: number;
  unrealizedPnL: number;
}

export interface Alert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  agentId?: string;
  actionRequired?: boolean;
}

export interface WebSocketMessage {
  type: 'agent_status' | 'task_update' | 'portfolio_update' | 'price_update' | 'alert';
  data: any;
  timestamp: Date;
}