// ====== SHARED TYPES ======

export type AgentStatus = 'active' | 'inactive' | 'error';
export type AgentType = 'monitoring' | 'analysis' | 'rebalancing' | 'alerts';
export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

// ====== AGENT TYPES ======

export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  status: AgentStatus;
  description: string;
  lastRun?: Date;
  nextRun?: Date;
  performance?: AgentPerformance;
  config?: AgentConfig;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentPerformance {
  tasksCompleted: number;
  successRate: number;
  averageExecutionTime: number;
  uptime?: string;
}

export interface AgentConfig {
  [key: string]: any;
}

export interface UpdateAgentRequest {
  name?: string;
  description?: string;
  config?: AgentConfig;
  status?: AgentStatus;
}

export interface AgentMetrics {
  agentId: string;
  agentName: string;
  performance: AgentPerformance;
  lastRun?: Date;
  nextRun?: Date;
  uptime: string;
}

// Enhanced agent metrics for monitoring page
export interface DetailedAgentMetrics {
  cpu: number;
  memory: number;
  latency: number;
  errorRate: number;
  throughput: number;
  logs: AgentLog[];
}

export interface AgentLog {
  time: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
}

// ====== TASK TYPES ======

export interface Task {
  id: string;
  agentId: string;
  type: string;
  status: TaskStatus;
  priority: TaskPriority;
  metadata?: TaskMetadata;
  executionTime?: number;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  error?: string;
}

export interface TaskMetadata {
  [key: string]: any;
}

export interface CreateTaskRequest {
  agentId: string;
  type: string;
  priority?: TaskPriority;
  metadata?: TaskMetadata;
}

export interface TasksQueryParams {
  page?: number;
  limit?: number;
  agentId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  sortBy?: 'createdAt' | 'priority' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface TaskStats {
  total: number;
  byStatus: {
    pending: number;
    running: number;
    completed: number;
    failed: number;
  };
  byPriority: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  completionRate: number;
  averageExecutionTime: number;
}

// ====== PORTFOLIO TYPES ======

export interface PortfolioAsset {
  symbol: string;
  name: string;
  quantity: number;
  price: number;
  value: number;
  percentage: number;
  change24h: number;
  lastUpdated: Date;
}

export interface PortfolioPerformance {
  totalReturn: number;
  dailyChange: number;
  weeklyChange: number;
  monthlyChange: number;
}

export interface RiskMetrics {
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  beta?: number;
}

export interface Portfolio {
  totalValue: number;
  assets: PortfolioAsset[];
  performance: PortfolioPerformance;
  riskMetrics: RiskMetrics;
  targetAllocations: Record<string, number>;
  lastRebalanced: Date;
  lastUpdated: Date;
}

export interface EnrichedPortfolio extends Portfolio {
  metrics: {
    totalAssets: number;
    topAsset: {
      symbol: string;
      percentage: number;
    };
    healthScore: number;
    lastUpdateTime: number;
    isRebalanceNeeded: boolean;
  };
  summary: {
    totalValue: number;
    dailyChange: number;
    totalReturn: number;
    riskLevel: 'Low' | 'Medium' | 'High';
  };
}

export interface PerformanceHistory {
  date: string;
  value: number;
  change: number;
}

export interface PerformanceData {
  period: string;
  history: PerformanceHistory[];
  metrics: {
    totalReturn: number;
    dailyChange: number;
    weeklyChange: number;
    monthlyChange: number;
    volatility: number;
    sharpeRatio: number;
    maxDrawdown: number;
    bestDay: number;
    worstDay: number;
    positiveDays: number;
    totalDays: number;
  };
  benchmarks: {
    sp500: number;
    btc: number;
    portfolio: number;
  };
}

export interface AllocationAnalysis {
  symbol: string;
  currentAllocation: number;
  targetAllocation: number;
  difference: number;
  currentValue: number;
  targetValue: number;
  rebalanceAmount: number;
  status: 'overweight' | 'underweight' | 'balanced';
  needsRebalance: boolean;
}

export interface RebalanceRecommendation {
  symbol: string;
  action: 'buy' | 'sell';
  amount: number;
  priority: 'high' | 'medium';
}

export interface AllocationData {
  currentAllocations: AllocationAnalysis[];
  rebalanceRecommendations: RebalanceRecommendation[];
  isRebalanceNeeded: boolean;
  lastRebalanced: Date;
  totalValue: number;
}

export interface RiskFactor {
  factor: string;
  value: number;
  impact: 'High' | 'Medium' | 'Low' | 'Positive' | 'Neutral';
}

export interface RiskAssessment {
  level: 'Low' | 'Medium' | 'High';
  score: number;
  factors: RiskFactor[];
}

export interface RiskAnalysis {
  current: RiskMetrics;
  assessment: RiskAssessment;
  recommendations: string[];
}

// ====== HOLDING TYPES FOR PORTFOLIO PAGE ======

export interface Holding {
  symbol: string;
  name: string;
  quantity: number;
  price: number;
  value: number;
  allocation: number;
  targetAllocation: number;
  pnl: number;
  pnlPercent: number;
  change24h: number;
}

// ====== QUERY PARAMETERS ======

export interface PerformanceQueryParams {
  period?: '7d' | '30d' | '90d' | '1y';
}

// ====== WEBSOCKET TYPES ======

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

export interface PriceUpdate {
  symbol: string;
  price: number;
  change24h: number;
  timestamp: number;
}

export interface AgentStatusUpdate {
  agentId: string;
  status: AgentStatus;
  lastRun?: Date;
  nextRun?: Date;
  performance?: AgentPerformance;
}

export interface TaskUpdate {
  taskId: string;
  status: TaskStatus;
  progress?: number;
  result?: any;
  error?: string;
}
