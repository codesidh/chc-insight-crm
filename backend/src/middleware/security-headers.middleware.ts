/**
 * Security Headers Middleware
 * 
 * Implements HTTPS enforcement and basic security headers
 * Requirements: 12.1, 12.4
 */

import { Request, Response, NextFunction } from 'express';

export interface SecurityConfig {
  enforceHttps: boolean;
  hsts: {
    maxAge: number;
    includeSubDomains: boolean;
    preload: boolean;
  };
  contentSecurityPolicy: {
    directives: Record<string, string[]>;
  };
  frameOptions: 'DENY' | 'SAMEORIGIN' | string;
  contentTypeOptions: boolean;
  referrerPolicy: string;
  permissionsPolicy: Record<string, string[]>;
}

class SecurityHeadersManager {
  private config: SecurityConfig;

  constructor(config: Partial<SecurityConfig> = {}) {
    this.config = {
      enforceHttps: process.env['NODE_ENV'] === 'production',
      hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true
      },
      contentSecurityPolicy: {
        directives: {
          'default-src': ["'self'"],
          'script-src': ["'self'", "'unsafe-inline'"],
          'style-src': ["'self'", "'unsafe-inline'"],
          'img-src': ["'self'", 'data:', 'https:'],
          'font-src': ["'self'"],
          'connect-src': ["'self'"],
          'frame-ancestors': ["'none'"],
          'base-uri': ["'self'"],
          'form-action': ["'self'"]
        }
      },
      frameOptions: 'DENY',
      contentTypeOptions: true,
      referrerPolicy: 'strict-origin-when-cross-origin',
      permissionsPolicy: {
        'camera': [],
        'microphone': [],
        'geolocation': [],
        'payment': [],
        'usb': [],
        'magnetometer': [],
        'gyroscope': [],
        'accelerometer': []
      },
      ...config
    };
  }

  /**
   * Apply security headers to response
   */
  applyHeaders(req: Request, res: Response): void {
    // HTTPS enforcement
    if (this.config.enforceHttps && !req.secure && req.get('X-Forwarded-Proto') !== 'https') {
      const httpsUrl = `https://${req.get('Host')}${req.url}`;
      res.redirect(301, httpsUrl);
      return;
    }

    // HTTP Strict Transport Security (HSTS)
    if (req.secure || req.get('X-Forwarded-Proto') === 'https') {
      let hstsValue = `max-age=${this.config.hsts.maxAge}`;
      if (this.config.hsts.includeSubDomains) {
        hstsValue += '; includeSubDomains';
      }
      if (this.config.hsts.preload) {
        hstsValue += '; preload';
      }
      res.setHeader('Strict-Transport-Security', hstsValue);
    }

    // Content Security Policy
    const cspDirectives = Object.entries(this.config.contentSecurityPolicy.directives)
      .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
      .join('; ');
    res.setHeader('Content-Security-Policy', cspDirectives);

    // X-Frame-Options
    res.setHeader('X-Frame-Options', this.config.frameOptions);

    // X-Content-Type-Options
    if (this.config.contentTypeOptions) {
      res.setHeader('X-Content-Type-Options', 'nosniff');
    }

    // Referrer Policy
    res.setHeader('Referrer-Policy', this.config.referrerPolicy);

    // Permissions Policy
    const permissionsPolicyDirectives = Object.entries(this.config.permissionsPolicy)
      .map(([feature, allowlist]) => {
        if (allowlist.length === 0) {
          return `${feature}=()`;
        }
        return `${feature}=(${allowlist.join(' ')})`;
      })
      .join(', ');
    res.setHeader('Permissions-Policy', permissionsPolicyDirectives);

    // X-XSS-Protection (legacy, but still useful for older browsers)
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Remove server information
    res.removeHeader('X-Powered-By');
    res.removeHeader('Server');

    // Cache control for sensitive endpoints
    if (this.isSensitiveEndpoint(req.path)) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }

    // CORS headers for API endpoints
    if (req.path.startsWith('/api/')) {
      this.applyCorsHeaders(req, res);
    }
  }

  /**
   * Apply CORS headers
   */
  private applyCorsHeaders(req: Request, res: Response): void {
    const origin = req.get('Origin');
    const allowedOrigins = this.getAllowedOrigins();

    // Check if origin is allowed
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (allowedOrigins.includes('*')) {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }

    // Allow credentials for same-origin requests
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    // Allowed methods
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');

    // Allowed headers
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-CSRF-Token'
    );

    // Exposed headers
    res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count, X-Page-Count');

    // Preflight cache
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
  }

  /**
   * Get allowed origins from environment
   */
  private getAllowedOrigins(): string[] {
    const origins = process.env['ALLOWED_ORIGINS'] || 'http://localhost:3000';
    return origins.split(',').map(origin => origin.trim());
  }

  /**
   * Check if endpoint contains sensitive data
   */
  private isSensitiveEndpoint(path: string): boolean {
    const sensitivePatterns = [
      '/api/auth/',
      '/api/users/',
      '/api/members/',
      '/api/providers/',
      '/api/reports/',
      '/api/admin/'
    ];

    return sensitivePatterns.some(pattern => path.includes(pattern));
  }
}

