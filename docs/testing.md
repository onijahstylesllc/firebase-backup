# Testing Documentation

This document describes the testing strategy, setup, and guidelines for the DocuMind application.

## Overview

The project uses **Vitest** as the test runner with **React Testing Library** for component testing. Tests are organized to mirror the source code structure under `src/__tests__/`.

## Test Infrastructure

### Test Runner: Vitest

Vitest is a fast, Vite-native test framework that provides:
- Fast execution with watch mode
- Built-in coverage reporting
- TypeScript and JSX/TSX support
- Jest-compatible API

### Testing Libraries

- **@testing-library/react**: For testing React components
- **@testing-library/jest-dom**: Custom matchers for DOM assertions
- **@testing-library/user-event**: For simulating user interactions
- **jsdom/happy-dom**: DOM environment for Node.js

## Running Tests

### Available Scripts

```bash
# Run all tests in watch mode (interactive)
pnpm test

# Run all tests once (CI mode)
pnpm test:unit

# Run tests in watch mode
pnpm test:watch

# Open Vitest UI (visual test runner)
pnpm test:ui

# Run tests with coverage report
pnpm test:coverage
```

### Coverage Thresholds

The project enforces minimum coverage thresholds:
- **Statements**: 40%
- **Branches**: 40%
- **Functions**: 40%
- **Lines**: 40%

Coverage reports are generated in multiple formats:
- **Terminal**: Text output in the console
- **HTML**: Interactive report in `coverage/` directory
- **JSON/LCOV**: For CI integration

## Test Organization

Tests are organized under `src/__tests__/` mirroring the source structure:

```
src/__tests__/
├── setup.ts                          # Global test setup
├── components/
│   └── supabase-provider.test.tsx   # SupabaseProvider tests
├── lib/
│   ├── use-supabase-collection.test.tsx
│   └── security/
│       └── sanitize.test.ts         # Sanitization utilities
└── ai/
    └── chat-flow.test.ts            # AI flow tests
```

## Test Suites

### 1. useSupabaseCollection Hook Tests

**Location**: `src/__tests__/lib/use-supabase-collection.test.tsx`

Tests cover:
- Initial data fetching
- Loading and error states
- Query options (orderBy, limit, ascending)
- Real-time updates (INSERT, UPDATE, DELETE)
- Subscription error handling
- Cleanup on unmount
- Dependency changes triggering refetch

**Mocking Strategy**:
- Mocks Supabase client methods
- Simulates real-time channel subscriptions
- Tests both happy paths and error scenarios

### 2. SupabaseProvider Component Tests

**Location**: `src/__tests__/components/supabase-provider.test.tsx`

Tests cover:
- Session initialization (with/without existing session)
- Auth state change handling (SIGNED_IN, SIGNED_OUT)
- Route-based redirects (dashboard vs. public routes)
- Context provider functionality
- Error handling for useSupabase outside provider
- Subscription cleanup on unmount

**Mocking Strategy**:
- Mocks `next/navigation` (useRouter, usePathname)
- Mocks Supabase auth methods
- Asserts on navigation side effects

### 3. Sanitization Utilities Tests

**Location**: `src/__tests__/lib/security/sanitize.test.ts`

Tests cover:
- Filename sanitization (path traversal, null bytes, control chars)
- File type validation (MIME type + extension matching)
- File size validation
- Comprehensive upload validation
- User input sanitization
- URL sanitization (protocol validation, XSS prevention)
- Safe filename generation

**Edge Cases Tested**:
- Path traversal attempts (`../../../etc/passwd`)
- Malicious filenames with control characters
- Empty or invalid input
- Oversized files
- Mismatched MIME types and extensions

### 4. AI Chat Flow Tests

**Location**: `src/__tests__/ai/chat-flow.test.ts`

Tests cover:
- Schema validation for input/output
- Basic message processing
- Document image handling
- Chat history support
- Personalization settings (role, tone, format)
- Error handling (service unavailable, missing output)
- Input validation edge cases

**Mocking Strategy**:
- Mocks Genkit AI module (`definePrompt`, `defineFlow`)
- Simulates prompt execution responses
- Tests schema enforcement

## Mocking Strategy

### Global Mocks (setup.ts)

The test setup file provides global mocks for:

```typescript
// Next.js router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  })),
  usePathname: vi.fn(() => '/'),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));
```

### Environment Variables

Test environment provides:
```typescript
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
```

### Supabase Mocking

