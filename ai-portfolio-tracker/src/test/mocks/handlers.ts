import { http, HttpResponse } from "msw";
import type { Agent, Task, Portfolio } from "../../services/types/api";

// Mock data
const mockAgents: Agent[] = [
  {
    id: "agent-monitoring-1",
    name: "Portfolio Monitor",
    type: "monitoring",
    status: "active",
    description: "Monitors portfolio performance and price changes",
    config: {
      interval: 30000,
      thresholds: {
        priceChange: 0.05,
        volumeChange: 0.1,
      },
    },
    metrics: {
      successRate: 0.98,
      averageExecutionTime: 250,
      totalExecutions: 1247,
      uptime: 0.995,
    },
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-15T12:30:00.000Z",
  },
  {
    id: "agent-rebalancing-1",
    name: "Auto Rebalancer",
    type: "rebalancing",
    status: "inactive",
    description: "Automatically rebalances portfolio based on target allocations",
    config: {
      interval: 3600000, // 1 hour
      targetAllocations: {
        BTC: 0.4,
        ETH: 0.3,
        SOL: 0.2,
        USDC: 0.1,
      },
      threshold: 0.05,
    },
    metrics: {
      successRate: 0.92,
      averageExecutionTime: 1200,
      totalExecutions: 45,
      uptime: 0.85,
    },
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-15T12:30:00.000Z",
  },
  {
    id: "agent-analysis-1",
    name: "Market Analyzer",
    type: "analysis",
    status: "error",
    description: "Analyzes market trends and provides insights",
    config: {
      interval: 300000, // 5 minutes
      indicators: ["RSI", "MACD", "BollingerBands"],
      timeframes: ["1h", "4h", "1d"],
    },
    metrics: {
      successRate: 0.75,
      averageExecutionTime: 800,
      totalExecutions: 892,
      uptime: 0.78,
    },
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-15T12:30:00.000Z",
  },
  {
    id: "agent-alerts-1",
    name: "Alert Manager",
    type: "alerts",
    status: "paused",
    description: "Sends alerts for price changes and portfolio events",
    config: {
      channels: ["email", "discord", "telegram"],
      conditions: [
        {
          type: "price_change",
          threshold: 0.1,
          timeframe: "1h",
        },
        {
          type: "portfolio_value",
          threshold: 0.05,
          direction: "down",
        },
      ],
    },
    metrics: {
      successRate: 0.99,
      averageExecutionTime: 150,
      totalExecutions: 2341,
      uptime: 0.97,
    },
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-15T12:30:00.000Z",
  },
];

const mockTasks: Task[] = [
  {
    id: "task-1",
    agentId: "agent-monitoring-1",
    type: "monitoring",
    title: "Monitor BTC price changes",
    description: "Check BTC price every 30 seconds for significant changes",
    status: "completed",
    priority: "high",
    progress: 100,
    result: {
      priceChange: 0.02,
      currentPrice: 45000,
      previousPrice: 44100,
    },
    error: null,
    executionTime: 245,
    createdAt: "2024-01-15T12:00:00.000Z",
    updatedAt: "2024-01-15T12:05:00.000Z",
    completedAt: "2024-01-15T12:05:00.000Z",
  },
  {
    id: "task-2",
    agentId: "agent-rebalancing-1",
    type: "rebalancing",
    title: "Rebalance portfolio allocation",
    description: "Adjust portfolio to match target allocations",
    status: "running",
    priority: "medium",
    progress: 60,
    result: null,
    error: null,
    executionTime: null,
    createdAt: "2024-01-15T12:30:00.000Z",
    updatedAt: "2024-01-15T12:35:00.000Z",
    completedAt: null,
  },
];

const mockPortfolio: Portfolio = {
  id: "portfolio-1",
  userId: "user-1",
  name: "Main Portfolio",
  totalValue: 125000.50,
  totalChange24h: 2500.75,
  totalChangePercent24h: 2.04,
  positions: [
    {
      symbol: "BTC",
      amount: 2.5,
      value: 112500,
      price: 45000,
      change24h: 900,
      changePercent24h: 2.0,
      allocation: 0.9,
    },
    {
      symbol: "ETH",
      amount: 5.0,
      value: 12500,
      price: 2500,
      change24h: 100,
      changePercent24h: 4.0,
      allocation: 0.1,
    },
  ],
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-15T12:35:00.000Z",
};

