# Security Headers Documentation

This document explains the security header configuration implemented in this application, including Content Security Policy (CSP), HTTP Strict Transport Security (HSTS), and other protective headers.

## Overview

Security headers are HTTP response headers that instruct browsers to enable various security protections. This application implements a comprehensive set of security headers to protect against common web vulnerabilities including:

- Cross-Site Scripting (XSS)
- Clickjacking
- MIME-sniffing attacks
- Protocol downgrade attacks
- Information leakage through referrers

## Implemented Headers

### 1. Content Security Policy (CSP)

The Content Security Policy is the most comprehensive security header, controlling which resources the browser is allowed to load.

**Location**: `src/lib/security/csp.ts`

#### Key Directives

| Directive | Configuration | Purpose |
|-----------|--------------|---------|
| `default-src` | `'self'` | Default fallback for any resource type not explicitly specified |
| `script-src` | `'self' 'unsafe-inline' 'unsafe-eval'*` | Controls JavaScript execution. `unsafe-eval` only in development for Next.js hot reload |
| `style-src` | `'self' 'unsafe-inline' fonts.googleapis.com` | Controls stylesheets. `unsafe-inline` needed for React inline styles and CSS custom properties |
| `img-src` | `'self' data: blob: picsum.photos [supabase]` | Controls image sources, including placeholder images and Supabase storage |
| `font-src` | `'self' data: fonts.gstatic.com` | Controls font sources, allows Google Fonts |
| `connect-src` | `'self' [supabase] wss://[supabase]` | Controls AJAX, WebSocket, and fetch destinations. Includes Supabase API and realtime |
| `frame-ancestors` | `'none'` | Prevents the site from being embedded in iframes (clickjacking protection) |
| `base-uri` | `'self'` | Restricts the URLs that can be used in `<base>` element |
| `form-action` | `'self'` | Restricts where forms can submit to |
| `object-src` | `'none'` | Disables plugins like Flash |
| `upgrade-insecure-requests` | (enabled in production) | Automatically upgrades HTTP requests to HTTPS in production |

\* `unsafe-eval` is only included in development mode

#### Environment-Based Configuration

The CSP is dynamically built based on environment variables:

- **`NEXT_PUBLIC_SUPABASE_URL`**: Automatically adds your Supabase instance URL to `connect-src` and `img-src` directives, including WebSocket support for realtime features.

**Example**:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
```

The CSP will automatically include:
- `https://your-project.supabase.co` in `connect-src` and `img-src`
- `wss://your-project.supabase.co` in `connect-src` for realtime WebSocket connections

### 2. Strict-Transport-Security (HSTS)

**Value**: `max-age=31536000; includeSubDomains; preload`

Forces browsers to only connect to the site via HTTPS for one year (31536000 seconds).

- `includeSubDomains`: Applies to all subdomains
- `preload`: Allows inclusion in browser HSTS preload lists for even stronger protection

**Note**: Only effective when served over HTTPS. In local development (HTTP), browsers ignore this header.

### 3. X-Content-Type-Options

**Value**: `nosniff`

Prevents browsers from MIME-sniffing responses away from the declared `Content-Type`. This prevents attacks where malicious content is disguised as a safe file type.

### 4. X-Frame-Options

**Value**: `DENY`

Prevents the site from being embedded in `<frame>`, `<iframe>`, `<embed>`, or `<object>` tags. This provides clickjacking protection for older browsers that don't support the CSP `frame-ancestors` directive.

### 5. Referrer-Policy

**Value**: `strict-origin-when-cross-origin`

Controls how much referrer information is sent with requests:
- Same-origin requests: Send full URL
- Cross-origin HTTPS→HTTPS: Send origin only
- Cross-origin HTTPS→HTTP: Send nothing (prevents leaking HTTPS URLs to HTTP sites)

### 6. Permissions-Policy

**Value**: `camera=(), microphone=(), geolocation=(), interest-cohort=()`

Restricts access to sensitive browser features:
- **camera**: Disables camera access
- **microphone**: Disables microphone access
- **geolocation**: Disables geolocation
- **interest-cohort**: Disables FLoC (Federated Learning of Cohorts) for privacy

## Configuration

### Next.js Integration

The security headers are configured in `next.config.mjs` using Next.js's `headers()` function:

```javascript
import { getSecurityHeaders } from './src/lib/security/csp.ts';

const nextConfig = {
  async headers() {
    const securityHeaders = getSecurityHeaders();
    
    return [
      {
        source: '/:path*', // Apply to all routes
        headers: Object.entries(securityHeaders).map(([key, value]) => ({
          key,
          value,
        })),
      },
    ];
  },
};
```

### Customizing CSP

If you need to add additional sources to the CSP (e.g., a new CDN or API), modify `src/lib/security/csp.ts`:

```typescript
export function buildCSP(config: CSPConfig = {}): string {
  const {
    supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL,
    additionalImageSources = [],
    additionalConnectSources = [],
  } = config;
  
  // ... rest of the function
}
```

You can also pass additional sources when calling `buildCSP()`:

```typescript
const csp = buildCSP({
  additionalImageSources: ['https://cdn.example.com'],
  additionalConnectSources: ['https://api.example.com'],
});
```

## Verification

### Local Development

