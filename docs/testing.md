# Testing Documentation

This document describes the testing setup and practices for the DocuMind AI application.

## Table of Contents

- [Overview](#overview)
- [End-to-End Tests](#end-to-end-tests)
  - [Prerequisites](#prerequisites)
  - [Running E2E Tests](#running-e2e-tests)
  - [Mock Authentication](#mock-authentication)
  - [Test Structure](#test-structure)
- [Unit Tests](#unit-tests)

## Overview

The project uses multiple testing strategies to ensure code quality and functionality:

- **End-to-End (E2E) Tests**: Playwright-based smoke tests covering critical user flows
- **Unit Tests**: (To be implemented) Component and utility function tests

## End-to-End Tests

End-to-end tests validate complete user workflows using Playwright. These tests run against a real instance of the application with mocked external services (like Supabase).

### Prerequisites

Before running E2E tests, ensure you have:

1. **Node.js and pnpm installed**
   ```bash
   node --version  # Should be v20 or higher
   pnpm --version  # Should be v9.15.4 or higher
   ```

2. **Dependencies installed**
   ```bash
   pnpm install
   ```

3. **Playwright browsers installed**
   ```bash
   pnpm exec playwright install chromium
   pnpm exec playwright install-deps chromium
   ```

4. **Environment variables configured**
   - Copy `.env.example` to `.env.local` if you haven't already
   - The tests use mock Supabase authentication, so real credentials are not required for running smoke tests

### Running E2E Tests

#### Headless Mode (Default)

Run tests in headless mode (no browser window visible):

```bash
pnpm test:e2e
```

This command will:
1. Start the Next.js development server automatically (`pnpm dev`)
2. Run all E2E tests in Chromium
3. Generate an HTML report in `playwright-report/`
4. Shut down the dev server when tests complete

#### Headed Mode (Watch the Browser)

Run tests with a visible browser window:

```bash
pnpm test:e2e:headed
```

This is useful for debugging test failures and understanding what's happening during test execution.

#### UI Mode (Interactive)

Run tests in Playwright's interactive UI mode:

```bash
pnpm test:e2e:ui
```

This provides:
- A graphical interface to select and run individual tests
- Time travel debugging with screenshots
- Network request inspection
- Step-by-step test execution

#### Run Specific Tests

Run a specific test file:

```bash
pnpm test:e2e tests/e2e/smoke.spec.ts
```

Run tests matching a pattern:

```bash
pnpm test:e2e --grep "login"
```

#### Debug Mode

Run tests in debug mode with Playwright Inspector:

```bash
pnpm exec playwright test --debug
```

### Mock Authentication

The E2E tests use a mock Supabase authentication system to avoid hitting real services. This is implemented in `tests/utils/mockSupabase.ts`.

#### How It Works

The `MockSupabaseAuth` class intercepts network requests to Supabase authentication endpoints and returns mock responses:

```typescript
import { MockSupabaseAuth } from '../utils/mockSupabase';

test('authenticated flow', async ({ page }) => {
  const mockAuth = new MockSupabaseAuth(page);
  
  // Setup authenticated session
  await mockAuth.setupAuthenticatedSession({
    id: 'test-user-id',
    email: 'test@example.com',
  });
  
  // Navigate to protected route
  await page.goto('/dashboard');
  
  // Test authenticated behavior
  await expect(page.locator('text=Quick Access')).toBeVisible();
});
```

#### Mock Capabilities

- **Unauthenticated state**: Simulates a logged-out user
- **Authenticated state**: Simulates a logged-in user with custom profile data
- **Sign-in flow**: Mocks successful or failed login attempts
- **API responses**: Returns mock data for profiles, activity, and other Supabase tables

### Test Structure

#### Current Test Coverage

The `tests/e2e/smoke.spec.ts` file contains smoke tests for critical paths:

1. **Landing Page**
   - Hero section loads with expected copy
   - Main tools grid displays correctly
   - Navigation links work

2. **Login Flow**
   - Login form displays all required fields
   - Toggle between login/signup/forgot password
   - Mocked sign-in success

3. **Authenticated Dashboard**
   - Dashboard renders with mock session
   - Quick access tools are visible
   - Navigation to tool pages works

4. **Navigation and Routing**
   - Public pages load correctly
   - Protected routes work with authentication

#### Test Organization

```
tests/
├── e2e/              # End-to-end test specs
│   └── smoke.spec.ts # Smoke tests for critical paths
└── utils/            # Test utilities and helpers
    └── mockSupabase.ts  # Mock authentication helper
```

#### Writing New Tests

When adding new E2E tests:

1. **Use descriptive test names** that explain what is being tested
2. **Group related tests** using `test.describe()` blocks
3. **Mock external services** to avoid dependencies on real APIs
4. **Test user-facing behavior** rather than implementation details
5. **Keep tests independent** - each test should be able to run in isolation

Example:

```typescript
test.describe('Document Upload', () => {
  test('should display upload button', async ({ page }) => {
    const mockAuth = new MockSupabaseAuth(page);
    await mockAuth.setupAuthenticatedSession();
    
    await page.goto('/documents');
    
    await expect(page.locator('button', { hasText: 'Upload' })).toBeVisible();
  });
  
  test('should accept PDF files', async ({ page }) => {
    // Test implementation...
  });
});
```

### Configuration

The Playwright configuration is defined in `playwright.config.ts`:

- **Test directory**: `./tests/e2e`
- **Base URL**: `http://localhost:3000`
- **Browsers**: Chromium (Chrome/Edge)
- **Retries**: 2 retries in CI, 0 locally
- **Parallel execution**: Enabled (adjustable via `workers` setting)
- **Web server**: Automatically starts `pnpm dev` before tests

### Troubleshooting

#### Tests Fail with "Timeout waiting for server"

The dev server might not be starting correctly. Check:
- Port 3000 is not already in use
- `.env.local` file is properly configured
- Dependencies are installed (`pnpm install`)

#### Tests Hang or Run Forever

Make sure the dev server shuts down properly:
- Use Ctrl+C to stop if running manually
- Check for orphaned Node processes: `ps aux | grep next`
- Kill any stuck processes: `pkill -f "next dev"`

#### Browser Dependencies Missing

If you see errors about missing browser dependencies:

```bash
pnpm exec playwright install-deps chromium
```

Or install system packages manually (Linux):

```bash
sudo apt-get install -y libnspr4 libnss3 libatk1.0-0 libatk-bridge2.0-0 \
  libcups2 libxkbcommon0 libatspi2.0-0 libxcomposite1 libxdamage1 \
  libxfixes3 libxrandr2 libgbm1 libcairo2 libpango-1.0-0 libasound2t64
```

#### Debugging Failed Tests

1. **View the HTML report**
   ```bash
   pnpm exec playwright show-report
   ```

2. **Run in headed mode** to watch the test execute
   ```bash
   pnpm test:e2e:headed
   ```

3. **Use Playwright Inspector**
   ```bash
   pnpm exec playwright test --debug
   ```

4. **Check screenshots** in `test-results/` directory for failed tests

## Unit Tests

Unit tests for components and utilities are planned but not yet implemented.

### Planned Setup

- **Framework**: Jest or Vitest
- **React Testing**: React Testing Library
- **Location**: Tests will live alongside source files as `*.test.ts` or `*.test.tsx`
- **Command**: `pnpm test` (to be added)

### Coverage Goals

- Component rendering and interaction
- Utility function logic
- Form validation
- Error handling
- Edge cases

---

## Best Practices

1. **Run tests before committing** to catch issues early
2. **Keep tests fast** by mocking external services
3. **Test user behavior** not implementation details
4. **Maintain test independence** - no shared state between tests
5. **Use semantic locators** - prefer user-facing selectors (text, labels) over CSS classes
6. **Add tests for bug fixes** to prevent regressions
7. **Document complex test logic** with comments

## CI/CD Integration

Currently, tests are designed to run locally. For CI/CD integration:

- Set `CI=true` environment variable
- Tests will retry 2 times on failure
- Web server will not reuse existing instances
- Consider adding to GitHub Actions or similar CI pipeline

Example GitHub Actions workflow (to be implemented):

```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm exec playwright install --with-deps chromium
      - run: pnpm test:e2e
```

---

For questions or issues with testing, please open an issue or contact the development team.
