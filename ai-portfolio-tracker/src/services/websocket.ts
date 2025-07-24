import { useCallback, useEffect, useRef, useState } from "react";
import type { Agent, Task } from "./types/api";

// WebSocket Event Types
export interface AgentStatusUpdate {
  agentId: string;
  status: Agent["status"];
  timestamp: string;
  message?: string;
  metrics?: Partial<Agent["metrics"]>;
}

export interface TaskStartedEvent {
  taskId: string;
  agentId: string;
  type: Task["type"];
  title: string;
  priority: Task["priority"];
  timestamp: string;
}

export interface TaskFinishedEvent {
  taskId: string;
  agentId: string;
  type: Task["type"];
  status: "completed" | "failed" | "cancelled";
  executionTime: number;
  timestamp: string;
  error?: string;
  result?: any;
}

export interface PortfolioUpdatedEvent {
  portfolioId: string;
  totalValue: number;
  totalChange24h: number;
  totalChangePercent24h: number;
  updatedAssets: Array<{
    symbol: string;
    price: number;
    change24h: number;
    changePercent24h: number;
  }>;
  timestamp: string;
}

export interface AlertRaisedEvent {
  id: string;
  type: "price" | "portfolio" | "system" | "agent";
  severity: "info" | "warning" | "error" | "critical";
  title: string;
  message: string;
  data?: any;
  timestamp: string;
  portfolioId?: string;
  agentId?: string;
  resolved?: boolean;
}

// Legacy types for backward compatibility
export interface PriceUpdate {
  symbol: string;
  price: number;
  change24h: number;
  timestamp: Date;
}

export interface PortfolioUpdate {
  portfolioId: string;
  totalValue: number;
  totalChange24h: number;
  updatedAssets: {
    symbol: string;
    price: number;
    change24h: number;
  }[];
}

// WebSocket Connection Configuration
interface WebSocketEndpoint {
  name: string;
  url: string;
  socket: WebSocket | null;
  reconnectAttempts: number;
  reconnectTimer: NodeJS.Timeout | null;
  isConnected: boolean;
}

// WebSocket Service Configuration
export interface WebSocketConfig {
  maxReconnectAttempts: number;
  baseReconnectDelay: number;
  maxReconnectDelay: number;
  heartbeatInterval: number;
  connectionTimeout: number;
  enableLogging: boolean;
}

const DEFAULT_CONFIG: WebSocketConfig = {
  maxReconnectAttempts: 10,
  baseReconnectDelay: 1000, // 1 second
  maxReconnectDelay: 30000, // 30 seconds
  heartbeatInterval: 30000, // 30 seconds
  connectionTimeout: 10000, // 10 seconds
  enableLogging: true,
};

class WebSocketService {
  private config: WebSocketConfig;
  private endpoints: Map<string, WebSocketEndpoint> = new Map();
  private eventListeners: Map<string, ((data: any) => void)[]> = new Map();
  private heartbeatTimers: Map<string, NodeJS.Timeout> = new Map();
  private actionDispatchers: Map<string, (data: any) => void> = new Map();
  private isInitialized = false;

