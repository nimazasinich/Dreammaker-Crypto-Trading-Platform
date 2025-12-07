/**
 * Storage Service - Persistent Data Management
 *
 * Provides a unified interface for persisting user data across sessions.
 * Uses localStorage with error handling and type safety.
 *
 * @example
 * ```ts
 * // Save settings
 * storage.saveSettings({ theme: 'dark', language: 'en' });
 *
 * // Load settings
 * const settings = storage.loadSettings();
 *
 * // Save tab state
 * storage.saveTabState('market-view', 'charting');
 * ```
 *
 * @version 1.0.0
 */

import { Logger } from '../core/Logger';

const logger = Logger.getInstance();

// Storage keys
const STORAGE_KEYS = {
  SETTINGS: 'dreammaker_settings',
  PREFERENCES: 'dreammaker_preferences',
  TAB_PREFIX: 'dreammaker_tab_',
  CHART_SETTINGS: 'dreammaker_chart_settings',
  FAVORITES: 'dreammaker_favorites',
  RECENT_SYMBOLS: 'dreammaker_recent_symbols',
  LAYOUT: 'dreammaker_layout',
  WATCHLIST: 'dreammaker_watchlist',
} as const;

// Type definitions
export interface Settings {
  theme: 'light' | 'dark' | 'auto';
  language: 'en' | 'fa';
  notifications: boolean;
  soundEnabled: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
  defaultTimeframe: string;
  defaultExchange: string;
}

export interface UserPreferences {
  compactMode: boolean;
  showAdvancedFeatures: boolean;
  defaultView: string;
  chartType: 'candlestick' | 'line' | 'area';
  showVolume: boolean;
  showGrid: boolean;
  indicators: string[];
}

export interface ChartSettings {
  type: 'candlestick' | 'line' | 'area';
  timeframe: string;
  indicators: string[];
  overlays: string[];
  showVolume: boolean;
  showGrid: boolean;
  colors: {
    up: string;
    down: string;
    volume: string;
  };
}

export interface LayoutConfig {
  sidebar: {
    collapsed: boolean;
    width: number;
  };
  panels: {
    [key: string]: {
      visible: boolean;
      position: 'left' | 'right' | 'top' | 'bottom';
      size: number;
    };
  };
}

/**
 * Storage service with error handling
 */
