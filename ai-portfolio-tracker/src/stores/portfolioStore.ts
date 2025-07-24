import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { PortfolioUpdatedEvent, PriceUpdate } from "../services/websocket";

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  amount: number;
  price: number;
  change24h: number;
  lastUpdated: Date;
}

export interface Portfolio {
  id: string;
  name: string;
  assets: Asset[];
  totalValue: number;
  totalChange24h: number;
}

export interface PortfolioState {
  portfolios: Portfolio[];
  currentPortfolio: Portfolio | null;
  isLoading: boolean;
  error: string | null;
  lastUpdate: string | null;

  // Actions
  addPortfolio: (portfolio: Omit<Portfolio, "id">) => void;
  updatePortfolio: (id: string, updates: Partial<Portfolio>) => void;
  deletePortfolio: (id: string) => void;
  setCurrentPortfolio: (portfolio: Portfolio | null) => void;
  addAssetToPortfolio: (portfolioId: string, asset: Omit<Asset, "id">) => void;
  updateAsset: (
    portfolioId: string,
    assetId: string,
    updates: Partial<Asset>
  ) => void;
  removeAssetFromPortfolio: (portfolioId: string, assetId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  calculatePortfolioTotals: (portfolioId: string) => void;

  // WebSocket event handlers
  portfolioUpdated: (event: PortfolioUpdatedEvent) => void;
  priceUpdate: (update: PriceUpdate) => void;
}

// Sample data for testing
const samplePortfolio: Portfolio = {
  id: "sample-portfolio-1",
  name: "Main Portfolio",
  assets: [
    {
      id: "asset-1",
      symbol: "SOL",
      name: "Solana",
      amount: 25.5,
      price: 166.67,
      change24h: 5.2,
      lastUpdated: new Date(),
    },
    {
      id: "asset-2",
      symbol: "USDC",
      name: "USD Coin",
      amount: 2100,
      price: 1.0,
      change24h: 0.1,
      lastUpdated: new Date(),
    },
    {
      id: "asset-3",
      symbol: "RAY",
      name: "Raydium",
      amount: 150.2,
      price: 12.58,
      change24h: -2.1,
      lastUpdated: new Date(),
    },
    {
      id: "asset-4",
      symbol: "JUP",
      name: "Jupiter",
      amount: 89.5,
      price: 7.43,
      change24h: 8.7,
      lastUpdated: new Date(),
    },
    {
      id: "asset-5",
      symbol: "PYTH",
      name: "Pyth Network",
      amount: 1250,
      price: 0.35,
      change24h: -1.4,
      lastUpdated: new Date(),
    },
  ],
  totalValue: 0, // Will be calculated
  totalChange24h: 0, // Will be calculated
};

// Calculate totals for sample data
samplePortfolio.totalValue = samplePortfolio.assets.reduce(
  (sum, asset) => sum + asset.amount * asset.price,
  0
);
samplePortfolio.totalChange24h = samplePortfolio.assets.reduce(
  (sum, asset) => sum + (asset.amount * asset.price * asset.change24h) / 100,
  0
);

export const usePortfolioStore = create<PortfolioState>()(
  devtools(
    persist(
      (set, get) => {
        const initialState = {
          portfolios: [samplePortfolio],
          currentPortfolio: samplePortfolio,
          isLoading: false,
          error: null,
          lastUpdate: null,
        };
        
        return {
          ...initialState,

          addPortfolio: portfolio => {
          const newPortfolio: Portfolio = {
            ...portfolio,
            id: crypto.randomUUID(),
          };
          set(state => ({
            portfolios: [...state.portfolios, newPortfolio],
          }));
        },

        updatePortfolio: (id, updates) => {
          set(state => ({
            portfolios: state.portfolios.map(portfolio =>
              portfolio.id === id ? { ...portfolio, ...updates } : portfolio
            ),
          }));
        },

        deletePortfolio: id => {
          set(state => ({
            portfolios: state.portfolios.filter(
              portfolio => portfolio.id !== id
            ),
            currentPortfolio:
              state.currentPortfolio?.id === id ? null : state.currentPortfolio,
          }));
        },

        setCurrentPortfolio: portfolio => {
          set({ currentPortfolio: portfolio });
        },

        addAssetToPortfolio: (portfolioId, asset) => {
          const newAsset: Asset = {
            ...asset,
            id: crypto.randomUUID(),
          };

          set(state => ({
            portfolios: state.portfolios.map(portfolio =>
              portfolio.id === portfolioId
                ? { ...portfolio, assets: [...portfolio.assets, newAsset] }
                : portfolio
            ),
          }));

          get().calculatePortfolioTotals(portfolioId);
        },

        updateAsset: (portfolioId, assetId, updates) => {
          set(state => ({
            portfolios: state.portfolios.map(portfolio =>
              portfolio.id === portfolioId
                ? {
                    ...portfolio,
                    assets: portfolio.assets.map(asset =>
                      asset.id === assetId ? { ...asset, ...updates } : asset
                    ),
                  }
                : portfolio
            ),
          }));

          get().calculatePortfolioTotals(portfolioId);
        },

        removeAssetFromPortfolio: (portfolioId, assetId) => {
          set(state => ({
            portfolios: state.portfolios.map(portfolio =>
              portfolio.id === portfolioId
                ? {
                    ...portfolio,
                    assets: portfolio.assets.filter(
                      asset => asset.id !== assetId
                    ),
                  }
                : portfolio
            ),
          }));

          get().calculatePortfolioTotals(portfolioId);
        },

        setLoading: loading => {
          set({ isLoading: loading });
        },

        setError: error => {
          set({ error });
        },

        calculatePortfolioTotals: portfolioId => {
          set(state => ({
            portfolios: state.portfolios.map(portfolio => {
              if (portfolio.id !== portfolioId) return portfolio;

              const totalValue = portfolio.assets.reduce(
                (sum, asset) => sum + asset.amount * asset.price,
                0
              );

              const totalChange24h = portfolio.assets.reduce(
                (sum, asset) =>
                  sum + (asset.amount * asset.price * asset.change24h) / 100,
                0
              );

              return {
                ...portfolio,
                totalValue,
                totalChange24h,
              };
            }),
          }));
        },

        // WebSocket event handlers
        portfolioUpdated: (event: PortfolioUpdatedEvent) => {
          set(state => {
            const updatedPortfolios = state.portfolios.map(portfolio => {
              if (portfolio.id === event.portfolioId) {
                // Update portfolio totals from WebSocket event
                const updatedPortfolio = {
                  ...portfolio,
                  totalValue: event.totalValue,
                  totalChange24h: event.totalChange24h,
                };

                // Update individual asset prices if provided
                if (event.updatedAssets && event.updatedAssets.length > 0) {
                  updatedPortfolio.assets = portfolio.assets.map(asset => {
                    const updatedAssetData = event.updatedAssets.find(
                      ua => ua.symbol === asset.symbol
                    );

                    if (updatedAssetData) {
                      return {
                        ...asset,
                        price: updatedAssetData.price,
                        change24h:
                          updatedAssetData.changePercent24h ||
                          updatedAssetData.change24h,
                        lastUpdated: new Date(event.timestamp),
                      };
                    }
                    return asset;
                  });
                }

                return updatedPortfolio;
              }
              return portfolio;
            });

            // Update current portfolio if it's the one being updated
            const updatedCurrentPortfolio =
              state.currentPortfolio?.id === event.portfolioId
                ? updatedPortfolios.find(p => p.id === event.portfolioId) ||
                  state.currentPortfolio
                : state.currentPortfolio;

            return {
              portfolios: updatedPortfolios,
              currentPortfolio: updatedCurrentPortfolio,
              lastUpdate: event.timestamp,
            };
          });
        },

        priceUpdate: (update: PriceUpdate) => {
          set(state => {
            const updatedPortfolios = state.portfolios.map(portfolio => {
              const hasAsset = portfolio.assets.some(
                asset => asset.symbol === update.symbol
              );

              if (hasAsset) {
                const updatedAssets = portfolio.assets.map(asset => {
                  if (asset.symbol === update.symbol) {
                    return {
                      ...asset,
                      price: update.price,
                      change24h: update.change24h,
                      lastUpdated: update.timestamp,
                    };
                  }
                  return asset;
                });

                // Recalculate portfolio totals
                const totalValue = updatedAssets.reduce(
                  (sum, asset) => sum + asset.amount * asset.price,
                  0
                );

                const totalChange24h = updatedAssets.reduce(
                  (sum, asset) =>
                    sum + (asset.amount * asset.price * asset.change24h) / 100,
                  0
                );

                return {
                  ...portfolio,
                  assets: updatedAssets,
                  totalValue,
                  totalChange24h,
                };
              }
              return portfolio;
            });

            // Update current portfolio if affected
            const updatedCurrentPortfolio =
              state.currentPortfolio &&
              state.currentPortfolio.assets.some(
                asset => asset.symbol === update.symbol
              )
                ? updatedPortfolios.find(
                    p => p.id === state.currentPortfolio!.id
                  ) || state.currentPortfolio
                : state.currentPortfolio;

            return {
              portfolios: updatedPortfolios,
              currentPortfolio: updatedCurrentPortfolio,
              lastUpdate: update.timestamp.toISOString(),
            };
          });
        },
      };
    },
      {
        name: "portfolio-storage",
        partialize: state => ({
          portfolios: state.portfolios,
          currentPortfolio: state.currentPortfolio,
        }),
      }
    ),
    { name: "portfolio-store" }
  )
);
