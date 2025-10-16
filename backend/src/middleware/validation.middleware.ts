/**
 * Data Validation and Sanitization Middleware
 * 
 * Implements basic data validation and sanitization for security
 * Requirements: 12.1, 12.4
 */

import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema, ZodError } from 'zod';
import DOMPurify from 'isomorphic-dompurify';
import validator from 'validator';

export interface ValidationOptions {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
  sanitizeHtml?: boolean;
  sanitizeInput?: boolean;
  maxBodySize?: number;
  allowedFileTypes?: string[];
}

export interface SanitizationConfig {
  stripHtml: boolean;
  escapeHtml: boolean;
  trimWhitespace: boolean;
  normalizeEmail: boolean;
  removeNullBytes: boolean;
  maxStringLength: number;
}

class DataValidator {
  private defaultSanitizationConfig: SanitizationConfig = {
    stripHtml: true,
    escapeHtml: true,
    trimWhitespace: true,
    normalizeEmail: true,
    removeNullBytes: true,
    maxStringLength: 10000
  };

  /**
   * Sanitize input data
   */
  sanitizeData(data: any, config: Partial<SanitizationConfig> = {}): any {
    const sanitizationConfig = { ...this.defaultSanitizationConfig, ...config };

    if (typeof data === 'string') {
      return this.sanitizeString(data, sanitizationConfig);
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeData(item, sanitizationConfig));
    }

    if (data && typeof data === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        // Sanitize the key as well
        const sanitizedKey = this.sanitizeString(key, sanitizationConfig);
        sanitized[sanitizedKey] = this.sanitizeData(value, sanitizationConfig);
      }
      return sanitized;
    }

    return data;
  }

  /**
   * Sanitize string input
   */
  private sanitizeString(str: string, config: SanitizationConfig): string {
    let sanitized = str;

    // Remove null bytes
    if (config.removeNullBytes) {
      sanitized = sanitized.replace(/\0/g, '');
    }

    // Trim whitespace
    if (config.trimWhitespace) {
      sanitized = sanitized.trim();
    }

    // Limit string length
    if (sanitized.length > config.maxStringLength) {
      sanitized = sanitized.substring(0, config.maxStringLength);
    }

    // Strip HTML tags
    if (config.stripHtml) {
      sanitized = DOMPurify.sanitize(sanitized, { ALLOWED_TAGS: [] });
    }

    // Escape HTML entities
    if (config.escapeHtml && !config.stripHtml) {
      sanitized = validator.escape(sanitized);
    }

    // Normalize email addresses
    if (config.normalizeEmail && validator.isEmail(sanitized)) {
      sanitized = validator.normalizeEmail(sanitized) || sanitized;
    }

    return sanitized;
  }

  /**
   * Validate file upload
   */
  validateFileUpload(file: any, allowedTypes: string[] = []): boolean {
    if (!file) return false;

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('File size exceeds 10MB limit');
    }

    // Check file type
    if (allowedTypes.length > 0) {
      const fileType = file.mimetype || file.type;
      if (!allowedTypes.includes(fileType)) {
        throw new Error(`File type ${fileType} not allowed`);
      }
    }

    // Check for malicious file extensions
    const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com'];
    const fileName = file.originalname || file.name || '';
    const hasExtension = dangerousExtensions.some(ext => 
      fileName.toLowerCase().endsWith(ext)
    );

    if (hasExtension) {
      throw new Error('File type not allowed for security reasons');
    }

    return true;
  }

  /**
   * Detect potential SQL injection patterns
   */
  detectSqlInjection(input: string): boolean {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
      /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
      /(--|\/\*|\*\/)/,
      /(\b(SCRIPT|JAVASCRIPT|VBSCRIPT)\b)/i,
      /(<\s*script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>)/gi
    ];

    return sqlPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Detect potential XSS patterns
   */
  detectXss(input: string): boolean {
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe\b[^>]*>/i,
      /<object\b[^>]*>/i,
      /<embed\b[^>]*>/i,
      /<link\b[^>]*>/i,
      /<meta\b[^>]*>/i
    ];

    return xssPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Validate and sanitize request data
   */
  validateRequest(req: Request, options: ValidationOptions): any {
    const errors: string[] = [];
    const sanitized: any = {};

    // Check body size
    if (options.maxBodySize && req.body) {
      const bodySize = JSON.stringify(req.body).length;
      if (bodySize > options.maxBodySize) {
        errors.push(`Request body size ${bodySize} exceeds limit ${options.maxBodySize}`);
      }
    }

    // Sanitize and validate body
    if (req.body && options.sanitizeInput) {
      req.body = this.sanitizeData(req.body);
    }

    // Validate with Zod schemas
    try {
      if (options.body && req.body) {
        sanitized.body = options.body.parse(req.body);
      }

      if (options.query && req.query) {
        const sanitizedQuery = options.sanitizeInput 
          ? this.sanitizeData(req.query) 
          : req.query;
        sanitized.query = options.query.parse(sanitizedQuery);
      }

      if (options.params && req.params) {
        const sanitizedParams = options.sanitizeInput 
          ? this.sanitizeData(req.params) 
          : req.params;
        sanitized.params = options.params.parse(sanitizedParams);
      }
    } catch (error) {
      if (error instanceof ZodError) {
        errors.push(...error.errors.map(e => `${e.path.join('.')}: ${e.message}`));
      } else {
        errors.push('Validation error occurred');
      }
    }

    // Check for potential attacks
    const checkForAttacks = (obj: any, path = ''): void => {
      if (typeof obj === 'string') {
        if (this.detectSqlInjection(obj)) {
          errors.push(`Potential SQL injection detected in ${path}`);
        }
        if (this.detectXss(obj)) {
          errors.push(`Potential XSS attack detected in ${path}`);
        }
      } else if (obj && typeof obj === 'object') {
        for (const [key, value] of Object.entries(obj)) {
          checkForAttacks(value, path ? `${path}.${key}` : key);
        }
      }
    };

    if (req.body) checkForAttacks(req.body, 'body');
    if (req.query) checkForAttacks(req.query, 'query');
    if (req.params) checkForAttacks(req.params, 'params');

    if (errors.length > 0) {
      throw new ValidationError('Validation failed', errors);
    }

    return sanitized;
  }
}

