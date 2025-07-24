import useSWR, { SWRConfiguration } from "swr";
import { portfolioApi, priceApi } from "@/services/api";

// Portfolio hooks
export function usePortfolios(config?: SWRConfiguration) {
  return useSWR("/api/portfolios", portfolioApi.getPortfolios, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    refreshInterval: 30000, // 30 seconds
    ...config,
  });
}

export function usePortfolio(id: string | null, config?: SWRConfiguration) {
  return useSWR(
    id ? `/api/portfolios/${id}` : null,
    () => (id ? portfolioApi.getPortfolio(id) : null),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      ...config,
    }
  );
}

// Price hooks
export function useAssetPrice(
  symbol: string | null,
  config?: SWRConfiguration
) {
  return useSWR(
    symbol ? `/api/prices/${symbol}` : null,
    () => (symbol ? priceApi.getAssetPrice(symbol) : null),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 10000, // 10 seconds for price updates
      ...config,
    }
  );
}

export function useMultiplePrices(
  symbols: string[],
  config?: SWRConfiguration
) {
  return useSWR(
    symbols.length > 0 ? `/api/prices/bulk?symbols=${symbols.join(",")}` : null,
    () => (symbols.length > 0 ? priceApi.getMultiplePrices(symbols) : null),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 10000, // 10 seconds for price updates
      ...config,
    }
  );
}

export function useHistoricalPrices(
  symbol: string | null,
  days: number = 7,
  config?: SWRConfiguration
) {
  return useSWR(
    symbol ? `/api/prices/${symbol}/history?days=${days}` : null,
    () => (symbol ? priceApi.getHistoricalPrices(symbol, days) : null),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 60000, // 1 minute for historical data
      ...config,
    }
  );
}

// Mutation hooks for optimistic updates
export function usePortfolioMutations() {
  const { mutate } = useSWR("/api/portfolios");

  const createPortfolio = async (data: any) => {
    // Optimistic update
    mutate(async (portfolios: any[]) => {
      const newPortfolio = await portfolioApi.createPortfolio(data);
      return [...(portfolios || []), newPortfolio];
    });
  };

  const updatePortfolio = async (id: string, data: any) => {
    // Optimistic update
    mutate(async (portfolios: any[]) => {
      const updatedPortfolio = await portfolioApi.updatePortfolio(id, data);
      return (portfolios || []).map(p => (p.id === id ? updatedPortfolio : p));
    });
  };

  const deletePortfolio = async (id: string) => {
    // Optimistic update
    mutate(async (portfolios: any[]) => {
      await portfolioApi.deletePortfolio(id);
      return (portfolios || []).filter(p => p.id !== id);
    });
  };

  return {
    createPortfolio,
    updatePortfolio,
    deletePortfolio,
  };
}
