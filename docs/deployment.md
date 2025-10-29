# Deployment Guide

This document provides guidelines and best practices for deploying the application to production environments.

## Table of Contents

- [Environment Variables](#environment-variables)
- [Build Hardening](#build-hardening)
- [Vercel Deployment](#vercel-deployment)
- [Security Considerations](#security-considerations)

## Environment Variables

### Required Production Variables

The following environment variables are required for production deployments:

```bash
# Core Application
NODE_ENV=production

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI/Genkit Configuration
GOOGLE_GENAI_API_KEY=your-google-ai-api-key

# Additional configurations as needed
```

### Security-Critical Variables

For enhanced security and to prevent source code exposure:

```bash
# Explicitly disable source maps in production
NEXT_DISABLE_SOURCEMAPS=1

# Ensure production mode
NODE_ENV=production
```

## Build Hardening

The application includes several build hardening measures to ensure production bundles are secure and optimized:

### Features

1. **Source Map Removal**: Source maps are disabled in production to prevent code structure exposure
2. **Minification**: SWC minification is enabled for optimal bundle sizes
3. **Console Stripping**: Non-critical console calls are removed (errors and warnings are kept)
4. **Security Headers**: X-Powered-By header is disabled

### Configuration

These settings are configured in `next.config.mjs`:

```javascript
{
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  swcMinify: true,
  compiler: {
    removeConsole: { exclude: ['error', 'warn'] }
  },
  experimental: {
    serverSourceMaps: false
  }
}
```

### Build Verification

The build process includes automatic verification to ensure no source maps are present:

```bash
# Standard build (includes verification)
pnpm build

# Run verification manually
pnpm run verify:bundle
```

The verification script (`scripts/check-sourcemaps.ts`) will:
- Scan the `.next/` directory for any `.map` files
- Fail the build if source maps are detected
- Provide clear feedback on security status

Expected output on success:
```
🔍 Checking for source maps in production build...

✅ No source maps found - production bundle is secure!
```

## Vercel Deployment

### Environment Setup

1. Navigate to your Vercel project settings
2. Go to **Settings** → **Environment Variables**
3. Add the following variables for all environments (Production, Preview, Development as needed):

```
NODE_ENV=production
NEXT_DISABLE_SOURCEMAPS=1
```

4. Add your application-specific variables (Supabase, API keys, etc.)

### Build Settings

Vercel should use the following build configuration:

- **Framework Preset**: Next.js
- **Build Command**: `pnpm build` (default)
- **Output Directory**: `.next` (default)
- **Install Command**: `pnpm install` (default)

### Deployment Checklist

Before deploying to production:

- [ ] All required environment variables are set
- [ ] `NEXT_DISABLE_SOURCEMAPS=1` is configured
- [ ] Build succeeds locally with `pnpm build`
- [ ] Verification script passes (no source maps found)
- [ ] Security headers are configured (verify with `pnpm run verify:security-headers` if available)

### Verifying Production Build

After deployment, verify the build is hardened:

1. Open browser DevTools on your production site
2. Go to the **Sources** or **Debugger** tab
3. Check that JavaScript files are minified and do not have corresponding `.map` files
4. Verify that `X-Powered-By` header is not present in response headers (use Network tab)

## Security Considerations

### Source Maps

Source maps expose your application's source code structure, making it easier for attackers to:
- Understand business logic
- Find vulnerabilities
- Reverse engineer proprietary algorithms

**Always ensure source maps are disabled in production.**

### Console Logs

Console logs can leak sensitive information such as:
- API keys or tokens
- User data
- Internal application state
- Debug information

The build configuration removes most console calls but preserves `console.error` and `console.warn` for critical logging.

### Headers

Security headers are configured to protect against common web vulnerabilities:
- Content Security Policy (CSP)
- Strict-Transport-Security (HSTS)
- X-Content-Type-Options
- X-Frame-Options
- And more

See `docs/security-headers.md` for detailed information.

## Troubleshooting

### Build Fails with Source Map Detection

If the build fails with source map detection:

1. Ensure `next.config.mjs` has `productionBrowserSourceMaps: false`
2. Clear the build cache: `rm -rf .next`
3. Rebuild: `pnpm build`
4. If issue persists, check for any webpack plugins or configurations that might override this setting

### Minification Issues

If you encounter issues with minified code:

1. Check browser console for runtime errors
2. Verify that dynamic code evaluation is not being used
3. Ensure all dependencies are compatible with minification
4. Consider adding specific packages to `optimizePackageImports` in `next.config.mjs` if needed

### Missing Environment Variables

If the application fails due to missing environment variables:

1. Verify all required variables are set in Vercel settings
2. Check that variables are available in the correct environments (Production, Preview, Development)
3. Redeploy after adding or updating variables

## Additional Resources

- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Next.js Production Checklist](https://nextjs.org/docs/going-to-production)
- [Application Security Headers Documentation](./security-headers.md)
