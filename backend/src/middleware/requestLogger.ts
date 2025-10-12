import { Request, Response, NextFunction } from 'express';

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();

  // Log request details
  console.log(`📥 ${timestamp} ${req.method} ${req.url}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    contentType: req.get('Content-Type'),
    contentLength: req.get('Content-Length'),
  });

  // Override res.end to log response details
  const originalEnd = res.end;
  res.end = function (chunk?: any, encoding?: any): Response {
    const duration = Date.now() - startTime;
    const responseTime = new Date().toISOString();

    // Log response details
    console.log(`📤 ${responseTime} ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`, {
      statusCode: res.statusCode,
      contentLength: res.get('Content-Length'),
      duration: `${duration}ms`,
    });

    // Call original end method
    return originalEnd.call(this, chunk, encoding);
  };

  next();
};