export class ValidationError extends Error {
  public errors: string[];

  constructor(message: string, errors: string[]) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

const dataValidator = new DataValidator();

/**
 * Middleware factory for request validation
 */
export const validateRequest = (options: ValidationOptions) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Validate file uploads if present
      if ((req as any).file && options.allowedFileTypes) {
        dataValidator.validateFileUpload((req as any).file, options.allowedFileTypes);
      }

      if ((req as any).files && Array.isArray((req as any).files) && options.allowedFileTypes) {
        for (const file of (req as any).files) {
          dataValidator.validateFileUpload(file, options.allowedFileTypes);
        }
      }

      // Validate and sanitize request data
      const sanitized = dataValidator.validateRequest(req, options);

      // Attach sanitized data to request
      if (sanitized.body) req.body = sanitized.body;
      if (sanitized.query) req.query = sanitized.query;
      if (sanitized.params) req.params = sanitized.params;

      next();
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: error.message,
            details: error.errors
          }
        });
      } else {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: error instanceof Error ? error.message : 'Validation failed'
          }
        });
      }
    }
  };
};

/**
 * Common validation schemas
 */
export const commonSchemas = {
  uuid: z.string().uuid(),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  tenantId: z.string().uuid(),
  userId: z.string().uuid(),
  pagination: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20)
  }),
  dateRange: z.object({
    start: z.string().datetime(),
    end: z.string().datetime()
  }),
  search: z.object({
    q: z.string().min(1).max(100),
    limit: z.coerce.number().min(1).max(50).default(10)
  })
};

/**
 * Sanitization utilities
 */
export const sanitize = {
  data: dataValidator.sanitizeData.bind(dataValidator),
  detectSqlInjection: dataValidator.detectSqlInjection.bind(dataValidator),
  detectXss: dataValidator.detectXss.bind(dataValidator),
  validateFile: dataValidator.validateFileUpload.bind(dataValidator)
};

export default validateRequest;