#### Using the Verification Script

The easiest way to verify all security headers at once:

```bash
./scripts/verify-security-headers.sh http://localhost:3000
```

This script will check all required security headers and report any issues.

#### Using curl

Check headers on your local development server:

```bash
curl -I http://localhost:3000
```

Look for the security headers in the response:

```
HTTP/1.1 200 OK
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; ...
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()
...
```

#### Using Browser DevTools

1. Open your browser's Developer Tools (F12)
2. Navigate to the **Network** tab
3. Refresh the page
4. Click on the first request (usually the HTML document)
5. Check the **Headers** section for "Response Headers"

All security headers should be present.

#### Testing CSP Violations

Open the browser console (F12 → Console tab) while browsing the application. If the CSP is blocking any resources, you'll see error messages like:

```
Refused to load the script 'https://example.com/script.js' because it violates 
the following Content Security Policy directive: "script-src 'self' 'unsafe-inline'".
```

**Expected behavior**: You should see **no CSP violations** when browsing any page or using any feature.

### Production Environment

For production deployments:

```bash
curl -I https://your-domain.com
```

In production, you should also see the `upgrade-insecure-requests` directive in the CSP.

## Troubleshooting

### CSP Violations in Browser Console

**Symptom**: Console shows CSP violation errors, resources fail to load

**Common Causes & Solutions**:

1. **External script/style/image not in allowlist**
   - Add the domain to the appropriate directive in `src/lib/security/csp.ts`
   - Example: Adding a new CDN:
     ```typescript
     'img-src': [
       "'self'",
       'data:',
       'https://new-cdn.example.com', // Add here
       // ...
     ],
     ```

2. **Third-party embed (e.g., YouTube, Twitter)**
   - Add the required domains to `frame-src` and potentially `script-src`
   - Check the third-party's CSP requirements documentation

3. **New analytics or monitoring service**
   - Add the service domains to `script-src` and `connect-src`

### Inline Styles Not Working

**Symptom**: Inline styles are not applied

**Note**: This shouldn't happen in this application as we allow `'unsafe-inline'` for styles due to React's extensive use of inline styles via the `style` prop and CSS custom properties.

If you're refactoring to remove `'unsafe-inline'`:
- Move inline styles to CSS modules or global stylesheets
- Use CSS custom properties set via inline styles (these are generally safe)
- Consider using nonces for any remaining inline styles

### HSTS Not Working in Development

**Symptom**: HSTS header seems ignored in local development

**Explanation**: HSTS only works over HTTPS. Local development typically uses HTTP (`http://localhost:3000`), so browsers correctly ignore the HSTS header.

**Solution**: This is expected and not a problem. Test HSTS in your staging or production environment with HTTPS.

### Supabase Realtime Not Connecting

**Symptom**: Supabase realtime features fail with CSP errors

**Cause**: WebSocket connection to Supabase is blocked

**Solution**: Ensure `NEXT_PUBLIC_SUPABASE_URL` is correctly set. The CSP builder automatically adds both the HTTPS and WSS versions of the Supabase URL.

Verify in browser console that `wss://your-project.supabase.co` is in the `connect-src` directive.

## Best Practices

### 1. Environment Variables

Always set `NEXT_PUBLIC_SUPABASE_URL` correctly for each environment:

```bash
# .env.local (development)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# .env.production (production)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Regular CSP Review

Periodically review the CSP directives to:
- Remove unused sources
- Tighten restrictions where possible
- Add new sources for newly integrated services

### 3. Monitor CSP Violations

Consider implementing CSP reporting to track violations in production:

```typescript
// Add to CSP directives
'report-uri': ['/api/csp-report'],
// or
'report-to': ['csp-endpoint'],
```

Create an API route to log CSP violations and review them regularly.

### 4. Progressive Enhancement

When adding new features that require external resources:
1. Add the resource to CSP
2. Test in development
3. Verify no CSP violations
4. Deploy to production

### 5. Balance Security and Functionality

The current CSP uses `'unsafe-inline'` for styles due to React's architecture and extensive use of inline styles for dynamic styling (CSS custom properties, animations, etc.). This is an acceptable tradeoff given:
- Scripts have stricter controls
- The main XSS vector (scripts) is well-protected
- Refactoring all components to avoid inline styles would be impractical

If stricter CSP is required, consider:
- Using CSS-in-JS libraries with nonce support
- Moving to CSS modules for all styling
- Implementing CSP nonces for inline styles

## Security Headers Testing Tools

- **[SecurityHeaders.com](https://securityheaders.com/)**: Analyzes your site's security headers and provides a grade
- **[Mozilla Observatory](https://observatory.mozilla.org/)**: Comprehensive security analysis
- **[CSP Evaluator](https://csp-evaluator.withgoogle.com/)**: Google's CSP testing tool
- **Browser DevTools**: Built-in tools to inspect headers and CSP violations

## Further Reading

- [MDN: Content Security Policy (CSP)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [MDN: Strict-Transport-Security](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security)
- [OWASP: Secure Headers Project](https://owasp.org/www-project-secure-headers/)
- [CSP Quick Reference](https://content-security-policy.com/)

## Maintenance

Last updated: 2024
Review frequency: Quarterly or when adding new external integrations
