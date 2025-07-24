/**
 * WebSocket service for real-time task and agent updates
 */

import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { Agent, Task } from '../types/workflow';

export interface WebSocketMessage {
  type: 'agentUpdate' | 'taskUpdate';
  data: Agent | Task | any;
  timestamp: Date;
}

export class WebSocketService {
  private wss: WebSocketServer;
  private clients: Set<WebSocket> = new Set();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ 
      server,
      path: '/ws'
    });

    this.wss.on('connection', (ws: WebSocket) => {
      console.log('🔌 New WebSocket client connected');
      this.clients.add(ws);

      // Send initial connection confirmation
      this.sendToClient(ws, {
        type: 'connection' as any,
        data: { message: 'Connected to Portfolio Tracker WebSocket' },
        timestamp: new Date()
      });

      ws.on('close', () => {
        console.log('🔌 WebSocket client disconnected');
        this.clients.delete(ws);
      });

      ws.on('error', (error) => {
        console.error('❌ WebSocket error:', error);
        this.clients.delete(ws);
      });

      // Handle ping/pong for connection health
      ws.on('ping', () => {
        ws.pong();
      });
    });

    console.log('🚀 WebSocket server initialized on /ws');
  }

  /**
   * Send message to a specific client
   */
  private sendToClient(client: WebSocket, message: WebSocketMessage): void {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(JSON.stringify(message));
      } catch (error) {
        console.error('❌ Error sending message to client:', error);
        this.clients.delete(client);
      }
    }
  }

  /**
   * Broadcast message to all connected clients
   */
  private broadcast(message: WebSocketMessage): void {
    const messageStr = JSON.stringify(message);
    const deadClients: WebSocket[] = [];

    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(messageStr);
        } catch (error) {
          console.error('❌ Error broadcasting to client:', error);
          deadClients.push(client);
        }
      } else {
        deadClients.push(client);
      }
    });

    // Clean up dead connections
    deadClients.forEach((client) => {
      this.clients.delete(client);
    });
  }

  /**
   * Broadcast agent update to all clients
   */
  public broadcastAgentUpdate(agent: Agent): void {
    const message: WebSocketMessage = {
      type: 'agentUpdate',
      data: agent,
      timestamp: new Date()
    };

    this.broadcast(message);
    console.log(`📡 Broadcasting agent update: ${agent.id} (${agent.status})`);
  }

  /**
   * Broadcast task update to all clients
   */
  public broadcastTaskUpdate(task: Task): void {
    const message: WebSocketMessage = {
      type: 'taskUpdate',
      data: task,
      timestamp: new Date()
    };

    this.broadcast(message);
    console.log(`📡 Broadcasting task update: ${task.id} (${task.status})`);
  }

  /**
   * Send custom message to all clients
   */
  public broadcastCustomMessage(type: string, data: any): void {
    const message = {
      type: type as any,
      data,
      timestamp: new Date()
    };

    this.broadcast(message);
    console.log(`📡 Broadcasting custom message: ${type}`);
  }

  /**
   * Get count of connected clients
   */
  public getClientCount(): number {
    return this.clients.size;
  }

  /**
   * Close all connections and cleanup
   */
  public close(): void {
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.close();
      }
    });
    this.clients.clear();
    this.wss.close();
    console.log('🔌 WebSocket server closed');
  }
}

// Singleton instance
let wsService: WebSocketService | null = null;

export const initializeWebSocketService = (server: Server): WebSocketService => {
  if (wsService) {
    throw new Error('WebSocket service already initialized');
  }
  wsService = new WebSocketService(server);
  return wsService;
};

export const getWebSocketService = (): WebSocketService => {
  if (!wsService) {
    throw new Error('WebSocket service not initialized');
  }
  return wsService;
};