For Supabase-dependent tests:
1. Mock the `@/lib/supabase-provider` module
2. Provide mock implementations of client methods
3. Simulate real-time channel behavior with callbacks

Example:
```typescript
vi.mock('@/lib/supabase-provider', () => ({
  useSupabase: vi.fn(() => ({
    supabase: mockSupabaseClient,
    session: mockSession,
  })),
}));
```

## Writing New Tests

### Test File Naming

- Unit/integration tests: `*.test.ts` or `*.test.tsx`
- Place in `src/__tests__/` mirroring source structure

### Test Structure

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('ComponentOrFunction', () => {
  beforeEach(() => {
    // Setup mocks and test state
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('feature area', () => {
    it('should handle specific scenario', () => {
      // Arrange
      const input = ...;
      
      // Act
      const result = ...;
      
      // Assert
      expect(result).toBe(...);
    });
  });
});
```

### Best Practices

1. **Meaningful Assertions**: Tests should assert behavior, not just structure
2. **Isolated Tests**: Each test should be independent
3. **Clear Names**: Use descriptive test names that explain the scenario
4. **Edge Cases**: Always test error paths and edge cases
5. **Cleanup**: Use `afterEach` to clean up mocks and state
6. **Async Handling**: Use `waitFor` for asynchronous updates
7. **Avoid Implementation Details**: Test public API, not internals

### Testing Async Components

```typescript
import { waitFor } from '@testing-library/react';

it('should load data', async () => {
  const { result } = renderHook(() => useData());
  
  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
  });
  
  expect(result.current.data).toBeDefined();
});
```

### Testing Components with User Interaction

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

it('should handle button click', async () => {
  const user = userEvent.setup();
  render(<MyComponent />);
  
  const button = screen.getByRole('button', { name: /submit/i });
  await user.click(button);
  
  expect(screen.getByText(/success/i)).toBeInTheDocument();
});
```

## Coverage Exclusions

The following are excluded from coverage:
- `node_modules/`
- `src/__tests__/` (test files themselves)
- Type definition files (`*.d.ts`)
- Configuration files (`*.config.*`)
- Mock data directories
- Build outputs (`.next/`, `dist/`)

## CI/CD Integration

### Running Tests in CI

Tests run automatically on:
- Pull requests
- Main branch commits
- Pre-merge checks

CI configuration should:
```bash
pnpm install
pnpm test:unit
pnpm test:coverage
```

### Coverage Reports

Coverage reports can be uploaded to services like:
- Codecov
- Coveralls
- SonarQube

Use the generated `coverage/lcov.info` file.

## Debugging Tests

### VS Code Integration

Add to `.vscode/launch.json`:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Vitest Tests",
  "runtimeExecutable": "pnpm",
  "runtimeArgs": ["test"],
  "console": "integratedTerminal"
}
```

### Isolating Tests

Run specific test file:
```bash
pnpm test src/__tests__/lib/sanitize.test.ts
```

Run tests matching pattern:
```bash
pnpm test -t "sanitizeFilename"
```

### Verbose Output

```bash
pnpm test --reporter=verbose
```

## Future Enhancements

Planned additions to the test suite:

1. **E2E Tests**: Using Playwright for full user flows
2. **Visual Regression**: Component screenshot comparisons
3. **Performance Tests**: Measuring render and load times
4. **API Integration Tests**: Testing actual Supabase/Genkit calls in staging
5. **Accessibility Tests**: Using jest-axe or similar
6. **Load Tests**: For AI endpoints and file processing

## Troubleshooting

### Common Issues

**Issue**: Tests fail with "Cannot find module '@/...'"
- **Solution**: Check `vitest.config.ts` path aliases match `tsconfig.json`

**Issue**: Supabase client errors in tests
- **Solution**: Ensure Supabase client is properly mocked in test setup

**Issue**: Tests hang or timeout
- **Solution**: Check for unresolved promises, ensure async operations complete

**Issue**: "useSupabase must be used within a SupabaseProvider"
- **Solution**: Mock the `useSupabase` hook before rendering components

**Issue**: React 18 warnings about `act()`
- **Solution**: Use `waitFor` from Testing Library for state updates

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Supabase Testing Guide](https://supabase.com/docs/guides/getting-started/testing)

## Questions or Issues?

For questions about testing strategy or help with writing tests, please:
1. Check this documentation
2. Review existing test examples
3. Open an issue with the `testing` label
4. Reach out to the development team

---

**Last Updated**: 2024
**Maintained By**: Development Team
