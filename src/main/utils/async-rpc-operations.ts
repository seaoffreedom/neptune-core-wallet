/**
 * Async RPC Operations
 *
 * Provides resilient RPC operations with retry logic, circuit breaker,
 * and connection health monitoring for blockchain data fetching
 */

import pRetry from "p-retry";
import pTimeout from "p-timeout";
import pLimit from "p-limit";
import pino from "pino";

const logger = pino({ level: "info" });

/**
 * Circuit Breaker for RPC operations
 */
export class RpcCircuitBreaker {
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
            context: "rpc-circuit-breaker",
            ...options,
        };
    }

    async execute<T>(
        operation: () => Promise<T>,
        options: {
            retries?: number;
            timeout?: number;
        } = {},
    ): Promise<T> {
        const { retries = 3, timeout = 10000 } = options;

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
            const result = await pRetry(
                () => pTimeout(operation(), { milliseconds: timeout }),
                {
                    retries,
                    factor: 2,
                    minTimeout: 1000,
                    maxTimeout: 5000,
                    onFailedAttempt: (error) => {
                        logger.warn(
                            {
                                attempt: error.attemptNumber,
                                context: this.options.context,
                                error:
                                    error instanceof Error
                                        ? error.message
                                        : String(error),
                            },
                            "RPC operation attempt failed",
                        );
                    },
                },
            );

            if (this.state === "half-open") {
                this.state = "closed";
                this.failures = 0;
                logger.info(
                    { context: this.options.context },
                    "Circuit breaker closed after successful operation",
                );
            }

            return result as T;
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

/**
 * Request deduplication for RPC calls
 */
export class RpcRequestDeduplicator {
    private pendingRequests = new Map<string, Promise<unknown>>();

    async deduplicate<T>(key: string, operation: () => Promise<T>): Promise<T> {
        // Check if request is already pending
        const existingRequest = this.pendingRequests.get(key);
        if (existingRequest) {
            logger.debug(
                { key },
                "Deduplicating RPC request - returning existing promise",
            );
            return existingRequest as Promise<T>;
        }

        // Create new request
        const requestPromise = operation().finally(() => {
            this.pendingRequests.delete(key);
        });

        this.pendingRequests.set(key, requestPromise);
        return requestPromise;
    }

    clear() {
        this.pendingRequests.clear();
        logger.info("RPC request deduplicator cleared");
    }

    getPendingCount() {
        return this.pendingRequests.size;
    }
}

/**
 * RPC operation queue with concurrency control
 */
export class RpcOperationQueue {
    private limit = pLimit(5); // Max 5 concurrent RPC operations
    private queue: Array<() => Promise<unknown>> = [];

    async add<T>(operation: () => Promise<T>): Promise<T> {
        return this.limit(async () => {
            logger.debug("Executing queued RPC operation");
            return operation();
        });
    }

    async addBatch<T>(operations: Array<() => Promise<T>>): Promise<T[]> {
        return Promise.all(operations.map((operation) => this.add(operation)));
    }

    getQueueSize() {
        return this.queue.length;
    }
}

/**
 * Connection health monitor for RPC operations
 */
export class RpcConnectionHealthMonitor {
    private lastSuccessfulCall = 0;
    private consecutiveFailures = 0;
    private isHealthy = true;

    constructor(
        private options: {
            maxConsecutiveFailures?: number;
            healthCheckInterval?: number;
            context?: string;
        } = {},
    ) {
        this.options = {
            maxConsecutiveFailures: 3,
            healthCheckInterval: 10000, // 10 seconds
            context: "rpc-health-monitor",
            ...options,
        };
    }

    recordSuccess() {
        this.lastSuccessfulCall = Date.now();
        this.consecutiveFailures = 0;
        this.isHealthy = true;
    }

    recordFailure() {
        this.consecutiveFailures++;
        if (
            this.consecutiveFailures >=
            (this.options.maxConsecutiveFailures || 3)
        ) {
            this.isHealthy = false;
            logger.warn(
                {
                    context: this.options.context,
                    consecutiveFailures: this.consecutiveFailures,
                },
                "RPC connection marked as unhealthy",
            );
        }
    }

    isConnectionHealthy(): boolean {
        // Check if we've had too many consecutive failures
        if (!this.isHealthy) {
            // Check if enough time has passed to retry
            const timeSinceLastFailure = Date.now() - this.lastSuccessfulCall;
            if (
                timeSinceLastFailure >
                (this.options.healthCheckInterval || 10000)
            ) {
                this.isHealthy = true;
                this.consecutiveFailures = 0;
                logger.info(
                    { context: this.options.context },
                    "RPC connection health check passed",
                );
            }
        }

        return this.isHealthy;
    }

    getHealthStatus() {
        return {
            isHealthy: this.isHealthy,
            consecutiveFailures: this.consecutiveFailures,
            lastSuccessfulCall: this.lastSuccessfulCall,
            timeSinceLastSuccess: Date.now() - this.lastSuccessfulCall,
        };
    }

    reset() {
        this.lastSuccessfulCall = Date.now();
        this.consecutiveFailures = 0;
        this.isHealthy = true;
        logger.info(
            { context: this.options.context },
            "RPC connection health monitor reset",
        );
    }
}

/**
 * Resilient RPC operation with all resilience features
 */
export class ResilientRpcOperation {
    private circuitBreaker: RpcCircuitBreaker;
    private deduplicator: RpcRequestDeduplicator;
    private queue: RpcOperationQueue;
    private healthMonitor: RpcConnectionHealthMonitor;

    constructor(
        private options: {
            failureThreshold?: number;
            resetTimeout?: number;
            maxConsecutiveFailures?: number;
            healthCheckInterval?: number;
            context?: string;
        } = {},
    ) {
        this.circuitBreaker = new RpcCircuitBreaker({
            failureThreshold: this.options.failureThreshold,
            resetTimeout: this.options.resetTimeout,
            context: this.options.context,
        });

        this.deduplicator = new RpcRequestDeduplicator();
        this.queue = new RpcOperationQueue();
        this.healthMonitor = new RpcConnectionHealthMonitor({
            maxConsecutiveFailures: this.options.maxConsecutiveFailures,
            healthCheckInterval: this.options.healthCheckInterval,
            context: this.options.context,
        });
    }

    async execute<T>(
        operation: () => Promise<T>,
        options: {
            retries?: number;
            timeout?: number;
            deduplicateKey?: string;
            skipHealthCheck?: boolean;
        } = {},
    ): Promise<T> {
        const {
            retries = 3,
            timeout = 10000,
            deduplicateKey,
            skipHealthCheck = false,
        } = options;

        // Check connection health
        if (!skipHealthCheck && !this.healthMonitor.isConnectionHealthy()) {
            throw new Error("RPC connection is unhealthy");
        }

        const executeOperation = async (): Promise<T> => {
            try {
                const result = await this.circuitBreaker.execute(operation, {
                    retries,
                    timeout,
                });
                this.healthMonitor.recordSuccess();
                return result;
            } catch (error) {
                this.healthMonitor.recordFailure();
                throw error;
            }
        };

        // Use deduplication if key provided
        if (deduplicateKey) {
            return this.deduplicator.deduplicate(
                deduplicateKey,
                executeOperation,
            );
        }

        // Use queue for concurrency control
        return this.queue.add(executeOperation);
    }

    async executeBatch<T>(
        operations: Array<() => Promise<T>>,
        options: {
            retries?: number;
            timeout?: number;
            skipHealthCheck?: boolean;
        } = {},
    ): Promise<T[]> {
        const {
            retries = 3,
            timeout = 10000,
            skipHealthCheck = false,
        } = options;

        // Check connection health
        if (!skipHealthCheck && !this.healthMonitor.isConnectionHealthy()) {
            throw new Error("RPC connection is unhealthy");
        }

        const executeOperations = operations.map((operation) => async () => {
            try {
                const result = await this.circuitBreaker.execute(operation, {
                    retries,
                    timeout,
                });
                this.healthMonitor.recordSuccess();
                return result;
            } catch (error) {
                this.healthMonitor.recordFailure();
                throw error;
            }
        });

        return this.queue.addBatch(executeOperations);
    }

    getStatus() {
        return {
            circuitBreaker: this.circuitBreaker.getState(),
            healthMonitor: this.healthMonitor.getHealthStatus(),
            pendingRequests: this.deduplicator.getPendingCount(),
            queueSize: this.queue.getQueueSize(),
        };
    }

    reset() {
        this.circuitBreaker.reset();
        this.healthMonitor.reset();
        this.deduplicator.clear();
        logger.info(
            { context: this.options.context },
            "Resilient RPC operation reset",
        );
    }
}
