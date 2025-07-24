import { Router, Request, Response } from 'express';
import { HTTP_STATUS, ApiResponse } from '@org/shared';
import { portfolioStore, updatePortfolio } from '../stores';
import { Portfolio } from '../types/workflow';

const router: Router = Router();

// GET /api/portfolio - Get aggregated portfolio data
router.get('/', (req: Request, res: Response) => {
  try {
    // Calculate additional real-time metrics
    const now = new Date();
    const totalAssets = portfolioStore.assets.length;
    const topAsset = portfolioStore.assets.reduce((max, asset) => 
      asset.value > max.value ? asset : max
    );
    
    // Calculate portfolio health score based on various factors
    const diversificationScore = Math.min(100, (totalAssets / 3) * 50); // Better with more assets
    const performanceScore = Math.max(0, Math.min(100, 50 + portfolioStore.performance.totalReturn * 2));
    const riskScore = Math.max(0, Math.min(100, 100 - portfolioStore.riskMetrics.volatility * 200));
    const healthScore = Math.round((diversificationScore + performanceScore + riskScore) / 3);

    const enrichedPortfolio = {
      ...portfolioStore,
      metrics: {
        totalAssets,
        topAsset: {
          symbol: topAsset.symbol,
          percentage: topAsset.percentage,
        },
        healthScore,
        lastUpdateTime: Math.max(...portfolioStore.assets.map(a => a.lastUpdated.getTime())),
        isRebalanceNeeded: portfolioStore.assets.some(asset => {
          const target = portfolioStore.targetAllocations[asset.symbol] || 0;
          const actual = asset.percentage / 100;
          return Math.abs(actual - target) > 0.05; // 5% threshold
        }),
      },
      summary: {
        totalValue: portfolioStore.totalValue,
        dailyChange: portfolioStore.performance.dailyChange,
        totalReturn: portfolioStore.performance.totalReturn,
        riskLevel: portfolioStore.riskMetrics.volatility > 0.3 ? 'High' : 
                   portfolioStore.riskMetrics.volatility > 0.2 ? 'Medium' : 'Low',
      },
    };

    res.json({
      success: true,
      data: enrichedPortfolio,
    } as ApiResponse<typeof enrichedPortfolio>);
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to fetch portfolio data',
    } as ApiResponse);
  }
});

// GET /api/portfolio/performance - Get performance analytics
router.get('/performance', (req: Request, res: Response) => {
  try {
    const { period = '30d' } = req.query;
    
    // Mock historical performance data based on period
    const generateMockHistory = (days: number) => {
      const history: Array<{ date: string; value: number; change: number }> = [];
      const baseValue = portfolioStore.totalValue * 0.85; // Start 15% lower
      
      for (let i = days; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        const progress = (days - i) / days;
        const randomVariation = (Math.random() - 0.5) * 0.1; // ±5% random variation
        const trend = progress * 0.15; // 15% overall growth
        const value = baseValue * (1 + trend + randomVariation);
        
        history.push({
          date: date.toISOString().split('T')[0],
          value: Math.round(value * 100) / 100,
          change: i === days ? 0 : Math.round((value - history[history.length - 1]?.value || value) * 100) / 100,
        });
      }
      return history;
    };

    const periodDays = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
    const performanceHistory = generateMockHistory(periodDays);
    
    const performanceData = {
      period,
      history: performanceHistory,
      metrics: {
        ...portfolioStore.performance,
        volatility: portfolioStore.riskMetrics.volatility,
        sharpeRatio: portfolioStore.riskMetrics.sharpeRatio,
        maxDrawdown: portfolioStore.riskMetrics.maxDrawdown,
        bestDay: Math.max(...performanceHistory.map(h => h.change)),
        worstDay: Math.min(...performanceHistory.map(h => h.change)),
        positiveDays: performanceHistory.filter(h => h.change > 0).length,
        totalDays: performanceHistory.length,
      },
      benchmarks: {
        sp500: 12.5, // Mock S&P 500 return
        btc: 45.2,   // Mock Bitcoin return
        portfolio: portfolioStore.performance.totalReturn,
      },
    };

    res.json({
      success: true,
      data: performanceData,
    } as ApiResponse);
  } catch (error) {
    console.error('Error fetching performance data:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to fetch performance data',
    } as ApiResponse);
  }
});

