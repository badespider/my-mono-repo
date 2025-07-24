import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import {
  transformAxiosError,
  logError,
  withRetry,
  RetryConfig,
} from "../utils/errors";
import type { ApiResponse, PaginatedResponse } from "../types/api";

export interface ApiClientConfig {
  baseURL?: string;
  timeout?: number;
  retryConfig?: Partial<RetryConfig>;
  enableLogging?: boolean;
  authMode?: "token" | "apiKey" | "none";
}

export interface AuthCredentials {
  token?: string;
  apiKey?: string;
  refreshToken?: string;
}

export class ApiClient {
  private client: AxiosInstance;
  private config: Required<ApiClientConfig>;
  private credentials: AuthCredentials = {};

  constructor(config: ApiClientConfig = {}) {
    this.config = {
      baseURL: config.baseURL || process.env.NEXT_PUBLIC_API_URL || "/api",
      timeout: config.timeout || 30000,
      retryConfig: config.retryConfig || {},
      enableLogging:
        config.enableLogging ?? process.env.NODE_ENV === "development",
      authMode: config.authMode || "token",
    };

    this.client = this.createAxiosInstance();
    this.setupInterceptors();
    this.loadCredentials();
  }

  private createAxiosInstance(): AxiosInstance {
    return axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      config => {
        // Add authentication headers
        this.addAuthHeaders(config);

        // Add request ID for tracing
        config.headers["X-Request-ID"] = this.generateRequestId();

        // Log request in development
        if (this.config.enableLogging) {
          console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, {
            params: config.params,
            data: config.data,
          });
        }

        return config;
      },
      error => {
        if (this.config.enableLogging) {
          console.error("[API] Request error:", error);
        }
        return Promise.reject(transformAxiosError(error));
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        if (this.config.enableLogging) {
          console.log(`[API] Response ${response.status}:`, response.data);
        }
        return response;
      },
      async error => {
        let transformedError = transformAxiosError(error);

        // Handle token refresh for 401 errors
        if (error.response?.status === 401 && this.credentials.refreshToken) {
          try {
            await this.refreshAuthToken();
            // Retry the original request
            return this.client.request(error.config);
          } catch (refreshError) {
            this.clearCredentials();
            const refreshAxiosError = refreshError as any;
            transformedError = transformAxiosError(refreshAxiosError);
          }
        }

        // Log error
        logError(transformedError, {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
        });

        return Promise.reject(transformedError);
      }
    );
  }

  private addAuthHeaders(config: AxiosRequestConfig): void {
    if (!config.headers) {
      config.headers = {};
    }

    switch (this.config.authMode) {
      case "token":
        if (this.credentials.token) {
          config.headers.Authorization = `Bearer ${this.credentials.token}`;
        }
        break;
      case "apiKey":
        if (this.credentials.apiKey) {
          config.headers["X-API-Key"] = this.credentials.apiKey;
        }
        break;
      case "none":
      default:
        // No authentication
        break;
    }
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private loadCredentials(): void {
    if (typeof window === "undefined") return;

    try {
      const token = localStorage.getItem("auth_token");
      const apiKey = localStorage.getItem("api_key");
      const refreshToken = localStorage.getItem("refresh_token");

      this.credentials = {
        token: token || undefined,
        apiKey: apiKey || undefined,
        refreshToken: refreshToken || undefined,
      };
    } catch (error) {
      console.warn("Failed to load credentials:", error);
    }
  }

  private saveCredentials(): void {
    if (typeof window === "undefined") return;

    try {
      if (this.credentials.token) {
        localStorage.setItem("auth_token", this.credentials.token);
      }
      if (this.credentials.apiKey) {
        localStorage.setItem("api_key", this.credentials.apiKey);
      }
      if (this.credentials.refreshToken) {
        localStorage.setItem("refresh_token", this.credentials.refreshToken);
      }
    } catch (error) {
      console.warn("Failed to save credentials:", error);
    }
  }

  private clearCredentials(): void {
    this.credentials = {};

    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("api_key");
      localStorage.removeItem("refresh_token");
    }
  }

  private async refreshAuthToken(): Promise<void> {
    if (!this.credentials.refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await this.client.post<ApiResponse<AuthCredentials>>(
      "/auth/refresh",
      {
        refreshToken: this.credentials.refreshToken,
      }
    );

    const { token, refreshToken } = response.data.data;
    this.setCredentials({ token, refreshToken });
  }

  // Public methods for credential management
  public setCredentials(credentials: Partial<AuthCredentials>): void {
    this.credentials = { ...this.credentials, ...credentials };
    this.saveCredentials();
  }

  public getCredentials(): AuthCredentials {
    return { ...this.credentials };
  }

  public clearAuth(): void {
    this.clearCredentials();
  }

  // HTTP methods with retry logic and error handling
  public async get<T>(
    url: string,
    config?: AxiosRequestConfig & { retry?: Partial<RetryConfig> }
  ): Promise<T> {
    const { retry, ...axiosConfig } = config || {};

    return withRetry(
      async () => {
        const response = await this.client.get<ApiResponse<T>>(
          url,
          axiosConfig
        );
        return response.data.data;
      },
      { ...this.config.retryConfig, ...retry }
    );
  }

  public async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig & { retry?: Partial<RetryConfig> }
  ): Promise<T> {
    const { retry, ...axiosConfig } = config || {};

    return withRetry(
      async () => {
        const response = await this.client.post<ApiResponse<T>>(
          url,
          data,
          axiosConfig
        );
        return response.data.data;
      },
      { ...this.config.retryConfig, ...retry }
    );
  }

  public async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig & { retry?: Partial<RetryConfig> }
  ): Promise<T> {
    const { retry, ...axiosConfig } = config || {};

    return withRetry(
      async () => {
        const response = await this.client.put<ApiResponse<T>>(
          url,
          data,
          axiosConfig
        );
        return response.data.data;
      },
      { ...this.config.retryConfig, ...retry }
    );
  }

  public async patch<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig & { retry?: Partial<RetryConfig> }
  ): Promise<T> {
    const { retry, ...axiosConfig } = config || {};

    return withRetry(
      async () => {
        const response = await this.client.patch<ApiResponse<T>>(
          url,
          data,
          axiosConfig
        );
        return response.data.data;
      },
      { ...this.config.retryConfig, ...retry }
    );
  }

  public async delete<T = void>(
    url: string,
    config?: AxiosRequestConfig & { retry?: Partial<RetryConfig> }
  ): Promise<T> {
    const { retry, ...axiosConfig } = config || {};

    return withRetry(
      async () => {
        const response = await this.client.delete<ApiResponse<T>>(
          url,
          axiosConfig
        );
        return response.data.data;
      },
      { ...this.config.retryConfig, ...retry }
    );
  }

  // Paginated requests
  public async getPaginated<T>(
    url: string,
    config?: AxiosRequestConfig & { retry?: Partial<RetryConfig> }
  ): Promise<PaginatedResponse<T>> {
    const { retry, ...axiosConfig } = config || {};

    return withRetry(
      async () => {
        const response = await this.client.get<PaginatedResponse<T>>(
          url,
          axiosConfig
        );
        return response.data;
      },
      { ...this.config.retryConfig, ...retry }
    );
  }

  // Raw axios methods for cases where you need full control
  public async raw<T>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.request<T>(config);
  }

  // Upload method for file uploads
  public async upload<T>(
    url: string,
    file: File | FormData,
    config?: AxiosRequestConfig & {
      onUploadProgress?: (progressEvent: any) => void;
      retry?: Partial<RetryConfig>;
    }
  ): Promise<T> {
    const { retry, onUploadProgress, ...axiosConfig } = config || {};

    const formData = file instanceof FormData ? file : new FormData();
    if (file instanceof File) {
      formData.append("file", file);
    }

    return withRetry(
      async () => {
        const response = await this.client.post<ApiResponse<T>>(url, formData, {
          ...axiosConfig,
          headers: {
            ...axiosConfig.headers,
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress,
        });
        return response.data.data;
      },
      { ...this.config.retryConfig, ...retry }
    );
  }

  // Health check method
  public async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.get("/health");
  }

  // Get current configuration
  public getConfig(): Required<ApiClientConfig> {
    return { ...this.config };
  }

  // Update configuration
  public updateConfig(config: Partial<ApiClientConfig>): void {
    this.config = { ...this.config, ...config };

    // Recreate client if baseURL or timeout changed
    if (config.baseURL || config.timeout) {
      this.client = this.createAxiosInstance();
      this.setupInterceptors();
    }
  }
}

// Create default instance
export const apiClient = new ApiClient();

// Export factory function for custom instances
export const createApiClient = (config: ApiClientConfig) =>
  new ApiClient(config);
