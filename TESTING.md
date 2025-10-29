# Testing Setup

This project includes unit tests for security and sanitization features.

## Installing Vitest

To run the tests, you need to install Vitest and its dependencies:

```bash
pnpm add -D vitest @vitejs/plugin-react jsdom @types/node
# or
npm install --save-dev vitest @vitejs/plugin-react jsdom @types/node
```

## Adding Test Script

Add the following script to `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run"
  }
}
```

## Running Tests

After installation:

```bash
# Run tests in watch mode
pnpm test

# Run tests once
pnpm test:run

# Run tests with UI
pnpm test:ui
```

## Test Files

Tests are located in:
- `src/__tests__/sanitize.test.ts` - Tests for file input sanitization

## Vitest Configuration

The Vitest configuration is already set up in `vitest.config.ts`.
