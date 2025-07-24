import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Position {
  id: string;
  tokenAddress: string;
  symbol: string;
  name: string;
  amount: number;
  averageCost: number;
  currentPrice: number;
  value: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
  weight: number; // percentage of total portfolio
  lastUpdated: number;
}

export interface PnLHistory {
  timestamp: number;
  totalValue: number;
  realizedPnl: number;
  unrealizedPnl: number;
  dailyChange: number;
  dailyChangePercent: number;
}

export interface RebalanceEvent {
  id: string;
  timestamp: number;
  type: "automatic" | "manual";
  triggeredBy?: string; // agent id or 'user'
  reason: string;
  changes: {
    tokenAddress: string;
    symbol: string;
    fromAmount: number;
    toAmount: number;
    amountDelta: number;
    fromWeight: number;
    toWeight: number;
  }[];
  gasUsed: number;
  gasCost: number;
  status: "pending" | "completed" | "failed";
  transactionHash?: string;
  error?: string;
}

interface PortfolioState {
  positions: Record<string, Position>;
  positionIds: string[];
  totalValue: number;
  totalInvested: number;
  totalRealizedPnl: number;
  totalUnrealizedPnl: number;
  totalUnrealizedPnlPercent: number;
  dailyChange: number;
  dailyChangePercent: number;
  pnlHistory: PnLHistory[];
  rebalanceHistory: RebalanceEvent[];
  lastRebalancedAt?: number;
  lastUpdated: number;
  loading: boolean;
  error: string | null;
}

const initialState: PortfolioState = {
  positions: {},
  positionIds: [],
  totalValue: 0,
  totalInvested: 0,
  totalRealizedPnl: 0,
  totalUnrealizedPnl: 0,
  totalUnrealizedPnlPercent: 0,
  dailyChange: 0,
  dailyChangePercent: 0,
  pnlHistory: [],
  rebalanceHistory: [],
  lastUpdated: 0,
  loading: false,
  error: null,
};

export const portfolioSlice = createSlice({
  name: "portfolio",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    updatePosition: (state, action: PayloadAction<Position>) => {
      const position = action.payload;
      const wasNew = !state.positions[position.id];

      state.positions[position.id] = position;

      if (wasNew && !state.positionIds.includes(position.id)) {
        state.positionIds.push(position.id);
      }

      // Recalculate totals
      portfolioSlice.caseReducers.recalculateTotals(state);
    },
    updatePositions: (state, action: PayloadAction<Position[]>) => {
      action.payload.forEach(position => {
        const wasNew = !state.positions[position.id];
        state.positions[position.id] = position;

        if (wasNew && !state.positionIds.includes(position.id)) {
          state.positionIds.push(position.id);
        }
      });

      portfolioSlice.caseReducers.recalculateTotals(state);
    },
    removePosition: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      delete state.positions[id];
      state.positionIds = state.positionIds.filter(posId => posId !== id);

      portfolioSlice.caseReducers.recalculateTotals(state);
    },
    updatePortfolioTotals: (
      state,
      action: PayloadAction<{
        totalValue: number;
        totalInvested: number;
        totalRealizedPnl: number;
        dailyChange: number;
        dailyChangePercent: number;
      }>
    ) => {
      const {
        totalValue,
        totalInvested,
        totalRealizedPnl,
        dailyChange,
        dailyChangePercent,
      } = action.payload;

      state.totalValue = totalValue;
      state.totalInvested = totalInvested;
      state.totalRealizedPnl = totalRealizedPnl;
      state.dailyChange = dailyChange;
      state.dailyChangePercent = dailyChangePercent;
      state.lastUpdated = Date.now();

      // Calculate unrealized PnL
      state.totalUnrealizedPnl = totalValue - totalInvested;
      state.totalUnrealizedPnlPercent =
        totalInvested > 0
          ? (state.totalUnrealizedPnl / totalInvested) * 100
          : 0;
    },
    addPnLHistory: (state, action: PayloadAction<PnLHistory>) => {
      state.pnlHistory.push(action.payload);

      // Keep only last 365 entries (1 year of daily data)
      if (state.pnlHistory.length > 365) {
        state.pnlHistory = state.pnlHistory.slice(-365);
      }
    },
    addRebalanceEvent: (state, action: PayloadAction<RebalanceEvent>) => {
      state.rebalanceHistory.unshift(action.payload); // Add to beginning for recent-first order

      if (action.payload.status === "completed") {
        state.lastRebalancedAt = action.payload.timestamp;
      }

      // Keep only last 100 rebalance events
      if (state.rebalanceHistory.length > 100) {
        state.rebalanceHistory = state.rebalanceHistory.slice(0, 100);
      }
    },
    updateRebalanceEvent: (
      state,
      action: PayloadAction<Partial<RebalanceEvent> & { id: string }>
    ) => {
      const { id, ...updates } = action.payload;
      const index = state.rebalanceHistory.findIndex(event => event.id === id);

      if (index >= 0) {
        state.rebalanceHistory[index] = {
          ...state.rebalanceHistory[index],
          ...updates,
        };

        if (updates.status === "completed") {
          state.lastRebalancedAt = state.rebalanceHistory[index].timestamp;
        }
      }
    },
    recalculateTotals: state => {
      let totalValue = 0;
      let totalUnrealizedPnl = 0;

      state.positionIds.forEach(id => {
        const position = state.positions[id];
        if (position) {
          totalValue += position.value;
          totalUnrealizedPnl += position.unrealizedPnl;

          // Update position weight
          if (totalValue > 0) {
            position.weight = (position.value / totalValue) * 100;
          }
        }
      });

      state.totalValue = totalValue;
      state.totalUnrealizedPnl = totalUnrealizedPnl;
      state.totalUnrealizedPnlPercent =
        state.totalInvested > 0
          ? (totalUnrealizedPnl / state.totalInvested) * 100
          : 0;
      state.lastUpdated = Date.now();

      // Recalculate weights after total is known
      state.positionIds.forEach(id => {
        const position = state.positions[id];
        if (position && totalValue > 0) {
          position.weight = (position.value / totalValue) * 100;
        }
      });
    },
    clearPortfolio: state => {
      state.positions = {};
      state.positionIds = [];
      state.totalValue = 0;
      state.totalInvested = 0;
      state.totalRealizedPnl = 0;
      state.totalUnrealizedPnl = 0;
      state.totalUnrealizedPnlPercent = 0;
      state.dailyChange = 0;
      state.dailyChangePercent = 0;
      state.lastUpdated = 0;
    },
    clearHistory: (
      state,
      action: PayloadAction<"pnl" | "rebalance" | "all">
    ) => {
      const type = action.payload;

      if (type === "pnl" || type === "all") {
        state.pnlHistory = [];
      }

      if (type === "rebalance" || type === "all") {
        state.rebalanceHistory = [];
        if (type === "all") {
          delete state.lastRebalancedAt;
        }
      }
    },
  },
});

export const {
  setLoading,
  setError,
  updatePosition,
  updatePositions,
  removePosition,
  updatePortfolioTotals,
  addPnLHistory,
  addRebalanceEvent,
  updateRebalanceEvent,
  recalculateTotals,
  clearPortfolio,
  clearHistory,
} = portfolioSlice.actions;
