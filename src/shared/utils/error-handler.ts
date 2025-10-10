/**
 * Centralized Error Handling Utility
 *
 * Provides consistent error handling patterns across the application
 * to reduce code duplication and improve maintainability.
 */

export interface ErrorContext {
    operation: string;
    component?: string;
    metadata?: Record<string, unknown>;
}

export interface ErrorResult<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    context?: ErrorContext;
}

/**
 * Standard error handler for async operations
 */
export async function handleAsyncOperation<T>(
    operation: () => Promise<T>,
    context: ErrorContext,
): Promise<ErrorResult<T>> {
    try {
        const data = await operation();
        return {
            success: true,
            data,
            context,
        };
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error";

        console.error(`❌ ${context.operation} failed:`, {
            error: errorMessage,
            context,
            stack: error instanceof Error ? error.stack : undefined,
        });

        return {
            success: false,
            error: errorMessage,
            context,
        };
    }
}

/**
 * Standard error handler for IPC operations
 */
export async function handleIpcOperation<T>(
    operation: () => Promise<T>,
    context: ErrorContext,
): Promise<ErrorResult<T>> {
    return handleAsyncOperation(operation, {
        ...context,
        component: context.component || "IPC",
    });
}

/**
 * Standard error handler for RPC operations
 */
export async function handleRpcOperation<T>(
    operation: () => Promise<T>,
    context: ErrorContext,
): Promise<ErrorResult<T>> {
    return handleAsyncOperation(operation, {
        ...context,
        component: context.component || "RPC",
    });
}

/**
 * Standard error handler for file operations
 */
export async function handleFileOperation<T>(
    operation: () => Promise<T>,
    context: ErrorContext,
): Promise<ErrorResult<T>> {
    return handleAsyncOperation(operation, {
        ...context,
        component: context.component || "File",
    });
}

/**
 * Create a standardized error response for IPC handlers
 */
export function createErrorResponse(
    error: unknown,
    context: ErrorContext,
): ErrorResult {
    const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

    console.error(`❌ ${context.operation} failed:`, {
        error: errorMessage,
        context,
        stack: error instanceof Error ? error.stack : undefined,
    });

    return {
        success: false,
        error: errorMessage,
        context,
    };
}

/**
 * Create a standardized success response for IPC handlers
 */
export function createSuccessResponse<T>(
    data: T,
    context: ErrorContext,
): ErrorResult<T> {
    return {
        success: true,
        data,
        context,
    };
}

/**
 * Retry wrapper with exponential backoff
 */
export async function withRetry<T>(
    operation: () => Promise<T>,
    options: {
        retries?: number;
        delay?: number;
        maxDelay?: number;
        context?: ErrorContext;
    } = {},
): Promise<T> {
    const { retries = 3, delay = 1000, maxDelay = 10000, context } = options;

    let lastError: Error;

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError =
                error instanceof Error ? error : new Error("Unknown error");

            if (attempt === retries) {
                console.error(
                    `❌ Operation failed after ${retries + 1} attempts:`,
                    {
                        error: lastError.message,
                        context,
                        attempts: retries + 1,
                    },
                );
                throw lastError!;
            }

            const currentDelay = Math.min(delay * 2 ** attempt, maxDelay);
            console.warn(
                `⚠️ Attempt ${attempt + 1} failed, retrying in ${currentDelay}ms:`,
                {
                    error: lastError.message,
                    context,
                    nextAttempt: attempt + 2,
                },
            );

            await new Promise((resolve) => setTimeout(resolve, currentDelay));
        }
    }

    throw lastError!;
}

/**
 * Timeout wrapper for operations
 */
export async function withTimeout<T>(
    operation: () => Promise<T>,
    timeoutMs: number,
    context?: ErrorContext,
): Promise<T> {
    return Promise.race([
        operation(),
        new Promise<never>((_, reject) => {
            setTimeout(() => {
                const error = new Error(
                    `Operation timed out after ${timeoutMs}ms`,
                );
                console.error(`⏰ Timeout error:`, {
                    error: error.message,
                    context,
                    timeout: timeoutMs,
                });
                reject(error);
            }, timeoutMs);
        }),
    ]);
}

/**
 * Circuit breaker pattern for resilient operations
 */
export class CircuitBreaker {
    private failures = 0;
    private lastFailureTime = 0;
    private state: "CLOSED" | "OPEN" | "HALF_OPEN" = "CLOSED";

    constructor(
        private options: {
            failureThreshold: number;
            recoveryTimeout: number;
            context?: ErrorContext;
        },
    ) {}

    async execute<T>(operation: () => Promise<T>): Promise<T> {
        if (this.state === "OPEN") {
            if (
                Date.now() - this.lastFailureTime >
                this.options.recoveryTimeout
            ) {
                this.state = "HALF_OPEN";
            } else {
                throw new Error("Circuit breaker is OPEN");
            }
        }

        try {
            const result = await operation();
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure();
            throw error;
        }
    }

    private onSuccess(): void {
        this.failures = 0;
        this.state = "CLOSED";
    }

    private onFailure(): void {
        this.failures++;
        this.lastFailureTime = Date.now();

        if (this.failures >= this.options.failureThreshold) {
            this.state = "OPEN";
            console.warn(`🔴 Circuit breaker opened:`, {
                failures: this.failures,
                threshold: this.options.failureThreshold,
                context: this.options.context,
            });
        }
    }

    getState(): string {
        return this.state;
    }
}
