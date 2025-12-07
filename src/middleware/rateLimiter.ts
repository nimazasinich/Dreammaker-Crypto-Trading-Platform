// src/middleware/rateLimiter.ts
// Rate limiting middleware for API endpoint protection

import rateLimit from 'express-rate-limit';
import type { Request, Response } from 'express';
import { Logger } from '../core/Logger.js';

const logger = Logger.getInstance();

// Get rate limit configuration from environment or use secure defaults
const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10); // 1 minute
const RATE_LIMIT_MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10); // 100 requests per window

/**
 * General API rate limiter - applies to most endpoints
 */
export const apiLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX_REQUESTS,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    status: 429,
    retryAfter: RATE_LIMIT_WINDOW_MS / 1000
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  handler: (req: Request, res: Response) => {
    logger.warn('⚠️ Rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      method: req.method
    });
    res.status(429).json({
      error: 'Too many requests from this IP, please try again later.',
      status: 429,
      retryAfter: RATE_LIMIT_WINDOW_MS / 1000
    });
  },
  skip: (req: Request) => {
    // Skip rate limiting for health check and monitoring endpoints
    const healthPaths = [
      '/api/health',
      '/api/system/health',
      '/status/health',
      '/health',
      '/metrics',
      '/api/system/metrics',
      '/api/system/diagnostics'
    ];
    return healthPaths.includes(req.path) || req.path.startsWith('/api/system/diagnostics/');
  }
});

/**
 * Strict rate limiter for authentication endpoints
 * Prevents brute force attacks
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Only 5 attempts per 15 minutes
  message: {
    error: 'Too many authentication attempts, please try again later.',
    status: 429,
    retryAfter: 900 // 15 minutes in seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful authentications
  handler: (req: Request, res: Response) => {
    logger.warn('⚠️ Auth rate limit exceeded - possible brute force attack', {
      ip: req.ip,
      path: req.path,
      method: req.method
    });
    res.status(429).json({
      error: 'Too many authentication attempts from this IP. Account temporarily locked.',
      status: 429,
      retryAfter: 900
    });
  }
});

/**
 * Lenient rate limiter for public/read-only endpoints
 * Allows higher traffic for market data, news, etc.
 */
export const publicLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX_REQUESTS * 3, // 3x normal limit (300 requests/minute)
  message: {
    error: 'Too many requests, please try again later.',
    status: 429,
    retryAfter: RATE_LIMIT_WINDOW_MS / 1000
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.info('Public API rate limit exceeded', {
      ip: req.ip,
      path: req.path
    });
    res.status(429).json({
      error: 'Too many requests, please try again later.',
      status: 429,
      retryAfter: RATE_LIMIT_WINDOW_MS / 1000
    });
  }
});

/**
 * Strict rate limiter for trading endpoints
 * Prevents abuse and excessive order placement
 */
export const tradingLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // Only 20 trades per minute
  message: {
    error: 'Trading rate limit exceeded. Please slow down.',
    status: 429,
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn('⚠️ Trading rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      method: req.method
    });
    res.status(429).json({
      error: 'Trading rate limit exceeded. Please slow down to prevent abuse.',
      status: 429,
      retryAfter: 60
    });
  }
});

/**
 * WebSocket connection rate limiter
 * Prevents connection spam
 */
export const wsConnectionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Max 10 WebSocket connections per minute per IP
  message: {
    error: 'Too many WebSocket connection attempts.',
    status: 429,
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn('⚠️ WebSocket connection rate limit exceeded', {
      ip: req.ip
    });
    res.status(429).json({
      error: 'Too many WebSocket connection attempts. Please wait before reconnecting.',
      status: 429,
      retryAfter: 60
    });
  }
});

logger.info('✅ Rate limiters initialized', {
  windowMs: RATE_LIMIT_WINDOW_MS,
  maxRequests: RATE_LIMIT_MAX_REQUESTS
});

