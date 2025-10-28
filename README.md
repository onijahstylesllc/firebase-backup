# Firebase Studio

This is a NextJS starter in Firebase Studio.

## Package Manager

This project uses **pnpm** as the package manager. Make sure you have pnpm installed:

```bash
npm install -g pnpm
```

## Getting Started

Install dependencies:

```bash
pnpm install
```

Run the development server:

```bash
pnpm dev
```

To get started, take a look at src/app/page.tsx.

## Testing

This project includes end-to-end smoke tests using Playwright.

### Running Tests

Run E2E tests in headless mode:

```bash
pnpm test:e2e
```

Run E2E tests in headed mode (visible browser):

```bash
pnpm test:e2e:headed
```

Run E2E tests in interactive UI mode:

```bash
pnpm test:e2e:ui
```

For more detailed testing documentation, see [docs/testing.md](./docs/testing.md).
