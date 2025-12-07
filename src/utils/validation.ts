/**
 * Validation utility for form inputs and data validation
 */
import { ValidationError } from '../types';

// Validation rules
export type ValidationRule = {
  test: (value: any, formValues?: Record<string, any>) => boolean;
  message: string;
};

// Common validation rules
export const rules = {
  required: (message = 'This field is required'): ValidationRule => ({
    test: (value) => {
      if (value === undefined || value === null) return false;
      if (typeof value === 'string') return value.trim().length > 0;
      if (Array.isArray(value)) return (value?.length || 0) > 0;
      return true;
    },
    message,
  }),
  
  minLength: (min: number, message = `Must be at least ${min} characters`): ValidationRule => ({
    test: (value) => typeof value === 'string' && value.trim().length >= min,
    message,
  }),
  
  maxLength: (max: number, message = `Must be no more than ${max} characters`): ValidationRule => ({
    test: (value) => typeof value === 'string' && value.trim().length <= max,
    message,
  }),
  
  email: (message = 'Please enter a valid email address'): ValidationRule => ({
    test: (value) => {
      if (typeof value !== 'string') return false;
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return emailRegex.test(value);
    },
    message,
  }),
  
  numeric: (message = 'Please enter a valid number'): ValidationRule => ({
    test: (value) => !isNaN(parseFloat(value)) && isFinite(value),
    message,
  }),
  
  integer: (message = 'Please enter a valid integer'): ValidationRule => ({
    test: (value) => Number.isInteger(Number(value)),
    message,
  }),
  
  min: (min: number, message = `Must be at least ${min}`): ValidationRule => ({
    test: (value) => Number(value) >= min,
    message,
  }),
  
  max: (max: number, message = `Must be no more than ${max}`): ValidationRule => ({
    test: (value) => Number(value) <= max,
    message,
  }),
  
  pattern: (regex: RegExp, message = 'Invalid format'): ValidationRule => ({
    test: (value) => regex.test(String(value)),
    message,
  }),
  
  match: (field: string, message = `Must match ${field}`): ValidationRule => ({
    test: (value, formValues) => value === formValues?.[field],
    message,
  }),
};

/**
 * Validate a single value against a set of rules
 * @param value Value to validate
 * @param validationRules Rules to validate against
 * @param formValues Optional form values for cross-field validation
 * @returns Error message or null if valid
 */
export function validateValue(
  value: any,
  validationRules: ValidationRule[],
  formValues?: Record<string, any>
): string | null {
  for (const rule of validationRules) {
    if (!rule.test(value, formValues)) {
      return rule.message;
    }
  }
  return null;
}

/**
 * Validate a form against a schema of rules
 * @param values Form values
 * @param schema Validation schema
 * @returns Object with errors for each field
 */
export function validateForm(
  values: Record<string, any>,
  schema: Record<string, ValidationRule[]>
): Record<string, string | null> {
  const errors: Record<string, string | null> = {};
  
  Object.entries(schema).forEach(([field, rules]) => {
    const error = validateValue(values[field], rules, values);
    if (error) {
      errors[field] = error;
    }
  });
  
  return errors;
}

/**
 * Check if a form has any validation errors
 * @param errors Validation errors object
 * @returns True if form has errors
 */
export function hasErrors(errors: Record<string, string | null>): boolean {
  return Object.values(errors).some(error => error !== null);
}

/**
 * Format validation errors for API response
 * @param errors Validation errors from server
 * @returns Formatted validation errors
 */
export function formatApiValidationErrors(errors: ValidationError[]): Record<string, string> {
  const formattedErrors: Record<string, string> = {};
  
  errors.forEach(error => {
    formattedErrors[error.field] = error.message;
  });
  
  return formattedErrors;
}

/**
 * Create a validation schema for a form
 * @param schema Schema definition
 * @returns Validation schema
 */
export function createValidationSchema(schema: Record<string, ValidationRule[]>) {
  return schema;
}

/**
 * Validate data against a schema
 * @param data Data to validate
 * @param schema Validation schema
 * @returns Array of validation errors or empty array if valid
 */
export function validateData(
  data: Record<string, any>,
  schema: Record<string, ValidationRule[]>
): ValidationError[] {
  const errors: ValidationError[] = [];

  Object.entries(schema).forEach(([field, rules]) => {
    const error = validateValue(data[field], rules);
    if (error) {
      errors.push({
        field,
        message: error
      });
    }
  });

  return errors;
}

// ==================== Trading-Specific Validations ====================

export interface ValidationResult {
  valid: boolean;
  error?: string;
  warnings?: string[];
}