class StorageService {
  /**
   * Check if localStorage is available
   */
  private isLocalStorageAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      logger.error('localStorage is not available:', {}, e as Error);
      return false;
    }
  }

  /**
   * Save data to localStorage
   */
  private save<T>(key: string, data: T): boolean {
    if (!this.isLocalStorageAvailable()) return false;

    try {
      const serialized = JSON.stringify(data);
      localStorage.setItem(key, serialized);
      logger.debug(`Saved data to localStorage:`, { key });
      return true;
    } catch (error) {
      logger.error(`Failed to save data to localStorage:`, { key }, error as Error);
      return false;
    }
  }

  /**
   * Load data from localStorage
   */
  private load<T>(key: string): T | null {
    if (!this.isLocalStorageAvailable()) return null;

    try {
      const item = localStorage.getItem(key);
      if (item === null) return null;

      const parsed = JSON.parse(item);
      logger.debug(`Loaded data from localStorage:`, { key });
      return parsed as T;
    } catch (error) {
      logger.error(`Failed to load data from localStorage:`, { key }, error as Error);
      return null;
    }
  }

  /**
   * Remove data from localStorage
   */
  private remove(key: string): boolean {
    if (!this.isLocalStorageAvailable()) return false;

    try {
      localStorage.removeItem(key);
      logger.debug(`Removed data from localStorage:`, { key });
      return true;
    } catch (error) {
      logger.error(`Failed to remove data from localStorage:`, { key }, error as Error);
      return false;
    }
  }

  // ==================== Settings ====================

  /**
   * Save user settings
   */
  saveSettings(settings: Partial<Settings>): boolean {
    const current = this.loadSettings();
    const updated = { ...this.getDefaultSettings(), ...current, ...settings };
    return this.save(STORAGE_KEYS.SETTINGS, updated);
  }

  /**
   * Load user settings
   */
  loadSettings(): Settings | null {
    return this.load<Settings>(STORAGE_KEYS.SETTINGS);
  }

  /**
   * Get default settings
   */
  getDefaultSettings(): Settings {
    return {
      theme: 'dark',
      language: 'en',
      notifications: true,
      soundEnabled: false,
      autoRefresh: true,
      refreshInterval: 30000,
      defaultTimeframe: '1h',
      defaultExchange: 'binance',
    };
  }

  // ==================== Preferences ====================

  /**
   * Save user preferences
   */
  savePreferences(preferences: Partial<UserPreferences>): boolean {
    const current = this.loadPreferences();
    const updated = { ...this.getDefaultPreferences(), ...current, ...preferences };
    return this.save(STORAGE_KEYS.PREFERENCES, updated);
  }

  /**
   * Load user preferences
   */
  loadPreferences(): UserPreferences | null {
    return this.load<UserPreferences>(STORAGE_KEYS.PREFERENCES);
  }

  /**
   * Get default preferences
   */
  getDefaultPreferences(): UserPreferences {
    return {
      compactMode: false,
      showAdvancedFeatures: true,
      defaultView: 'dashboard',
      chartType: 'candlestick',
      showVolume: true,
      showGrid: true,
      indicators: ['MA20', 'MA50'],
    };
  }

  // ==================== Tab State ====================

  /**
   * Save active tab for a view
   */
  saveTabState(viewId: string, tabId: string): boolean {
    return this.save(`${STORAGE_KEYS.TAB_PREFIX}${viewId}`, tabId);
  }

  /**
   * Load active tab for a view
   */
  loadTabState(viewId: string): string | null {
    return this.load<string>(`${STORAGE_KEYS.TAB_PREFIX}${viewId}`);
  }

  /**
   * Clear tab state for a view
   */
  clearTabState(viewId: string): boolean {
    return this.remove(`${STORAGE_KEYS.TAB_PREFIX}${viewId}`);
  }

  // ==================== Chart Settings ====================

  /**
   * Save chart settings
   */
  saveChartSettings(settings: Partial<ChartSettings>): boolean {
    const current = this.loadChartSettings();
    const updated = { ...this.getDefaultChartSettings(), ...current, ...settings };
    return this.save(STORAGE_KEYS.CHART_SETTINGS, updated);
  }

  /**
   * Load chart settings
   */
  loadChartSettings(): ChartSettings | null {
    return this.load<ChartSettings>(STORAGE_KEYS.CHART_SETTINGS);
  }

  /**
   * Get default chart settings
   */
  getDefaultChartSettings(): ChartSettings {
    return {
      type: 'candlestick',
      timeframe: '1h',
      indicators: [],
      overlays: [],
      showVolume: true,
      showGrid: true,
      colors: {
        up: '#10b981',
        down: '#ef4444',
        volume: '#6366f1',
      },
    };
  }

  // ==================== Favorites & Watchlist ====================

  /**
   * Add symbol to favorites
   */
  addFavorite(symbol: string): boolean {
    const favorites = this.loadFavorites();
    if (!favorites.includes(symbol)) {
      favorites.push(symbol);
      return this.save(STORAGE_KEYS.FAVORITES, favorites);
    }
    return true;
  }

  /**
   * Remove symbol from favorites
   */
  removeFavorite(symbol: string): boolean {
    const favorites = this.loadFavorites();
    const filtered = favorites.filter((s) => s !== symbol);
    return this.save(STORAGE_KEYS.FAVORITES, filtered);
  }

  /**
   * Load favorites
   */
  loadFavorites(): string[] {
    return this.load<string[]>(STORAGE_KEYS.FAVORITES) || [];
  }

  /**
   * Check if symbol is favorited
   */
  isFavorite(symbol: string): boolean {
    return this.loadFavorites().includes(symbol);
  }

  /**
   * Save watchlist
   */
  saveWatchlist(symbols: string[]): boolean {
    return this.save(STORAGE_KEYS.WATCHLIST, symbols);
  }

  /**
   * Load watchlist
   */
  loadWatchlist(): string[] {
    return this.load<string[]>(STORAGE_KEYS.WATCHLIST) || [];
  }

  // ==================== Recent Symbols ====================

  /**
   * Add symbol to recent list
   */
  addRecentSymbol(symbol: string, maxRecent: number = 10): boolean {
    const recent = this.loadRecentSymbols();

    // Remove if already exists
    const filtered = recent.filter((s) => s !== symbol);

    // Add to beginning
    filtered.unshift(symbol);

    // Limit to max
    const limited = filtered.slice(0, maxRecent);

    return this.save(STORAGE_KEYS.RECENT_SYMBOLS, limited);
  }

  /**
   * Load recent symbols
   */
  loadRecentSymbols(): string[] {
    return this.load<string[]>(STORAGE_KEYS.RECENT_SYMBOLS) || [];
  }

  /**
   * Clear recent symbols
   */
  clearRecentSymbols(): boolean {
    return this.remove(STORAGE_KEYS.RECENT_SYMBOLS);
  }

  // ==================== Layout ====================

  /**
   * Save layout configuration
   */
  saveLayout(layout: LayoutConfig): boolean {
    return this.save(STORAGE_KEYS.LAYOUT, layout);
  }

  /**
   * Load layout configuration
   */
  loadLayout(): LayoutConfig | null {
    return this.load<LayoutConfig>(STORAGE_KEYS.LAYOUT);
  }

  /**
   * Reset layout to defaults
   */
  resetLayout(): boolean {
    return this.remove(STORAGE_KEYS.LAYOUT);
  }

  // ==================== Utility Methods ====================

  /**
   * Clear all stored data
   */
  clearAll(): boolean {
    if (!this.isLocalStorageAvailable()) return false;

    try {
      // Remove all dreammaker-prefixed keys
      const keys = Object.keys(localStorage);
      const dreammakerKeys = keys.filter((key) => key.startsWith('dreammaker_'));

      dreammakerKeys.forEach((key) => localStorage.removeItem(key));

      logger.info('Cleared all stored data');
      return true;
    } catch (error) {
      logger.error('Failed to clear stored data:', {}, error as Error);
      return false;
    }
  }

  /**
   * Export all data as JSON
   */
  exportData(): string {
    const data = {
      settings: this.loadSettings(),
      preferences: this.loadPreferences(),
      chartSettings: this.loadChartSettings(),
      favorites: this.loadFavorites(),
      watchlist: this.loadWatchlist(),
      recentSymbols: this.loadRecentSymbols(),
      layout: this.loadLayout(),
    };

    return JSON.stringify(data, null, 2);
  }

  /**
   * Import data from JSON
   */
  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);

      if (data.settings) this.saveSettings(data.settings);
      if (data.preferences) this.savePreferences(data.preferences);
      if (data.chartSettings) this.saveChartSettings(data.chartSettings);
      if (data.favorites) this.save(STORAGE_KEYS.FAVORITES, data.favorites);
      if (data.watchlist) this.saveWatchlist(data.watchlist);
      if (data.recentSymbols) this.save(STORAGE_KEYS.RECENT_SYMBOLS, data.recentSymbols);
      if (data.layout) this.saveLayout(data.layout);

      logger.info('Imported data successfully');
      return true;
    } catch (error) {
      logger.error('Failed to import data:', {}, error as Error);
      return false;
    }
  }
}

// Export singleton instance
export const storage = new StorageService();

export default storage;