  constructor(config: Partial<WebSocketConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Initialize the WebSocket service with endpoints
   */
  initialize() {
    if (this.isInitialized) {
      this.log("WebSocket service already initialized");
      return;
    }

    const baseUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001";

    // Register main endpoints
    this.registerEndpoint("agents", `${baseUrl}/agents`);
    this.registerEndpoint("tasks", `${baseUrl}/tasks`);
    this.registerEndpoint("portfolio", `${baseUrl}/portfolio`); // Legacy endpoint

    // Set up action dispatchers for Zustand store updates
    this.setupActionDispatchers();

    this.isInitialized = true;
    this.log(
      "WebSocket service initialized with endpoints:",
      Array.from(this.endpoints.keys())
    );
  }

  /**
   * Register a new WebSocket endpoint
   */
  private registerEndpoint(name: string, url: string) {
    this.endpoints.set(name, {
      name,
      url,
      socket: null,
      reconnectAttempts: 0,
      reconnectTimer: null,
      isConnected: false,
    });
  }

  /**
   * Set up action dispatchers for different event types
   */
  private setupActionDispatchers() {
    // Agent status updates
    this.actionDispatchers.set(
      "agentStatusUpdated",
      (data: AgentStatusUpdate) => {
        // Dispatch to agent store (will be created)
        this.dispatchStoreAction("agent", "updateAgentStatus", data);
      }
    );

    // Task events
    this.actionDispatchers.set("taskStarted", (data: TaskStartedEvent) => {
      this.dispatchStoreAction("task", "taskStarted", data);
    });

    this.actionDispatchers.set("taskFinished", (data: TaskFinishedEvent) => {
      this.dispatchStoreAction("task", "taskFinished", data);
    });

    // Portfolio updates
    this.actionDispatchers.set(
      "portfolioUpdated",
      (data: PortfolioUpdatedEvent) => {
        this.dispatchStoreAction("portfolio", "portfolioUpdated", data);
      }
    );

    // Alerts
    this.actionDispatchers.set("alertRaised", (data: AlertRaisedEvent) => {
      this.dispatchStoreAction("alert", "alertRaised", data);
    });

    // Legacy events for backward compatibility
    this.actionDispatchers.set("price_update", (data: PriceUpdate) => {
      this.dispatchStoreAction("portfolio", "priceUpdate", data);
    });

    this.actionDispatchers.set("portfolio_update", (data: PortfolioUpdate) => {
      this.dispatchStoreAction("portfolio", "portfolioUpdate", data);
    });
  }

  /**
   * Dispatch action to appropriate Zustand store
   */
  private dispatchStoreAction(storeType: string, action: string, data: any) {
    // Import stores dynamically to avoid circular dependencies
    import("../stores/agentStore")
      .then(({ useAgentStore }) => {
        if (storeType === "agent" && action === "updateAgentStatus") {
          useAgentStore.getState().updateAgentStatus(data);
        }
      })
      .catch(this.log);

    import("../stores/taskStore")
      .then(({ useTaskStore }) => {
        if (storeType === "task") {
          const taskStore = useTaskStore.getState();
          if (action === "taskStarted") {
            taskStore.taskStarted(data);
          } else if (action === "taskFinished") {
            taskStore.taskFinished(data);
          }
        }
      })
      .catch(this.log);

    import("../stores/portfolioStore")
      .then(({ usePortfolioStore }) => {
        if (storeType === "portfolio") {
          const portfolioStore = usePortfolioStore.getState();
          if (action === "portfolioUpdated") {
            portfolioStore.portfolioUpdated(data);
          } else if (action === "priceUpdate") {
            portfolioStore.priceUpdate(data);
          } else if (action === "portfolioUpdate") {
            // Legacy support - convert to new format
            portfolioStore.portfolioUpdated({
              portfolioId: data.portfolioId,
              totalValue: data.totalValue,
              totalChange24h: data.totalChange24h,
              totalChangePercent24h: 0, // Not provided in legacy format
              updatedAssets: data.updatedAssets.map((asset: any) => ({
                symbol: asset.symbol,
                price: asset.price,
                change24h: asset.change24h,
                changePercent24h: asset.change24h,
              })),
              timestamp: new Date().toISOString(),
            });
          }
        }
      })
      .catch(this.log);

    import("../stores/alertStore")
      .then(({ useAlertStore }) => {
        if (storeType === "alert" && action === "alertRaised") {
          useAlertStore.getState().alertRaised(data);
        }
      })
      .catch(this.log);

    // Also emit as custom events for additional listeners
    this.emit(`${storeType}:${action}`, data);
    this.log(`Store action dispatched: ${storeType}:${action}`, data);
  }

  /**
   * Connect to all registered endpoints
   */
  async connectAll(): Promise<void> {
    if (!this.isInitialized) {
      this.initialize();
    }

    const connections = Array.from(this.endpoints.keys()).map(name =>
      this.connect(name)
    );

    await Promise.allSettled(connections);
  }

  /**
   * Connect to a specific endpoint
   */
  async connect(endpointName: string): Promise<WebSocket | null> {
    const endpoint = this.endpoints.get(endpointName);
    if (!endpoint) {
      this.log(`Endpoint '${endpointName}' not found`);
      return null;
    }

    // Close existing connection if any
    if (endpoint.socket) {
      endpoint.socket.close();
    }

    try {
      this.log(`Connecting to ${endpointName}: ${endpoint.url}`);
      endpoint.socket = new WebSocket(endpoint.url);

      await this.setupEndpointListeners(endpointName, endpoint);
      return endpoint.socket;
    } catch (error) {
      this.log(
        `Failed to create WebSocket connection to ${endpointName}:`,
        error
      );
      this.scheduleReconnect(endpointName);
      return null;
    }
  }

  /**
   * Setup event listeners for a specific endpoint
   */
  private async setupEndpointListeners(
    endpointName: string,
    endpoint: WebSocketEndpoint
  ): Promise<void> {
    if (!endpoint.socket) return;

    return new Promise((resolve, reject) => {
      const socket = endpoint.socket!;
      const connectionTimeout = setTimeout(() => {
        reject(new Error(`Connection timeout for ${endpointName}`));
      }, this.config.connectionTimeout);

      socket.onopen = () => {
        clearTimeout(connectionTimeout);
        this.log(`WebSocket connected to ${endpointName}`);
        endpoint.isConnected = true;
        endpoint.reconnectAttempts = 0;
        this.clearReconnectTimer(endpointName);
        this.startHeartbeat(endpointName);
        resolve();
      };

      socket.onclose = event => {
        clearTimeout(connectionTimeout);
        this.log(
          `WebSocket disconnected from ${endpointName}:`,
          event.code,
          event.reason
        );
        endpoint.isConnected = false;
        this.stopHeartbeat(endpointName);

        // Don't reconnect if it was a clean close
        if (event.code !== 1000) {
          this.scheduleReconnect(endpointName);
        }
      };

      socket.onerror = error => {
        clearTimeout(connectionTimeout);
        this.log(`WebSocket error on ${endpointName}:`, error);
        endpoint.isConnected = false;
      };

      socket.onmessage = event => {
        try {
          const message = JSON.parse(event.data);
          this.handleMessage(endpointName, message);
        } catch (error) {
          this.log(
            `Failed to parse WebSocket message from ${endpointName}:`,
            error
          );
        }
      };
    });
  }

  /**
   * Handle incoming WebSocket message
   */
  private handleMessage(endpointName: string, message: any) {
    const { type, data } = message;

    // Handle heartbeat/pong messages
    if (type === "pong") {
      this.log(`Received pong from ${endpointName}`);
      return;
    }

    this.log(`Received message from ${endpointName}:`, type, data);

    // Dispatch to registered action handlers
    const actionHandler = this.actionDispatchers.get(type);
    if (actionHandler) {
      actionHandler(data);
    }

    // Emit to event listeners
    this.emit(type, data);
    this.emit(`${endpointName}:${type}`, data);
  }

  /**
   * Schedule reconnection with exponential backoff
   */
  private scheduleReconnect(endpointName: string) {
    const endpoint = this.endpoints.get(endpointName);
    if (
      !endpoint ||
      endpoint.reconnectAttempts >= this.config.maxReconnectAttempts
    ) {
      if (
        endpoint &&
        endpoint.reconnectAttempts >= this.config.maxReconnectAttempts
      ) {
        this.log(`Max reconnection attempts reached for ${endpointName}`);
      }
      return;
    }

    endpoint.reconnectAttempts++;

    // Exponential backoff with jitter
    const delay = Math.min(
      this.config.baseReconnectDelay *
        Math.pow(2, endpoint.reconnectAttempts - 1),
      this.config.maxReconnectDelay
    );
    const jitter = Math.random() * 0.1 * delay; // Add 10% jitter
    const finalDelay = delay + jitter;

    this.log(
      `Scheduling reconnect for ${endpointName} in ${Math.round(finalDelay)}ms (attempt ${endpoint.reconnectAttempts})`
    );

    endpoint.reconnectTimer = setTimeout(() => {
      this.connect(endpointName);
    }, finalDelay);
  }

  /**
   * Clear reconnection timer for an endpoint
   */
  private clearReconnectTimer(endpointName: string) {
    const endpoint = this.endpoints.get(endpointName);
    if (endpoint?.reconnectTimer) {
      clearTimeout(endpoint.reconnectTimer);
      endpoint.reconnectTimer = null;
    }
  }

  /**
   * Start heartbeat for an endpoint
   */
  private startHeartbeat(endpointName: string) {
    this.stopHeartbeat(endpointName); // Clear any existing heartbeat

    const timer = setInterval(() => {
      if (this.isEndpointConnected(endpointName)) {
        this.sendToEndpoint(endpointName, "ping", {
          timestamp: new Date().toISOString(),
        });
      }
    }, this.config.heartbeatInterval);

    this.heartbeatTimers.set(endpointName, timer);
  }

  /**
   * Stop heartbeat for an endpoint
   */
  private stopHeartbeat(endpointName: string) {
    const timer = this.heartbeatTimers.get(endpointName);
    if (timer) {
      clearInterval(timer);
      this.heartbeatTimers.delete(endpointName);
    }
  }

  /**
   * Send message to specific endpoint
   */
  sendToEndpoint(endpointName: string, type: string, data: any = {}) {
    const endpoint = this.endpoints.get(endpointName);
    if (!endpoint?.socket || !endpoint.isConnected) {
      this.log(`Cannot send to ${endpointName}: not connected`);
      return false;
    }

    try {
      const message = JSON.stringify({ type, data });
      endpoint.socket.send(message);
      return true;
    } catch (error) {
      this.log(`Failed to send message to ${endpointName}:`, error);
      return false;
    }
  }

  /**
   * Send message to all connected endpoints
   */
  broadcast(type: string, data: any = {}) {
    let sent = 0;
    for (const [name] of this.endpoints) {
      if (this.sendToEndpoint(name, type, data)) {
        sent++;
      }
    }
    return sent;
  }

  // Legacy methods for backward compatibility
  send(type: string, data: any) {
    return this.broadcast(type, data) > 0;
  }

  subscribeToPrices(symbols: string[]) {
    this.sendToEndpoint("portfolio", "subscribe_prices", { symbols });
  }

  unsubscribeFromPrices(symbols: string[]) {
    this.sendToEndpoint("portfolio", "unsubscribe_prices", { symbols });
  }

  subscribeToPortfolio(portfolioId: string) {
    this.sendToEndpoint("portfolio", "subscribe_portfolio", { portfolioId });
  }

  unsubscribeFromPortfolio(portfolioId: string) {
    this.sendToEndpoint("portfolio", "unsubscribe_portfolio", { portfolioId });
  }

  onPriceUpdate(callback: (update: PriceUpdate) => void) {
    return this.on("price_update", callback);
  }

  onPortfolioUpdate(callback: (update: PortfolioUpdate) => void) {
    return this.on("portfolio_update", callback);
  }

  // Event system
  on(event: string, callback: (data: any) => void) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }

