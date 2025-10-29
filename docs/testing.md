# Testing Guide

This document describes the testing setup and best practices for this Next.js project.

## Overview

The project uses **Vitest** as the test runner and **React Testing Library** for component testing. This combination provides a fast, modern testing experience that works seamlessly with Next.js 15 App Router.

## Tech Stack

- **Vitest**: Fast unit test framework powered by Vite
- **@testing-library/react**: Testing utilities for React components
- **@testing-library/jest-dom**: Custom matchers for DOM assertions
- **@testing-library/user-event**: Advanced user interaction simulation
- **MSW (Mock Service Worker)**: API mocking for integration tests
- **jsdom**: Browser environment simulation for Node.js

## Running Tests

All test commands use **pnpm** as the package manager:

### Run all tests once
```bash
pnpm test:unit
```

### Run tests in watch mode (development)
```bash
pnpm test:watch
```

### Generate coverage report
```bash
pnpm coverage
```

The coverage report will be generated in the `coverage/` directory. Open `coverage/index.html` in a browser to view the detailed report.

## Project Structure

```
src/
├── __tests__/          # Test files (*.test.ts, *.test.tsx)
├── setupTests.ts       # Global test setup
├── components/         # React components with co-located tests
├── hooks/              # Custom hooks with co-located tests
└── lib/                # Utility functions with co-located tests
```

## Writing Tests

### Basic Unit Test

```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from './myFunction';

describe('myFunction', () => {
  it('should return the correct value', () => {
    const result = myFunction(2, 3);
    expect(result).toBe(5);
  });
});
```

### Component Test

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('should handle user interactions', async () => {
    const user = userEvent.setup();
    render(<MyComponent />);
    
    const button = screen.getByRole('button', { name: 'Click me' });
    await user.click(button);
    
    expect(screen.getByText('Clicked!')).toBeInTheDocument();
  });
});
```

## Mocking Supabase

Supabase is a core dependency in this application. When testing components or functions that interact with Supabase, you have several options:

### Option 1: Mock the Supabase client directly

```typescript
import { vi } from 'vitest';
import { createClient } from '@supabase/supabase-js';

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      signIn: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  })),
}));
```

### Option 2: Use MSW for API mocking

For more complex scenarios, use Mock Service Worker to intercept network requests:

```typescript
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { beforeAll, afterEach, afterAll } from 'vitest';

const server = setupServer(
  http.get('https://*.supabase.co/rest/v1/*', () => {
    return HttpResponse.json({ data: [] });
  }),
  http.post('https://*.supabase.co/auth/v1/*', () => {
    return HttpResponse.json({ access_token: 'mock-token' });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Option 3: Create mock providers

For components that consume Supabase through context:

```typescript
import { vi } from 'vitest';

const mockSupabase = {
  auth: {
    getUser: vi.fn().mockResolvedValue({ 
      data: { user: { id: 'test-user-id' } }, 
      error: null 
    }),
  },
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockResolvedValue({ data: [], error: null }),
  })),
};

// Wrap component with mock context
const wrapper = ({ children }) => (
  <SupabaseContext.Provider value={mockSupabase}>
    {children}
  </SupabaseContext.Provider>
);

render(<MyComponent />, { wrapper });
```

## Testing Next.js Features

### Server Components

Server components cannot be tested directly in jsdom. Instead:
- Test the business logic separately
- Use integration tests with Playwright/Cypress
- Test client components that consume server-generated data

### API Routes

```typescript
import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

describe('API Route: GET /api/example', () => {
  it('should return data', async () => {
    const request = new NextRequest('http://localhost:3000/api/example');
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data).toHaveProperty('result');
  });
});
```

### Testing with Next.js router

```typescript
import { vi } from 'vitest';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/current-path',
  useSearchParams: () => new URLSearchParams(),
}));
```

## Testing AI/Genkit Flows

For testing Genkit flows:

```typescript
import { vi } from 'vitest';

// Mock the Genkit flow
vi.mock('@genkit-ai/core', () => ({
  defineFlow: vi.fn((config, handler) => handler),
  runFlow: vi.fn(),
}));

// Mock Gemini API calls
vi.mock('@genkit-ai/google-genai', () => ({
  gemini15Pro: vi.fn(() => ({
    generate: vi.fn().mockResolvedValue({
      text: () => 'Mocked AI response',
    }),
  })),
}));
```

## Best Practices

1. **Co-locate tests**: Place test files next to the code they test (e.g., `Button.tsx` and `Button.test.tsx`)
2. **Use descriptive names**: Test descriptions should clearly state what is being tested
3. **AAA Pattern**: Structure tests with Arrange, Act, Assert sections
4. **Test behavior, not implementation**: Focus on what the code does, not how it does it
5. **Mock external dependencies**: Use mocks for API calls, database queries, and third-party services
6. **Keep tests isolated**: Each test should be independent and not rely on others
7. **Use screen queries wisely**: Prefer `getByRole` and `getByLabelText` over `getByTestId`
8. **Async handling**: Always await async operations and use `findBy*` queries for async UI updates

## Common Assertions

### Testing Library Queries (in order of preference)
1. `getByRole` - Most accessible way to query
2. `getByLabelText` - For form fields
3. `getByPlaceholderText` - For input placeholders
4. `getByText` - For non-interactive elements
5. `getByDisplayValue` - For current form values
6. `getByAltText` - For images
7. `getByTitle` - For title attributes
8. `getByTestId` - Last resort when other queries don't work

### Jest-DOM Matchers
- `toBeInTheDocument()`
- `toBeVisible()`
- `toBeDisabled()`
- `toHaveValue()`
- `toHaveTextContent()`
- `toHaveAttribute()`
- `toHaveClass()`

## Debugging Tests

### View DOM output
```typescript
import { render, screen } from '@testing-library/react';

render(<MyComponent />);
screen.debug(); // Prints the entire DOM
```

### Check what's queryable
```typescript
screen.logTestingPlaygroundURL(); // Generates a URL to test queries
```

### Run a single test
```bash
pnpm test:unit -t "test name pattern"
```

### Run tests for a specific file
```bash
pnpm test:unit path/to/file.test.tsx
```

## CI/CD Integration

Tests run automatically in the CI pipeline. The build will fail if:
- Any test fails
- Coverage thresholds are not met (if configured)
- Type checking fails

## Coverage Thresholds

Current coverage thresholds are set to 0% to allow gradual adoption. As the test suite grows, these should be increased in `vitest.config.ts`:

```typescript
coverage: {
  thresholds: {
    lines: 80,
    functions: 80,
    branches: 80,
    statements: 80,
  },
}
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
- [MSW Documentation](https://mswjs.io/)
- [Next.js Testing](https://nextjs.org/docs/app/building-your-application/testing)
