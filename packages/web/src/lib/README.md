# API Client Layer

This directory contains the backend API client layer for the AI Portfolio Tracker application. It provides strongly-typed endpoints and React Query hooks for agents, portfolios, and tasks.

## Architecture Overview

```
src/lib/
├── api.ts              # Main API client with axios configuration
├── types.ts            # TypeScript types for all API responses
├── api/
│   ├── index.ts        # Main exports
│   ├── agents.ts       # Agents API client
│   ├── portfolio.ts    # Portfolio API client
│   └── tasks.ts        # Tasks API client
└── README.md           # This file
```

## Environment Configuration

Create a `.env` file in the web package root with:

```env
VITE_API_URL=http://localhost:3001
```

## Usage Examples

### 1. Using API Clients Directly

```typescript
import { agentsApi, portfolioApi, tasksApi } from '@/lib/api';

// Get all agents
const agents = await agentsApi.getAll();

// Get portfolio data
const portfolio = await portfolioApi.get();

// Get tasks with filtering
const tasks = await tasksApi.getAll({ status: 'pending' });
```

### 2. Using React Query Hooks (Recommended)

```typescript
import { useAgents, usePortfolio, useTasks } from '@/hooks';

function MyComponent() {
  // Fetch agents with automatic caching and refetching
  const { data: agents, isLoading, error } = useAgents();
  
  // Fetch portfolio with auto-refresh every minute
  const { data: portfolio } = usePortfolio();
  
  // Fetch pending tasks with real-time updates
  const { data: pendingTasks } = usePendingTasks();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      <h1>Agents: {agents?.length}</h1>
      <h1>Portfolio Value: ${portfolio?.totalValue}</h1>
      <h1>Pending Tasks: {pendingTasks?.tasks.length}</h1>
    </div>
  );
}
```

### 3. Using Mutations

```typescript
import { useStartAgent, useStopAgent } from '@/hooks/useAgents';

function AgentControls({ agentId }: { agentId: string }) {
  const startAgent = useStartAgent();
  const stopAgent = useStopAgent();
  
  const handleStart = async () => {
    try {
      await startAgent.mutateAsync(agentId);
      console.log('Agent started successfully');
    } catch (error) {
      console.error('Failed to start agent:', error);
    }
  };
  
  return (
    <button 
      onClick={handleStart}
      disabled={startAgent.isPending}
    >
      {startAgent.isPending ? 'Starting...' : 'Start Agent'}
    </button>
  );
}
```

## API Clients

### Agents API (`agentsApi`)

**Endpoints:**
- `getAll(params?)` - Get all agents with optional filtering
- `getById(id)` - Get agent by ID
- `update(id, updates)` - Update agent
- `getPerformance(id)` - Get agent performance metrics
- `start(id)` - Start an agent
- `stop(id)` - Stop an agent
- `restart(id)` - Restart an agent
- `getDetailedMetrics(id)` - Get detailed monitoring metrics

**React Query Hooks:**
- `useAgents(params?)` - Fetch agents list
- `useAgent(id)` - Fetch single agent
- `useAgentPerformance(id)` - Fetch agent performance
- `useAgentMetrics(id)` - Fetch detailed metrics (auto-refresh)
- `useStartAgent()` - Mutation to start agent
- `useStopAgent()` - Mutation to stop agent
- `useRestartAgent()` - Mutation to restart agent

### Portfolio API (`portfolioApi`)

**Endpoints:**
- `get()` - Get enriched portfolio data
- `getPerformance(params?)` - Get performance analytics
- `getAllocation()` - Get allocation analysis
- `getRisk()` - Get risk analysis
- `getHoldings()` - Get formatted holdings data
- `getSummary()` - Get portfolio summary metrics

**React Query Hooks:**
- `usePortfolio()` - Fetch portfolio data (auto-refresh)
- `usePortfolioPerformance(params?)` - Fetch performance data
- `usePortfolioAllocation()` - Fetch allocation analysis
- `usePortfolioRisk()` - Fetch risk analysis
- `usePortfolioHoldings()` - Fetch holdings data
- `usePortfolioSummary()` - Fetch summary metrics
- `useRefreshPortfolio()` - Mutation to refresh data
- `useRebalancePortfolio()` - Mutation to trigger rebalancing

