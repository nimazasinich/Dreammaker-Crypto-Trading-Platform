/**
 * Core Configuration Manager
 * 
 * Centralized configuration management for the application.
 * Supports runtime configuration updates, validation, and
 * environment-specific settings.
 * 
 * @module core/ConfigManager
 * @since 2.1.0
 */

import { Logger } from './Logger';

export interface AppConfig {
    // API Settings
    api: {
        baseUrl: string;
        timeout: number;
        retryAttempts: number;
        retryDelay: number;
    };

    // Feature Flags
    features: {
        enableFutures: boolean;
        enableAI: boolean;
        enableTelegram: boolean;
        enableBacktest: boolean;
        enableRealTrading: boolean;
        enableDarkMode: boolean;
        enableAccessibilityMode: boolean;
    };

    // UI Settings
    ui: {
        theme: 'light' | 'dark' | 'system';
        animationsEnabled: boolean;
        reducedMotion: boolean;
        highContrastMode: boolean;
        fontSize: 'small' | 'medium' | 'large';
    };

    // Trading Settings
    trading: {
        defaultSymbol: string;
        defaultTimeframe: string;
        maxPositions: number;
        riskPerTrade: number;
    };

    // Performance Settings
    performance: {
        cacheEnabled: boolean;
        cacheTTL: number;
        maxConcurrentRequests: number;
        debounceDelay: number;
    };

    // Logging Settings
    logging: {
        level: 'debug' | 'info' | 'warn' | 'error';
        enableConsole: boolean;
        enableRemote: boolean;
    };
}

type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type ConfigChangeHandler = (
    key: string,
    newValue: unknown,
    oldValue: unknown
) => void;

export class ConfigManager {
    private static instance: ConfigManager;
    private logger = Logger.getInstance();
    private config: AppConfig;
    private changeHandlers = new Set<ConfigChangeHandler>();
    private configHistory: Array<{ timestamp: string; config: AppConfig }> = [];
    private maxHistorySize = 10;

    private constructor() {
        this.config = this.getDefaultConfig();
        this.loadFromEnvironment();
        this.loadFromStorage();
    }

    /**
     * Get the singleton ConfigManager instance
     */
    static getInstance(): ConfigManager {
        if (!ConfigManager.instance) {
            ConfigManager.instance = new ConfigManager();
        }
        return ConfigManager.instance;
    }

    /**
     * Get the current configuration
     */
    getConfig(): Readonly<AppConfig> {
        return Object.freeze({ ...this.config });
    }

