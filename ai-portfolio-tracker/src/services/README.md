# API Services Layer

This directory contains the centralized API service layer for the AI Portfolio Tracker application. It provides typed wrappers for all backend API endpoints with comprehensive error handling, retry logic, and authentication support.

## Architecture

```
src/services/
├── types/
│   └── api.ts              # TypeScript interfaces and types
├── utils/
│   └── errors.ts           # Error handling utilities
├── client/
│   └── apiClient.ts        # Enhanced API client with auth & retry
├── agents/
│   └── agentsService.ts    # Agent management service
├── tasks/
│   └── tasksService.ts     # Task execution service  
├── portfolio/
│   └── portfolioService.ts # Portfolio management service
├── api.ts                  # Legacy API service (maintained for compatibility)
├── websocket.ts            # WebSocket service
├── index.ts                # Main exports
└── README.md               # This file
```

## Key Features

- **Type Safety**: Full TypeScript support with comprehensive interfaces
- **Error Handling**: Centralized error transformation and logging
- **Retry Logic**: Automatic retry with exponential backoff
- **Authentication**: Token-based auth with automatic refresh
- **Caching**: Built-in request/response caching (future)
- **WebSocket**: Real-time updates for portfolios and prices

## Usage Examples

### Basic Service Usage

```typescript
import { agentsService, portfolioService, tasksService } from '@/services';

// Get all agents with filtering
const agents = await agentsService.getAgents(
  { type: 'monitoring', status: 'active' },
  { page: 1, limit: 10 }
);

// Create a new portfolio
const portfolio = await portfolioService.createPortfolio({
  name: 'My DeFi Portfolio',
  assets: [
    { symbol: 'SOL', mintAddress: 'So11111111...', targetAllocation: 50 },
    { symbol: 'USDC', mintAddress: 'EPjFWdd5...', targetAllocation: 30 },
    { symbol: 'RAY', mintAddress: '4k3Dyjzvzp...', targetAllocation: 20 }
  ],
  riskProfile: {
    level: 'moderate',
    maxAssetAllocation: 40,
    volatilityTolerance: 0.25,
    correlationLimit: 0.7,
    rebalanceThreshold: 5
  },
  rebalanceConfig: {
    enabled: true,
    frequency: 'weekly',
    threshold: 5,
    maxSlippage: 1,
    dryRun: false
  }
});

// Execute a task
const task = await tasksService.createTask({
  agentId: 'agent-123',
  type: 'analysis',
  title: 'Portfolio Risk Analysis',
  priority: 'high',
  input: {
    portfolioId: portfolio.id,
    parameters: { 
      timeframe: '30d',
      includeCorrelations: true 
    }
  }
});
```

### Error Handling

```typescript
import { 
  getAgents, 
  ValidationError, 
  AuthenticationError,
  getErrorMessage 
} from '@/services';

try {
  const agents = await getAgents({ type: 'invalid-type' });
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('Validation failed:', error.details);
  } else if (error instanceof AuthenticationError) {
    // Redirect to login
    router.push('/login');
  } else {
    console.error('Unexpected error:', getErrorMessage(error));
  }
}
```

### Authentication

```typescript
import { apiClient } from '@/services';

// Set authentication credentials
apiClient.setCredentials({
  token: 'your-jwt-token',
  refreshToken: 'your-refresh-token'
});

// Token refresh is handled automatically
// Clear credentials on logout
apiClient.clearAuth();
```

### Custom API Client

```typescript
import { createApiClient } from '@/services';

const customClient = createApiClient({
  baseURL: 'https://api.custom.com',
  timeout: 15000,
  authMode: 'apiKey',
  retryConfig: {
    maxRetries: 5,
    baseDelay: 2000
  }
});
```

## Service APIs

### Agents Service

Manages AI agents for monitoring, analysis, rebalancing, and alerts.

**Key Methods:**
- `getAgents(filters?, pagination?)` - List agents with filtering
- `createAgent(data)` - Create new agent
- `startAgent(id)` / `stopAgent(id)` - Control agent lifecycle
- `getAgentMetrics(id)` - Performance metrics
- `executeAgent(id, options?)` - Manual execution

### Tasks Service

Handles task creation, execution, and monitoring.

**Key Methods:**
- `getTasks(filters?, pagination?)` - List tasks with filtering
- `createTask(data)` - Create new task
- `cancelTask(id)` / `retryTask(id)` - Task control
- `getTaskLogs(id)` - Execution logs
- `getTaskMetrics(id)` - Real-time metrics

