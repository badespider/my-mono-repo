# Redux Store Architecture

This directory contains the Redux store setup for the AI Portfolio Tracker, implementing global state management for agents, tasks, portfolio data, and alerts.

## Structure

```
src/store/
├── index.ts              # Store configuration and types
├── hooks.ts              # Typed Redux hooks
├── slices/               # Redux Toolkit slices
│   ├── agentsSlice.ts    # Agent management state
│   ├── tasksSlice.ts     # Task queue and history
│   ├── portfolioSlice.ts # Portfolio positions and P&L
│   └── alertsSlice.ts    # Notification system
├── selectors/            # Memoized selectors  
│   └── index.ts          # All selectors
├── middleware/           # Custom middleware
│   └── realtimeMiddleware.ts # WebSocket integration
└── README.md
```

## Slices Overview

### Agents Slice (`agentsSlice.ts`)
Manages AI agents with live status tracking, metrics, and configuration.

**State Structure:**
- `byId`: Map of agents by ID
- `allIds`: Array of agent IDs
- `loading`: Loading state
- `error`: Error messages

**Key Features:**
- Live agent status (active, idle, error, disabled)
- Performance metrics (tasks completed, success rate, uptime)
- Configuration management (intervals, thresholds, parameters)
- Real-time status updates

**Example Usage:**
```typescript
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { selectActiveAgents, updateAgentStatus } from '../store/selectors';

const Dashboard = () => {
  const activeAgents = useAppSelector(selectActiveAgents);
  const dispatch = useAppDispatch();
  
  // Update agent status
  dispatch(updateAgentStatus({ 
    id: 'agent-1', 
    status: 'active' 
  }));
};
```

### Tasks Slice (`tasksSlice.ts`)
Handles task queue management, progress tracking, and history.

**State Structure:**
- `byId`: Map of tasks by ID
- `allIds`: All task IDs
- `queueIds`: Pending/running tasks
- `historyIds`: Completed/failed tasks

**Key Features:**
- Task lifecycle management (pending → running → completed/failed)
- Progress tracking with steps and percentages
- Retry logic with configurable limits
- Agent-task associations
- Queue vs history separation

**Example Usage:**
```typescript
import { selectQueuedTasks, selectTaskStats } from '../store/selectors';

const TaskManager = () => {
  const queuedTasks = useAppSelector(selectQueuedTasks);
  const taskStats = useAppSelector(selectTaskStats);
  
  return (
    <div>
      <p>Queued: {taskStats.pending}</p>
      <p>Running: {taskStats.running}</p>
      <p>Completed: {taskStats.completed}</p>
    </div>
  );
};
```

### Portfolio Slice (`portfolioSlice.ts`)
Manages portfolio positions, P&L tracking, and rebalancing history.

**State Structure:**
- `positions`: Map of token positions
- `positionIds`: Array of position IDs
- `totalValue`, `totalInvested`: Portfolio totals
- `pnlHistory`: Historical P&L data
- `rebalanceHistory`: Rebalancing events

**Key Features:**
- Real-time position updates with price changes
- Automatic weight calculations
- P&L history tracking (365 days)
- Rebalancing event logging
- Unrealized vs realized P&L separation

**Example Usage:**
```typescript
import { selectPortfolioTotals, selectTopPositions } from '../store/selectors';

const PortfolioOverview = () => {
  const totals = useAppSelector(selectPortfolioTotals);
  const topPositions = useAppSelector((state) => selectTopPositions(state, 5));
  
  return (
    <div>
      <h2>Total Value: ${totals.totalValue.toFixed(2)}</h2>
      <p>Unrealized P&L: {totals.totalUnrealizedPnlPercent.toFixed(2)}%</p>
    </div>
  );
};
```

### Alerts Slice (`alertsSlice.ts`)
Notification system with read/unread tracking and categorization.

**State Structure:**
- `byId`: Map of alerts by ID
- `allIds`: All alert IDs  
- `unreadIds`: Unread alert IDs
- `readIds`: Read alert IDs
- `unreadCount`: Quick unread counter

**Key Features:**
- Read/unread status management
- Alert categorization (portfolio, price, system, etc.)
- Bulk operations (mark all as read, clear by category)
- Actionable alerts with buttons/links
- Auto-cleanup of old alerts (500 limit)

