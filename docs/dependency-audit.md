# Dependency Security Audit

## Overview

This document records the results of the dependency security audit performed on the project, including all identified vulnerabilities, mitigations applied, and any outstanding issues.

**Audit Date:** 2025-10-28  
**Package Manager:** pnpm@9.15.4  
**Audit Tool:** `pnpm audit`

## Audit Results

### Initial Scan

When the audit was first performed, the following vulnerability was identified:

| Severity | Package | Vulnerable Versions | Patched Versions | Advisory |
|----------|---------|---------------------|------------------|----------|
| Moderate | esbuild | ≤0.24.2 | ≥0.25.0 | [GHSA-67mh-4wv8-2f99](https://github.com/advisories/GHSA-67mh-4wv8-2f99) |

**Issue Description:**  
esbuild versions ≤0.24.2 enable any website to send any requests to the development server and read the response. This is a moderate security concern primarily affecting development environments.

**Dependency Path:**  
```
. > pdf-compressor@1.0.5 > vite-plugin-node-polyfills@0.21.0 > vite@5.4.21 > esbuild@0.21.5
```

### Mitigations Applied

#### 1. esbuild Vulnerability (GHSA-67mh-4wv8-2f99)

**Resolution:** Added pnpm override to force esbuild to version ≥0.25.0

The vulnerability existed as a transitive dependency through `pdf-compressor`. Since this is not a direct dependency, we used pnpm's override mechanism to force all instances of esbuild to use a patched version.

**Change Applied:**
```json
"pnpm": {
  "overrides": {
    "esbuild": ">=0.25.0"
  }
}
```

**Status:** ✅ Resolved

### Current Status

After applying the override and reinstalling dependencies:

```bash
$ pnpm audit
No known vulnerabilities found
```

✅ **No high or critical vulnerabilities remain**

### Deprecated Dependencies

During the audit, the following deprecated subdependencies were noted:

1. `@opentelemetry/exporter-jaeger@1.30.1` - Transitive dependency
2. `node-domexception@1.0.0` - Transitive dependency

**Impact:** Low - These are transitive dependencies that don't currently pose security risks. They should be monitored as upstream packages are updated.

## Dependency Updates

### Direct Dependencies

All direct dependencies were reviewed and are currently at their specified versions. No critical updates were required for security purposes at this time.

### Key Dependencies

| Package | Current Version | Status |
|---------|----------------|--------|
| next | 15.5.6 | ✅ Up to date |
| react | 18.3.1 | ✅ Up to date |
| @supabase/supabase-js | 2.76.1 | ✅ Up to date |
| @genkit-ai/google-genai | 1.22.0 | ✅ Up to date |
| firebase | 11.10.0 | ✅ Up to date |
| firebase-admin | 12.7.0 | ✅ Up to date |

## Package Manager Migration

### pnpm Adoption

The project has been standardized to use **pnpm** as the package manager.

**Benefits:**
- Faster installation times through hard linking
- Strict dependency resolution
- Better disk space efficiency
- Built-in security audit tooling

**Files:**
- ✅ `pnpm-lock.yaml` - Present and up to date
- ✅ `package-lock.json` - Removed/ignored via .gitignore
- ✅ `yarn.lock` - Removed/ignored via .gitignore
- ✅ `package.json` - packageManager field set to "pnpm@9.15.4"

## Build and Test Verification

After applying dependency updates and security fixes:

- ✅ `pnpm install` succeeds
- ✅ Lockfile generated successfully
- ✅ No security vulnerabilities detected
- ⏳ Build verification (to be performed by CI/CD)

## Recommendations

### Ongoing Maintenance

1. **Regular Audits:** Run `pnpm audit` regularly (at least monthly or before each release)
2. **Dependency Updates:** Review and update dependencies quarterly to stay current with security patches
3. **Monitor Advisories:** Subscribe to security advisories for key dependencies (Next.js, React, Supabase, Firebase)
4. **Automated Scanning:** Consider integrating automated security scanning in CI/CD pipeline

### Future Considerations

1. **Dependabot/Renovate:** Consider setting up automated dependency update PRs
2. **Lock File Maintenance:** Ensure `pnpm-lock.yaml` is always committed and kept up to date
3. **Deprecated Dependencies:** Monitor and plan for migration away from deprecated packages

## Follow-up Actions

- [ ] Monitor `@opentelemetry/exporter-jaeger` for replacement in upstream dependencies
- [ ] Monitor `node-domexception` for replacement in upstream dependencies
- [ ] Schedule quarterly dependency review
- [ ] Set up automated security scanning in CI/CD

## References

- [pnpm Documentation](https://pnpm.io/)
- [pnpm Security Audit](https://pnpm.io/cli/audit)
- [GitHub Advisory Database](https://github.com/advisories)
- [npm Security Best Practices](https://docs.npmjs.com/security-best-practices)

---

**Last Updated:** 2025-10-28  
**Next Review Date:** 2026-01-28 (Quarterly)
