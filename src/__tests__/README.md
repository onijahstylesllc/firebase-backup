# Test Suite

This directory contains unit and component tests for the application.

## Test Files

- **sanity.test.ts** - Basic sanity checks to verify the test environment is working correctly
- **supabase-mock-example.test.ts** - Examples of how to mock Supabase client for testing

## Running Tests

See the main [testing documentation](../../docs/testing.md) for details on running tests.

Quick reference:
```bash
# Run all tests
pnpm test:unit

# Run tests in watch mode
pnpm test:watch

# Generate coverage report
pnpm coverage
```

## Writing Tests

Tests can be placed either in this directory or co-located with the code they test.

For example:
- `src/components/ui/Button.tsx` → `src/components/ui/Button.test.tsx`
- `src/lib/utils.ts` → `src/lib/utils.test.ts`

Co-located tests are preferred as they make it easier to maintain tests alongside the code.
