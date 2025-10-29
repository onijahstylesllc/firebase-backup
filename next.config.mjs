/**
 * Build Content Security Policy string
 * Note: This is defined here instead of imported to avoid ESM/TypeScript issues
 * The main implementation and documentation is in src/lib/security/csp.ts
 */
function buildCSP() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  
  let supabaseDomain = '';
  if (supabaseUrl) {
    try {
      const url = new URL(supabaseUrl);
      supabaseDomain = url.origin;
    } catch (e) {
      console.warn('Invalid NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl);
    }
  }

  const directives = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-inline'",
      ...(process.env.NODE_ENV === 'development' ? ["'unsafe-eval'"] : []),
    ],
    'style-src': [
      "'self'",
      "'unsafe-inline'",
      'https://fonts.googleapis.com',
    ],
    'img-src': [
      "'self'",
      'data:',
      'blob:',
      'https://picsum.photos',
      ...(supabaseDomain ? [supabaseDomain] : []),
    ],
    'font-src': [
      "'self'",
      'data:',
      'https://fonts.gstatic.com',
    ],
    'connect-src': [
      "'self'",
      ...(supabaseDomain ? [
        supabaseDomain,
        supabaseDomain.replace('https://', 'wss://'),
      ] : []),
    ],
    'media-src': ["'self'"],
    'object-src': ["'none'"],
    'frame-src': ["'self'"],
    'worker-src': ["'self'", 'blob:'],
    'child-src': ["'self'", 'blob:'],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
    'base-uri': ["'self'"],
    ...(process.env.NODE_ENV === 'production' ? {
      'upgrade-insecure-requests': [],
    } : {}),
  };

  return Object.entries(directives)
    .map(([key, values]) => {
      if (values.length === 0) {
        return key;
      }
      return `${key} ${values.join(' ')}`;
    })
    .join('; ');
}

/**
 * Get security headers for the application
 */
function getSecurityHeaders() {
  return {
    'Content-Security-Policy': buildCSP(),
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  };
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable X-Powered-By header for security
  poweredByHeader: false,
  
  // Disable production source maps to prevent code exposure
  productionBrowserSourceMaps: false,
  
  // Disable experimental server source maps
  experimental: {
    serverSourceMaps: false,
  },
  
  async headers() {
    const securityHeaders = getSecurityHeaders();
    
    return [
      {
        // Apply security headers to all routes
        source: '/:path*',
        headers: Object.entries(securityHeaders).map(([key, value]) => ({
          key,
          value,
        })),
      },
    ];
  },
};

export default nextConfig;

