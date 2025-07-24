import { api } from '../api';
import type {
  EnrichedPortfolio,
  PerformanceData,
  AllocationData,
  RiskAnalysis,
  PerformanceQueryParams,
  Holding,
} from '../types';

/**
 * Portfolio API client with strongly-typed endpoints
 */
export const portfolioApi = {
  /**
   * Get aggregated portfolio data
   */
  get: async (): Promise<EnrichedPortfolio> => {
    return api.get<EnrichedPortfolio>('/portfolio');
  },

  /**
   * Get portfolio performance analytics
   */
  getPerformance: async (params?: PerformanceQueryParams): Promise<PerformanceData> => {
    return api.get<PerformanceData>('/portfolio/performance', params);
  },

  /**
   * Get current vs target allocation analysis
   */
  getAllocation: async (): Promise<AllocationData> => {
    return api.get<AllocationData>('/portfolio/allocation');
  },

  /**
   * Get risk analysis
   */
  getRisk: async (): Promise<RiskAnalysis> => {
    return api.get<RiskAnalysis>('/portfolio/risk');
  },

  /**
   * Get holdings data formatted for the portfolio page
   * This transforms the portfolio data into the format expected by the holdings table
   */
  getHoldings: async (): Promise<Holding[]> => {
    const portfolio = await portfolioApi.get();
    
    // Transform portfolio assets to holdings format
    const holdings: Holding[] = portfolio.assets.map(asset => ({
      symbol: asset.symbol,
      name: asset.name,
      quantity: asset.quantity,
      price: asset.price,
      value: asset.value,
      allocation: asset.percentage,
      targetAllocation: (portfolio.targetAllocations[asset.symbol] || 0) * 100,
      pnl: asset.value * (asset.change24h / 100), // Rough P&L calculation
      pnlPercent: asset.change24h,
      change24h: asset.change24h,
    }));

    return holdings;
  },

  /**
   * Get portfolio summary metrics
   */
  getSummary: async () => {
    const portfolio = await portfolioApi.get();
    
    return {
      totalValue: portfolio.totalValue,
      dailyChange: portfolio.performance.dailyChange,
      totalReturn: portfolio.performance.totalReturn,
      riskLevel: portfolio.summary.riskLevel,
      healthScore: portfolio.metrics.healthScore,
      isRebalanceNeeded: portfolio.metrics.isRebalanceNeeded,
      topHolding: portfolio.metrics.topAsset,
      assetCount: portfolio.metrics.totalAssets,
    };
  },

  /**
   * Get performance data for different time periods
   */
  getPerformance7d: async (): Promise<PerformanceData> => {
    return portfolioApi.getPerformance({ period: '7d' });
  },

  getPerformance30d: async (): Promise<PerformanceData> => {
    return portfolioApi.getPerformance({ period: '30d' });
  },

  getPerformance90d: async (): Promise<PerformanceData> => {
    return portfolioApi.getPerformance({ period: '90d' });
  },

  getPerformance1y: async (): Promise<PerformanceData> => {
    return portfolioApi.getPerformance({ period: '1y' });
  },

  /**
   * Refresh portfolio data (trigger recalculation)
   * Note: This endpoint doesn't exist yet in the backend
   */
  refresh: async (): Promise<EnrichedPortfolio> => {
    // For now, just return fresh data
    return portfolioApi.get();
  },

  /**
   * Execute rebalancing
   * Note: This endpoint doesn't exist yet in the backend
   */
  rebalance: async (): Promise<{ success: boolean; message: string }> => {
    // This would trigger the rebalancing agent
    return Promise.resolve({
      success: true,
      message: 'Rebalancing initiated. Check the agents dashboard for progress.',
    });
  },

  /**
   * Get rebalancing suggestions
   */
  getRebalanceSuggestions: async () => {
    const allocation = await portfolioApi.getAllocation();
    return allocation.rebalanceRecommendations;
  },

  /**
   * Get risk metrics summary
   */
  getRiskSummary: async () => {
    const risk = await portfolioApi.getRisk();
    return {
      level: risk.assessment.level,
      score: risk.assessment.score,
      volatility: risk.current.volatility,
      sharpeRatio: risk.current.sharpeRatio,
      maxDrawdown: risk.current.maxDrawdown,
      recommendations: risk.recommendations,
    };
  },
};

export default portfolioApi;
