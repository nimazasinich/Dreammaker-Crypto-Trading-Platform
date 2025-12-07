// src/middleware/errorHandler.ts
// Global error handler middleware for consistent JSON error responses

import type { Request, Response, NextFunction } from 'express';
import { Logger } from '../core/Logger.js';

const logger = Logger.getInstance();

/**
 * Custom error class with HTTP status code
 */
export class HttpError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'HttpError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error response interface
 */
interface ErrorResponse {
  error: string;
  status: number;
  timestamp: string;
  path?: string;
  details?: any;
  requestId?: string;
  stack?: string;
}

/**
 * Global error handler middleware
 * Ensures all errors return consistent JSON responses (never HTML)
 */
export function errorHandler(
  err: Error | HttpError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Prevent sending response if headers already sent
  if (res.headersSent) {
    return next(err);
  }

  // Determine status code
  let statusCode = 500;
  if (err instanceof HttpError) {
    statusCode = err.statusCode;
  } else if ('statusCode' in err && typeof (err as any).statusCode === 'number') {
    statusCode = (err as any).statusCode;
  } else if ('status' in err && typeof (err as any).status === 'number') {
    statusCode = (err as any).status;
  }

  // Build error response
  const errorResponse: ErrorResponse = {
    error: err.message || 'Internal server error',
    status: statusCode,
    timestamp: new Date().toISOString(),
    path: req.path,
    requestId: (req as any).correlationId
  };

  // Add details if available (for validation errors, etc.)
  if (err instanceof HttpError && err.details) {
    errorResponse.details = err.details;
  }

  // Include stack trace in development only
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    errorResponse.stack = err.stack;
  }

  // Log error with appropriate severity
  if (statusCode >= 500) {
    // Server errors (5xx) are logged as errors
    logger.error('Server error', {
      statusCode,
      message: err.message,
      path: req.path,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    }, err);
  } else if (statusCode >= 400) {
    // Client errors (4xx) are logged as warnings
    logger.warn('Client error', {
      statusCode,
      message: err.message,
      path: req.path,
      method: req.method,
      ip: req.ip
    });
  }

  // Send JSON error response
  res.status(statusCode).json(errorResponse);
}

/**
 * 404 Not Found handler
 * Must be placed after all routes
 */
export function notFoundHandler(req: Request, res: Response): void {
  logger.warn('404 Not Found', {
    path: req.path,
    method: req.method,
    ip: req.ip
  });

  res.status(404).json({
    error: `Cannot ${req.method} ${req.path}`,
    status: 404,
    timestamp: new Date().toISOString(),
    path: req.path
  });
}

/**
 * Async route handler wrapper
 * Catches async errors and passes them to error handler
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Validation error helper
 * Creates consistent validation error responses
 */
export function validationError(message: string, details?: any): HttpError {
  return new HttpError(400, message, details);
}

/**
 * Unauthorized error helper
 */
export function unauthorizedError(message: string = 'Unauthorized'): HttpError {
  return new HttpError(401, message);
}

/**
 * Forbidden error helper
 */
export function forbiddenError(message: string = 'Forbidden'): HttpError {
  return new HttpError(403, message);
}

/**
 * Not found error helper
 */
export function notFoundError(message: string = 'Resource not found'): HttpError {
  return new HttpError(404, message);
}

/**
 * Rate limit error helper
 */
export function rateLimitError(message: string = 'Too many requests'): HttpError {
  return new HttpError(429, message);
}

/**
 * Internal server error helper
 */
export function serverError(message: string = 'Internal server error', details?: any): HttpError {
  return new HttpError(500, message, details);
}

logger.info('✅ Error handler middleware loaded');

