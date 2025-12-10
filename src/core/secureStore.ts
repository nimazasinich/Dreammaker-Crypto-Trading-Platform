/**
 * Secure Store
 * Provides secure storage for sensitive configuration data
 * Uses in-memory storage for development, can be extended for file/env-based storage
 */

import { Logger } from './Logger';

const logger = Logger.getInstance();

// In-memory store for development
const store: Map<string, unknown> = new Map();

// Storage keys
const TELEGRAM_CONFIG_KEY = 'telegram_config';

/**
 * Read Telegram configuration
 */
export function readTelegramConfig(): Record<string, unknown> | null {
  try {
    // Try environment variables first
    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
      return {
        enabled: process.env.TELEGRAM_ENABLED === 'true',
        onHighSeverity: process.env.TELEGRAM_ON_HIGH_SEVERITY !== 'false',
        onLiquidation: process.env.TELEGRAM_ON_LIQUIDATION !== 'false',
        token: process.env.TELEGRAM_BOT_TOKEN,
        chatId: process.env.TELEGRAM_CHAT_ID,
      };
    }

    // Fall back to in-memory store
    const config = store.get(TELEGRAM_CONFIG_KEY);
    return config ? (config as Record<string, unknown>) : null;
  } catch (error) {
    logger.warn('Failed to read Telegram config', { error: String(error) });
    return null;
  }
}

/**
 * Write Telegram configuration
 */
export function writeTelegramConfig(config: Record<string, unknown>): void {
  try {
    store.set(TELEGRAM_CONFIG_KEY, config);
    logger.debug('Telegram config updated');
  } catch (error) {
    logger.error('Failed to write Telegram config', { error: String(error) });
  }
}

/**
 * Generic secure read
 */
export function secureRead<T>(key: string): T | null {
  try {
    const value = store.get(key);
    return value ? (value as T) : null;
  } catch (error) {
    logger.warn('Failed to read secure value', { key, error: String(error) });
    return null;
  }
}

/**
 * Generic secure write
 */
export function secureWrite<T>(key: string, value: T): void {
  try {
    store.set(key, value);
  } catch (error) {
    logger.error('Failed to write secure value', { key, error: String(error) });
  }
}

/**
 * Clear a secure value
 */
export function secureClear(key: string): void {
  store.delete(key);
}

/**
 * Clear all secure values
 */
export function secureClearAll(): void {
  store.clear();
}
