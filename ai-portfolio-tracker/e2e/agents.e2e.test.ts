import { test, expect, Page } from "@playwright/test";

// Page Object Model for Agents page
class AgentsPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/agents");
    await this.page.waitForLoadState("networkidle");
  }

  async getAgentCard(agentName: string) {
    return this.page.locator(`[data-testid="agent-card"]`).filter({
      hasText: agentName,
    });
  }

  async startAgent(agentName: string) {
    const agentCard = await this.getAgentCard(agentName);
    await agentCard.locator(`[data-testid="start-agent-btn"]`).click();
  }

  async stopAgent(agentName: string) {
    const agentCard = await this.getAgentCard(agentName);
    await agentCard.locator(`[data-testid="stop-agent-btn"]`).click();
  }

  async getAgentStatus(agentName: string) {
    const agentCard = await this.getAgentCard(agentName);
    return agentCard.locator(`[data-testid="agent-status"]`).textContent();
  }

  async executeRebalance() {
    await this.page.click(`[data-testid="execute-rebalance-btn"]`);
  }

  async waitForAlert() {
    return this.page.waitForSelector(`[data-testid="alert-notification"]`, {
      timeout: 10000,
    });
  }

  async getAlertMessage() {
    const alert = await this.page.locator(`[data-testid="alert-notification"]`);
    return alert.textContent();
  }
}

