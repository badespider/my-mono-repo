import { FullConfig } from "@playwright/test";
import { closeMockWebSocketServer } from "../src/test/mocks/websocket";

async function globalTeardown(config: FullConfig) {
  console.log("🧹 Starting E2E test environment teardown...");

  // Close mock WebSocket server
  await closeMockWebSocketServer();

  console.log("✅ Mock WebSocket server closed");
  console.log("✅ E2E test environment teardown complete");
}

export default globalTeardown;
