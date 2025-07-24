import { create } from 'zustand';
import { Portfolio } from '../types/agents';

interface PortfolioStore {
  portfolio: Portfolio | null;
  isConnected: boolean;
  walletAddress: string | null;
  
  // Actions
  setPortfolio: (portfolio: Portfolio) => void;
  setWalletConnection: (connected: boolean, address?: string) => void;
  updateHoldingPrice: (symbol: string, price: number, change24h: number) => void;
}

export const usePortfolioStore = create<PortfolioStore>((set, get) => ({
  portfolio: null,
  isConnected: false,
  walletAddress: null,

  setPortfolio: (portfolio) => set({ portfolio }),
  
  setWalletConnection: (connected, address) =>
    set({ isConnected: connected, walletAddress: address || null }),

  updateHoldingPrice: (symbol, price, change24h) =>
    set((state) => {
      if (!state.portfolio) return state;
      
      const updatedHoldings = state.portfolio.holdings.map((holding) =>
        holding.symbol === symbol
          ? { ...holding, currentPrice: price, change24h }
          : holding
      );
      
      const totalValue = updatedHoldings.reduce(
        (sum, holding) => sum + holding.quantity * holding.currentPrice,
        0
      );
      
      return {
        portfolio: {
          ...state.portfolio,
          holdings: updatedHoldings,
          totalValue,
        },
      };
    }),
}));