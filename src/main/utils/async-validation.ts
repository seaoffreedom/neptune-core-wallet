/**
 * Async Validation Utilities
 *
 * Provides resilient async validation operations using p-* packages
 * for better performance and error handling.
 */

import pRetry from "p-retry";
import pTimeout from "p-timeout";
import pino from "pino";

const logger = pino({ level: "info" });

/**
 * Resilient async validation with retry and timeout
 */
export async function validateWithRetry<T>(
    validationFn: () => Promise<T>,
    options: {
        retries?: number;
        timeout?: number;
        context?: string;
    } = {},
): Promise<T> {
    const { retries = 2, timeout = 3000, context = "validation" } = options;

    return pRetry(
        () => pTimeout(validationFn(), timeout, `${context} timeout`),
        {
            retries,
            factor: 2,
            minTimeout: 500,
            maxTimeout: 2000,
            onFailedAttempt: (error) => {
                logger.warn(
                    {
                        attempt: error.attemptNumber,
                        context,
                        error: error.message,
                    },
                    "Validation attempt failed",
                );
            },
        },
    );
}

/**
 * Batch validation with concurrency control
 */
export async function validateBatch<T>(
    validations: Array<() => Promise<T>>,
    options: {
        timeout?: number;
        context?: string;
    } = {},
): Promise<T[]> {
    const { timeout = 5000, context = "batch-validation" } = options;

    const results = await Promise.allSettled(
        validations.map((validation) =>
            pTimeout(validation(), timeout, `${context} timeout`),
        ),
    );

    const successful = results
        .filter(
            (result): result is PromiseFulfilledResult<T> =>
                result.status === "fulfilled",
        )
        .map((result) => result.value);

    const failed = results
        .filter(
            (result): result is PromiseRejectedResult =>
                result.status === "rejected",
        )
        .map((result) => result.reason);

    if (failed.length > 0) {
        logger.warn(
            {
                context,
                failedCount: failed.length,
                totalCount: validations.length,
                errors: failed.map((error) => error.message),
            },
            "Some validations failed in batch",
        );
    }

    return successful;
}

/**
 * Async validation with circuit breaker pattern
 */
export class AsyncValidationCircuitBreaker {
    private failures = 0;
    private lastFailureTime = 0;
    private state: "closed" | "open" | "half-open" = "closed";

    constructor(
        private options: {
            failureThreshold?: number;
            resetTimeout?: number;
            context?: string;
        } = {},
    ) {
        this.options = {
            failureThreshold: 5,
            resetTimeout: 30000, // 30 seconds
            context: "validation-circuit-breaker",
            ...options,
        };
    }

    async validate<T>(
        validationFn: () => Promise<T>,
        options: {
            retries?: number;
            timeout?: number;
        } = {},
    ): Promise<T> {
        const { retries = 1, timeout = 3000 } = options;

        if (this.state === "open") {
            if (
                Date.now() - this.lastFailureTime >
                (this.options.resetTimeout || 30000)
            ) {
                this.state = "half-open";
                logger.info(
                    { context: this.options.context },
                    "Circuit breaker transitioning to half-open",
                );
            } else {
                throw new Error(
                    `Circuit breaker is open for ${this.options.context}`,
                );
            }
        }

        try {
            const result = await validateWithRetry(validationFn, {
                retries,
                timeout,
                context: this.options.context,
            });

            if (this.state === "half-open") {
                this.state = "closed";
                this.failures = 0;
                logger.info(
                    { context: this.options.context },
                    "Circuit breaker closed after successful validation",
                );
            }

            return result;
        } catch (error) {
            this.failures++;
            this.lastFailureTime = Date.now();

            if (this.failures >= (this.options.failureThreshold || 5)) {
                this.state = "open";
                logger.error(
                    {
                        context: this.options.context,
                        failures: this.failures,
                        threshold: this.options.failureThreshold,
                    },
                    "Circuit breaker opened due to too many failures",
                );
            }

            throw error;
        }
    }

    getState() {
        return {
            state: this.state,
            failures: this.failures,
            lastFailureTime: this.lastFailureTime,
        };
    }

    reset() {
        this.failures = 0;
        this.lastFailureTime = 0;
        this.state = "closed";
        logger.info(
            { context: this.options.context },
            "Circuit breaker manually reset",
        );
    }
}
