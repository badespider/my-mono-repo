import { FullConfig } from "@playwright/test";
import { createMockWebSocketServer } from "../src/test/mocks/websocket";

async function globalSetup(config: FullConfig) {
  console.log("🚀 Starting E2E test environment setup...");

  // Start mock WebSocket server for E2E tests
  const mockWSServer = createMockWebSocketServer(8082);
  await mockWSServer.start();

  console.log("✅ Mock WebSocket server started on port 8082");
  console.log("✅ E2E test environment setup complete");

  // Store server instance for cleanup
  process.env.E2E_WS_SERVER_PORT = "8082";
}

export default globalSetup;