// GET /api/portfolio/allocation - Get current vs target allocation analysis
router.get('/allocation', (req: Request, res: Response) => {
  try {
    const allocationAnalysis = portfolioStore.assets.map(asset => {
      const currentAllocation = asset.percentage / 100;
      const targetAllocation = portfolioStore.targetAllocations[asset.symbol] || 0;
      const difference = currentAllocation - targetAllocation;
      const differencePercent = Math.round(difference * 10000) / 100; // Convert to percentage with 2 decimals
      const isOverweight = difference > 0.01; // More than 1% over
      const isUnderweight = difference < -0.01; // More than 1% under
      
      return {
        symbol: asset.symbol,
        currentAllocation: Math.round(currentAllocation * 10000) / 100,
        targetAllocation: Math.round(targetAllocation * 10000) / 100,
        difference: differencePercent,
        currentValue: asset.value,
        targetValue: Math.round(portfolioStore.totalValue * targetAllocation * 100) / 100,
        rebalanceAmount: Math.round((portfolioStore.totalValue * targetAllocation - asset.value) * 100) / 100,
        status: isOverweight ? 'overweight' : isUnderweight ? 'underweight' : 'balanced',
        needsRebalance: Math.abs(difference) > 0.05, // 5% threshold
      };
    });

    const rebalanceRecommendations = allocationAnalysis
      .filter(item => item.needsRebalance)
      .map(item => ({
        symbol: item.symbol,
        action: item.rebalanceAmount > 0 ? 'buy' : 'sell',
        amount: Math.abs(item.rebalanceAmount),
        priority: Math.abs(item.difference) > 0.1 ? 'high' : 'medium',
      }));

    res.json({
      success: true,
      data: {
        currentAllocations: allocationAnalysis,
        rebalanceRecommendations,
        isRebalanceNeeded: rebalanceRecommendations.length > 0,
        lastRebalanced: portfolioStore.lastRebalanced,
        totalValue: portfolioStore.totalValue,
      },
    } as ApiResponse);
  } catch (error) {
    console.error('Error fetching allocation data:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to fetch allocation data',
    } as ApiResponse);
  }
});

// GET /api/portfolio/risk - Get risk analysis
router.get('/risk', (req: Request, res: Response) => {
  try {
    const riskAnalysis = {
      current: portfolioStore.riskMetrics,
      assessment: {
        level: portfolioStore.riskMetrics.volatility > 0.3 ? 'High' : 
               portfolioStore.riskMetrics.volatility > 0.2 ? 'Medium' : 'Low',
        score: Math.round((1 - portfolioStore.riskMetrics.volatility) * 100),
        factors: [
          {
            factor: 'Volatility',
            value: portfolioStore.riskMetrics.volatility,
            impact: portfolioStore.riskMetrics.volatility > 0.25 ? 'High' : 'Medium',
          },
          {
            factor: 'Sharpe Ratio',
            value: portfolioStore.riskMetrics.sharpeRatio,
            impact: portfolioStore.riskMetrics.sharpeRatio > 1.5 ? 'Positive' : 'Neutral',
          },
          {
            factor: 'Max Drawdown',
            value: portfolioStore.riskMetrics.maxDrawdown,
            impact: Math.abs(portfolioStore.riskMetrics.maxDrawdown) > 0.15 ? 'High' : 'Medium',
          },
        ],
      },
      recommendations: [
        portfolioStore.riskMetrics.volatility > 0.3 && 'Consider reducing exposure to high-volatility assets',
        portfolioStore.riskMetrics.sharpeRatio < 1.0 && 'Portfolio may not be adequately compensating for risk',
        Math.abs(portfolioStore.riskMetrics.maxDrawdown) > 0.2 && 'Consider implementing stop-loss strategies',
      ].filter(Boolean),
    };

    res.json({
      success: true,
      data: riskAnalysis,
    } as ApiResponse);
  } catch (error) {
    console.error('Error fetching risk analysis:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to fetch risk analysis',
    } as ApiResponse);
  }
});

export { router as portfolioRouter };
