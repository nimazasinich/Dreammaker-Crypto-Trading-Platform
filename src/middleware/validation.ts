// src/middleware/validation.ts
// Input validation middleware for API endpoints

import type { Request, Response, NextFunction } from 'express';
import { validationError } from './errorHandler.js';

/**
 * Validation result interface
 */
interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate required fields are present
 */
export function validateRequiredFields(fields: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const body = req.body || {};
    const missing: string[] = [];

    for (const field of fields) {
      if (!(field in body) || body[field] === null || body[field] === undefined || body[field] === '') {
        missing.push(field);
      }
    }

    if (missing.length > 0) {
      return next(validationError(`Missing required fields: ${missing.join(', ')}`, { missing }));
    }

    next();
  };
}

/**
 * Validate symbol parameter (crypto trading pairs)
 */
export function validateSymbol(req: Request, res: Response, next: NextFunction) {
  const symbol = req.params.symbol || req.query.symbol || req.body?.symbol;

  if (!symbol) {
    return next(validationError('Symbol parameter is required'));
  }

  // Symbol validation: Alphanumeric, 2-20 characters, optionally ending with USDT/USD/BTC
  const symbolRegex = /^[A-Z0-9]{2,10}(USDT|USD|BTC|ETH|BNB)?$/i;
  if (!symbolRegex.test(symbol)) {
    return next(validationError('Invalid symbol format. Expected format: BTCUSDT, ETH, etc.'));
  }

  // Normalize to uppercase
  if (req.params.symbol) req.params.symbol = symbol.toUpperCase();
  if (req.query.symbol) req.query.symbol = symbol.toUpperCase();
  if (req.body?.symbol) req.body.symbol = symbol.toUpperCase();

  next();
}

/**
 * Validate timeframe parameter
 */
export function validateTimeframe(req: Request, res: Response, next: NextFunction) {
  const timeframe = req.params.timeframe || req.query.timeframe || req.body?.timeframe;

  if (!timeframe) {
    return next(validationError('Timeframe parameter is required'));
  }

  // Valid timeframes: 1m, 5m, 15m, 30m, 1h, 4h, 1d, 1w, etc.
  const validTimeframes = ['1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d', '3d', '1w', '1M'];
  if (!validTimeframes.includes(timeframe)) {
    return next(validationError(`Invalid timeframe. Valid options: ${validTimeframes.join(', ')}`));
  }

  next();
}

/**
 * Validate numeric parameter (positive number)
 */
export function validatePositiveNumber(paramName: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const value = req.params[paramName] || req.query[paramName] || req.body?.[paramName];

    if (value === undefined || value === null || value === '') {
      return next(validationError(`${paramName} is required`));
    }

    const num = Number(value);
    if (isNaN(num) || num <= 0) {
      return next(validationError(`${paramName} must be a positive number`));
    }

    next();
  };
}

/**
 * Validate limit parameter (pagination)
 */
export function validateLimit(req: Request, res: Response, next: NextFunction) {
  const limit = req.query.limit;

  if (limit !== undefined) {
    const num = Number(limit);
    if (isNaN(num) || num < 1 || num > 1000) {
      return next(validationError('Limit must be between 1 and 1000'));
    }

    // Set validated limit
    req.query.limit = String(Math.floor(num));
  }

  next();
}

/**
 * Validate trade order parameters
 */
export function validateTradeOrder(req: Request, res: Response, next: NextFunction) {
  const { symbol, side, type, quantity, price } = req.body;

  const errors: string[] = [];

  // Validate symbol
  if (!symbol || typeof symbol !== 'string') {
    errors.push('symbol is required and must be a string');
  }

  // Validate side
  if (!side || !['BUY', 'SELL', 'buy', 'sell'].includes(side)) {
    errors.push('side must be either BUY or SELL');
  }

  // Validate type
  if (!type || !['MARKET', 'LIMIT', 'STOP_LOSS', 'STOP_LOSS_LIMIT'].includes(type)) {
    errors.push('type must be MARKET, LIMIT, STOP_LOSS, or STOP_LOSS_LIMIT');
  }

  // Validate quantity
  if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0) {
    errors.push('quantity must be a positive number');
  }

  // Validate price for LIMIT orders
  if (type === 'LIMIT' || type === 'STOP_LOSS_LIMIT') {
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      errors.push('price is required for LIMIT orders and must be a positive number');
    }
  }

  if (errors.length > 0) {
    return next(validationError('Trade order validation failed', { errors }));
  }

  // Normalize values
  req.body.side = side.toUpperCase();
  req.body.symbol = symbol.toUpperCase();
  req.body.quantity = Number(quantity);
  if (price) req.body.price = Number(price);

  next();
}

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';
  
  // Remove HTML tags and dangerous characters
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>'"]/g, '') // Remove dangerous characters
    .trim();
}

/**
 * Sanitize object recursively
 */
export function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  // Sanitize body
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query params
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }

  next();
}

/**
 * Recursively sanitize object properties
 */
function sanitizeObject(obj: any): any {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  const sanitized: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Validate JSON body exists and is valid
 */
export function validateJsonBody(req: Request, res: Response, next: NextFunction) {
  if (!req.body || Object.keys(req.body).length === 0) {
    return next(validationError('Request body is required'));
  }

  next();
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate API key format (for future authentication)
 */
export function validateApiKey(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;

  if (!apiKey) {
    return next(validationError('API key is required', { header: 'X-API-Key' }));
  }

  if (typeof apiKey !== 'string' || apiKey.length < 32) {
    return next(validationError('Invalid API key format'));
  }

  // TODO: Verify API key against database
  // For now, just validate format

  next();
}

console.log('✅ Validation middleware loaded');

