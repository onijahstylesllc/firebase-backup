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

## Security

### Security Headers

This application implements comprehensive security headers including Content Security Policy (CSP), HTTP Strict Transport Security (HSTS), and other protective measures. For detailed information about the security header configuration, customization, and verification, see [docs/security-headers.md](docs/security-headers.md).

To verify security headers are properly configured:

```bash
./scripts/verify-security-headers.sh http://localhost:3000
```

### Dependency Audits

For information about dependency security audits and vulnerability management, see [docs/dependency-audit.md](docs/dependency-audit.md).
