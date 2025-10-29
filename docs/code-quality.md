# Code Quality Guidelines

This document outlines the linting rules and code quality standards for the project.

## ESLint Configuration

The project uses a flat ESLint configuration (`eslint.config.mjs`) that extends:

- `next/core-web-vitals` - Next.js recommended rules for web vitals
- `@typescript-eslint/eslint-plugin` - TypeScript-specific linting rules  
- `eslint-plugin-security` - Security-focused linting rules
- `eslint-plugin-react-hooks` - React Hooks rules
- `eslint-config-prettier` - Disables ESLint rules that conflict with Prettier

## Key Linting Rules

### Security Rules

The following security rules help prevent common vulnerabilities:

- **`security/detect-unsafe-regex`** (error): Prevents unsafe regular expressions that could cause ReDoS attacks
- **`security/detect-eval-with-expression`** (error): Disallows use of `eval()` which can execute arbitrary code
- **`security/detect-non-literal-regexp`** (warn): Warns about RegExp constructed from variables (potential injection)
- **`security/detect-possible-timing-attacks`** (warn): Warns about string comparisons that might be vulnerable to timing attacks
- **`security/detect-non-literal-fs-filename`** (warn): Warns about dynamic file paths (potential path traversal)

### Console Statement Rules

Production code should not contain `console.log` statements:

- **`no-console`** (error): Disallows `console.log`, but allows `console.warn`, `console.error`, and `console.info`

**Why?** Console.log statements can:
- Expose sensitive information in production
- Clutter browser console for end users
- Impact performance when logging large objects

**How to fix:**
```typescript
// ❌ Bad
console.log('User data:', userData);

// ✅ Good - use for development only
if (process.env.NODE_ENV === 'development') {
  console.info('User data:', userData);
}

// ✅ Good - use proper logging in production
console.error('Failed to fetch user:', error);
console.warn('Rate limit approaching');
```

### TypeScript Rules

- **`@typescript-eslint/no-explicit-any`** (warn): Discourages use of `any` type - use specific types or `unknown` instead
- **`@typescript-eslint/no-unused-vars`** (error): Prevents unused variables, functions, and imports
  - Allowed pattern: Variables starting with `_` (e.g., `_unusedParam`) are ignored
  - Useful for function parameters you need to accept but don't use

**How to fix unused variables:**
```typescript
// ❌ Bad - unused import
import { Button, Card } from '@/components/ui';

export function MyComponent() {
  return <Button>Click me</Button>;
}

// ✅ Good - remove unused import
import { Button } from '@/components/ui';

export function MyComponent() {
  return <Button>Click me</Button>;
}

// ❌ Bad - unused function parameter
function handleClick(event, index) {
  console.info('Clicked!');
}

// ✅ Good - prefix with underscore
function handleClick(_event, _index) {
  console.info('Clicked!');
}
```

### React Hooks Rules

- **`react-hooks/rules-of-hooks`** (error): Ensures Hooks are only called at the top level and in function components
- **`react-hooks/exhaustive-deps`** (error): Ensures all dependencies are included in Hook dependency arrays

**Why?** Missing dependencies can cause:
- Stale closures
- Bugs where components don't update when they should
- Infinite loops if dependencies are incorrectly specified

**How to fix:**
```typescript
// ❌ Bad - missing dependency
useEffect(() => {
  fetchData(userId);
}, []);

// ✅ Good - include all dependencies
useEffect(() => {
  fetchData(userId);
}, [userId]);

// ✅ Alternative - disable if intentional (rare cases)
useEffect(() => {
  fetchData(userId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
```

### General Best Practices

- **`no-throw-literal`** (error): Requires throwing Error objects, not literals
- **`prefer-promise-reject-errors`** (error): Requires rejecting promises with Error objects
- **`no-return-await`** (error): Disallows unnecessary `return await`
- **`require-await`** (warn): Warns when async functions don't use `await`

## Running Lint

### Check for issues
```bash
npm run lint
```

### Auto-fix issues
```bash
npm run lint:fix
```

This will automatically fix many issues including:
- Removing unused imports
- Fixing quote consistency
- Adding/removing semicolons
- Fixing indentation

### Common Issues That Require Manual Fix

1. **Unused variables** - Remove the import/variable or prefix with `_` if needed
2. **Missing Hook dependencies** - Add the missing dependency to the array
3. **Unescaped entities** - Replace `'` with `&apos;` in JSX, `"` with `&quot;`, etc.
4. **console.log statements** - Remove or replace with `console.error`/`console.warn`

## File Exceptions

Certain files have relaxed rules:

- **`*.mjs` files**: TypeScript rules are disabled
- **`next.config.mjs`, `postcss.config.mjs`, `tailwind.config.ts`**: Console statements are allowed
- **`**/.next/**`, `**/node_modules/**`, `**/dist/**`**: Completely ignored

## Integration with CI/CD

Linting runs automatically:
- Before git commit (via pre-commit hooks)
- In CI/CD pipelines
- Before production builds

**All lint errors must be fixed before code can be merged.**

## Best Practices

1. **Fix lint errors immediately** - Don't accumulate technical debt
2. **Use eslint-disable sparingly** - Only when absolutely necessary with a comment explaining why
3. **Run `npm run lint` before committing** - Catch issues early
4. **Use TypeScript types** - Avoid `any`, prefer specific types or `unknown`
5. **Follow React Hooks rules** - Always include dependencies in Hook arrays
6. **Remove console.log** - Use proper logging or debugging tools
7. **Handle errors properly** - Always throw/reject with Error objects

## Disabling Rules

If you absolutely must disable a rule, use inline comments:

```typescript
// Disable for a single line
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data: any = fetchData();

// Disable for entire file (use sparingly)
/* eslint-disable @typescript-eslint/no-explicit-any */
```

**Always add a comment explaining why the rule is disabled.**

## Additional Resources

- [ESLint Documentation](https://eslint.org/docs/latest/)
- [TypeScript ESLint](https://typescript-eslint.io/)
- [React Hooks Rules](https://react.dev/reference/rules/rules-of-hooks)
- [Next.js ESLint](https://nextjs.org/docs/app/building-your-application/configuring/eslint)
- [ESLint Security Plugin](https://github.com/eslint-community/eslint-plugin-security)
