import { useEffect, useCallback } from "react";
import { useAgentStore } from "../stores/agentStore";
import type { Agent } from "../services/types/api";

const SIMULATION_INTERVAL = 5000; // 5 seconds
const HEARTBEAT_INTERVAL = 15000; // 15 seconds

export function useWebSocketSimulation() {
  const { agents, updateAgent } = useAgentStore();

  // Simulate agent status changes
  const simulateStatusUpdates = useCallback(() => {
    if (agents.length === 0) return;

    const randomAgent = agents[Math.floor(Math.random() * agents.length)];

    // Randomly change status occasionally
    if (Math.random() < 0.1) {
      // 10% chance
      const statuses: Agent["status"][] = [
        "active",
        "inactive",
        "error",
        "maintenance",
      ];
      const currentStatusIndex = statuses.indexOf(randomAgent.status);
      const newStatuses = statuses.filter(
        (_, index) => index !== currentStatusIndex
      );
      const newStatus =
        newStatuses[Math.floor(Math.random() * newStatuses.length)];

      updateAgent(randomAgent.id, {
        status: newStatus,
        updatedAt: new Date().toISOString(),
        metrics: {
          ...randomAgent.metrics,
          lastError:
            newStatus === "error"
              ? "Simulated error: Connection timeout"
              : undefined,
        },
      });
    }

    // Update metrics
    if (Math.random() < 0.3) {
      // 30% chance
      const newMetrics = {
        ...randomAgent.metrics,
        executionCount:
          randomAgent.metrics.executionCount + Math.floor(Math.random() * 5),
        successRate: Math.max(
          0.7,
          Math.min(
            1.0,
            randomAgent.metrics.successRate + (Math.random() - 0.5) * 0.02
          )
        ),
        averageExecutionTime: Math.max(
          50,
          randomAgent.metrics.averageExecutionTime + (Math.random() - 0.5) * 100
        ),
        uptime: randomAgent.metrics.uptime + SIMULATION_INTERVAL / 1000,
      };

      updateAgent(randomAgent.id, {
        metrics: newMetrics,
        updatedAt: new Date().toISOString(),
      });
    }
  }, [agents, updateAgent]);

  // Simulate heartbeat updates
  const simulateHeartbeats = useCallback(() => {
    agents.forEach(agent => {
      if (agent.status === "active" && Math.random() < 0.8) {
        // 80% chance for active agents
        updateAgent(agent.id, {
          lastExecuted: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    });
  }, [agents, updateAgent]);

  // Set up intervals for simulation
  useEffect(() => {
    const statusInterval = setInterval(
      simulateStatusUpdates,
      SIMULATION_INTERVAL
    );
    const heartbeatInterval = setInterval(
      simulateHeartbeats,
      HEARTBEAT_INTERVAL
    );

    return () => {
      clearInterval(statusInterval);
      clearInterval(heartbeatInterval);
    };
  }, [simulateStatusUpdates, simulateHeartbeats]);

  return {
    isSimulating: true,
  };
}
