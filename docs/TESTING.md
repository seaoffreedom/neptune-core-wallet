# Testing Guide for Neptune Core Wallet

This document provides comprehensive guidance for testing the Neptune Core Wallet application.

## Testing Strategy

Our testing strategy follows a **3-tier approach**:

1. **Unit Tests** - Test individual functions and components in isolation
2. **Integration Tests** - Test interactions between components and services
3. **End-to-End (E2E) Tests** - Test complete user workflows

## Testing Stack

### Unit & Integration Tests

- **Vitest** - Fast, modern test runner with excellent TypeScript support
- **React Testing Library** - Simple and complete testing utilities for React components
- **Jest DOM** - Custom Jest matchers for DOM elements
- **jsdom** - DOM implementation for Node.js

### End-to-End Tests

- **Playwright** - Cross-browser testing with excellent Electron support
- **Multi-browser testing** - Chrome, Firefox, Safari, Edge
- **Mobile testing** - Responsive design validation

## Getting Started

### Installation

```bash
# Install dependencies
pnpm install

# Install Playwright browsers
pnpm playwright:install

# Install Playwright system dependencies (Linux only)
pnpm playwright:install-deps
```

### Running Tests

```bash
# Run all unit tests
pnpm test

# Run unit tests in watch mode
pnpm test:watch

# Run unit tests with coverage
pnpm test:coverage

# Run E2E tests
pnpm test:e2e

# Run E2E tests in headed mode (visible browser)
pnpm test:e2e:headed

# Run E2E tests with UI mode
pnpm test:e2e:ui

# Run all tests (unit + E2E)
pnpm test:all

# Run tests for CI
pnpm test:ci
```

## Test Structure

```
src/
├── test/                    # Test utilities and setup
│   ├── setup.ts            # Global test setup
│   ├── utils/              # Test utilities
│   └── mocks/              # Mock implementations
├── components/
│   └── __tests__/          # Component tests
├── main/
│   └── services/
│       └── __tests__/      # Service tests
└── store/
    └── __tests__/          # Store tests

tests/
└── e2e/                    # End-to-end tests
    ├── global-setup.ts     # E2E global setup
    ├── global-teardown.ts  # E2E global teardown
    └── *.spec.ts           # E2E test files
```

## Writing Tests

### Unit Tests

#### Component Testing

```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@test/utils/test-utils";
import { BalanceCard } from "@/components/wallet/balance-card";

describe("BalanceCard", () => {
  it("should display balance correctly", () => {
    render(<BalanceCard />);
    expect(screen.getByTestId("balance-amount")).toHaveTextContent("1000.50");
  });
});
```

#### Service Testing

```typescript
import { describe, it, expect, vi } from "vitest";
import { NeptuneRpcService } from "@/main/services/neptune-rpc.service";

describe("NeptuneRpcService", () => {
  it("should make successful RPC call", async () => {
    const service = new NeptuneRpcService("http://localhost:8080");
    const result = await service.call("get_balance");
    expect(result).toBeDefined();
  });
});
```

### E2E Tests

```typescript
import { test, expect } from "@playwright/test";

test.describe("Wallet Functionality", () => {
  test("should display wallet balance", async ({ page }) => {
    await page.goto("/wallet");
    await expect(page.locator("[data-testid='balance-card']")).toBeVisible();
  });
});
```

## Test Utilities

### Custom Render Function

```typescript
import { render } from "@test/utils/test-utils";

// Automatically includes providers (Router, Theme, etc.)
render(<MyComponent />);
```

### Mock Data Factories

```typescript
import { mockData } from "@test/utils/test-utils";

const wallet = mockData.wallet();
const transaction = mockData.transaction();
```

### Electron API Mocking

```typescript
import { mockElectronAPI } from "@test/mocks/electron-api.mock";

// Mock successful response
mockElectronAPI.invoke.mockResolvedValue({ balance: "1000.0" });

// Mock failed response
mockElectronAPI.invoke.mockRejectedValue(new Error("Network error"));
```

## Test Data Management

### Mock Data

- Use `mockData` factories for consistent test data
- Keep mock data simple and focused
- Avoid hardcoded values in tests

### Test Isolation

- Each test should be independent
- Use `beforeEach` and `afterEach` for setup/cleanup
- Mock external dependencies

## Coverage Requirements

### Minimum Coverage Thresholds

- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

### Coverage Reports

```bash
# Generate coverage report
pnpm test:coverage

# View coverage report
open coverage/index.html
```

## E2E Testing Best Practices

### Test Organization

- Group related tests in `describe` blocks
- Use descriptive test names
- Keep tests focused on single workflows

### Page Object Model

```typescript
class WalletPage {
  constructor(private page: Page) {}

  async navigateToWallet() {
    await this.page.goto("/wallet");
  }

  async getBalance() {
    return this.page.locator("[data-testid='balance-amount']").textContent();
  }
}
```

### Test Data

- Use test-specific data
- Clean up after tests
- Avoid dependencies between tests

## CI/CD Integration

### GitHub Actions

Tests run automatically on:

- Pull requests
- Pushes to main/develop branches
- Scheduled runs (weekly)

### Test Reports

- Unit test results: `test-results/results.json`
- E2E test results: `test-results/e2e-results.json`
- Coverage reports: `coverage/`

## Debugging Tests

### Unit Tests

```bash
# Run specific test file
pnpm test balance-card.test.tsx

# Run tests in debug mode
pnpm test --inspect-brk

# Run tests with UI
pnpm test:ui
```

### E2E Tests

```bash
# Run E2E tests in debug mode
pnpm test:e2e:debug

# Run specific E2E test
pnpm test:e2e wallet.spec.ts

# Run E2E tests with UI
pnpm test:e2e:ui
```

## Performance Testing

### Unit Test Performance

- Keep tests fast (< 100ms per test)
- Use mocks for slow operations
- Avoid unnecessary async operations

### E2E Test Performance

- Use `waitForSelector` instead of `sleep`
- Minimize test data setup
- Run tests in parallel when possible

## Security Testing

### Input Validation

- Test all user inputs
- Verify sanitization
- Test edge cases

### Authentication

- Test login/logout flows
- Verify session management
- Test permission boundaries

## Accessibility Testing

### Automated Testing

```typescript
import { axe, toHaveNoViolations } from "jest-axe";

expect.extend(toHaveNoViolations);

test("should not have accessibility violations", async () => {
  const { container } = render(<MyComponent />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Manual Testing

- Test with keyboard navigation
- Verify screen reader compatibility
- Check color contrast ratios

## Troubleshooting

### Common Issues

1. **Tests timing out**
   - Increase timeout values
   - Check for infinite loops
   - Verify async operations complete

2. **Mock not working**
   - Check mock setup
   - Verify import paths
   - Clear mock state between tests

3. **E2E tests flaky**
   - Add proper waits
   - Use stable selectors
   - Check for race conditions

### Getting Help

- Check test logs for detailed error messages
- Use debug mode for step-by-step execution
- Review test documentation and examples

## Contributing

### Adding New Tests

1. Follow existing test patterns
2. Use descriptive test names
3. Add appropriate test data
4. Update documentation if needed

### Test Review Checklist

- [ ] Tests are focused and independent
- [ ] Mock data is appropriate
- [ ] Error cases are covered
- [ ] Performance is acceptable
- [ ] Documentation is updated

---

For more information, see:

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [React Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)
