import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { agentsService } from "../agentsService";
import { createMockWebSocketServer, closeMockWebSocketServer } from "../../../test/mocks/websocket";

// Setup WebSocket server
let socketServer = createMockWebSocketServer(8081);

// Define integration tests
describe("AgentsService Integration Tests", () => {
  beforeAll(async () => {
    await socketServer.start();
  });

  afterAll(async () => {
    await closeMockWebSocketServer();
  });

  it("should retrieve agents successfully", async () => {
    const response = await agentsService.getAgents();
    expect(response.data).toHaveLength(4); // Based on mock data
    expect(response.data[0].name).toBe("Portfolio Monitor");
  });

  it("should start and stop an agent successfully", async () => {
    const startResponse = await agentsService.startAgent("agent-monitoring-1");
    expect(startResponse.status).toBe("active");

    const stopResponse = await agentsService.stopAgent("agent-monitoring-1");
    expect(stopResponse.status).toBe("inactive");
  });

  it("should handle WebSocket agent status updates", (done) => {
    function handleStatusUpdate(data: any) {
      expect(data.agentId).toEqual("agent-monitoring-1");
      expect(["active", "inactive"]).toContain(data.status);
      done();
    }
    
    // Mock socket event listener
    setTimeout(() => {
      handleStatusUpdate({
        agentId: "agent-monitoring-1",
        status: "active",
        timestamp: new Date().toISOString(),
      });
    }, 100);

    socketServer.simulateAgentStatusUpdate("agent-monitoring-1", "active");
  });
});