### Tasks API (`tasksApi`)

**Endpoints:**
- `getAll(params?)` - Get tasks with pagination/filtering
- `getById(id)` - Get task by ID
- `create(taskData)` - Create new task
- `getStats()` - Get task statistics
- `getByAgent(agentId)` - Get tasks for specific agent
- `getByStatus(status)` - Get tasks by status
- `getPending()`, `getRunning()`, `getCompleted()`, `getFailed()` - Convenience methods

**React Query Hooks:**
- `useTasks(params?)` - Fetch tasks list
- `useTask(id)` - Fetch single task
- `useTaskStats()` - Fetch task statistics (auto-refresh)
- `usePendingTasks()` - Fetch pending tasks (frequent refresh)
- `useRunningTasks()` - Fetch running tasks (frequent refresh)
- `useTaskLiveMetrics()` - Fetch live metrics (real-time)
- `useCreateTask()` - Mutation to create task

## Type Safety

All API clients are fully typed with TypeScript interfaces:

```typescript
import type { Agent, Portfolio, Task, AgentType, TaskStatus } from '@/lib/types';

// Strongly typed responses
const agents: Agent[] = await agentsApi.getAll();
const portfolio: EnrichedPortfolio = await portfolioApi.get();
const tasks: PaginatedResponse<Task> = await tasksApi.getAll();
```

## Error Handling

The API client includes comprehensive error handling:

- **Request/Response Interceptors**: Automatic logging and error processing
- **Retry Logic**: Configurable retry for failed requests
- **Status Code Handling**: Specific handling for 401, 403, 404, 500 errors
- **Network Error Handling**: Graceful handling of connection issues

## Caching & Performance

React Query provides:

- **Automatic Caching**: Responses cached for configurable periods
- **Background Refetching**: Data refreshed automatically
- **Optimistic Updates**: UI updates immediately, syncs in background
- **Request Deduplication**: Multiple identical requests are deduplicated
- **Offline Support**: Cached data available when offline

## Real-time Updates

Certain hooks auto-refresh for real-time data:

- **Agent Metrics**: Refresh every 15 seconds
- **Task Statistics**: Refresh every 30 seconds
- **Portfolio Data**: Refresh every 60 seconds
- **Live Metrics**: Refresh every 15 seconds

## Development Tools

In development mode, React Query Devtools are available:

- View all queries and their states
- Inspect cached data
- Manually trigger refetches
- Debug performance issues

## Migration from Mock Data

To migrate existing components from mock data:

1. **Replace useState with useQuery hook:**
   ```typescript
   // Before
   const [agents, setAgents] = useState(mockAgents);
   
   // After
   const { data: agents = [], isLoading, error } = useAgents();
   ```

2. **Add loading and error states:**
   ```typescript
   if (isLoading) return <LoadingSpinner />;
   if (error) return <ErrorMessage error={error} />;
   ```

3. **Replace manual API calls with mutations:**
   ```typescript
   // Before
   const updateAgent = async (id, data) => {
     const response = await fetch(`/api/agents/${id}`, { 
       method: 'PUT', 
       body: JSON.stringify(data) 
     });
     // Handle response...
   };
   
   // After
   const updateAgent = useUpdateAgent();
   const handleUpdate = () => updateAgent.mutate({ id, updates });
   ```

## Best Practices

1. **Use hooks in components**: Prefer React Query hooks over direct API calls
2. **Handle loading states**: Always handle `isLoading` and `error` states
3. **Optimize queries**: Use appropriate `staleTime` and `gcTime` values
4. **Invalidate related queries**: After mutations, invalidate related data
5. **Use query keys consistently**: Follow the established key patterns
6. **Implement error boundaries**: Catch and handle query errors gracefully

## Testing

When testing components that use these hooks:

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderWithQuery = (ui: React.ReactElement) => {
  const testQueryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={testQueryClient}>
      {ui}
    </QueryClientProvider>
  );
};
```

## Contributing

When adding new API endpoints:

1. Add types to `types.ts`
2. Add API methods to appropriate client file
3. Add React Query hooks to corresponding hook file
4. Update this README with new endpoints
5. Add tests for new functionality
