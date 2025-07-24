// Base API Response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  success: boolean;
  message?: string;
  timestamp: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

// Agent Types
export interface Agent {
  id: string;
  name: string;
  type: "monitoring" | "analysis" | "rebalancing" | "alerts";
  status: "active" | "inactive" | "error" | "maintenance";
  description: string;
  config: AgentConfig;
  createdAt: string;
  updatedAt: string;
  lastExecuted?: string;
  metrics: AgentMetrics;
}

export interface AgentConfig {
  enabled: boolean;
  interval: number; // in milliseconds
  parameters: Record<string, any>;
  thresholds?: {
    [key: string]: number;
  };
  notifications: {
    email: boolean;
    webhook: boolean;
    inApp: boolean;
  };
}

export interface AgentMetrics {
  executionCount: number;
  successRate: number;
  averageExecutionTime: number;
  lastError?: string;
  uptime: number;
}

export interface CreateAgentRequest {
  name: string;
  type: Agent["type"];
  description: string;
  config: Omit<AgentConfig, "enabled">;
}

export interface UpdateAgentRequest {
  name?: string;
  type?: Agent["type"];
  description?: string;
  status?: Agent["status"];
  config?: Partial<AgentConfig>;
}

// Task Types
export interface Task {
  id: string;
  agentId: string;
  type: "analysis" | "rebalance" | "alert" | "monitor" | "report";
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  priority: "low" | "medium" | "high" | "critical";
  title: string;
  description?: string;
  input: TaskInput;
  output?: TaskOutput;
  progress: number; // 0-100
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
  executionTime?: number; // in milliseconds
  retryCount: number;
  maxRetries: number;
  error?: TaskError;
}

export interface TaskInput {
  portfolioId?: string;
  symbols?: string[];
  parameters: Record<string, any>;
  context?: Record<string, any>;
}

export interface TaskOutput {
  result: any;
  metadata: {
    executionTime: number;
    resourcesUsed: Record<string, any>;
    confidence?: number;
  };
  recommendations?: TaskRecommendation[];
}

export interface TaskError {
  code: string;
  message: string;
  stack?: string;
  context?: Record<string, any>;
  retryable: boolean;
}

export interface TaskRecommendation {
  type: "buy" | "sell" | "hold" | "rebalance" | "alert";
  asset: string;
  action: string;
  confidence: number;
  reason: string;
  impact: "low" | "medium" | "high";
}

export interface CreateTaskRequest {
  agentId: string;
  type: Task["type"];
  priority?: Task["priority"];
  title: string;
  description?: string;
  input: TaskInput;
  maxRetries?: number;
}

export interface UpdateTaskRequest {
  status?: Task["status"];
  progress?: number;
  output?: TaskOutput;
  error?: TaskError;
}

// Portfolio Types
export interface Portfolio {
  id: string;
  userId: string;
  name: string;
  description?: string;
  totalValue: number;
  totalChange24h: number;
  totalChangePercent24h: number;
  assets: PortfolioAsset[];
  allocation: AssetAllocation[];
  riskProfile: RiskProfile;
  rebalanceConfig: RebalanceConfig;
  createdAt: string;
  updatedAt: string;
  lastRebalanced?: string;
  performance: PortfolioPerformance;
}

export interface PortfolioAsset {
  id: string;
  symbol: string;
  name: string;
  mintAddress: string; // Solana mint address
  amount: number;
  value: number;
  price: number;
  change24h: number;
  changePercent24h: number;
  allocation: number; // percentage of total portfolio
  targetAllocation?: number;
  lastUpdated: string;
}

export interface AssetAllocation {
  symbol: string;
  current: number;
  target: number;
  deviation: number;
}

export interface RiskProfile {
  level: "conservative" | "moderate" | "aggressive";
  maxAssetAllocation: number; // max % for single asset
  volatilityTolerance: number;
  correlationLimit: number;
  rebalanceThreshold: number; // % deviation to trigger rebalance
}

export interface RebalanceConfig {
  enabled: boolean;
  frequency: "manual" | "daily" | "weekly" | "monthly";
  threshold: number; // % deviation to trigger rebalance
  maxSlippage: number;
  dryRun: boolean;
}

export interface PortfolioPerformance {
  totalReturn: number;
  totalReturnPercent: number;
  sharpeRatio: number;
  volatility: number;
  maxDrawdown: number;
  winRate: number;
  periodReturns: {
    "1d": number;
    "7d": number;
    "30d": number;
    "90d": number;
    "365d": number;
    all: number;
  };
}

export interface CreatePortfolioRequest {
  name: string;
  description?: string;
  assets: Array<{
    symbol: string;
    mintAddress: string;
    targetAllocation: number;
  }>;
  riskProfile: RiskProfile;
  rebalanceConfig: RebalanceConfig;
}

export interface UpdatePortfolioRequest {
  name?: string;
  description?: string;
  riskProfile?: Partial<RiskProfile>;
  rebalanceConfig?: Partial<RebalanceConfig>;
  assets?: Array<{
    symbol: string;
    mintAddress: string;
    amount?: number;
    targetAllocation?: number;
  }>;
}

// Filter and Query Types
export interface AgentFilters {
  type?: Agent["type"] | Agent["type"][];
  status?: Agent["status"] | Agent["status"][];
  search?: string;
}

export interface TaskFilters {
  agentId?: string;
  type?: Task["type"] | Task["type"][];
  status?: Task["status"] | Task["status"][];
  priority?: Task["priority"] | Task["priority"][];
  portfolioId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface PortfolioFilters {
  userId?: string;
  search?: string;
  minValue?: number;
  maxValue?: number;
  riskLevel?: RiskProfile["level"] | RiskProfile["level"][];
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
