import { AxiosError } from "axios";
import { ApiError } from "../types/api";

// Custom Error Classes
export class ApiClientError extends Error {
  public code: string;
  public status?: number;
  public details?: any;

  constructor(message: string, code: string, status?: number, details?: any) {
    super(message);
    this.name = "ApiClientError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export class ValidationError extends ApiClientError {
  constructor(message: string, details?: any) {
    super(message, "VALIDATION_ERROR", 400, details);
    this.name = "ValidationError";
  }
}

export class AuthenticationError extends ApiClientError {
  constructor(message: string = "Authentication required") {
    super(message, "AUTHENTICATION_ERROR", 401);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends ApiClientError {
  constructor(message: string = "Insufficient permissions") {
    super(message, "AUTHORIZATION_ERROR", 403);
    this.name = "AuthorizationError";
  }
}

export class NotFoundError extends ApiClientError {
  constructor(resource: string) {
    super(`${resource} not found`, "NOT_FOUND_ERROR", 404);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends ApiClientError {
  constructor(message: string, details?: any) {
    super(message, "CONFLICT_ERROR", 409, details);
    this.name = "ConflictError";
  }
}

export class RateLimitError extends ApiClientError {
  public retryAfter?: number;

  constructor(message: string = "Too many requests", retryAfter?: number) {
    super(message, "RATE_LIMIT_ERROR", 429);
    this.name = "RateLimitError";
    this.retryAfter = retryAfter;
  }
}

export class ServerError extends ApiClientError {
  constructor(message: string = "Server error occurred") {
    super(message, "SERVER_ERROR", 500);
    this.name = "ServerError";
  }
}

export class NetworkError extends ApiClientError {
  constructor(message: string = "Network error occurred") {
    super(message, "NETWORK_ERROR");
    this.name = "NetworkError";
  }
}

// Error transformation utilities
export function transformAxiosError(error: AxiosError): ApiClientError {
  if (!error.response) {
    // Network error
    return new NetworkError(error.message);
  }

  const { status, data } = error.response;
  const apiError = data as ApiError;
  const message = apiError?.error?.message || error.message;
  const code = apiError?.error?.code || `HTTP_${status}`;
  const details = apiError?.error?.details;

  switch (status) {
    case 400:
      return new ValidationError(message, details);
    case 401:
      return new AuthenticationError(message);
    case 403:
      return new AuthorizationError(message);
    case 404:
      return new NotFoundError(message);
    case 409:
      return new ConflictError(message, details);
    case 429:
      const retryAfter = error.response.headers["retry-after"];
      return new RateLimitError(
        message,
        retryAfter ? parseInt(retryAfter) : undefined
      );
    case 500:
    case 502:
    case 503:
    case 504:
      return new ServerError(message);
    default:
      return new ApiClientError(message, code, status, details);
  }
}

// Error logging utility
export function logError(error: Error, context?: Record<string, any>) {
  const errorData: any = {
    name: error.name,
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    context,
  };

  if (error instanceof ApiClientError) {
    errorData.code = error.code;
    errorData.status = error.status;
    errorData.details = error.details;
  }

  // In development, log to console
  if (process.env.NODE_ENV === "development") {
    console.error("API Error:", errorData);
  }

  // In production, you might want to send to error tracking service
  // Example: Sentry, LogRocket, etc.
  if (process.env.NODE_ENV === "production") {
    // TODO: Integrate with error tracking service
    // Sentry.captureException(error, { contexts: { api: errorData } });
  }
}

// Retry logic utilities
export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
  retryableErrors: string[];
}

export const defaultRetryConfig: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
  retryableErrors: [
    "NETWORK_ERROR",
    "SERVER_ERROR",
    "RATE_LIMIT_ERROR",
    "HTTP_500",
    "HTTP_502",
    "HTTP_503",
    "HTTP_504",
  ],
};

export async function withRetry<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const retryConfig = { ...defaultRetryConfig, ...config };
  let lastError: Error;
  let delay = retryConfig.baseDelay;

  for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      if (attempt === retryConfig.maxRetries) {
        break;
      }

      // Check if error is retryable
      const isRetryable =
        error instanceof ApiClientError
          ? retryConfig.retryableErrors.includes(error.code)
          : error instanceof NetworkError;

      if (!isRetryable) {
        throw error;
      }

      // Handle rate limiting with retry-after header
      if (error instanceof RateLimitError && error.retryAfter) {
        delay = error.retryAfter * 1000;
      }

      // Wait before retry
      await new Promise(resolve =>
        setTimeout(resolve, Math.min(delay, retryConfig.maxDelay))
      );
      delay *= retryConfig.backoffFactor;
    }
  }

  throw lastError!;
}

// Error boundary helpers for React components
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "An unexpected error occurred";
}

export function getErrorCode(error: unknown): string | undefined {
  if (error instanceof ApiClientError) {
    return error.code;
  }

  return undefined;
}

export function isRetryableError(error: unknown): boolean {
  if (error instanceof ApiClientError) {
    return defaultRetryConfig.retryableErrors.includes(error.code);
  }

  return error instanceof NetworkError;
}
