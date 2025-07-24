# WebSocket Implementation for Real-time Updates

## Overview

This implementation adds real-time WebSocket functionality to the Portfolio Tracker backend, enabling live updates for task and agent status changes. The system broadcasts JSON messages to connected clients whenever agents or tasks are modified.

## Features

- ✅ WebSocket server on `/ws` endpoint
- ✅ Real-time broadcasting of agent updates
- ✅ Real-time broadcasting of task updates  
- ✅ JSON message format: `{type: 'agentUpdate' | 'taskUpdate', data: ..., timestamp: Date}`
- ✅ Automatic cleanup of disconnected clients
- ✅ Connection health monitoring with ping/pong
- ✅ Test endpoints for simulating updates
- ✅ HTML test client for development

## Architecture

### WebSocket Service (`src/services/websocket.ts`)

- **WebSocketService**: Main service class managing WebSocket connections
- **Singleton pattern**: Single instance shared across the application
- **Connection management**: Tracks connected clients and handles cleanup
- **Broadcasting**: Sends updates to all connected clients

### Integration Points

1. **Main Server** (`src/index.ts`): Initializes WebSocket service on HTTP server
2. **Data Store** (`src/stores/index.ts`): Automatically broadcasts when data changes
3. **Routes**: Standard REST endpoints continue to work normally

## Message Format

All WebSocket messages follow this structure:

```typescript
interface WebSocketMessage {
  type: 'agentUpdate' | 'taskUpdate' | 'connection' | string;
  data: Agent | Task | any;
  timestamp: Date;
}
```

### Message Types

- **`agentUpdate`**: Sent when agent status/config changes
- **`taskUpdate`**: Sent when task status/result changes  
- **`connection`**: Connection status messages
- **Custom types**: Can broadcast any custom message type

## Usage

### Backend Integration

The WebSocket service is automatically initialized when the server starts. No additional setup required.

```typescript
// Agent updates are automatically broadcasted
updateAgent('monitoring-agent', { status: 'active' });

// Task updates are automatically broadcasted  
updateTask('task-123', { status: 'completed', result: {...} });

// Custom broadcasts
const wsService = getWebSocketService();
wsService.broadcastCustomMessage('portfolioUpdate', portfolioData);
```

### Frontend Integration

Connect to the WebSocket endpoint using native WebSocket API:

```javascript
const ws = new WebSocket('ws://localhost:4000/ws');

ws.onmessage = function(event) {
  const message = JSON.parse(event.data);
  
  switch(message.type) {
    case 'agentUpdate':
      console.log('Agent updated:', message.data);
      // Update UI with new agent status
      break;
      
    case 'taskUpdate':
      console.log('Task updated:', message.data);
      // Update UI with new task status
      break;
      
    default:
      console.log('Custom message:', message.type, message.data);
  }
};
```

## API Endpoints

### WebSocket Connection
- **URL**: `ws://localhost:4000/ws`
- **Protocol**: WebSocket
- **Format**: JSON messages

### Test Endpoints (Development)

#### Get WebSocket Status
```http
GET /api/ws-test/status
```

#### Simulate Agent Update
```http
POST /api/ws-test/simulate-agent-update
Content-Type: application/json

{
  "agentId": "monitoring-agent",
  "status": "active"
}
```

#### Simulate Task Creation
```http
POST /api/ws-test/simulate-task-creation
Content-Type: application/json

{
  "agentId": "monitoring-agent", 
  "type": "price_check",
  "priority": "high"
}
```

#### Simulate Task Update
```http
POST /api/ws-test/simulate-task-update
Content-Type: application/json

{
  "taskId": "task-123",
  "status": "completed",
  "result": {"price": 45.67}
}
```

#### Custom Broadcast
```http
POST /api/ws-test/broadcast-custom
Content-Type: application/json

{
  "type": "portfolioUpdate",
  "data": {"totalValue": 125000.50}
}
```

## Testing

### HTML Test Client

1. Start the backend server: `npm run dev`
2. Open `websocket-test-client.html` in a browser
3. Click "Connect to WebSocket"
4. Use the test controls to simulate updates

### Manual Testing with curl

```bash
# Update agent status
curl -X POST http://localhost:4000/api/ws-test/simulate-agent-update \
  -H "Content-Type: application/json" \
  -d '{"agentId": "monitoring-agent", "status": "active"}'

# Create task
curl -X POST http://localhost:4000/api/ws-test/simulate-task-creation \
  -H "Content-Type: application/json" \
  -d '{"agentId": "monitoring-agent", "type": "price_check", "priority": "high"}'
```

## Error Handling

- **Connection Errors**: Automatic client cleanup on disconnect
- **Send Errors**: Failed sends remove client from active list
- **Parse Errors**: Invalid JSON messages are logged but don't crash server
- **Service Unavailable**: Graceful fallback when WebSocket not initialized

## Production Considerations

1. **Scaling**: Current implementation uses in-memory client tracking
2. **Authentication**: No authentication implemented (add JWT/session validation)
3. **Rate Limiting**: Consider limiting broadcast frequency for high-volume updates
4. **Message Queuing**: Add Redis/message queue for distributed deployments
5. **Monitoring**: Add metrics for connection count, message volume, errors

## File Structure

```
packages/backend/src/
├── services/
│   └── websocket.ts           # WebSocket service implementation
├── routes/
│   └── websocket-test.ts      # Test endpoints
├── stores/
│   └── index.ts               # Data store with broadcasting
└── index.ts                   # Server setup with WebSocket init

packages/backend/
├── websocket-test-client.html # HTML test client
└── WebSocket_Implementation.md # This documentation
```

## Dependencies

- `ws`: WebSocket library for Node.js
- `@types/ws`: TypeScript definitions

Added to `package.json`:
```json
{
  "dependencies": {
    "ws": "^8.14.2"
  },
  "devDependencies": {
    "@types/ws": "^8.5.8"
  }
}
```

## Next Steps

1. **Frontend Integration**: Update React components to connect to WebSocket
2. **Authentication**: Add user session validation for WebSocket connections
3. **Message Persistence**: Store important messages for offline clients
4. **Real Agent Implementation**: Connect to actual Solana/Virtuals Protocol agents
5. **Performance Monitoring**: Add WebSocket metrics and monitoring
