import "@testing-library/jest-dom";
import { setupServer } from "msw/node";
import { handlers } from "./mocks/handlers";
import { beforeAll, afterEach, afterAll } from "vitest";

// Setup MSW server
const server = setupServer(...handlers);

// Start server before all tests
beforeAll(() => {
  server.listen({
    onUnhandledRequest: "error",
  });
});

// Reset handlers after each test
afterEach(() => {
  server.resetHandlers();
});

// Close server after all tests
afterAll(() => {
  server.close();
});

// Mock IntersectionObserver
Object.defineProperty(global, "IntersectionObserver", {
  writable: true,
  value: class MockIntersectionObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    unobserve() {}
  },
});

// Mock ResizeObserver
Object.defineProperty(global, "ResizeObserver", {
  writable: true,
  value: class MockResizeObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    unobserve() {}
  },
});

// Mock matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock WebSocket
class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  readyState = MockWebSocket.CONNECTING;
  url: string;
  onopen: ((event: Event) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;

  constructor(url: string) {
    this.url = url;
    
    // Simulate connection after a short delay
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN;
      if (this.onopen) {
        this.onopen(new Event("open"));
      }
    }, 10);
  }

  send(data: string | ArrayBuffer | Blob | ArrayBufferView) {
    // Mock sending data
    console.log("MockWebSocket send:", data);
  }

  close(code?: number, reason?: string) {
    this.readyState = MockWebSocket.CLOSED;
    if (this.onclose) {
      this.onclose(new CloseEvent("close", { code, reason }));
    }
  }

  addEventListener(type: string, listener: EventListener) {
    if (type === "open") this.onopen = listener as any;
    if (type === "close") this.onclose = listener as any;
    if (type === "message") this.onmessage = listener as any;
    if (type === "error") this.onerror = listener as any;
  }

  removeEventListener(type: string, listener: EventListener) {
    if (type === "open") this.onopen = null;
    if (type === "close") this.onclose = null;
    if (type === "message") this.onmessage = null;
    if (type === "error") this.onerror = null;
  }
}

// Replace global WebSocket with mock
(global as any).WebSocket = MockWebSocket;

// Mock Chart.js for portfolio chart components
vi.mock("chart.js", () => ({
  Chart: {
    register: vi.fn(),
  },
  CategoryScale: vi.fn(),
  LinearScale: vi.fn(),
  PointElement: vi.fn(),
  LineElement: vi.fn(),
  Title: vi.fn(),
  Tooltip: vi.fn(),
  Legend: vi.fn(),
}));

// Mock framer-motion for animations
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => children,
    span: ({ children, ...props }: any) => children,
    button: ({ children, ...props }: any) => children,
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Export server for test-specific configuration
export { server };
