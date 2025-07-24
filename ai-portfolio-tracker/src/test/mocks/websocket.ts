import WS from "ws";
import type {
  AgentStatusUpdate,
  TaskStartedEvent,
  TaskFinishedEvent,
  PortfolioUpdatedEvent,
  AlertRaisedEvent,
} from "../../services/websocket";

interface MockWebSocketServer {
  server: WS.WebSocketServer;
  port: number;
  clients: Set<WS.WebSocket>;
  start(): Promise<void>;
  stop(): Promise<void>;
  broadcast(type: string, data: any): void;
  sendToClient(client: WS.WebSocket, type: string, data: any): void;
  simulateAgentStatusUpdate(agentId: string, status: string): void;
  simulateTaskStarted(taskData: Partial<TaskStartedEvent>): void;
  simulateTaskFinished(taskData: Partial<TaskFinishedEvent>): void;
  simulatePortfolioUpdate(portfolioData: Partial<PortfolioUpdatedEvent>): void;
  simulateAlert(alertData: Partial<AlertRaisedEvent>): void;
}

export class MockWebSocketServer implements MockWebSocketServer {
  public server: WS.WebSocketServer;
  public port: number;
  public clients = new Set<WS.WebSocket>();

  constructor(port: number = 8080) {
    this.port = port;
    this.server = new WS.WebSocketServer({ port: this.port });
    this.setupServer();
  }

  private setupServer(): void {
    this.server.on("connection", (client: WS.WebSocket) => {
      console.log(`[MockWebSocketServer] Client connected. Total clients: ${this.clients.size + 1}`);
      this.clients.add(client);

      // Send initial connection message
      this.sendToClient(client, "connected", {
        timestamp: new Date().toISOString(),
        message: "WebSocket connection established",
      });

      client.on("message", (message: Buffer) => {
        try {
          const parsedMessage = JSON.parse(message.toString());
          this.handleClientMessage(client, parsedMessage);
        } catch (error) {
          console.error("[MockWebSocketServer] Error parsing client message:", error);
        }
      });

      client.on("close", () => {
        console.log(`[MockWebSocketServer] Client disconnected. Total clients: ${this.clients.size - 1}`);
        this.clients.delete(client);
      });

      client.on("error", (error) => {
        console.error("[MockWebSocketServer] Client error:", error);
        this.clients.delete(client);
      });
    });

    this.server.on("error", (error) => {
      console.error("[MockWebSocketServer] Server error:", error);
    });
  }

  private handleClientMessage(client: WS.WebSocket, message: any): void {
    const { type, data } = message;

    switch (type) {
      case "ping":
        this.sendToClient(client, "pong", {
          timestamp: new Date().toISOString(),
          originalTimestamp: data?.timestamp,
        });
        break;

      case "subscribe_prices":
        // Simulate price subscription
        const { symbols } = data;
        symbols?.forEach((symbol: string) => {
          setTimeout(() => {
            this.sendToClient(client, "price_update", {
              symbol,
              price: Math.random() * 50000 + 20000, // Random price between 20k-70k
              change24h: (Math.random() - 0.5) * 2000, // Random change ±1000
              timestamp: new Date(),
            });
          }, Math.random() * 1000); // Random delay up to 1 second
        });
        break;

      case "subscribe_portfolio":
        // Simulate portfolio subscription
        setTimeout(() => {
          this.simulatePortfolioUpdate({
            portfolioId: data.portfolioId,
            totalValue: Math.random() * 100000 + 50000,
            totalChange24h: (Math.random() - 0.5) * 5000,
            totalChangePercent24h: (Math.random() - 0.5) * 10,
          });
        }, 500);
        break;

      default:
        console.log(`[MockWebSocketServer] Unknown message type: ${type}`);
    }
  }

  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server.on("listening", () => {
        console.log(`[MockWebSocketServer] Server started on port ${this.port}`);
        resolve();
      });

      this.server.on("error", (error) => {
        console.error("[MockWebSocketServer] Failed to start server:", error);
        reject(error);
      });

