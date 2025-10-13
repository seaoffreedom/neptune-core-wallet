/**
 * Centralized Logger Utility
 *
 * Provides a consistent logging interface across the application using Pino.
 * Supports both main process and renderer process logging with appropriate transports.
 */

import pino from 'pino';

/**
 * Logger configuration for different environments
 */
const createLoggerConfig = (component?: string) => {
    const isDevelopment = typeof process !== 'undefined' && process.env?.NODE_ENV === 'development';
    const isRenderer = typeof window !== 'undefined';

    // Base configuration
    const config: pino.LoggerOptions = {
        level: isDevelopment ? 'debug' : 'info',
        base: {
            component: component || 'app',
            ...(typeof process !== 'undefined' && process.pid ? { pid: process.pid } : {}),
        },
    };

    // Add transport for development
    if (isDevelopment && !isRenderer) {
        config.transport = {
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'SYS:standard',
                ignore: 'pid,hostname',
                singleLine: true,
            },
        };
    }

    return config;
};

/**
 * Create a logger instance for a specific component
 */
export function createLogger(component: string): pino.Logger {
    return pino(createLoggerConfig(component));
}

/**
 * Default application logger
 */
export const logger = createLogger('app');

/**
 * Pre-configured loggers for common components
 */
export const loggers = {
    app: logger,
    main: createLogger('main'),
    renderer: createLogger('renderer'),
    wallet: createLogger('wallet'),
    settings: createLogger('settings'),
    price: createLogger('price'),
    network: createLogger('network'),
    mining: createLogger('mining'),
    performance: createLogger('performance'),
    security: createLogger('security'),
    data: createLogger('data'),
    advanced: createLogger('advanced'),
    neptune: createLogger('neptune'),
    rpc: createLogger('rpc'),
    ipc: createLogger('ipc'),
    ui: createLogger('ui'),
    store: createLogger('store'),
    hooks: createLogger('hooks'),
    components: createLogger('components'),
    services: createLogger('services'),
    utils: createLogger('utils'),
} as const;

/**
 * Type-safe logger interface
 */
export type Logger = pino.Logger;

/**
 * Log levels for type safety
 */
export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

/**
 * Structured log data interface
 */
export interface LogData {
    [key: string]: unknown;
}

/**
 * Helper function to create structured log data
 */
export function createLogData(data: LogData): LogData {
    return data;
}

/**
 * Helper function to log with context
 */
export function logWithContext(
    logger: pino.Logger,
    level: LogLevel,
    message: string,
    context?: LogData,
): void {
    if (context) {
        logger[level](context, message);
    } else {
        logger[level](message);
    }
}

/**
 * Performance logging helper
 */
export function logPerformance(
    logger: pino.Logger,
    operation: string,
    duration: number,
    context?: LogData,
): void {
    logWithContext(logger, 'info', `Performance: ${operation}`, {
        operation,
        duration: `${duration}ms`,
        ...context,
    });
}

/**
 * Error logging helper with stack trace
 */
export function logError(
    logger: pino.Logger,
    message: string,
    error: Error,
    context?: LogData,
): void {
    logWithContext(logger, 'error', message, {
        error: {
            name: error.name,
            message: error.message,
            stack: error.stack,
        },
        ...context,
    });
}

/**
 * Success logging helper
 */
export function logSuccess(
    logger: pino.Logger,
    message: string,
    context?: LogData,
): void {
    logWithContext(logger, 'info', `✅ ${message}`, context);
}

/**
 * Warning logging helper
 */
export function logWarning(
    logger: pino.Logger,
    message: string,
    context?: LogData,
): void {
    logWithContext(logger, 'warn', `⚠️ ${message}`, context);
}

/**
 * Info logging helper
 */
export function logInfo(
    logger: pino.Logger,
    message: string,
    context?: LogData,
): void {
    logWithContext(logger, 'info', `ℹ️ ${message}`, context);
}

/**
 * Debug logging helper
 */
export function logDebug(
    logger: pino.Logger,
    message: string,
    context?: LogData,
): void {
    logWithContext(logger, 'debug', `🔍 ${message}`, context);
}