const securityManager = new SecurityHeadersManager();

/**
 * Security headers middleware
 */
export const securityHeadersMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  securityManager.applyHeaders(req, res);
  next();
};

/**
 * CSRF protection middleware
 */
export const csrfProtection = (req: Request, res: Response, next: NextFunction): void => {
  // Skip CSRF for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Skip CSRF for API endpoints using JWT authentication
  if (req.path.startsWith('/api/') && req.headers.authorization?.startsWith('Bearer ')) {
    return next();
  }

  const token = req.headers['x-csrf-token'] || req.body._csrf;
  const sessionToken = (req as any).session?.csrfToken;

  if (!token || !sessionToken || token !== sessionToken) {
    res.status(403).json({
      success: false,
      error: {
        code: 'CSRF_TOKEN_MISMATCH',
        message: 'CSRF token validation failed'
      }
    });
    return;
  }

  next();
};

/**
 * Rate limiting middleware
 */
export const rateLimitMiddleware = (options: {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
} = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100
}) => {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction): void => {
    const key = req.ip || 'unknown';
    const now = Date.now();
    const windowStart = now - options.windowMs;

    // Clean up old entries
    for (const [ip, data] of requests.entries()) {
      if (data.resetTime < windowStart) {
        requests.delete(ip);
      }
    }

    // Get or create request data for this IP
    let requestData = requests.get(key);
    if (!requestData || requestData.resetTime < windowStart) {
      requestData = { count: 0, resetTime: now + options.windowMs };
      requests.set(key, requestData);
    }

    // Check if limit exceeded
    if (requestData.count >= options.maxRequests) {
      res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests, please try again later',
          retryAfter: Math.ceil((requestData.resetTime - now) / 1000)
        }
      });
      return;
    }

    // Increment request count
    requestData.count++;

    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', options.maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, options.maxRequests - requestData.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(requestData.resetTime / 1000));

    next();
  };
};

/**
 * Security configuration for different environments
 */
export const securityConfigs = {
  development: {
    enforceHttps: false,
    contentSecurityPolicy: {
      directives: {
        'default-src': ["'self'"],
        'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        'style-src': ["'self'", "'unsafe-inline'"],
        'img-src': ["'self'", 'data:', 'https:', 'http:'],
        'connect-src': ["'self'", 'ws:', 'wss:']
      }
    }
  },
  production: {
    enforceHttps: true,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    contentSecurityPolicy: {
      directives: {
        'default-src': ["'self'"],
        'script-src': ["'self'"],
        'style-src': ["'self'", "'unsafe-inline'"],
        'img-src': ["'self'", 'data:', 'https:'],
        'connect-src': ["'self'"],
        'frame-ancestors': ["'none'"],
        'upgrade-insecure-requests': []
      }
    }
  }
};

export default securityHeadersMiddleware;