    this.eventListeners.get(event)?.push(callback);

    // Return cleanup function
    return () => {
      const listeners = this.eventListeners.get(event);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  private emit(event: string, data: any) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          this.log(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Check if specific endpoint is connected
   */
  isEndpointConnected(endpointName: string): boolean {
    const endpoint = this.endpoints.get(endpointName);
    return endpoint?.isConnected ?? false;
  }

  /**
   * Check if any endpoint is connected
   */
  get isConnected(): boolean {
    return Array.from(this.endpoints.values()).some(
      endpoint => endpoint.isConnected
    );
  }

  /**
   * Get connection status for all endpoints
   */
  getConnectionStatus() {
    const status: Record<string, boolean> = {};
    for (const [name, endpoint] of this.endpoints) {
      status[name] = endpoint.isConnected;
    }
    return status;
  }

  /**
   * Disconnect from specific endpoint
   */
  disconnectEndpoint(endpointName: string) {
    const endpoint = this.endpoints.get(endpointName);
    if (endpoint) {
      this.clearReconnectTimer(endpointName);
      this.stopHeartbeat(endpointName);

      if (endpoint.socket) {
        endpoint.socket.close(1000, "Requested disconnect");
        endpoint.socket = null;
      }
      endpoint.isConnected = false;
    }
  }

  /**
   * Disconnect from all endpoints
   */
  disconnect() {
    for (const [name] of this.endpoints) {
      this.disconnectEndpoint(name);
    }
    this.eventListeners.clear();
    this.actionDispatchers.clear();
  }

  /**
   * Get socket instance for specific endpoint (legacy)
   */
  get socketInstance() {
    const portfolioEndpoint = this.endpoints.get("portfolio");
    return portfolioEndpoint?.socket || null;
  }

  /**
   * Get socket instance for specific endpoint
   */
  getSocketInstance(endpointName: string) {
    return this.endpoints.get(endpointName)?.socket || null;
  }

  private log(message: string, ...args: any[]) {
    if (this.config.enableLogging) {
      console.log(`[WebSocketService] ${message}`, ...args);
    }
  }
}

// Create a singleton instance
export const wsService = new WebSocketService();

// React hook for WebSocket connection
export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    Record<string, boolean>
  >({});
  const [lastError, setLastError] = useState<string | null>(null);
  const serviceRef = useRef(wsService);

  // Initialize and connect on mount
  useEffect(() => {
    const service = serviceRef.current;

    if (!service.isConnected) {
      service.initialize();
      service.connectAll().catch(error => {
        setLastError(error.message);
      });
    }

    // Set up status monitoring
    const statusInterval = setInterval(() => {
      const status = service.getConnectionStatus();
      setConnectionStatus(status);
      setIsConnected(service.isConnected);
    }, 1000);

    return () => {
      clearInterval(statusInterval);
    };
  }, []);

  const connect = useCallback(async (url?: string) => {
    const service = serviceRef.current;

    if (url) {
      // Legacy single connection
      service.registerEndpoint("custom", url);
      return service.connect("custom");
    } else {
      // Connect to all registered endpoints
      await service.connectAll();
      return null;
    }
  }, []);

  const disconnect = useCallback(() => {
    serviceRef.current.disconnect();
    setIsConnected(false);
    setConnectionStatus({});
  }, []);

  const sendToEndpoint = useCallback(
    (endpoint: string, type: string, data: any) => {
      return serviceRef.current.sendToEndpoint(endpoint, type, data);
    },
    []
  );

  const broadcast = useCallback((type: string, data: any) => {
    return serviceRef.current.broadcast(type, data);
  }, []);

  const subscribe = useCallback(
    (event: string, callback: (data: any) => void) => {
      return serviceRef.current.on(event, callback);
    },
    []
  );

  // Event subscription hooks
  const onAgentStatusUpdate = useCallback(
    (callback: (data: AgentStatusUpdate) => void) => {
      return serviceRef.current.on("agentStatusUpdated", callback);
    },
    []
  );

  const onTaskStarted = useCallback(
    (callback: (data: TaskStartedEvent) => void) => {
      return serviceRef.current.on("taskStarted", callback);
    },
    []
  );

  const onTaskFinished = useCallback(
    (callback: (data: TaskFinishedEvent) => void) => {
      return serviceRef.current.on("taskFinished", callback);
    },
    []
  );

  const onPortfolioUpdated = useCallback(
    (callback: (data: PortfolioUpdatedEvent) => void) => {
      return serviceRef.current.on("portfolioUpdated", callback);
    },
    []
  );

  const onAlertRaised = useCallback(
    (callback: (data: AlertRaisedEvent) => void) => {
      return serviceRef.current.on("alertRaised", callback);
    },
    []
  );

  // Legacy methods
  const subscribeToPrices = useCallback((symbols: string[]) => {
    serviceRef.current.subscribeToPrices(symbols);
  }, []);

  const subscribeToPortfolio = useCallback((portfolioId: string) => {
    serviceRef.current.subscribeToPortfolio(portfolioId);
  }, []);

  const onPriceUpdate = useCallback(
    (callback: (update: PriceUpdate) => void) => {
      return serviceRef.current.onPriceUpdate(callback);
    },
    []
  );

  const onPortfolioUpdate = useCallback(
    (callback: (update: PortfolioUpdate) => void) => {
      return serviceRef.current.onPortfolioUpdate(callback);
    },
    []
  );

  return {
    // Connection management
    connect,
    disconnect,
    isConnected,
    connectionStatus,
    lastError,

    // Messaging
    sendToEndpoint,
    broadcast,
    subscribe,

    // Event subscriptions
    onAgentStatusUpdate,
    onTaskStarted,
    onTaskFinished,
    onPortfolioUpdated,
    onAlertRaised,

    // Legacy support
    subscribeToPrices,
    subscribeToPortfolio,
    onPriceUpdate,
    onPortfolioUpdate,

    // Direct service access
    wsService: serviceRef.current,
  };
}
