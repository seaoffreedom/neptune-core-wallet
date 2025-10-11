# Production-Ready Testing Infrastructure

## Overview

This document outlines the comprehensive testing infrastructure implemented for the Neptune Core Wallet project, following industry best practices for production-ready applications.

## Testing Stack

### Core Testing Framework

- **Vitest** - Modern, fast test runner with excellent TypeScript support
- **Playwright** - Cross-browser E2E testing with Electron support
- **React Testing Library** - Simple and complete React component testing
- **Jest DOM** - Custom matchers for DOM testing

### Why These Choices?

#### Vitest over Jest

- **Faster execution** - Native ESM support, faster startup
- **Better TypeScript integration** - Built-in TypeScript support
- **Modern tooling** - Works seamlessly with Vite
- **Active development** - More modern and actively maintained

#### Playwright over Cypress

- **Cross-browser testing** - Chrome, Firefox, Safari, Edge
- **Better Electron support** - Native Electron testing capabilities
- **More stable** - Less flaky than Cypress
- **Better debugging** - Superior debugging tools and trace viewer

## Architecture

### Test Organization

```
├── src/test/                    # Test utilities and setup
│   ├── setup.ts                # Global test configuration
│   ├── utils/                  # Test utilities and helpers
│   │   └── test-utils.tsx      # Custom render function
│   └── mocks/                  # Mock implementations
│       └── electron-api.mock.ts # Electron API mocks
├── src/components/__tests__/    # Component unit tests
├── src/main/services/__tests__/ # Service unit tests
├── tests/e2e/                  # End-to-end tests
│   ├── global-setup.ts         # E2E global setup
│   ├── global-teardown.ts      # E2E global teardown
│   └── *.spec.ts               # E2E test files
├── vitest.config.ts            # Vitest configuration
└── playwright.config.ts        # Playwright configuration
```

### Test Types

#### 1. Unit Tests

- **Purpose**: Test individual functions and components in isolation
- **Framework**: Vitest + React Testing Library
- **Coverage**: 80% minimum threshold
- **Location**: `src/**/__tests__/`

#### 2. Integration Tests

- **Purpose**: Test interactions between components and services
- **Framework**: Vitest + React Testing Library
- **Coverage**: Included in unit test coverage
- **Location**: `src/**/__tests__/`

#### 3. End-to-End Tests

- **Purpose**: Test complete user workflows
- **Framework**: Playwright
- **Coverage**: Critical user journeys
- **Location**: `tests/e2e/`

## Configuration

### Vitest Configuration (`vitest.config.ts`)

```typescript
export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
});
```

### Playwright Configuration (`playwright.config.ts`)

```typescript
export default defineConfig({
  testDir: "./tests/e2e",
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
  webServer: {
    command: "pnpm start",
    url: "http://localhost:3000",
  },
});
```

## Mocking Strategy

### Electron API Mocking

```typescript
// Comprehensive Electron API mock
export const mockElectronAPI = {
  invoke: vi.fn(),
  wallet: { getBalance: vi.fn() },
  blockchain: { getBlockHeight: vi.fn() },
  system: { getSystemStats: vi.fn() },
  // ... all other APIs
};
```

### Store Mocking

```typescript
// Zustand store mocks
vi.mock("@/store/onchain.store", () => ({
  useOnchainStore: vi.fn(() => ({
    balance: "1000.0",
    isLoading: false,
    error: null,
  })),
}));
```

### Service Mocking

```typescript
// Service layer mocks
vi.mock("ky", () => ({
  default: { post: vi.fn() },
}));
```

## Test Utilities

### Custom Render Function

```typescript
// Automatically includes all providers
const customRender = (ui: ReactElement, options?: RenderOptions) => {
  return render(ui, { wrapper: AllTheProviders, ...options });
};
```

### Mock Data Factories

```typescript
// Consistent test data generation
export const mockData = {
  wallet: () => ({ address: "test-address", balance: "1000.0" }),
  transaction: () => ({ id: "test-tx", amount: "100.0" }),
  // ... other factories
};
```

### Helper Functions

```typescript
// Common test utilities
export const mockSuccessfulRPC = (data: unknown) => {
  mockElectronAPI.invoke.mockResolvedValue(data);
};

export const waitFor = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
```

## CI/CD Integration

### GitHub Actions Workflow

```yaml
- name: Run unit tests
  run: pnpm test:run --coverage

- name: Run E2E tests
  run: pnpm test:e2e

- name: Upload coverage
  uses: codecov/codecov-action@v4
```

### Test Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:all": "pnpm test:run && pnpm test:e2e",
    "test:ci": "pnpm test:run --coverage && pnpm test:e2e"
  }
}
```

## Best Practices

### Test Organization

1. **Group related tests** in `describe` blocks
2. **Use descriptive test names** that explain the behavior
3. **Keep tests focused** on single responsibilities
4. **Arrange-Act-Assert** pattern for test structure

### Mocking Guidelines

1. **Mock external dependencies** (APIs, file system, etc.)
2. **Use consistent mock data** with factories
3. **Reset mocks** between tests
4. **Mock at the right level** (service layer, not implementation)

### E2E Testing

1. **Test critical user journeys** end-to-end
2. **Use stable selectors** (`data-testid` attributes)
3. **Wait for elements** instead of using `sleep`
4. **Clean up test data** after tests

### Performance

1. **Keep unit tests fast** (< 100ms per test)
2. **Run tests in parallel** when possible
3. **Minimize test data setup** time
4. **Use appropriate timeouts** for E2E tests

## Coverage Requirements

### Minimum Thresholds

- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

### Coverage Reports

- **HTML Report**: `coverage/index.html`
- **JSON Report**: `coverage/coverage-final.json`
- **LCOV Report**: `coverage/lcov.info`

## Security Testing

### Input Validation

- Test all user inputs for proper validation
- Verify sanitization of user data
- Test edge cases and boundary conditions

### Authentication

- Test login/logout flows
- Verify session management
- Test permission boundaries

### Data Protection

- Test wallet file encryption
- Verify private key handling
- Test secure storage mechanisms

## Accessibility Testing

### Automated Testing

```typescript
import { axe, toHaveNoViolations } from "jest-axe";

test("should not have accessibility violations", async () => {
  const { container } = render(<MyComponent />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Manual Testing

- Keyboard navigation
- Screen reader compatibility
- Color contrast ratios
- Focus management

## Debugging

### Unit Tests

```bash
# Debug specific test
pnpm test --inspect-brk balance-card.test.tsx

# Run with UI
pnpm test:ui

# Watch mode
pnpm test:watch
```

### E2E Tests

```bash
# Debug mode
pnpm test:e2e:debug

# Headed mode (visible browser)
pnpm test:e2e:headed

# UI mode
pnpm test:e2e:ui
```

## Maintenance

### Regular Updates

- Keep testing dependencies updated
- Review and update test coverage thresholds
- Refactor tests as code evolves
- Remove obsolete tests

### Performance Monitoring

- Monitor test execution times
- Track flaky test rates
- Optimize slow tests
- Review test coverage trends

## Conclusion

This testing infrastructure provides:

- **Comprehensive coverage** across all testing levels
- **Production-ready reliability** with proper mocking and isolation
- **Developer-friendly** tools and utilities
- **CI/CD integration** for automated testing
- **Security and accessibility** testing capabilities
- **Maintainable** and scalable test architecture

The combination of Vitest for unit/integration tests and Playwright for E2E tests provides a modern, fast, and reliable testing foundation for the Neptune Core Wallet project.
