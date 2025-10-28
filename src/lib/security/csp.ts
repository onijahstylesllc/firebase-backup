/**
 * Content Security Policy (CSP) Configuration
 * 
 * Builds a comprehensive CSP header string based on environment variables
 * and application requirements to secure the application against XSS and
 * other code injection attacks.
 */

interface CSPConfig {
  supabaseUrl?: string;
  additionalImageSources?: string[];
  additionalConnectSources?: string[];
}

/**
 * Builds a Content Security Policy string for the application.
 * 
 * @param config - Optional configuration for CSP directives
 * @returns CSP header value string
 */
export function buildCSP(config: CSPConfig = {}): string {
  const {
    supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL,
    additionalImageSources = [],
    additionalConnectSources = [],
  } = config;

  // Parse Supabase URL to get the domain
  let supabaseDomain = '';
  if (supabaseUrl) {
    try {
      const url = new URL(supabaseUrl);
      supabaseDomain = url.origin;
    } catch (e) {
      console.warn('Invalid NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl);
    }
  }

  const directives: Record<string, string[]> = {
    // Default fallback - restrict to same origin
    'default-src': ["'self'"],

    // Scripts: Allow self and necessary inline scripts
    // Next.js requires 'unsafe-eval' in development and 'unsafe-inline' for some features
    'script-src': [
      "'self'",
      // Allow inline scripts (Next.js uses them)
      "'unsafe-inline'",
      // Allow eval in development (Next.js hot reload)
      ...(process.env.NODE_ENV === 'development' ? ["'unsafe-eval'"] : []),
    ],

    // Styles: Allow self, inline styles, and unsafe-inline for dynamic styles
    // Many components use React's style prop for dynamic styling
    'style-src': [
      "'self'",
      "'unsafe-inline'", // Required for React inline styles and CSS custom properties
      'https://fonts.googleapis.com',
    ],

    // Images: Allow self, data URIs, and external image sources
    'img-src': [
      "'self'",
      'data:',
      'blob:',
      'https://picsum.photos', // Placeholder images
      ...(supabaseDomain ? [supabaseDomain] : []),
      ...additionalImageSources,
    ],

    // Fonts: Allow self and Google Fonts
    'font-src': [
      "'self'",
      'data:',
      'https://fonts.gstatic.com',
    ],

    // AJAX, WebSocket, and EventSource connections
    'connect-src': [
      "'self'",
      ...(supabaseDomain ? [
        supabaseDomain,
        // Supabase realtime WebSocket
        supabaseDomain.replace('https://', 'wss://'),
      ] : []),
      ...additionalConnectSources,
    ],

    // Media sources (audio/video)
    'media-src': ["'self'"],

    // Object sources (for <object>, <embed>, <applet>)
    'object-src': ["'none'"],

    // Frame sources (for iframes)
    'frame-src': ["'self'"],

    // Worker sources (for Web Workers, Service Workers)
    'worker-src': [
      "'self'",
      'blob:',
    ],

    // Child sources (deprecated but still supported in some browsers)
    'child-src': [
      "'self'",
      'blob:',
    ],

    // Form action destinations
    'form-action': ["'self'"],

    // Frame ancestors (who can embed this site in a frame)
    'frame-ancestors': ["'none'"],

    // Base URI restriction
    'base-uri': ["'self'"],

    // Upgrade insecure requests in production
    ...(process.env.NODE_ENV === 'production' ? {
      'upgrade-insecure-requests': [],
    } : {}),
  };

  // Build CSP string
  return Object.entries(directives)
    .map(([key, values]) => {
      if (values.length === 0) {
        return key; // Directives like 'upgrade-insecure-requests' have no values
      }
      return `${key} ${values.join(' ')}`;
    })
    .join('; ');
}

/**
 * Get all security headers for the application.
 * 
 * @returns Object containing security headers
 */
export function getSecurityHeaders() {
  const csp = buildCSP();

  return {
    // Content Security Policy
    'Content-Security-Policy': csp,

    // Strict Transport Security (HSTS)
    // Tells browsers to only access the site over HTTPS
    // max-age: 1 year (31536000 seconds)
    // includeSubDomains: Apply to all subdomains
    // preload: Allow inclusion in browser HSTS preload lists
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',

    // Prevent browsers from MIME-sniffing
    'X-Content-Type-Options': 'nosniff',

    // Prevent clickjacking by not allowing the site to be framed
    // Note: frame-ancestors in CSP provides better control, but this is for older browsers
    'X-Frame-Options': 'DENY',

    // Control how much referrer information is sent
    // strict-origin-when-cross-origin: Send full URL for same-origin, only origin for cross-origin HTTPS
    'Referrer-Policy': 'strict-origin-when-cross-origin',

    // Control browser features and APIs
    // Restrict access to sensitive features
    'Permissions-Policy': [
      'camera=()',      // Disable camera access
      'microphone=()',  // Disable microphone access
      'geolocation=()', // Disable geolocation
      'interest-cohort=()', // Disable FLoC (privacy)
    ].join(', '),
  };
}
