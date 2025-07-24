# Portfolio Tracker Backend API Documentation

## Overview

This backend provides RESTful APIs for a multi-agent AI portfolio tracker built on Solana using Virtuals Protocol. The system manages agents, tasks, and portfolio data with a focus on automated trading and analysis.

## Base URL

```
http://localhost:4000
```

## API Routes

### Workflow Management

#### Start Workflow
- **POST** `/api/workflow/start`
- **Description**: Starts the multi-agent workflow system
- **Response**: 
```json
{
  "success": true,
  "data": {
    "isRunning": true,
    "startedAt": "2024-01-15T10:30:00.000Z",
    "activeAgents": 4
  },
  "message": "Workflow started successfully"
}
```

#### Stop Workflow
- **POST** `/api/workflow/stop`
- **Description**: Stops the multi-agent workflow system
- **Response**:
```json
{
  "success": true,
  "data": {
    "isRunning": false,
    "stoppedAt": "2024-01-15T11:30:00.000Z",
    "runDuration": 3600000
  },
  "message": "Workflow stopped successfully"
}
```

#### Get Workflow Status
- **GET** `/api/workflow/status`
- **Description**: Returns current workflow status and metrics
- **Response**:
```json
{
  "success": true,
  "data": {
    "isRunning": true,
    "startedAt": "2024-01-15T10:30:00.000Z",
    "cycleInterval": 5000,
    "maxConcurrentTasks": 10,
    "agents": {
      "total": 4,
      "active": 4,
      "inactive": 0,
      "error": 0
    }
  }
}
```

### Agent Management

#### Get All Agents
- **GET** `/api/agents`
- **Query Parameters**:
  - `type` (optional): Filter by agent type (monitoring, analysis, rebalancing, alerts)
  - `status` (optional): Filter by status (active, inactive, error)
