/**
 * Core Logger Module
 * 
 * Centralized logging infrastructure for the entire application.
 * Provides structured logging with support for different log levels,
 * metadata, and error tracking.
 * 
 * @module core/Logger
 * @since 2.1.0
 * 
 * WCAG Compliance Note:
 * This logger supports accessibility auditing by enabling structured
 * error tracking that can be correlated with UI accessibility issues.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
    data?: Record<string, unknown>;
    error?: Error;
    component?: string;
}

export interface LoggerConfig {
    minLevel: LogLevel;
    enableConsole: boolean;
    enableStructuredOutput: boolean;
    maxLogEntries: number;
    component?: string;
}

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
};

const LOG_LEVEL_COLORS: Record<LogLevel, string> = {
    debug: '\x1b[36m', // Cyan
    info: '\x1b[32m',  // Green
    warn: '\x1b[33m',  // Yellow
    error: '\x1b[31m', // Red
};

const RESET_COLOR = '\x1b[0m';

export class Logger {
    private static instance: Logger;
    private config: LoggerConfig;
    private logBuffer: LogEntry[] = [];
    private subscribers: Set<(entry: LogEntry) => void> = new Set();

    private constructor(config?: Partial<LoggerConfig>) {
        this.config = {
            minLevel: (process.env.LOG_LEVEL as LogLevel) || 'info',
            enableConsole: process.env.NODE_ENV !== 'test',
            enableStructuredOutput: process.env.NODE_ENV === 'production',
            maxLogEntries: 1000,
            ...config,
        };
    }

    /**
     * Get the singleton Logger instance
     */
    static getInstance(config?: Partial<LoggerConfig>): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger(config);
        }
        return Logger.instance;
    }

    /**
     * Create a child logger with a specific component context
     */
    createChild(component: string): Logger {
        const child = Object.create(this);
        child.config = { ...this.config, component };
        return child;
    }

    /**
     * Update logger configuration
     */
    configure(config: Partial<LoggerConfig>): void {
        this.config = { ...this.config, ...config };
    }

    /**
     * Subscribe to log entries
     */
    subscribe(callback: (entry: LogEntry) => void): () => void {
        this.subscribers.add(callback);
        return () => this.subscribers.delete(callback);
    }

    /**
     * Get recent log entries
     */
    getRecentLogs(count: number = 100): LogEntry[] {
        return this.logBuffer.slice(-count);
    }

    /**
     * Clear the log buffer
     */
    clearLogs(): void {
        this.logBuffer = [];
    }

    /**
     * Debug level log - for detailed debugging information
     */
    debug(message: string, data?: Record<string, unknown>, error?: Error): void {
        this.log('debug', message, data, error);
    }

    /**
     * Info level log - for general information
     */
    info(message: string, data?: Record<string, unknown>, error?: Error): void {
        this.log('info', message, data, error);
    }

    /**
     * Warning level log - for potentially harmful situations
     */
    warn(message: string, data?: Record<string, unknown>, error?: Error): void {
        this.log('warn', message, data, error);
    }

    /**
     * Error level log - for error conditions
     */
    error(message: string, data?: Record<string, unknown>, error?: Error): void {
        this.log('error', message, data, error);
    }

    /**
     * Critical level log - alias for error (for critical situations)
     */
    critical(message: string, data?: Record<string, unknown>, error?: Error): void {
        this.log('error', message, data, error);
    }

    /**
     * Core logging method
     */
    private log(
        level: LogLevel,
        message: string,
        data?: Record<string, unknown>,
        error?: Error
    ): void {
        // Check if this log level should be output
        if (LOG_LEVEL_PRIORITY[level] < LOG_LEVEL_PRIORITY[this.config.minLevel]) {
            return;
        }

        const entry: LogEntry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            data,
            error,
            component: this.config.component,
        };

        // Add to buffer
        this.logBuffer.push(entry);
        if (this.logBuffer.length > this.config.maxLogEntries) {
            this.logBuffer.shift();
        }

        // Notify subscribers
        this.subscribers.forEach(callback => {
            try {
                callback(entry);
            } catch (e) {
                // Prevent subscriber errors from breaking logging
                console.error('Logger subscriber error:', e);
            }
        });

        // Output to console
        if (this.config.enableConsole) {
            this.outputToConsole(entry);
        }
    }

    /**
     * Output log entry to console
     */
    private outputToConsole(entry: LogEntry): void {
        const { timestamp, level, message, data, error, component } = entry;

        if (this.config.enableStructuredOutput) {
            // Structured JSON output for production
            const output = {
                timestamp,
                level,
                message,
                ...(component && { component }),
                ...(data && { data }),
                ...(error && {
                    error: {
                        name: error.name,
                        message: error.message,
                        stack: error.stack,
                    },
                }),
            };
            console[level === 'debug' ? 'log' : level](JSON.stringify(output));
        } else {
            // Human-readable output for development
            const color = LOG_LEVEL_COLORS[level];
            const prefix = component ? `[${component}]` : '';
            const levelStr = level.toUpperCase().padEnd(5);
            const timeStr = timestamp.split('T')[1].replace('Z', '');

            let logMessage = `${color}${timeStr} ${levelStr}${RESET_COLOR} ${prefix} ${message}`;

            if (data && Object.keys(data).length > 0) {
                logMessage += ` ${JSON.stringify(data)}`;
            }

            console[level === 'debug' ? 'log' : level](logMessage);

            if (error) {
                console.error(`${color}Error:${RESET_COLOR}`, error);
            }
        }
    }

    /**
     * Log performance metrics
     */
    performance(operation: string, durationMs: number, data?: Record<string, unknown>): void {
        this.info(`Performance: ${operation}`, {
            durationMs,
            durationFormatted: durationMs > 1000 ? `${(durationMs / 1000).toFixed(2)}s` : `${durationMs}ms`,
            ...data,
        });
    }

    /**
     * Start a timer for performance logging
     */
    startTimer(operation: string): () => void {
        const start = performance.now();
        return () => {
            const duration = performance.now() - start;
            this.performance(operation, Math.round(duration));
        };
    }

    /**
     * Log accessibility-related events
     * Useful for tracking WCAG compliance issues
     */
    accessibility(message: string, data?: Record<string, unknown>): void {
        this.info(`[A11y] ${message}`, {
            ...data,
            category: 'accessibility',
        });
    }
}

// Export default instance for convenience
export const logger = Logger.getInstance();

export default Logger;
