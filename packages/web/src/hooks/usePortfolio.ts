import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { portfolioApi } from '@/lib/api/portfolio';
import type { PerformanceQueryParams } from '@/lib/types';

// Query Keys
export const portfolioKeys = {
  all: ['portfolio'] as const,
  details: () => [...portfolioKeys.all, 'detail'] as const,
  detail: () => [...portfolioKeys.details()] as const,
  performance: () => [...portfolioKeys.all, 'performance'] as const,
  performanceWithPeriod: (period?: string) => [...portfolioKeys.performance(), period] as const,
  allocation: () => [...portfolioKeys.all, 'allocation'] as const,
  risk: () => [...portfolioKeys.all, 'risk'] as const,
  holdings: () => [...portfolioKeys.all, 'holdings'] as const,
  summary: () => [...portfolioKeys.all, 'summary'] as const,
};

// Main portfolio query
export const usePortfolio = () => {
  return useQuery({
    queryKey: portfolioKeys.detail(),
    queryFn: () => portfolioApi.get(),
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
    refetchInterval: 60000, // Auto-refresh every minute
  });
};

// Performance data with different periods
export const usePortfolioPerformance = (params?: PerformanceQueryParams) => {
  return useQuery({
    queryKey: portfolioKeys.performanceWithPeriod(params?.period),
    queryFn: () => portfolioApi.getPerformance(params),
    staleTime: 60000, // 1 minute
    gcTime: 300000,
  });
};

// Specific period performance hooks
export const usePortfolioPerformance7d = () => {
  return useQuery({
    queryKey: portfolioKeys.performanceWithPeriod('7d'),
    queryFn: () => portfolioApi.getPerformance7d(),
    staleTime: 60000,
    gcTime: 300000,
  });
};

export const usePortfolioPerformance30d = () => {
  return useQuery({
    queryKey: portfolioKeys.performanceWithPeriod('30d'),
    queryFn: () => portfolioApi.getPerformance30d(),
    staleTime: 60000,
    gcTime: 300000,
  });
};

export const usePortfolioPerformance90d = () => {
  return useQuery({
    queryKey: portfolioKeys.performanceWithPeriod('90d'),
    queryFn: () => portfolioApi.getPerformance90d(),
    staleTime: 60000,
    gcTime: 300000,
  });
};

export const usePortfolioPerformance1y = () => {
  return useQuery({
    queryKey: portfolioKeys.performanceWithPeriod('1y'),
    queryFn: () => portfolioApi.getPerformance1y(),
    staleTime: 60000,
    gcTime: 300000,
  });
};

// Allocation analysis
export const usePortfolioAllocation = () => {
  return useQuery({
    queryKey: portfolioKeys.allocation(),
    queryFn: () => portfolioApi.getAllocation(),
    staleTime: 30000,
    gcTime: 300000,
  });
};

// Risk analysis
export const usePortfolioRisk = () => {
  return useQuery({
    queryKey: portfolioKeys.risk(),
    queryFn: () => portfolioApi.getRisk(),
    staleTime: 60000, // Risk data can be less frequent
    gcTime: 300000,
  });
};

// Holdings data (formatted for portfolio page)
export const usePortfolioHoldings = () => {
  return useQuery({
    queryKey: portfolioKeys.holdings(),
    queryFn: () => portfolioApi.getHoldings(),
    staleTime: 30000,
    gcTime: 300000,
    refetchInterval: 60000, // Auto-refresh holdings
  });
};

// Portfolio summary metrics
export const usePortfolioSummary = () => {
  return useQuery({
    queryKey: portfolioKeys.summary(),
    queryFn: () => portfolioApi.getSummary(),
    staleTime: 30000,
    gcTime: 300000,
    refetchInterval: 60000,
  });
};

// Rebalance suggestions
export const useRebalanceSuggestions = () => {
  return useQuery({
    queryKey: [...portfolioKeys.allocation(), 'suggestions'],
    queryFn: () => portfolioApi.getRebalanceSuggestions(),
    staleTime: 60000,
    gcTime: 300000,
  });
};

// Risk summary
export const useRiskSummary = () => {
  return useQuery({
    queryKey: [...portfolioKeys.risk(), 'summary'],
    queryFn: () => portfolioApi.getRiskSummary(),
    staleTime: 60000,
    gcTime: 300000,
  });
};

// Mutation hooks
export const useRefreshPortfolio = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => portfolioApi.refresh(),
    onSuccess: (data) => {
      // Update portfolio data in cache
      queryClient.setQueryData(portfolioKeys.detail(), data);
      // Invalidate related queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: portfolioKeys.all });
    },
  });
};

export const useRebalancePortfolio = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => portfolioApi.rebalance(),
    onSuccess: () => {
      // Invalidate all portfolio-related queries after rebalancing
      queryClient.invalidateQueries({ queryKey: portfolioKeys.all });
    },
  });
};

// Combined hooks for dashboard
export const usePortfolioDashboard = () => {
  const portfolio = usePortfolio();
  const summary = usePortfolioSummary();
  const allocation = usePortfolioAllocation();
  const risk = useRiskSummary();

  return {
    portfolio: portfolio.data,
    summary: summary.data,
    allocation: allocation.data,
    risk: risk.data,
    isLoading: portfolio.isLoading || summary.isLoading || allocation.isLoading || risk.isLoading,
    isError: portfolio.isError || summary.isError || allocation.isError || risk.isError,
    error: portfolio.error || summary.error || allocation.error || risk.error,
    refetch: () => {
      portfolio.refetch();
      summary.refetch();
      allocation.refetch();
      risk.refetch();
    },
  };
};

// Custom hook for portfolio metrics cards
export const usePortfolioMetrics = () => {
  const { data: portfolio, isLoading, error } = usePortfolio();

  if (!portfolio) {
    return { isLoading, error, metrics: null };
  }

  const metrics = {
    totalValue: portfolio.totalValue,
    dailyChange: portfolio.performance.dailyChange,
    totalReturn: portfolio.performance.totalReturn,
    weeklyChange: portfolio.performance.weeklyChange,
    monthlyChange: portfolio.performance.monthlyChange,
    healthScore: portfolio.metrics.healthScore,
    topAsset: portfolio.metrics.topAsset,
    isRebalanceNeeded: portfolio.metrics.isRebalanceNeeded,
    riskLevel: portfolio.summary.riskLevel,
    assetCount: portfolio.metrics.totalAssets,
    volatility: portfolio.riskMetrics.volatility,
    sharpeRatio: portfolio.riskMetrics.sharpeRatio,
    maxDrawdown: portfolio.riskMetrics.maxDrawdown,
  };

  return {
    metrics,
    isLoading,
    error,
  };
};

// Hook for checking if rebalancing is needed
export const useRebalanceStatus = () => {
  const { data: allocation } = usePortfolioAllocation();
  
  return {
    isRebalanceNeeded: allocation?.isRebalanceNeeded || false,
    recommendations: allocation?.rebalanceRecommendations || [],
    lastRebalanced: allocation?.lastRebalanced,
  };
};