export interface TradeOrderData {
  side: 'LONG' | 'SHORT' | 'BUY' | 'SELL';
  price: number;
  quantity: number;
  stopLoss?: number;
  takeProfit?: number;
  leverage?: number;
}

/**
 * Validate that weights sum to 100%
 */
export function validateWeights(weights: number[], tolerance: number = 0.01): ValidationResult {
  if (!weights || weights.length === 0) {
    return { valid: false, error: 'At least one weight is required' };
  }

  if (weights.some((w) => w < 0)) {
    return { valid: false, error: 'All weights must be positive (≥ 0%)' };
  }

  if (weights.some((w) => w > 100)) {
    return { valid: false, error: 'Individual weights cannot exceed 100%' };
  }

  const total = weights.reduce((sum, w) => sum + w, 0);
  const diff = Math.abs(total - 100);

  if (diff > tolerance) {
    return {
      valid: false,
      error: `Total weight is ${total.toFixed(2)}%. Must equal 100.00%`,
    };
  }

  return { valid: true };
}

/**
 * Validate trade order before submission
 */
export function validateTradeOrder(order: TradeOrderData): ValidationResult {
  const warnings: string[] = [];

  if (order.price <= 0) {
    return { valid: false, error: 'Price must be greater than 0' };
  }

  if (order.quantity <= 0) {
    return { valid: false, error: 'Quantity must be greater than 0' };
  }

  if (order.leverage !== undefined) {
    if (order.leverage < 1 || order.leverage > 125) {
      return { valid: false, error: 'Leverage must be between 1x and 125x' };
    }
    if (order.leverage > 20) {
      warnings.push(`High leverage (${order.leverage}x) increases risk significantly`);
    }
  }

  // Validate stop loss for longs
  if ((order.side === 'LONG' || order.side === 'BUY') && order.stopLoss !== undefined) {
    if (order.stopLoss >= order.price) {
      return { valid: false, error: 'Stop loss must be below entry price for long positions' };
    }
    const slDistance = ((order.price - order.stopLoss) / order.price) * 100;
    if (slDistance < 0.5) {
      warnings.push('Stop loss is very close to entry price (< 0.5%)');
    }
  }

  // Validate stop loss for shorts
  if ((order.side === 'SHORT' || order.side === 'SELL') && order.stopLoss !== undefined) {
    if (order.stopLoss <= order.price) {
      return { valid: false, error: 'Stop loss must be above entry price for short positions' };
    }
    const slDistance = ((order.stopLoss - order.price) / order.price) * 100;
    if (slDistance < 0.5) {
      warnings.push('Stop loss is very close to entry price (< 0.5%)');
    }
  }

  // Validate take profit for longs
  if ((order.side === 'LONG' || order.side === 'BUY') && order.takeProfit !== undefined) {
    if (order.takeProfit <= order.price) {
      return { valid: false, error: 'Take profit must be above entry price for long positions' };
    }
  }

  // Validate take profit for shorts
  if ((order.side === 'SHORT' || order.side === 'SELL') && order.takeProfit !== undefined) {
    if (order.takeProfit >= order.price) {
      return { valid: false, error: 'Take profit must be below entry price for short positions' };
    }
  }

  // Check risk/reward ratio
  if (order.stopLoss !== undefined && order.takeProfit !== undefined) {
    let risk: number, reward: number;
    if (order.side === 'LONG' || order.side === 'BUY') {
      risk = order.price - order.stopLoss;
      reward = order.takeProfit - order.price;
    } else {
      risk = order.stopLoss - order.price;
      reward = order.price - order.takeProfit;
    }
    const riskRewardRatio = reward / risk;
    if (riskRewardRatio < 1) {
      warnings.push(`Poor risk/reward ratio (${riskRewardRatio.toFixed(2)}:1). Consider adjusting targets.`);
    }
  }

  return { valid: true, warnings: warnings.length > 0 ? warnings : undefined };
}

/**
 * Validate symbol format
 */
export function validateSymbol(symbol: string): ValidationResult {
  if (!symbol || symbol.trim().length === 0) {
    return { valid: false, error: 'Symbol is required' };
  }

  const symbolRegex = /^[A-Z0-9]+$/;
  if (!symbolRegex.test(symbol)) {
    return { valid: false, error: 'Symbol must be uppercase alphanumeric (e.g., BTCUSDT)' };
  }

  if (symbol.length < 2 || symbol.length > 20) {
    return { valid: false, error: 'Symbol must be between 2 and 20 characters' };
  }

  return { valid: true };
}