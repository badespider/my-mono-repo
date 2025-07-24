import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AgentControlPanel } from "../AgentControlPanel";
import type { Agent } from "../../../services/types/api";

// Mock the agents service
vi.mock("../../../services/agents/agentsService", () => ({
  agentsService: {
    startAgent: vi.fn(),
    stopAgent: vi.fn(),
    restartAgent: vi.fn(),
    getAgentMetrics: vi.fn(),
  },
}));

// Mock Chakra UI provider
vi.mock("../../../providers/ChakraProvider", () => ({
  ChakraProvider: ({ children }: { children: React.ReactNode }) => children,
}));

const mockAgent: Agent = {
  id: "agent-1",
  name: "Test Agent",
  type: "monitoring",
  status: "active",
  description: "Test agent for unit testing",
  config: {
    interval: 30000,
  },
  metrics: {
    successRate: 0.95,
    averageExecutionTime: 250,
    totalExecutions: 100,
    uptime: 0.99,
  },
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-15T12:00:00.000Z",
};

describe("AgentControlPanel", () => {
  const mockOnStatusChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders agent information correctly", () => {
    render(
      <AgentControlPanel agent={mockAgent} onStatusChange={mockOnStatusChange} />
    );

    expect(screen.getByText("Test Agent")).toBeInTheDocument();
    expect(screen.getByText("Test agent for unit testing")).toBeInTheDocument();
    expect(screen.getByText("active")).toBeInTheDocument();
  });

  it("displays agent metrics", () => {
    render(
      <AgentControlPanel agent={mockAgent} onStatusChange={mockOnStatusChange} />
    );

    expect(screen.getByText("95%")).toBeInTheDocument(); // Success rate
    expect(screen.getByText("250ms")).toBeInTheDocument(); // Avg execution time
    expect(screen.getByText("100")).toBeInTheDocument(); // Total executions
    expect(screen.getByText("99%")).toBeInTheDocument(); // Uptime
  });

  it("shows stop button for active agent", () => {
    render(
      <AgentControlPanel agent={mockAgent} onStatusChange={mockOnStatusChange} />
    );

    const stopButton = screen.getByRole("button", { name: /stop/i });
    expect(stopButton).toBeInTheDocument();
    expect(stopButton).not.toBeDisabled();
  });

  it("shows start button for inactive agent", () => {
    const inactiveAgent = { ...mockAgent, status: "inactive" as const };

    render(
      <AgentControlPanel agent={inactiveAgent} onStatusChange={mockOnStatusChange} />
    );

    const startButton = screen.getByRole("button", { name: /start/i });
    expect(startButton).toBeInTheDocument();
    expect(startButton).not.toBeDisabled();
  });

  it("handles start agent action", async () => {
    const { agentsService } = await import("../../../services/agents/agentsService");
    const startAgentSpy = vi.mocked(agentsService.startAgent);
    startAgentSpy.mockResolvedValue({ ...mockAgent, status: "active" });

    const inactiveAgent = { ...mockAgent, status: "inactive" as const };

    render(
      <AgentControlPanel agent={inactiveAgent} onStatusChange={mockOnStatusChange} />
    );

    const startButton = screen.getByRole("button", { name: /start/i });
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(startAgentSpy).toHaveBeenCalledWith("agent-1");
      expect(mockOnStatusChange).toHaveBeenCalledWith("agent-1", "active");
    });
  });

  it("handles stop agent action", async () => {
    const { agentsService } = await import("../../../services/agents/agentsService");
    const stopAgentSpy = vi.mocked(agentsService.stopAgent);
    stopAgentSpy.mockResolvedValue({ ...mockAgent, status: "inactive" });

    render(
      <AgentControlPanel agent={mockAgent} onStatusChange={mockOnStatusChange} />
    );

    const stopButton = screen.getByRole("button", { name: /stop/i });
    fireEvent.click(stopButton);

    await waitFor(() => {
      expect(stopAgentSpy).toHaveBeenCalledWith("agent-1");
      expect(mockOnStatusChange).toHaveBeenCalledWith("agent-1", "inactive");
    });
  });

  it("handles restart agent action", async () => {
    const { agentsService } = await import("../../../services/agents/agentsService");
    const restartAgentSpy = vi.mocked(agentsService.restartAgent);
    restartAgentSpy.mockResolvedValue(mockAgent);

    render(
      <AgentControlPanel agent={mockAgent} onStatusChange={mockOnStatusChange} />
    );

    const restartButton = screen.getByRole("button", { name: /restart/i });
    fireEvent.click(restartButton);

    await waitFor(() => {
      expect(restartAgentSpy).toHaveBeenCalledWith("agent-1");
      expect(mockOnStatusChange).toHaveBeenCalledWith("agent-1", "active");
    });
  });

  it("shows error state for agent with error status", () => {
    const errorAgent = { ...mockAgent, status: "error" as const };

    render(
      <AgentControlPanel agent={errorAgent} onStatusChange={mockOnStatusChange} />
    );

    expect(screen.getByText("error")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /restart/i })).toBeInTheDocument();
  });

  it("disables controls when agent is in transitioning state", () => {
    const loadingAgent = { ...mockAgent, status: "starting" as const };

    render(
      <AgentControlPanel agent={loadingAgent} onStatusChange={mockOnStatusChange} />
    );

    const buttons = screen.getAllByRole("button");
    buttons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });

  it("handles API errors gracefully", async () => {
    const { agentsService } = await import("../../../services/agents/agentsService");
    const startAgentSpy = vi.mocked(agentsService.startAgent);
    startAgentSpy.mockRejectedValue(new Error("API Error"));

    const inactiveAgent = { ...mockAgent, status: "inactive" as const };

    render(
      <AgentControlPanel agent={inactiveAgent} onStatusChange={mockOnStatusChange} />
    );

    const startButton = screen.getByRole("button", { name: /start/i });
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getByText(/error starting agent/i)).toBeInTheDocument();
    });
  });

  it("shows agent type badge", () => {
    render(
      <AgentControlPanel agent={mockAgent} onStatusChange={mockOnStatusChange} />
    );

    expect(screen.getByText("monitoring")).toBeInTheDocument();
  });

  it("formats uptime correctly", () => {
    const agentWithLowUptime = {
      ...mockAgent,
      metrics: {
        ...mockAgent.metrics,
        uptime: 0.8567, // 85.67%
      },
    };

    render(
      <AgentControlPanel agent={agentWithLowUptime} onStatusChange={mockOnStatusChange} />
    );

    expect(screen.getByText("86%")).toBeInTheDocument();
  });
});
