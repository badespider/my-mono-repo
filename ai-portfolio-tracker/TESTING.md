# Testing Guide for AI Portfolio Tracker

This document provides comprehensive information about the testing strategy, setup, and guidelines for the AI Portfolio Tracker project.

## Table of Contents

- [Testing Strategy](#testing-strategy)
- [Test Types](#test-types)
- [Test Setup](#test-setup)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Mocking Strategy](#mocking-strategy)
- [Coverage Requirements](#coverage-requirements)
- [CI/CD Integration](#cicd-integration)
- [Debugging Tests](#debugging-tests)

## Testing Strategy

Our testing strategy follows the testing pyramid approach:

1. **Unit Tests (70%)** - Fast, isolated tests for individual functions and components
2. **Integration Tests (20%)** - Tests for service interactions and API integrations
3. **E2E Tests (10%)** - Full user journey tests with real browser automation

## Test Types

### Unit Tests

- **Location**: `src/**/*.unit.test.{ts,tsx}`
- **Purpose**: Test individual functions, components, and services in isolation
- **Tools**: Vitest, React Testing Library, MSW
- **Coverage**: Aim for 80%+ coverage

#### Examples:
- Component rendering and user interactions
- Service method functionality
- Utility function logic
- Hook behavior

### Integration Tests

- **Location**: `src/**/*.integration.test.{ts,tsx}`
- **Purpose**: Test interactions between multiple components/services
- **Tools**: Vitest, MSW, Mock WebSocket Server
- **Coverage**: Focus on critical user flows

#### Examples:
- API service integration with UI components
- WebSocket real-time data flow
- Store state management integration
- Cross-component communication

### End-to-End Tests

- **Location**: `e2e/**/*.e2e.test.ts`
- **Purpose**: Test complete user journeys in a real browser
- **Tools**: Playwright
- **Coverage**: Critical business flows

#### Examples:
- Agent start/stop operations
- Portfolio rebalancing workflow
- Real-time alert notifications
- User authentication flows

## Test Setup

### Prerequisites

```bash
# Install dependencies
npm ci

# Install Playwright browsers (for E2E tests)
npx playwright install
```

### Configuration Files

- **Vitest**: `vitest.config.ts` - Unit and integration test configuration
- **Playwright**: `playwright.config.ts` - E2E test configuration
- **Test Setup**: `src/test/setup.ts` - Global test setup and mocks

### Mock Services

#### Mock Service Worker (MSW)
- **Location**: `src/test/mocks/handlers.ts`
- **Purpose**: Mock HTTP requests for testing
- **Usage**: Automatically configured in test setup

#### WebSocket Mock Server
- **Location**: `src/test/mocks/websocket.ts`
- **Purpose**: Mock WebSocket connections for real-time features
- **Usage**: Started/stopped in integration tests

## Running Tests

### Command Reference

```bash
# Run all tests
npm run test:all

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run E2E tests only
npm run test:e2e

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test

# Run tests with UI
npm run test:ui

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in headed mode (visible browser)
npm run test:e2e:headed
```

### Test Filtering

```bash
# Run specific test file
npx vitest src/services/agents/agentsService.unit.test.ts

# Run tests matching pattern
npx vitest --grep "should start agent"

# Run tests for specific component
npx playwright test --grep "Agent Management"
```

## Writing Tests

### Unit Test Guidelines

```typescript
// Good unit test structure
describe("AgentsService", () => {
  beforeEach(() => {
    // Setup for each test
    server.resetHandlers();
  });

  it("should start an agent successfully", async () => {
    // Arrange
    server.use(
      http.post("/api/agents/:id/start", () => {
        return HttpResponse.json({ status: "active" });
      })
    );

    // Act
    const result = await agentsService.startAgent("agent-1");

    // Assert
    expect(result.status).toBe("active");
  });
});
```

### Integration Test Guidelines

```typescript
// Good integration test structure
describe("AgentsService Integration", () => {
  let mockWSServer: MockWebSocketServer;

  beforeAll(async () => {
    mockWSServer = createMockWebSocketServer(8081);
    await mockWSServer.start();
  });

  afterAll(async () => {
    await closeMockWebSocketServer();
  });

  it("should handle real-time agent status updates", async () => {
    // Test WebSocket integration with API calls
    const response = await agentsService.startAgent("agent-1");
    
    // Simulate WebSocket event
    mockWSServer.simulateAgentStatusUpdate("agent-1", "active");
    
    // Assert integration behavior
    expect(response.status).toBe("active");
  });
});
```

### E2E Test Guidelines

```typescript
// Good E2E test structure
test.describe("Agent Management", () => {
  test("should start and stop agents", async ({ page }) => {
    // Navigate to agents page
    await page.goto("/agents");
    
    // Interact with UI
    await page.click('[data-testid="start-agent-btn"]');
    
    // Assert UI changes
    await expect(page.locator('[data-testid="agent-status"]'))
      .toContainText("active");
  });
});
```

## Mocking Strategy

### API Mocking with MSW

```typescript
// Define API handlers
export const handlers = [
  http.get("/api/agents", () => {
    return HttpResponse.json({
      data: mockAgents,
      meta: { total: mockAgents.length }
    });
  }),
];
```

### Component Mocking

```typescript
// Mock external dependencies
vi.mock("chart.js", () => ({
  Chart: { register: vi.fn() },
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children }: any) => children,
  },
}));
```

### WebSocket Mocking

```typescript
// Mock WebSocket for unit tests
class MockWebSocket {
  constructor(url: string) {
    // Mock implementation
  }
  send(data: string) {}
  close() {}
}

(global as any).WebSocket = MockWebSocket;
```

## Coverage Requirements

### Minimum Coverage Thresholds

- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

### Coverage Reports

```bash
# Generate coverage report
npm run test:coverage

# View HTML coverage report
open coverage/index.html
```

### Coverage Exclusions

Files excluded from coverage requirements:
- Test files (`**/*.test.{ts,tsx}`)
- Type definitions (`**/*.d.ts`)
- Configuration files (`**/*.config.{js,ts}`)
- Mock files (`src/test/mocks/**`)

## CI/CD Integration

### GitHub Actions Workflow

The CI pipeline runs tests in the following order:

1. **Lint** - Code quality checks
2. **Unit Tests** - Fast isolated tests
3. **Integration Tests** - Service integration tests
4. **Build** - Application build verification
5. **E2E Tests** - Full user journey tests
6. **Security** - Dependency vulnerability checks

### Test Artifacts

- **Unit/Integration Coverage**: Uploaded to Codecov
- **E2E Test Reports**: Playwright HTML reports
- **E2E Test Videos**: Failed test recordings
- **Screenshots**: Failure screenshots

## Debugging Tests

### Debugging Unit Tests

```bash
# Run tests with debugger
npx vitest --inspect-brk

# Run specific test with logs
DEBUG=* npx vitest specific-test.ts
```

### Debugging E2E Tests

```bash
# Run with headed browser
npm run test:e2e:headed

# Run with debug mode
npx playwright test --debug

# Record test execution
npx playwright codegen localhost:3000
```

### Common Issues

#### MSW Handler Not Working
```typescript
// Ensure handlers are properly configured
beforeEach(() => {
  server.resetHandlers();
});
```

#### WebSocket Mock Issues
```typescript
// Verify WebSocket mock is properly initialized
beforeAll(async () => {
  mockWSServer = createMockWebSocketServer(8081);
  await mockWSServer.start();
});
```

#### Playwright Timeouts
```typescript
// Increase timeout for slow operations
test("slow test", async ({ page }) => {
  test.setTimeout(60000); // 60 seconds
  // ... test code
});
```

## Best Practices

### Test Organization

1. **File Naming**: Use descriptive names with appropriate suffixes
2. **Test Structure**: Follow Arrange-Act-Assert pattern
3. **Test Isolation**: Each test should be independent
4. **Descriptive Names**: Test names should clearly describe the scenario

### Test Data Management

1. **Mock Data**: Use realistic but minimal test data
2. **Data Builders**: Create helper functions for complex test data
3. **Cleanup**: Ensure tests clean up after themselves

### Performance Considerations

1. **Parallel Execution**: Configure tests to run in parallel when possible
2. **Mock Heavy Operations**: Mock expensive operations like API calls
3. **Test Timeouts**: Set appropriate timeouts for different test types

### Accessibility Testing

1. **Screen Reader Testing**: Use accessible queries in tests
2. **Keyboard Navigation**: Test keyboard accessibility
3. **ARIA Labels**: Verify proper ARIA attributes

## Contributing

When adding new features:

1. Write tests before implementation (TDD)
2. Ensure all test types are covered
3. Update test documentation
4. Verify CI pipeline passes
5. Maintain coverage thresholds

For questions or issues with testing, please refer to the team documentation or reach out to the development team.
