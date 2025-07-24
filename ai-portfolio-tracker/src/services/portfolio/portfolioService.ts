import { apiClient } from "../client/apiClient";
import type {
  Portfolio,
  CreatePortfolioRequest,
  UpdatePortfolioRequest,
  PortfolioFilters,
  PaginationParams,
  PaginatedResponse,
} from "../types/api";

/**
 * Service for managing Solana-based crypto portfolios
 * Handles portfolio creation, asset management, and performance tracking
 */
export class PortfolioService {
  private readonly basePath = "/portfolio";

  /**
   * Get all portfolios with optional filtering and pagination
   */
  async getPortfolios(
    filters?: PortfolioFilters,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<Portfolio>> {
    const params = new URLSearchParams();

    // Add filters
    if (filters?.userId) {
      params.append("userId", filters.userId);
    }

    if (filters?.search) {
      params.append("search", filters.search);
    }

    if (filters?.minValue) {
      params.append("minValue", filters.minValue.toString());
    }

    if (filters?.maxValue) {
      params.append("maxValue", filters.maxValue.toString());
    }

    if (filters?.riskLevel) {
      const riskLevels = Array.isArray(filters.riskLevel)
        ? filters.riskLevel
        : [filters.riskLevel];
      riskLevels.forEach(level => params.append("riskLevel", level));
    }

    // Add pagination
    if (pagination?.page) {
      params.append("page", pagination.page.toString());
    }

    if (pagination?.limit) {
      params.append("limit", pagination.limit.toString());
    }

    if (pagination?.sortBy) {
      params.append("sortBy", pagination.sortBy);
    }

    if (pagination?.sortOrder) {
      params.append("sortOrder", pagination.sortOrder);
    }

    const url = `${this.basePath}${params.toString() ? `?${params.toString()}` : ""}`;
    return apiClient.getPaginated<Portfolio>(url);
  }

  /**
   * Get a specific portfolio by ID
   */
  async getPortfolio(id: string): Promise<Portfolio> {
    return apiClient.get<Portfolio>(`${this.basePath}/${id}`);
  }

  /**
   * Create a new portfolio
   */
  async createPortfolio(data: CreatePortfolioRequest): Promise<Portfolio> {
    return apiClient.post<Portfolio>(this.basePath, data);
  }

  /**
   * Update an existing portfolio
   */
  async updatePortfolio(
    id: string,
    data: UpdatePortfolioRequest
  ): Promise<Portfolio> {
    return apiClient.patch<Portfolio>(`${this.basePath}/${id}`, data);
  }

  /**
   * Delete a portfolio
   */
  async deletePortfolio(id: string): Promise<void> {
    return apiClient.delete<void>(`${this.basePath}/${id}`);
  }

  /**
   * Get portfolio performance analytics
   */
  async getPortfolioAnalytics(
    id: string,
    timeframe?: "1d" | "7d" | "30d" | "90d" | "365d" | "all"
  ): Promise<{
    performance: {
      totalReturn: number;
      totalReturnPercent: number;
      sharpeRatio: number;
      volatility: number;
      maxDrawdown: number;
      winRate: number;
      benchmark: {
        name: string;
        return: number;
        outperformance: number;
      };
    };
    riskMetrics: {
      valueAtRisk: number;
      expectedShortfall: number;
      beta: number;
      alpha: number;
      informationRatio: number;
      correlationMatrix: Record<string, Record<string, number>>;
    };
    attribution: {
      assetContribution: Array<{
        symbol: string;
        contribution: number;
        weight: number;
        return: number;
      }>;
      sectorContribution: Array<{
        sector: string;
        contribution: number;
        weight: number;
        return: number;
      }>;
    };
    historicalData: Array<{
      timestamp: string;
      totalValue: number;
      totalReturn: number;
      dailyReturn: number;
      volatility: number;
    }>;
  }> {
    const params = timeframe ? `?timeframe=${timeframe}` : "";
    return apiClient.get(`${this.basePath}/${id}/analytics${params}`);
  }

  /**
   * Get portfolio rebalancing suggestions
   */
  async getRebalancingSuggestions(
    id: string,
    options?: {
      method?:
        | "target_allocation"
        | "risk_parity"
        | "equal_weight"
        | "momentum";
      considerTransactionCosts?: boolean;
      minTradeAmount?: number;
    }
  ): Promise<{
    currentAllocation: Array<{
      symbol: string;
      currentWeight: number;
      targetWeight: number;
      deviation: number;
    }>;
    suggestions: Array<{
      symbol: string;
      action: "buy" | "sell" | "hold";
      currentAmount: number;
      targetAmount: number;
      deltaAmount: number;
      deltaValue: number;
      reason: string;
      priority: "high" | "medium" | "low";
    }>;
    impact: {
      estimatedCost: number;
      expectedReturn: number;
      riskReduction: number;
      taxImplications: number;
    };
    execution: {
      totalTrades: number;
      estimatedSlippage: number;
      optimalExecutionTime: string;
      marketImpact: number;
    };
  }> {
    const params = new URLSearchParams();

    if (options?.method) params.append("method", options.method);
    if (options?.considerTransactionCosts)
      params.append("considerTransactionCosts", "true");
    if (options?.minTradeAmount)
      params.append("minTradeAmount", options.minTradeAmount.toString());

    const url = `${this.basePath}/${id}/rebalance/suggestions${params.toString() ? `?${params.toString()}` : ""}`;
    return apiClient.get(url);
  }

  /**
   * Execute portfolio rebalancing
   */
  async executeRebalancing(
    id: string,
    rebalanceData: {
      trades: Array<{
        symbol: string;
        action: "buy" | "sell";
        amount: number;
        maxSlippage?: number;
      }>;
      dryRun?: boolean;
      allowPartialExecution?: boolean;
    }
  ): Promise<{
    executionId: string;
    status: "pending" | "executing" | "completed" | "failed" | "cancelled";
    trades: Array<{
      symbol: string;
      action: "buy" | "sell";
      requestedAmount: number;
      executedAmount: number;
      averagePrice: number;
      totalCost: number;
      slippage: number;
      status: "pending" | "executed" | "failed" | "cancelled";
      transactionId?: string;
      error?: string;
    }>;
    summary: {
      totalTrades: number;
      successfulTrades: number;
      failedTrades: number;
      totalCost: number;
      totalSlippage: number;
      executionTime: number;
    };
  }> {
    return apiClient.post(
      `${this.basePath}/${id}/rebalance/execute`,
      rebalanceData
    );
  }

  /**
   * Get portfolio asset allocation breakdown
   */
  async getAssetAllocation(id: string): Promise<{
    byAsset: Array<{
      symbol: string;
      name: string;
      value: number;
      percentage: number;
      targetPercentage?: number;
      deviation: number;
      category: string;
    }>;
    byCategory: Array<{
      category: string;
      value: number;
      percentage: number;
      assets: number;
      topAssets: Array<{
        symbol: string;
        percentage: number;
      }>;
    }>;
    diversification: {
      herfindahlIndex: number;
      effectiveAssets: number;
      concentrationRisk: number;
      correlationRisk: number;
    };
  }> {
    return apiClient.get(`${this.basePath}/${id}/allocation`);
  }

  /**
   * Get portfolio risk assessment
   */
  async getRiskAssessment(id: string): Promise<{
    overallRisk: {
      score: number;
      level: "very_low" | "low" | "moderate" | "high" | "very_high";
      factors: Array<{
        name: string;
        impact: number;
        description: string;
      }>;
    };
    riskMetrics: {
      volatility: {
        daily: number;
        weekly: number;
        monthly: number;
        annualized: number;
      };
      valueAtRisk: {
        "95%": number;
        "99%": number;
        timeHorizon: string;
      };
      maximumDrawdown: {
        current: number;
        historical: number;
        duration: number;
      };
    };
    assetRisks: Array<{
      symbol: string;
      individualRisk: number;
      contributionToPortfolioRisk: number;
      liquidityRisk: number;
      concentrationRisk: number;
    }>;
    recommendations: Array<{
      type:
        | "diversification"
        | "position_sizing"
        | "asset_selection"
        | "rebalancing";
      priority: "high" | "medium" | "low";
      description: string;
      expectedImpact: number;
    }>;
  }> {
    return apiClient.get(`${this.basePath}/${id}/risk`);
  }

  /**
   * Add assets to portfolio
   */
  async addAssets(
    id: string,
    assets: Array<{
      symbol: string;
      mintAddress: string;
      amount: number;
      targetAllocation?: number;
    }>
  ): Promise<Portfolio> {
    return apiClient.post(`${this.basePath}/${id}/assets`, { assets });
  }

  /**
   * Remove assets from portfolio
   */
  async removeAssets(id: string, assetIds: string[]): Promise<Portfolio> {
    return apiClient.delete(`${this.basePath}/${id}/assets`, {
      data: { assetIds },
    });
  }

  /**
   * Update asset allocation targets
   */
  async updateAssetTargets(
    id: string,
    targets: Array<{
      symbol: string;
      targetAllocation: number;
    }>
  ): Promise<Portfolio> {
    return apiClient.patch(`${this.basePath}/${id}/targets`, { targets });
  }

  /**
   * Get portfolio transaction history
   */
  async getTransactionHistory(
    id: string,
    filters?: {
      type?: "buy" | "sell" | "rebalance" | "dividend" | "fee";
      symbol?: string;
      dateFrom?: string;
      dateTo?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<{
    transactions: Array<{
      id: string;
      type: "buy" | "sell" | "rebalance" | "dividend" | "fee";
      symbol: string;
      amount: number;
      price: number;
      value: number;
      fee: number;
      timestamp: string;
      transactionHash?: string;
      status: "pending" | "confirmed" | "failed";
    }>;
    summary: {
      totalTransactions: number;
      totalVolume: number;
      totalFees: number;
      averageTransactionSize: number;
    };
  }> {
    const params = new URLSearchParams();

    if (filters?.type) params.append("type", filters.type);
    if (filters?.symbol) params.append("symbol", filters.symbol);
    if (filters?.dateFrom) params.append("dateFrom", filters.dateFrom);
    if (filters?.dateTo) params.append("dateTo", filters.dateTo);
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.offset) params.append("offset", filters.offset.toString());

    const url = `${this.basePath}/${id}/transactions${params.toString() ? `?${params.toString()}` : ""}`;
    return apiClient.get(url);
  }

  /**
   * Get portfolio comparison with benchmarks
   */
  async compareWithBenchmarks(
    id: string,
    benchmarks?: string[],
    timeframe?: "1d" | "7d" | "30d" | "90d" | "365d" | "all"
  ): Promise<{
    portfolio: {
      name: string;
      return: number;
      volatility: number;
      sharpeRatio: number;
      maxDrawdown: number;
    };
    benchmarks: Array<{
      name: string;
      symbol: string;
      return: number;
      volatility: number;
      sharpeRatio: number;
      maxDrawdown: number;
      correlation: number;
      outperformance: number;
    }>;
    metrics: {
      alpha: number;
      beta: number;
      informationRatio: number;
      treynorRatio: number;
      calmarRatio: number;
    };
    chart: Array<{
      date: string;
      portfolio: number;
      benchmarks: Record<string, number>;
    }>;
  }> {
    const params = new URLSearchParams();

    if (benchmarks) {
      benchmarks.forEach(benchmark => params.append("benchmark", benchmark));
    }

    if (timeframe) {
      params.append("timeframe", timeframe);
    }

    const url = `${this.basePath}/${id}/compare${params.toString() ? `?${params.toString()}` : ""}`;
    return apiClient.get(url);
  }

  /**
   * Export portfolio data
   */
  async exportPortfolio(
    id: string,
    format: "json" | "csv" | "xlsx" | "pdf",
    options?: {
      includeTransactions?: boolean;
      includeAnalytics?: boolean;
      timeframe?: string;
    }
  ): Promise<{
    downloadUrl: string;
    expiresAt: string;
    format: string;
    size: number;
  }> {
    return apiClient.post(`${this.basePath}/${id}/export`, {
      format,
      ...options,
    });
  }

  /**
   * Get portfolio alerts and notifications
   */
  async getPortfolioAlerts(id: string): Promise<{
    active: Array<{
      id: string;
      type: "price" | "allocation" | "risk" | "performance";
      severity: "info" | "warning" | "critical";
      message: string;
      triggerValue: number;
      currentValue: number;
      timestamp: string;
      acknowledged: boolean;
    }>;
    configuration: {
      priceAlerts: Array<{
        symbol: string;
        condition: "above" | "below" | "change";
        threshold: number;
        enabled: boolean;
      }>;
      allocationAlerts: Array<{
        symbol: string;
        maxDeviation: number;
        enabled: boolean;
      }>;
      riskAlerts: {
        maxDrawdown: number;
        volatilityThreshold: number;
        enabled: boolean;
      };
    };
  }> {
    return apiClient.get(`${this.basePath}/${id}/alerts`);
  }

  /**
   * Update portfolio alert settings
   */
  async updateAlertSettings(
    id: string,
    settings: {
      priceAlerts?: Array<{
        symbol: string;
        condition: "above" | "below" | "change";
        threshold: number;
        enabled: boolean;
      }>;
      allocationAlerts?: Array<{
        symbol: string;
        maxDeviation: number;
        enabled: boolean;
      }>;
      riskAlerts?: {
        maxDrawdown: number;
        volatilityThreshold: number;
        enabled: boolean;
      };
    }
  ): Promise<Portfolio> {
    return apiClient.patch(`${this.basePath}/${id}/alerts`, settings);
  }

  /**
   * Acknowledge portfolio alerts
   */
  async acknowledgeAlerts(id: string, alertIds: string[]): Promise<void> {
    return apiClient.post(`${this.basePath}/${id}/alerts/acknowledge`, {
      alertIds,
    });
  }
}

// Create singleton instance
export const portfolioService = new PortfolioService();

// Export individual methods for convenience
export const {
  getPortfolios,
  getPortfolio,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
  getPortfolioAnalytics,
  getRebalancingSuggestions,
  executeRebalancing,
  getAssetAllocation,
  getRiskAssessment,
  addAssets,
  removeAssets,
  updateAssetTargets,
  getTransactionHistory,
  compareWithBenchmarks,
  exportPortfolio,
  getPortfolioAlerts,
  updateAlertSettings,
  acknowledgeAlerts,
} = portfolioService;