// API Handlers
export const handlers = [
  // Agents endpoints
  http.get("/api/agents", ({ request }) => {
    const url = new URL(request.url);
    const type = url.searchParams.get("type");
    const status = url.searchParams.get("status");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");

    let filteredAgents = [...mockAgents];

    if (type) {
      filteredAgents = filteredAgents.filter((agent) => agent.type === type);
    }

    if (status) {
      filteredAgents = filteredAgents.filter((agent) => agent.status === status);
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedAgents = filteredAgents.slice(startIndex, endIndex);

    return HttpResponse.json({
      data: paginatedAgents,
      meta: {
        total: filteredAgents.length,
        page,
        limit,
        totalPages: Math.ceil(filteredAgents.length / limit),
      },
    });
  }),

  http.get("/api/agents/:id", ({ params }) => {
    const agent = mockAgents.find((a) => a.id === params.id);
    if (!agent) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(agent);
  }),

  http.post("/api/agents", async ({ request }) => {
    const body = await request.json();
    const newAgent: Agent = {
      id: `agent-${Date.now()}`,
      ...body,
      status: "inactive",
      metrics: {
        successRate: 0,
        averageExecutionTime: 0,
        totalExecutions: 0,
        uptime: 0,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockAgents.push(newAgent);
    return HttpResponse.json(newAgent, { status: 201 });
  }),

  http.patch("/api/agents/:id", async ({ params, request }) => {
    const agentIndex = mockAgents.findIndex((a) => a.id === params.id);
    if (agentIndex === -1) {
      return new HttpResponse(null, { status: 404 });
    }

    const body = await request.json();
    mockAgents[agentIndex] = {
      ...mockAgents[agentIndex],
      ...body,
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json(mockAgents[agentIndex]);
  }),

  http.delete("/api/agents/:id", ({ params }) => {
    const agentIndex = mockAgents.findIndex((a) => a.id === params.id);
    if (agentIndex === -1) {
      return new HttpResponse(null, { status: 404 });
    }

    mockAgents.splice(agentIndex, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  // Agent control endpoints
  http.post("/api/agents/:id/start", ({ params }) => {
    const agentIndex = mockAgents.findIndex((a) => a.id === params.id);
    if (agentIndex === -1) {
      return new HttpResponse(null, { status: 404 });
    }

    mockAgents[agentIndex].status = "active";
    mockAgents[agentIndex].updatedAt = new Date().toISOString();

    return HttpResponse.json(mockAgents[agentIndex]);
  }),

  http.post("/api/agents/:id/stop", ({ params }) => {
    const agentIndex = mockAgents.findIndex((a) => a.id === params.id);
    if (agentIndex === -1) {
      return new HttpResponse(null, { status: 404 });
    }

    mockAgents[agentIndex].status = "inactive";
    mockAgents[agentIndex].updatedAt = new Date().toISOString();

    return HttpResponse.json(mockAgents[agentIndex]);
  }),

  http.post("/api/agents/:id/restart", ({ params }) => {
    const agentIndex = mockAgents.findIndex((a) => a.id === params.id);
    if (agentIndex === -1) {
      return new HttpResponse(null, { status: 404 });
    }

    mockAgents[agentIndex].status = "active";
    mockAgents[agentIndex].updatedAt = new Date().toISOString();

    return HttpResponse.json(mockAgents[agentIndex]);
  }),

  http.post("/api/agents/:id/execute", ({ params }) => {
    const agent = mockAgents.find((a) => a.id === params.id);
    if (!agent) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json({
      executionId: `exec-${Date.now()}`,
      status: "started",
      estimatedCompletion: new Date(Date.now() + 30000).toISOString(),
    });
  }),

  // Agent metrics
  http.get("/api/agents/:id/metrics", ({ params, request }) => {
    const agent = mockAgents.find((a) => a.id === params.id);
    if (!agent) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json({
      executionHistory: [
        {
          timestamp: "2024-01-15T12:00:00.000Z",
          duration: 250,
          status: "success",
        },
        {
          timestamp: "2024-01-15T11:30:00.000Z",
          duration: 320,
          status: "success",
        },
        {
          timestamp: "2024-01-15T11:00:00.000Z",
          duration: 280,
          status: "failure",
          error: "Network timeout",
        },
      ],
      performance: agent.metrics,
      resourceUsage: {
        cpu: 15.2,
        memory: 245.8,
        network: 1.2,
      },
    });
  }),

  // Tasks endpoints
  http.get("/api/tasks", ({ request }) => {
    const url = new URL(request.url);
    const agentId = url.searchParams.get("agentId");
    const status = url.searchParams.get("status");

    let filteredTasks = [...mockTasks];

    if (agentId) {
      filteredTasks = filteredTasks.filter((task) => task.agentId === agentId);
    }

    if (status) {
      filteredTasks = filteredTasks.filter((task) => task.status === status);
    }

    return HttpResponse.json({
      data: filteredTasks,
      meta: {
        total: filteredTasks.length,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    });
  }),

  // Portfolio endpoints
  http.get("/api/portfolio", () => {
    return HttpResponse.json(mockPortfolio);
  }),

  http.post("/api/portfolio/rebalance", async ({ request }) => {
    const body = await request.json();
    
    // Simulate rebalancing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return HttpResponse.json({
      taskId: `rebalance-${Date.now()}`,
      status: "started",
      estimatedCompletion: new Date(Date.now() + 60000).toISOString(),
    });
  }),

  // Health check
  http.get("/api/health", () => {
    return HttpResponse.json({ status: "ok", timestamp: new Date().toISOString() });
  }),
];