### Portfolio Service

Manages Solana-based crypto portfolios.

**Key Methods:**
- `getPortfolios(filters?, pagination?)` - List portfolios
- `createPortfolio(data)` - Create new portfolio
- `getPortfolioAnalytics(id)` - Performance analytics
- `getRebalancingSuggestions(id)` - AI-powered rebalancing
- `executeRebalancing(id, trades)` - Execute trades

## Types and Interfaces

### Core Types

```typescript
// Agent types
interface Agent {
  id: string;
  name: string;
  type: 'monitoring' | 'analysis' | 'rebalancing' | 'alerts';
  status: 'active' | 'inactive' | 'error' | 'maintenance';
  config: AgentConfig;
  metrics: AgentMetrics;
}

// Task types
interface Task {
  id: string;
  agentId: string;
  type: 'analysis' | 'rebalance' | 'alert' | 'monitor' | 'report';
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  input: TaskInput;
  output?: TaskOutput;
}

// Portfolio types  
interface Portfolio {
  id: string;
  name: string;
  totalValue: number;
  assets: PortfolioAsset[];
  performance: PortfolioPerformance;
  riskProfile: RiskProfile;
}
```

### Request/Response Types

All API methods use strongly typed request and response interfaces:

- `CreateAgentRequest` / `UpdateAgentRequest`
- `CreateTaskRequest` / `UpdateTaskRequest`  
- `CreatePortfolioRequest` / `UpdatePortfolioRequest`
- `ApiResponse<T>` / `PaginatedResponse<T>`

## Error Handling

### Custom Error Classes

```typescript
- ApiClientError      // Base error class
- ValidationError     // 400 Bad Request
- AuthenticationError // 401 Unauthorized  
- AuthorizationError  // 403 Forbidden
- NotFoundError       // 404 Not Found
- ConflictError       // 409 Conflict
- RateLimitError      // 429 Too Many Requests
- ServerError         // 5xx Server Errors
- NetworkError        // Network/connectivity issues
```

### Retry Logic

Automatic retry with exponential backoff for:
- Network errors
- Server errors (5xx)
- Rate limiting (with respect for Retry-After header)

## Configuration

### Environment Variables

```bash
NEXT_PUBLIC_API_URL=https://api.yourapp.com
NEXT_PUBLIC_WS_URL=wss://ws.yourapp.com
```

### Client Configuration

```typescript
const client = createApiClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30000,
  authMode: 'token', // 'token' | 'apiKey' | 'none'
  enableLogging: process.env.NODE_ENV === 'development',
  retryConfig: {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000
  }
});
```

## WebSocket Integration

Real-time updates for portfolios and price data:

```typescript
import { wsService } from '@/services';

// Connect to WebSocket
wsService.connect();

// Subscribe to portfolio updates
wsService.subscribeToPortfolio('portfolio-123');

// Listen for updates
wsService.onPortfolioUpdate((update) => {
  console.log('Portfolio updated:', update);
});

// Subscribe to price updates
wsService.subscribeToPrices(['SOL', 'USDC', 'RAY']);
wsService.onPriceUpdate((update) => {
  console.log('Price update:', update);
});
```

## Testing

```typescript
import { agentsService } from '@/services';
import { vi } from 'vitest';

// Mock the API client
vi.mock('@/services/client/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn()
  }
}));

// Test service methods
describe('AgentsService', () => {
  it('should fetch agents with filters', async () => {
    const mockAgents = [{ id: '1', name: 'Test Agent' }];
    apiClient.getPaginated.mockResolvedValue({ data: mockAgents });
    
    const result = await agentsService.getAgents({ type: 'monitoring' });
    expect(result.data).toEqual(mockAgents);
  });
});
```

## Migration from Legacy API

The new services layer is fully backward compatible. Existing code using the legacy `api.ts` will continue to work:

```typescript
// Old way (still works)
import { portfolioApi } from '@/services/api';
const portfolios = await portfolioApi.getPortfolios();

// New way (recommended)
import { getPortfolios } from '@/services';
const portfolios = await getPortfolios();
```

## Future Enhancements

- **OpenAPI Code Generation**: Auto-generate interfaces from backend OpenAPI spec
- **Request Caching**: Intelligent caching with cache invalidation
- **Offline Support**: Queue requests when offline
- **Request Deduplication**: Prevent duplicate concurrent requests
- **Metrics Collection**: API usage analytics and performance monitoring
