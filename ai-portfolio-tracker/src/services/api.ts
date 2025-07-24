import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

class ApiService {
  private client: AxiosInstance;

  constructor(baseURL: string = process.env.NEXT_PUBLIC_API_URL || "/api") {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      config => {
        // Add auth token if available
        if (typeof window !== "undefined") {
          const token = localStorage.getItem("auth_token");
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      error => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      error => {
        if (error.response?.status === 401) {
          // Handle unauthorized access
          if (typeof window !== "undefined") {
            localStorage.removeItem("auth_token");
            window.location.href = "/login";
          }
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async patch<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}

export const apiService = new ApiService();

// Portfolio API
export const portfolioApi = {
  getPortfolios: () => apiService.get<any[]>("/portfolios"),
  getPortfolio: (id: string) => apiService.get<any>(`/portfolios/${id}`),
  createPortfolio: (data: any) => apiService.post<any>("/portfolios", data),
  updatePortfolio: (id: string, data: any) =>
    apiService.put<any>(`/portfolios/${id}`, data),
  deletePortfolio: (id: string) => apiService.delete<void>(`/portfolios/${id}`),
};

// Asset price API
export const priceApi = {
  getAssetPrice: (symbol: string) => apiService.get<any>(`/prices/${symbol}`),
  getMultiplePrices: (symbols: string[]) =>
    apiService.post<any>("/prices/bulk", { symbols }),
  getHistoricalPrices: (symbol: string, days: number = 7) =>
    apiService.get<any>(`/prices/${symbol}/history?days=${days}`),
};