**Example Usage:**
```typescript
import { selectUnreadAlerts, selectUnreadCount } from '../store/selectors';

const NotificationBell = () => {
  const unreadCount = useAppSelector(selectUnreadCount);
  const criticalAlerts = useAppSelector(selectCriticalAlerts);
  
  return (
    <div className="notification-bell">
      <span className="count">{unreadCount}</span>
      {criticalAlerts.length > 0 && <span className="critical" />}
    </div>
  );
};
```

## Selectors

All selectors are memoized using `createSelector` for optimal performance:

### Base Selectors
- `selectAgentsState`, `selectTasksState`, etc. - Raw state access

### Entity Selectors  
- `selectAllAgents`, `selectAllTasks` - All entities as arrays
- `selectAgentById`, `selectTaskById` - Single entity by ID

### Filtered Selectors
- `selectActiveAgents` - Only active agents
- `selectTasksByStatus` - Tasks filtered by status
- `selectUnreadAlerts` - Only unread notifications

### Computed Selectors
- `selectTaskStats` - Aggregated task statistics
- `selectPortfolioTotals` - Portfolio summary numbers
- `selectSystemHealth` - Overall system health metrics

### Cross-Domain Selectors
- `selectDashboardData` - Combined data for dashboard
- `selectAgentDashboard` - Agent overview with task counts
- `selectSystemHealth` - System-wide health indicators

## Middleware

### Realtime Middleware (`realtimeMiddleware.ts`)
Handles WebSocket connections for live updates from agents and backend services.

**Features:**
- Automatic reconnection with exponential backoff
- Message type routing to appropriate actions
- Bidirectional state synchronization
- Connection error handling with user alerts

**Message Types:**
- `AGENT_STATUS` - Agent status and metrics updates
- `TASK_UPDATE` - Task progress and completion
- `PORTFOLIO_UPDATE` - Position and P&L changes
- `PRICE_UPDATE` - Real-time token price feeds
- `ALERT` - System-generated notifications

## Usage Patterns

### Component Integration
```typescript
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { selectDashboardData } from '../store/selectors';

const Dashboard = () => {
  const dashboardData = useAppSelector(selectDashboardData);
  
  return (
    <div>
      <h1>Portfolio: ${dashboardData.portfolio.totalValue}</h1>
      <p>Active Agents: {dashboardData.activeAgentsCount}</p>
      <p>Running Tasks: {dashboardData.runningTasksCount}</p>
    </div>
  );
};
```

### Dispatching Actions
```typescript
import { addAlert, updateAgentConfig } from '../store/slices/alertsSlice';

const AgentControls = ({ agentId }) => {
  const dispatch = useAppDispatch();
  
  const handleConfigUpdate = (config) => {
    dispatch(updateAgentConfig({ id: agentId, config }));
    
    dispatch(addAlert({
      id: `config-update-${Date.now()}`,
      type: 'success',
      category: 'agent',
      title: 'Configuration Updated',
      message: `Agent ${agentId} configuration has been updated.`,
      timestamp: Date.now(),
      read: false,
      persistent: false,
    }));
  };
};
```

### Selector Composition
```typescript
// Create custom selectors by combining existing ones
const selectAgentPerformance = createSelector(
  [selectAllAgents, selectAllTasks],
  (agents, tasks) => {
    return agents.map(agent => {
      const agentTasks = tasks.filter(task => task.agentId === agent.id);
      const completedTasks = agentTasks.filter(task => task.status === 'completed');
      
      return {
        ...agent,
        totalTasks: agentTasks.length,
        successRate: agentTasks.length > 0 ? completedTasks.length / agentTasks.length : 0,
      };
    });
  }
);
```

## Performance Considerations

1. **Memoization**: All selectors use `createSelector` for automatic memoization
2. **Normalized State**: Data stored in `byId` maps with `allIds` arrays for O(1) lookups
3. **Middleware Optimization**: Real-time updates only dispatch when data actually changes
4. **Cleanup**: Automatic cleanup of old alerts and P&L history to prevent memory leaks
5. **Batching**: Related updates are batched together to minimize re-renders

## Integration with Components

The store is designed to work seamlessly with React components through:

- **Typed Hooks**: `useAppSelector` and `useAppDispatch` provide full TypeScript support
- **Granular Selectors**: Components only re-render when their specific data changes
- **Action Creators**: Type-safe action dispatching with payload validation
- **Real-time Updates**: Automatic UI updates from WebSocket messages

This architecture provides a robust foundation for the AI Portfolio Tracker's state management needs, with excellent performance characteristics and developer experience.
