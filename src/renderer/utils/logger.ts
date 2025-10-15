/**
 * Renderer Process Logger
 *
 * Provides logging functionality for the renderer process.
 * Falls back to console methods when Pino is not available in browser context.
 */

import type { LogData } from "@/shared/utils/logger";

/**
 * Renderer-safe logger that falls back to console when needed
 */
class RendererLogger {
    private component: string;

    constructor(component: string) {
        this.component = component;
    }

    private formatMessage(message: string, context?: LogData): string {
        const prefix = `[${this.component}]`;
        if (context) {
            return `${prefix} ${message} ${JSON.stringify(context)}`;
        }
        return `${prefix} ${message}`;
    }

    trace(message: string, context?: LogData): void {
        console.trace(this.formatMessage(message, context));
    }

    debug(message: string, context?: LogData): void {
        console.debug(this.formatMessage(message, context));
    }

    info(message: string, context?: LogData): void {
        console.info(this.formatMessage(message, context));
    }

    warn(message: string, context?: LogData): void {
        console.warn(this.formatMessage(message, context));
    }

    error(message: string, context?: LogData): void {
        console.error(this.formatMessage(message, context));
    }

    fatal(message: string, context?: LogData): void {
        console.error(this.formatMessage(`FATAL: ${message}`, context));
    }

    child(bindings: LogData): RendererLogger {
        return new RendererLogger((bindings.component as string) || "child");
    }
}

/**
 * Create a renderer-safe logger for a specific component
 */
export function createRendererLogger(component: string): RendererLogger {
    return new RendererLogger(component);
}

/**
 * Pre-configured renderer loggers
 */
export const rendererLoggers = {
    app: createRendererLogger("app"),
    wallet: createRendererLogger("wallet"),
    settings: createRendererLogger("settings"),
    price: createRendererLogger("price"),
    network: createRendererLogger("network"),
    mining: createRendererLogger("mining"),
    performance: createRendererLogger("performance"),
    security: createRendererLogger("security"),
    data: createRendererLogger("data"),
    advanced: createRendererLogger("advanced"),
    ui: createRendererLogger("ui"),
    store: createRendererLogger("store"),
    hooks: createRendererLogger("hooks"),
    components: createRendererLogger("components"),
    services: createRendererLogger("services"),
    utils: createRendererLogger("utils"),
} as const;

/**
 * Default renderer logger
 */
export const logger = rendererLoggers.app;

// ============================================================================
// Logging Helper Functions
// ============================================================================

/**
 * Helper function to log with context
 */
export function logWithContext(
    logger: RendererLogger,
    level: "trace" | "debug" | "info" | "warn" | "error" | "fatal",
    message: string,
    context?: LogData,
): void {
    logger[level](message, context);
}

/**
 * Performance logging helper
 */
export function logPerformance(
    logger: RendererLogger,
    operation: string,
    duration: number,
    context?: LogData,
): void {
    logWithContext(logger, "info", `Performance: ${operation}`, {
        operation,
        duration: `${duration}ms`,
        ...context,
    });
}

/**
 * Error logging helper with stack trace
 */
export function logError(
    logger: RendererLogger,
    message: string,
    error: Error,
    context?: LogData,
): void {
    logWithContext(logger, "error", message, {
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
    logger: RendererLogger,
    message: string,
    context?: LogData,
): void {
    logWithContext(logger, "info", message, context);
}

/**
 * Warning logging helper
 */
export function logWarning(
    logger: RendererLogger,
    message: string,
    context?: LogData,
): void {
    logWithContext(logger, "warn", message, context);
}

/**
 * Info logging helper
 */
export function logInfo(
    logger: RendererLogger,
    message: string,
    context?: LogData,
): void {
    logWithContext(logger, "info", message, context);
}

/**
 * Debug logging helper
 */
export function logDebug(
    logger: RendererLogger,
    message: string,
    context?: LogData,
): void {
    logWithContext(logger, "debug", message, context);
}
