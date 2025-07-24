# Agent Management Dashboard

A comprehensive dashboard component for managing AI portfolio tracker agents with real-time WebSocket updates.

## Features

### ✨ Core Features
- **Responsive Grid Layout**: Adaptive card grid that scales from 1-4 columns based on screen size
- **Real-time Status Updates**: WebSocket integration for live agent status monitoring
- **Status Badges**: Color-coded badges showing agent states (connected, running, stopped, error)
- **Heartbeat Timestamps**: Last activity timestamps with staleness indicators
- **Performance Metrics**: Success rates, execution counts, uptime, and average execution times
- **Error Handling**: Detailed error messages for failed agents
- **Control Panel Access**: Quick access buttons to agent configuration interfaces

### 🎨 Design Elements
- **Color Coding**: 
  - Green: Active/Connected agents
  - Gray: Inactive/Stopped agents  
  - Red: Error states
  - Orange: Maintenance mode
- **Visual Indicators**:
  - Status strip at the top of each card
  - Icon-based agent type identification
  - Hover effects with smooth transitions
  - Loading skeletons during data fetch

### 📊 Agent Types Supported
- **Monitoring Agents**: Portfolio and asset monitoring
- **Analysis Agents**: Risk analysis, sentiment analysis, performance tracking
- **Rebalancing Agents**: Automated portfolio rebalancing
- **Alert Agents**: Price alerts, stop-loss management, notifications

## Component Structure

```
src/components/agents/
├── AgentManagementDashboard.tsx   # Main dashboard component
└── README.md                      # This documentation
```

## Usage

### Basic Implementation
```tsx
import AgentManagementDashboard from './components/agents/AgentManagementDashboard';

function AgentsPage() {
  const handleOpenControlPanel = (agentId: string) => {
    // Handle control panel opening
    console.log(`Opening control panel for agent: ${agentId}`);
  };

  return (
    <AgentManagementDashboard 
      onOpenControlPanel={handleOpenControlPanel}
    />
  );
}
```

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onOpenControlPanel` | `(agentId: string) => void` | `() => {}` | Callback when control panel button is clicked |

## Data Flow

### WebSocket Integration
The dashboard integrates with the WebSocket service for real-time updates:

```tsx
// WebSocket event handling
const { isConnected, onAgentStatusUpdate } = useWebSocket();

useEffect(() => {
  const unsubscribe = onAgentStatusUpdate((update) => {
    // Handle real-time agent status updates
    setLastUpdate(new Date());
  });
  return unsubscribe;
}, [onAgentStatusUpdate]);
```

### State Management
Uses Zustand store for agent state management:

```tsx
const { 
  agents, 
  isLoading, 
  getAgentsByType 
} = useAgentStore();
```

## Agent Status Mapping

| Status | Display | Color | Description |
|---------|---------|-------|-------------|
| `active` | Connected | Green | Agent is running and operational |
| `inactive` | Stopped | Gray | Agent is stopped/disabled |
| `error` | Error | Red | Agent encountered an error |
| `maintenance` | Maintenance | Orange | Agent is under maintenance |

## Responsive Breakpoints

| Screen Size | Columns | Description |
|-------------|---------|-------------|
| `base` (mobile) | 1 | Single column layout |
| `md` (tablet) | 2 | Two column layout |
| `lg` (desktop) | 3 | Three column layout |
| `xl` (large desktop) | 4 | Four column layout |

## Performance Features

### Loading States
- Skeleton loading animations during data fetch
- Progressive loading of agent cards
- Smooth transitions between states

### Real-time Updates
- WebSocket connection status indicator
- Last update timestamp display
- Automatic re-rendering on data changes

### Optimization
- Memoized components for performance
- Efficient re-rendering with proper dependency arrays
- Responsive design with breakpoint-based column counts

## Metrics Display

Each agent card shows:
- **Success Rate**: Percentage of successful executions
- **Executions**: Total number of task executions
- **Avg. Time**: Average execution time in milliseconds
- **Uptime**: Total uptime in hours
- **Last Heartbeat**: Time since last activity with staleness indication

## Error Handling

- Graceful handling of missing agent data
- Error message display for failed agents
- Fallback states for network issues
- Loading states during data fetching

## Integration with Solana/Virtuals Protocol

The dashboard is designed to work with Solana-based portfolio tracking agents that leverage the Virtuals Protocol for:
- Multi-agent coordination
- Real-time portfolio monitoring
- Automated rebalancing strategies
- Risk management and alerts

## Development Notes

### Testing
The component includes a WebSocket simulation hook for development and testing:

```tsx
// Enable real-time simulation for development
useWebSocketSimulation();
```

### Customization
The dashboard is highly customizable through:
- Chakra UI theme integration
- Color mode support (light/dark themes)
- Responsive design tokens
- Icon and color mappings

### Future Enhancements
- Agent deployment wizard
- Real-time performance charts
- Advanced filtering and sorting
- Bulk agent operations
- Agent template marketplace integration