- **Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "monitoring-agent",
      "name": "Portfolio Monitor",
      "type": "monitoring",
      "status": "active",
      "description": "Monitors portfolio performance and tracks asset prices",
      "config": {
        "interval": 60000,
        "assets": ["SOL", "BTC", "ETH"]
      },
      "performance": {
        "tasksCompleted": 150,
        "successRate": 98.5,
        "averageExecutionTime": 2500
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "count": 4
}
```

#### Get Agent by ID
- **GET** `/api/agents/:id`
- **Response**: Single agent object

#### Update Agent
- **PUT** `/api/agents/:id`
- **Body**:
```json
{
  "name": "Updated Agent Name",
  "description": "Updated description",
  "config": {
    "interval": 30000
  },
  "status": "inactive"
}
```
- **Response**: Updated agent object

#### Get Agent Performance
- **GET** `/api/agents/:id/performance`
- **Response**:
```json
{
  "success": true,
  "data": {
    "agentId": "monitoring-agent",
    "agentName": "Portfolio Monitor",
    "performance": {
      "tasksCompleted": 150,
      "successRate": 98.5,
      "averageExecutionTime": 2500
    },
    "lastRun": "2024-01-15T10:25:00.000Z",
    "uptime": "100%"
  }
}
```

### Task Management

#### Get Tasks (Paginated)
- **GET** `/api/tasks`
- **Query Parameters**:
  - `page` (default: 1): Page number
  - `limit` (default: 20, max: 100): Items per page
  - `agentId` (optional): Filter by agent ID
  - `status` (optional): Filter by status (pending, running, completed, failed)
  - `priority` (optional): Filter by priority (low, medium, high, critical)
  - `sortBy` (default: createdAt): Sort field (createdAt, priority, status)
  - `sortOrder` (default: desc): Sort order (asc, desc)
- **Response**:
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": "task-1642254600000-abc123",
        "agentId": "monitoring-agent",
        "type": "price_monitoring",
        "status": "completed",
        "priority": "medium",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "completedAt": "2024-01-15T10:30:05.000Z",
        "executionTime": 5000,
        "result": {
          "priceData": {...}
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

#### Create Task
- **POST** `/api/tasks`
- **Body**:
```json
{
  "agentId": "monitoring-agent",
  "type": "price_check",
  "priority": "high",
  "metadata": {
    "symbol": "SOL",
    "threshold": 0.05
  }
}
```
- **Response**: Created task object

#### Get Task by ID
- **GET** `/api/tasks/:id`
- **Response**: Single task object

#### Get Task Statistics
- **GET** `/api/tasks/stats`
- **Response**:
```json
{
  "success": true,
  "data": {
    "total": 150,
    "byStatus": {
      "pending": 5,
      "running": 2,
      "completed": 140,
      "failed": 3
    },
    "byPriority": {
      "low": 20,
      "medium": 100,
      "high": 25,
      "critical": 5
    },
    "completionRate": 93.33,
    "averageExecutionTime": 3500
  }
}
```

### Portfolio Management

#### Get Portfolio Data
- **GET** `/api/portfolio`
- **Response**:
```json
{
  "success": true,
  "data": {
    "id": "main-portfolio",
    "totalValue": 125000.50,
    "assets": [
      {
        "symbol": "SOL",
        "amount": 1250.5,
        "value": 50000.25,
        "percentage": 40.0,
        "priceChange24h": 2.5,
        "lastUpdated": "2024-01-15T10:30:00.000Z"
      }
    ],
    "performance": {
      "totalReturn": 15.7,
      "dailyChange": 1.8,
      "weeklyChange": 4.2,
      "monthlyChange": 12.3
    },
    "riskMetrics": {
      "volatility": 0.285,
      "sharpeRatio": 1.45,
      "maxDrawdown": -0.125
    },
    "metrics": {
      "totalAssets": 3,
      "topAsset": {
        "symbol": "SOL",
        "percentage": 40.0
      },
      "healthScore": 85,
      "isRebalanceNeeded": false
    },
    "summary": {
      "totalValue": 125000.50,
      "dailyChange": 1.8,
      "totalReturn": 15.7,
      "riskLevel": "Medium"
    }
  }
}
```

#### Get Performance Analytics
- **GET** `/api/portfolio/performance`
- **Query Parameters**:
  - `period` (default: 30d): Time period (7d, 30d, 90d, 1y)
- **Response**: Performance history and metrics

#### Get Allocation Analysis
- **GET** `/api/portfolio/allocation`
- **Response**: Current vs target allocation analysis with rebalance recommendations

#### Get Risk Analysis
- **GET** `/api/portfolio/risk`
- **Response**: Risk metrics and assessment with recommendations

## Data Models

### Agent
```typescript
interface Agent {
  id: string;
  name: string;
  type: 'monitoring' | 'analysis' | 'rebalancing' | 'alerts';
  status: 'active' | 'inactive' | 'error';
  description: string;
  lastRun?: Date;
  nextRun?: Date;
  config: Record<string, any>;
  performance?: {
    tasksCompleted: number;
    successRate: number;
    averageExecutionTime: number;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### Task
```typescript
interface Task {
  id: string;
  agentId: string;
  type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  completedAt?: Date;
  result?: any;
  error?: string;
  metadata?: Record<string, any>;
  executionTime?: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### Portfolio
```typescript
interface Portfolio {
  id: string;
  totalValue: number;
  assets: {
    symbol: string;
    amount: number;
    value: number;
    percentage: number;
    priceChange24h?: number;
    lastUpdated: Date;
  }[];
  performance: {
    totalReturn: number;
    dailyChange: number;
    weeklyChange: number;
    monthlyChange: number;
  };
  riskMetrics: {
    volatility: number;
    sharpeRatio: number;
    maxDrawdown: number;
  };
  lastRebalanced?: Date;
  targetAllocations: Record<string, number>;
  createdAt: Date;
  updatedAt: Date;
}
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

## Authentication

Currently, the API does not implement authentication. In production, consider implementing:
- JWT tokens
- API keys
- OAuth 2.0
- Role-based access control

## Rate Limiting

No rate limiting is currently implemented. For production, consider:
- Request rate limits per IP
- API quotas per user
- Burst protection

## Development Notes

- All data is currently stored in memory and will be lost on server restart
- For production, implement persistent storage (PostgreSQL, MongoDB, etc.)
- Consider implementing WebSocket connections for real-time updates
- Add comprehensive logging and monitoring
- Implement proper error tracking (Sentry, etc.)