test.describe("Agent Management E2E Tests", () => {
  let agentsPage: AgentsPage;

  test.beforeEach(async ({ page }) => {
    agentsPage = new AgentsPage(page);
    await agentsPage.goto();
  });

  test("should display all agents on page load", async ({ page }) => {
    // Check if agents are displayed
    await expect(page.locator(`[data-testid="agent-card"]`)).toHaveCount(4);

    // Check specific agents
    await expect(page.getByText("Portfolio Monitor")).toBeVisible();
    await expect(page.getByText("Auto Rebalancer")).toBeVisible();
    await expect(page.getByText("Market Analyzer")).toBeVisible();
    await expect(page.getByText("Alert Manager")).toBeVisible();
  });

  test("should start an inactive agent", async ({ page }) => {
    // Find an inactive agent (Auto Rebalancer should be inactive by default)
    const agentCard = await agentsPage.getAgentCard("Auto Rebalancer");
    
    // Verify initial status
    await expect(agentCard.locator(`[data-testid="agent-status"]`)).toContainText("inactive");

    // Start the agent
    await agentsPage.startAgent("Auto Rebalancer");

    // Wait for status change
    await page.waitForTimeout(1000);

    // Verify status changed to active
    await expect(agentCard.locator(`[data-testid="agent-status"]`)).toContainText("active");
  });

  test("should stop an active agent", async ({ page }) => {
    // Find an active agent (Portfolio Monitor should be active by default)
    const agentCard = await agentsPage.getAgentCard("Portfolio Monitor");
    
    // Verify initial status
    await expect(agentCard.locator(`[data-testid="agent-status"]`)).toContainText("active");

    // Stop the agent
    await agentsPage.stopAgent("Portfolio Monitor");

    // Wait for status change
    await page.waitForTimeout(1000);

    // Verify status changed to inactive
    await expect(agentCard.locator(`[data-testid="agent-status"]`)).toContainText("inactive");
  });

  test("should observe real-time agent status updates", async ({ page }) => {
    // Start observing WebSocket messages
    const wsMessages: any[] = [];
    
    page.on("websocket", (ws) => {
      ws.on("framereceived", (event) => {
        try {
          const message = JSON.parse(event.payload as string);
          wsMessages.push(message);
        } catch (e) {
          // Ignore non-JSON frames
        }
      });
    });

    // Wait for initial connection
    await page.waitForTimeout(2000);

    // Start an agent to trigger status update
    await agentsPage.startAgent("Auto Rebalancer");

    // Wait for WebSocket message
    await page.waitForTimeout(3000);

    // Verify we received agent status update
    const statusUpdates = wsMessages.filter(msg => msg.type === "agentStatusUpdated");
    expect(statusUpdates.length).toBeGreaterThan(0);
  });

  test("should execute portfolio rebalancing", async ({ page }) => {
    // Navigate to portfolio rebalancing section
    await page.click(`[data-testid="rebalancing-tab"]`);

    // Execute rebalance
    await agentsPage.executeRebalance();

    // Wait for confirmation dialog or success message
    await expect(page.locator(`[data-testid="rebalance-confirmation"]`)).toBeVisible();

    // Confirm rebalancing
    await page.click(`[data-testid="confirm-rebalance-btn"]`);

    // Wait for rebalancing to start
    await page.waitForTimeout(2000);

    // Check that rebalancing task appears
    await expect(page.locator(`[data-testid="rebalancing-task"]`)).toBeVisible();
    await expect(page.locator(`[data-testid="task-status"]`)).toContainText("running");
  });

  test("should receive and display alerts", async ({ page }) => {
    // Wait for automatic alert generation (mock server generates alerts periodically)
    const alert = await agentsPage.waitForAlert();
    
    // Verify alert is displayed
    expect(alert).toBeTruthy();

    // Check alert content
    const alertMessage = await agentsPage.getAlertMessage();
    expect(alertMessage).toBeTruthy();
    expect(alertMessage?.length).toBeGreaterThan(0);

    // Verify alert can be dismissed
    await page.click(`[data-testid="dismiss-alert-btn"]`);
    await expect(page.locator(`[data-testid="alert-notification"]`)).toBeHidden();
  });

  test("should display agent metrics and performance data", async ({ page }) => {
    // Click on an agent to view details
    const agentCard = await agentsPage.getAgentCard("Portfolio Monitor");
    await agentCard.click();

    // Wait for agent details modal/page
    await expect(page.locator(`[data-testid="agent-details-modal"]`)).toBeVisible();

    // Check metrics are displayed
    await expect(page.locator(`[data-testid="success-rate"]`)).toBeVisible();
    await expect(page.locator(`[data-testid="execution-time"]`)).toBeVisible();
    await expect(page.locator(`[data-testid="total-executions"]`)).toBeVisible();
    await expect(page.locator(`[data-testid="uptime"]`)).toBeVisible();

    // Check execution history
    await expect(page.locator(`[data-testid="execution-history"]`)).toBeVisible();
    await expect(page.locator(`[data-testid="history-item"]`)).toHaveCount(3); // Based on mock data

    // Close modal
    await page.click(`[data-testid="close-modal-btn"]`);
    await expect(page.locator(`[data-testid="agent-details-modal"]`)).toBeHidden();
  });

  test("should handle agent errors gracefully", async ({ page }) => {
    // Find an agent in error state (Market Analyzer should be in error state)
    const agentCard = await agentsPage.getAgentCard("Market Analyzer");
    
    // Verify error status
    await expect(agentCard.locator(`[data-testid="agent-status"]`)).toContainText("error");

    // Try to start the agent
    await agentsPage.startAgent("Market Analyzer");

    // Should show error message or retry option
    await expect(page.locator(`[data-testid="error-message"]`)).toBeVisible();

    // Verify error details are shown
    const errorMessage = await page.locator(`[data-testid="error-message"]`).textContent();
    expect(errorMessage).toBeTruthy();
  });

  test("should filter agents by status", async ({ page }) => {
    // Click on status filter
    await page.click(`[data-testid="status-filter"]`);

    // Select "Active" filter
    await page.click(`[data-testid="filter-active"]`);

    // Wait for filter to apply
    await page.waitForTimeout(1000);

    // Should only show active agents
    const visibleAgents = page.locator(`[data-testid="agent-card"]:visible`);
    await expect(visibleAgents).toHaveCount(1); // Only Portfolio Monitor should be active initially

    // Clear filter
    await page.click(`[data-testid="clear-filters"]`);
    await expect(page.locator(`[data-testid="agent-card"]`)).toHaveCount(4);
  });

  test("should create a new agent", async ({ page }) => {
    // Click create agent button
    await page.click(`[data-testid="create-agent-btn"]`);

    // Fill out agent creation form
    await page.fill(`[data-testid="agent-name-input"]`, "Test Agent");
    await page.selectOption(`[data-testid="agent-type-select"]`, "monitoring");
    await page.fill(`[data-testid="agent-description-input"]`, "Test agent for E2E testing");

    // Configure agent settings
    await page.fill(`[data-testid="interval-input"]`, "60000");

    // Submit form
    await page.click(`[data-testid="create-agent-submit"]`);

    // Wait for agent to be created
    await page.waitForTimeout(2000);

    // Verify new agent appears in list
    await expect(page.getByText("Test Agent")).toBeVisible();
    await expect(page.locator(`[data-testid="agent-card"]`)).toHaveCount(5);
  });
});