    /**
     * Get a specific configuration value by path
     */
    get<T = unknown>(path: string): T | undefined {
        const keys = path.split('.');
        let value: unknown = this.config;

        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = (value as Record<string, unknown>)[key];
            } else {
                return undefined;
            }
        }

        return value as T;
    }

    /**
     * Set a specific configuration value
     */
    set<T>(path: string, newValue: T): void {
        const keys = path.split('.');
        const lastKey = keys.pop();

        if (!lastKey) return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let target: any = this.config;
        const oldValue = this.get(path);

        for (const key of keys) {
            if (!(key in target) || typeof target[key] !== 'object') {
                target[key] = {};
            }
            target = target[key] as Record<string, unknown>;
        }

        target[lastKey] = newValue;

        // Save history
        this.saveHistory();

        // Notify handlers
        this.notifyChange(path, newValue, oldValue);

        // Persist to storage
        this.saveToStorage();

        this.logger.info('Configuration updated', { path, oldValue, newValue });
    }

    /**
     * Update multiple configuration values
     */
    update(updates: DeepPartial<AppConfig>): void {
        this.saveHistory();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.deepMerge(this.config as any, updates as any);
        this.notifyChange('*', this.config, null);
        this.saveToStorage();
        this.logger.info('Configuration bulk update', { updatedPaths: Object.keys(updates) });
    }

    /**
     * Reset configuration to defaults
     */
    reset(): void {
        this.saveHistory();
        const oldConfig = { ...this.config };
        this.config = this.getDefaultConfig();
        this.notifyChange('*', this.config, oldConfig);
        this.saveToStorage();
        this.logger.info('Configuration reset to defaults');
    }

    /**
     * Subscribe to configuration changes
     */
    onChange(handler: ConfigChangeHandler): () => void {
        this.changeHandlers.add(handler);
        return () => this.changeHandlers.delete(handler);
    }

    /**
     * Get configuration history
     */
    getHistory(): Array<{ timestamp: string; config: AppConfig }> {
        return [...this.configHistory];
    }

    /**
     * Restore configuration from history
     */
    restoreFromHistory(index: number): boolean {
        if (index < 0 || index >= this.configHistory.length) {
            return false;
        }

        const historyEntry = this.configHistory[index];
        const oldConfig = { ...this.config };
        this.config = { ...historyEntry.config };
        this.notifyChange('*', this.config, oldConfig);
        this.saveToStorage();
        this.logger.info('Configuration restored from history', { index, timestamp: historyEntry.timestamp });
        return true;
    }

    /**
     * Validate configuration
     */
    validate(): { valid: boolean; errors: string[] } {
        const errors: string[] = [];

        // Validate API settings
        if (!this.config.api.baseUrl) {
            errors.push('API base URL is required');
        }
        if (this.config.api.timeout < 0) {
            errors.push('API timeout must be non-negative');
        }
        if (this.config.api.retryAttempts < 0) {
            errors.push('API retry attempts must be non-negative');
        }

        // Validate trading settings
        if (this.config.trading.riskPerTrade < 0 || this.config.trading.riskPerTrade > 100) {
            errors.push('Risk per trade must be between 0 and 100');
        }
        if (this.config.trading.maxPositions < 1) {
            errors.push('Max positions must be at least 1');
        }

        // Validate performance settings
        if (this.config.performance.cacheTTL < 0) {
            errors.push('Cache TTL must be non-negative');
        }

        return { valid: errors.length === 0, errors };
    }

    /**
     * Export configuration as JSON
     */
    export(): string {
        return JSON.stringify(this.config, null, 2);
    }

    /**
     * Import configuration from JSON
     */
    import(json: string): boolean {
        try {
            const imported = JSON.parse(json) as AppConfig;
            this.saveHistory();
            const oldConfig = { ...this.config };
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this.deepMerge(this.config as any, imported as any);
            this.notifyChange('*', this.config, oldConfig);
            this.saveToStorage();
            this.logger.info('Configuration imported');
            return true;
        } catch (error) {
            this.logger.error('Failed to import configuration', {}, error as Error);
            return false;
        }
    }

    /**
     * Get default configuration
     */
    private getDefaultConfig(): AppConfig {
        return {
            api: {
                baseUrl: 'http://localhost:8001',
                timeout: 30000,
                retryAttempts: 3,
                retryDelay: 1000,
            },
            features: {
                enableFutures: true,
                enableAI: true,
                enableTelegram: false,
                enableBacktest: true,
                enableRealTrading: false,
                enableDarkMode: true,
                enableAccessibilityMode: false,
            },
            ui: {
                theme: 'system',
                animationsEnabled: true,
                reducedMotion: false,
                highContrastMode: false,
                fontSize: 'medium',
            },
            trading: {
                defaultSymbol: 'BTCUSDT',
                defaultTimeframe: '4h',
                maxPositions: 10,
                riskPerTrade: 2,
            },
            performance: {
                cacheEnabled: true,
                cacheTTL: 300000, // 5 minutes
                maxConcurrentRequests: 10,
                debounceDelay: 300,
            },
            logging: {
                level: 'info',
                enableConsole: true,
                enableRemote: false,
            },
        };
    }

    /**
     * Load configuration from environment variables
     */
    private loadFromEnvironment(): void {
        // API Settings
        if (process.env.VITE_API_BASE_URL || process.env.API_BASE_URL) {
            this.config.api.baseUrl = process.env.VITE_API_BASE_URL || process.env.API_BASE_URL || this.config.api.baseUrl;
        }

        // Feature Flags
        if (process.env.FEATURE_FUTURES !== undefined) {
            this.config.features.enableFutures = process.env.FEATURE_FUTURES === 'true';
        }
        if (process.env.FEATURE_AI !== undefined) {
            this.config.features.enableAI = process.env.FEATURE_AI === 'true';
        }

        // Logging
        if (process.env.LOG_LEVEL) {
            this.config.logging.level = process.env.LOG_LEVEL as AppConfig['logging']['level'];
        }
    }

    /**
     * Load configuration from local storage (browser) or file (server)
     */
    private loadFromStorage(): void {
        if (typeof window !== 'undefined' && window.localStorage) {
            try {
                const stored = localStorage.getItem('app_config');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    this.deepMerge(this.config as any, parsed);
                    this.logger.debug('Configuration loaded from localStorage');
                }
            } catch (error) {
                this.logger.warn('Failed to load configuration from localStorage', { error });
            }
        }
    }

    /**
     * Save configuration to storage
     */
    private saveToStorage(): void {
        if (typeof window !== 'undefined' && window.localStorage) {
            try {
                localStorage.setItem('app_config', JSON.stringify(this.config));
            } catch (error) {
                this.logger.warn('Failed to save configuration to localStorage', { error });
            }
        }
    }

    /**
     * Save current config to history
     */
    private saveHistory(): void {
        this.configHistory.push({
            timestamp: new Date().toISOString(),
            config: JSON.parse(JSON.stringify(this.config)),
        });

        if (this.configHistory.length > this.maxHistorySize) {
            this.configHistory.shift();
        }
    }

    /**
     * Notify change handlers
     */
    private notifyChange(path: string, newValue: unknown, oldValue: unknown): void {
        this.changeHandlers.forEach(handler => {
            try {
                handler(path, newValue, oldValue);
            } catch (error) {
                this.logger.error('Config change handler error', {}, error as Error);
            }
        });
    }

    /**
     * Deep merge objects
     */
    private deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): void {
        for (const key of Object.keys(source)) {
            if (
                source[key] &&
                typeof source[key] === 'object' &&
                !Array.isArray(source[key]) &&
                target[key] &&
                typeof target[key] === 'object'
            ) {
                this.deepMerge(
                    target[key] as Record<string, unknown>,
                    source[key] as Record<string, unknown>
                );
            } else {
                target[key] = source[key];
            }
        }
    }
}

// Export default instance for convenience
export const configManager = ConfigManager.getInstance();

export default ConfigManager;
