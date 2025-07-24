import { Middleware } from "@reduxjs/toolkit";
import { RootState } from "../index";
import { updateAgentStatus, updateAgentMetrics } from "../slices/agentsSlice";
import {
  updateTaskProgress,
  startTask,
  completeTask,
  failTask,
} from "../slices/tasksSlice";
import { updatePosition, addPnLHistory } from "../slices/portfolioSlice";
import { addAlert } from "../slices/alertsSlice";

export interface RealtimeMessage {
  type:
    | "AGENT_STATUS"
    | "TASK_UPDATE"
    | "PORTFOLIO_UPDATE"
    | "PRICE_UPDATE"
    | "ALERT";
  payload: any;
  timestamp: number;
}

// WebSocket connection management
class RealtimeConnection {
  private ws: WebSocket | null = null;
  private reconnectInterval: number = 5000;
  private maxReconnectAttempts: number = 10;
  private reconnectAttempts: number = 0;
  private dispatch: any = null;

  connect(dispatch: any, wsUrl: string = "ws://localhost:8080/ws") {
    this.dispatch = dispatch;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log("WebSocket connected");
        this.reconnectAttempts = 0;

        // Send initial subscription message
        this.send({
          type: "SUBSCRIBE",
          channels: ["agents", "tasks", "portfolio", "alerts"],
        });
      };

      this.ws.onmessage = event => {
        try {
          const message: RealtimeMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };

      this.ws.onclose = () => {
        console.log("WebSocket disconnected");
        this.attemptReconnect();
      };

      this.ws.onerror = error => {
        console.error("WebSocket error:", error);
      };
    } catch (error) {
      console.error("Failed to connect to WebSocket:", error);
      this.attemptReconnect();
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
      );

      setTimeout(() => {
        this.connect(this.dispatch);
      }, this.reconnectInterval);
    } else {
      console.error("Max reconnection attempts reached");

      // Dispatch connection error alert
      if (this.dispatch) {
        this.dispatch(
          addAlert({
            id: `ws-error-${Date.now()}`,
            type: "error",
            category: "system",
            title: "Connection Lost",
            message:
              "Lost connection to real-time data service. Please refresh the page.",
            timestamp: Date.now(),
            read: false,
            persistent: true,
          })
        );
      }
    }
  }

  private handleMessage(message: RealtimeMessage) {
    if (!this.dispatch) return;

    switch (message.type) {
      case "AGENT_STATUS":
        this.dispatch(
          updateAgentStatus({
            id: message.payload.agentId,
            status: message.payload.status,
            errorMessage: message.payload.error,
          })
        );

        if (message.payload.metrics) {
          this.dispatch(
            updateAgentMetrics({
              id: message.payload.agentId,
              metrics: message.payload.metrics,
            })
          );
        }
        break;

      case "TASK_UPDATE":
        const { taskId, status, progress, result, error } = message.payload;

        if (status === "running" && progress) {
          this.dispatch(updateTaskProgress({ id: taskId, progress }));
        } else if (status === "completed") {
          this.dispatch(completeTask({ id: taskId, result }));
        } else if (status === "failed") {
          this.dispatch(failTask({ id: taskId, error }));
        } else if (status === "running") {
          this.dispatch(startTask(taskId));
        }
        break;

      case "PORTFOLIO_UPDATE":
        if (message.payload.positions) {
          message.payload.positions.forEach((position: any) => {
            this.dispatch(updatePosition(position));
          });
        }

        if (message.payload.pnlHistory) {
          this.dispatch(addPnLHistory(message.payload.pnlHistory));
        }
        break;

      case "PRICE_UPDATE":
        // Handle real-time price updates
        if (message.payload.tokenPrices) {
          // Update positions with new prices
          Object.entries(message.payload.tokenPrices).forEach(
            ([tokenAddress, price]) => {
              // This would typically trigger a recalculation of position values
              console.log(`Price update for ${tokenAddress}: ${price}`);
            }
          );
        }
        break;

      case "ALERT":
        this.dispatch(
          addAlert({
            id: message.payload.id || `alert-${Date.now()}`,
            type: message.payload.type || "info",
            category: message.payload.category || "system",
            title: message.payload.title,
            message: message.payload.message,
            timestamp: message.payload.timestamp || Date.now(),
            read: false,
            persistent: message.payload.persistent || false,
            agentId: message.payload.agentId,
            relatedEntityId: message.payload.relatedEntityId,
            metadata: message.payload.metadata,
            actions: message.payload.actions,
          })
        );
        break;

      default:
        console.warn("Unknown message type:", message.type);
    }
  }

  send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

// Create singleton instance
const realtimeConnection = new RealtimeConnection();

// Middleware
export const realtimeMiddleware: Middleware<{}, RootState> =
  store => next => action => {
    const result = next(action);

    // Initialize connection on store creation
    if (
      action.type === "@@INIT" ||
      action.type === "@reduxjs/toolkit/query/init"
    ) {
      if (!realtimeConnection.isConnected()) {
        realtimeConnection.connect(store.dispatch);
      }
    }

    // Handle outgoing actions that should be sent to the server
    if (
      action.type.startsWith("agents/") ||
      action.type.startsWith("tasks/") ||
      action.type.startsWith("portfolio/")
    ) {
      // Send relevant actions to the server for synchronization
      if (realtimeConnection.isConnected()) {
        realtimeConnection.send({
          type: "STATE_UPDATE",
          action: action,
          timestamp: Date.now(),
        });
      }
    }

    return result;
  };

export { realtimeConnection };