      // Start periodic data simulation
      this.startPeriodicSimulation();
    });
  }

  async stop(): Promise<void> {
    return new Promise((resolve) => {
      this.server.close(() => {
        console.log("[MockWebSocketServer] Server stopped");
        resolve();
      });

      // Force close all client connections
      this.clients.forEach((client) => {
        client.terminate();
      });
      this.clients.clear();
    });
  }

  broadcast(type: string, data: any): void {
    const message = JSON.stringify({ type, data });
    this.clients.forEach((client) => {
      if (client.readyState === WS.OPEN) {
        client.send(message);
      }
    });
  }

  sendToClient(client: WS.WebSocket, type: string, data: any): void {
    if (client.readyState === WS.OPEN) {
      const message = JSON.stringify({ type, data });
      client.send(message);
    }
  }

  simulateAgentStatusUpdate(agentId: string, status: string): void {
    const update: AgentStatusUpdate = {
      agentId,
      status: status as any,
      timestamp: new Date().toISOString(),
      message: `Agent ${agentId} status changed to ${status}`,
      metrics: {
        successRate: Math.random(),
        averageExecutionTime: Math.random() * 1000,
        totalExecutions: Math.floor(Math.random() * 1000),
        uptime: Math.random(),
      },
    };

    this.broadcast("agentStatusUpdated", update);
  }

  simulateTaskStarted(taskData: Partial<TaskStartedEvent>): void {
    const task: TaskStartedEvent = {
      taskId: taskData.taskId || `task-${Date.now()}`,
      agentId: taskData.agentId || "agent-monitoring-1",
      type: taskData.type || "monitoring",
      title: taskData.title || "Mock Task",
      priority: taskData.priority || "medium",
      timestamp: new Date().toISOString(),
    };

    this.broadcast("taskStarted", task);
  }

  simulateTaskFinished(taskData: Partial<TaskFinishedEvent>): void {
    const task: TaskFinishedEvent = {
      taskId: taskData.taskId || `task-${Date.now()}`,
      agentId: taskData.agentId || "agent-monitoring-1",
      type: taskData.type || "monitoring",
      status: taskData.status || "completed",
      executionTime: taskData.executionTime || Math.random() * 1000,
      timestamp: new Date().toISOString(),
      result: taskData.result || { success: true },
    };

    this.broadcast("taskFinished", task);
  }

  simulatePortfolioUpdate(portfolioData: Partial<PortfolioUpdatedEvent>): void {
    const portfolio: PortfolioUpdatedEvent = {
      portfolioId: portfolioData.portfolioId || "portfolio-1",
      totalValue: portfolioData.totalValue || 125000,
      totalChange24h: portfolioData.totalChange24h || 2500,
      totalChangePercent24h: portfolioData.totalChangePercent24h || 2.0,
      updatedAssets: portfolioData.updatedAssets || [
        {
          symbol: "BTC",
          price: 45000 + (Math.random() - 0.5) * 2000,
          change24h: (Math.random() - 0.5) * 2000,
          changePercent24h: (Math.random() - 0.5) * 5,
        },
        {
          symbol: "ETH",
          price: 2500 + (Math.random() - 0.5) * 200,
          change24h: (Math.random() - 0.5) * 200,
          changePercent24h: (Math.random() - 0.5) * 8,
        },
      ],
      timestamp: new Date().toISOString(),
    };

    this.broadcast("portfolioUpdated", portfolio);
  }

  simulateAlert(alertData: Partial<AlertRaisedEvent>): void {
    const alert: AlertRaisedEvent = {
      id: alertData.id || `alert-${Date.now()}`,
      type: alertData.type || "price",
      severity: alertData.severity || "warning",
      title: alertData.title || "Price Alert",
      message: alertData.message || "BTC price has changed significantly",
      timestamp: new Date().toISOString(),
      portfolioId: alertData.portfolioId || "portfolio-1",
      agentId: alertData.agentId || "agent-monitoring-1",
      resolved: alertData.resolved || false,
      data: alertData.data || {
        symbol: "BTC",
        currentPrice: 45000,
        previousPrice: 44000,
        changePercent: 2.27,
      },
    };

    this.broadcast("alertRaised", alert);
  }

  private startPeriodicSimulation(): void {
    // Simulate agent status updates every 10 seconds
    setInterval(() => {
      if (this.clients.size > 0) {
        const agentIds = ["agent-monitoring-1", "agent-rebalancing-1", "agent-analysis-1", "agent-alerts-1"];
        const statuses = ["active", "inactive", "error", "paused"];
        const randomAgent = agentIds[Math.floor(Math.random() * agentIds.length)];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        
        this.simulateAgentStatusUpdate(randomAgent, randomStatus);
      }
    }, 10000);

    // Simulate portfolio updates every 5 seconds
    setInterval(() => {
      if (this.clients.size > 0) {
        this.simulatePortfolioUpdate({});
      }
    }, 5000);

    // Simulate occasional alerts
    setInterval(() => {
      if (this.clients.size > 0 && Math.random() > 0.7) { // 30% chance
        const alertTypes = ["price", "portfolio", "system", "agent"];
        const severities = ["info", "warning", "error", "critical"];
        
        this.simulateAlert({
          type: alertTypes[Math.floor(Math.random() * alertTypes.length)] as any,
          severity: severities[Math.floor(Math.random() * severities.length)] as any,
          title: `Random Alert ${Date.now()}`,
          message: "This is a simulated alert for testing purposes",
        });
      }
    }, 15000);

    // Simulate task executions
    setInterval(() => {
      if (this.clients.size > 0 && Math.random() > 0.5) { // 50% chance
        const taskId = `task-${Date.now()}`;
        
        // Start task
        this.simulateTaskStarted({
          taskId,
          title: `Automated Task ${taskId}`,
        });

        // Finish task after 2-5 seconds
        setTimeout(() => {
          this.simulateTaskFinished({
            taskId,
            status: Math.random() > 0.8 ? "failed" : "completed", // 20% failure rate
            executionTime: Math.random() * 3000 + 1000, // 1-4 seconds
          });
        }, Math.random() * 3000 + 2000);
      }
    }, 8000);
  }
}

// Singleton instance for tests
let mockWSServer: MockWebSocketServer | null = null;

export const createMockWebSocketServer = (port: number = 8080): MockWebSocketServer => {
  if (mockWSServer) {
    return mockWSServer;
  }
  
  mockWSServer = new MockWebSocketServer(port);
  return mockWSServer;
};

export const getMockWebSocketServer = (): MockWebSocketServer | null => {
  return mockWSServer;
};

export const closeMockWebSocketServer = async (): Promise<void> => {
  if (mockWSServer) {
    await mockWSServer.stop();
    mockWSServer = null;
  }
};
