/**
 * Renderer Process Logger
 *
 * Provides logging functionality for the renderer process.
 * Falls back to console methods when Pino is not available in browser context.
 */

import { loggers, type Logger, type LogData } from '@/shared/utils/logger';

/**
 * Renderer-safe logger that falls back to console when needed
 */
class RendererLogger {
    private logger: Logger;

    constructor(component: string) {
        try {
            // Try to use Pino logger
            this.logger = loggers[component as keyof typeof loggers] || loggers.app;
        } catch {
            // Fallback to console-based logger
            this.logger = this.createConsoleLogger(component);
        }
    }

    private createConsoleLogger(component: string): Logger {
        const prefix = `[${component}]`;
        
        return {
            trace: (obj: LogData | string, msg?: string) => console.trace(prefix, msg || obj),
            debug: (obj: LogData | string, msg?: string) => console.debug(prefix, msg || obj),
            info: (obj: LogData | string, msg?: string) => console.info(prefix, msg || obj),
            warn: (obj: LogData | string, msg?: string) => console.warn(prefix, msg || obj),
            error: (obj: LogData | string, msg?: string) => console.error(prefix, msg || obj),
            fatal: (obj: LogData | string, msg?: string) => console.error(prefix, 'FATAL:', msg || obj),
            child: () => this.logger,
        } as Logger;
    }

    trace(obj: LogData, msg?: string): void;
    trace(msg: string): void;
    trace(objOrMsg: LogData | string, msg?: string): void {
        if (typeof objOrMsg === 'string') {
            this.logger.trace(objOrMsg);
        } else {
            this.logger.trace(objOrMsg, msg);
        }
    }

    debug(obj: LogData, msg?: string): void;
    debug(msg: string): void;
    debug(objOrMsg: LogData | string, msg?: string): void {
        if (typeof objOrMsg === 'string') {
            this.logger.debug(objOrMsg);
        } else {
            this.logger.debug(objOrMsg, msg);
        }
    }

    info(obj: LogData, msg?: string): void;
    info(msg: string): void;
    info(objOrMsg: LogData | string, msg?: string): void {
        if (typeof objOrMsg === 'string') {
            this.logger.info(objOrMsg);
        } else {
            this.logger.info(objOrMsg, msg);
        }
    }

    warn(obj: LogData, msg?: string): void;
    warn(msg: string): void;
    warn(objOrMsg: LogData | string, msg?: string): void {
        if (typeof objOrMsg === 'string') {
            this.logger.warn(objOrMsg);
        } else {
            this.logger.warn(objOrMsg, msg);
        }
    }

    error(obj: LogData, msg?: string): void;
    error(msg: string): void;
    error(objOrMsg: LogData | string, msg?: string): void {
        if (typeof objOrMsg === 'string') {
            this.logger.error(objOrMsg);
        } else {
            this.logger.error(objOrMsg, msg);
        }
    }

    fatal(obj: LogData, msg?: string): void;
    fatal(msg: string): void;
    fatal(objOrMsg: LogData | string, msg?: string): void {
        if (typeof objOrMsg === 'string') {
            this.logger.fatal(objOrMsg);
        } else {
            this.logger.fatal(objOrMsg, msg);
        }
    }

    child(bindings: LogData): RendererLogger {
        return new RendererLogger(bindings.component as string || 'child');
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
    app: createRendererLogger('app'),
    wallet: createRendererLogger('wallet'),
    settings: createRendererLogger('settings'),
    price: createRendererLogger('price'),
    network: createRendererLogger('network'),
    mining: createRendererLogger('mining'),
    performance: createRendererLogger('performance'),
    security: createRendererLogger('security'),
    data: createRendererLogger('data'),
    advanced: createRendererLogger('advanced'),
    ui: createRendererLogger('ui'),
    store: createRendererLogger('store'),
    hooks: createRendererLogger('hooks'),
    components: createRendererLogger('components'),
    services: createRendererLogger('services'),
    utils: createRendererLogger('utils'),
} as const;

/**
 * Default renderer logger
 */
export const logger = rendererLoggers.app;
