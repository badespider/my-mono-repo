import { describe, it, expect, beforeEach } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../../../test/setup";
import { agentsService } from "../agentsService";

interface MockedResponse extends Response {
  json(): Promise<Record<string, any>>;
}

describe("AgentsService", () => {
  // Setup mocks
  beforeEach(() => {
    // Reset handlers
    server.resetHandlers();
  });

  it("should fetch all agents", async () => {
    // Mock server response
    server.use(
      http.get("/api/agents", () => {
        return HttpResponse.json({
          data: [
            {
              id: "agent-1",
              name: "Agent 1",
              status: "active",
            },
          ],
          meta: { total: 1 },
        });
      })
    );

    const response = await agentsService.getAgents();
    
    expect(response.data).toHaveLength(1);
    expect(response.data[0].status).toBe("active");
  });

  it("should handle server error when fetching agents", async () => {
    // Mock server error
    server.use(
      rest.get("/agents", (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    try {
      await agentsService.getAgents();
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it("should start an agent", async () => {
    // Mock server response
    server.use(
      rest.post("/agents/:id/start", (req, res, ctx) => {
        const { id } = req.params;

        return res(
          ctx.json({
            id,
            status: "active",
          })
        );
      })
    );

    const response = await agentsService.startAgent("agent-1");
    const agent = await (response as MockedResponse).json();

    expect(agent.status).toBe("active");
  });

  it("should throw error if starting agent fails", async () => {
    // Mock server error
    server.use(
      rest.post("/agents/:id/start", (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    try {
      await agentsService.startAgent("agent-1");
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});

