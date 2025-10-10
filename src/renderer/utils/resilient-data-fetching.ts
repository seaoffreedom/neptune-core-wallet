/**
 * Resilient Data Fetching Utilities
 *
 * Provides resilient data fetching with retry logic, exponential backoff,
 * and circuit breaker patterns for renderer-side data operations
 */

import pRetry from "p-retry";
import pTimeout from "p-timeout";

/**
 * Circuit Breaker for data fetching operations
 */
export class DataFetchingCircuitBreaker {
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
            failureThreshold: 3,
            resetTimeout: 15000, // 15 seconds
            context: "data-fetching-circuit-breaker",
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
        const { retries = 2, timeout = 8000 } = options;

        if (this.state === "open") {
            if (
                Date.now() - this.lastFailureTime >
                (this.options.resetTimeout || 15000)
            ) {
                this.state = "half-open";
                console.info(
                    `[${this.options.context}] Circuit breaker transitioning to half-open`,
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
                    maxTimeout: 4000,
                    onFailedAttempt: (error) => {
                        console.warn(
                            `[${this.options.context}] Data fetch attempt ${error.attemptNumber} failed:`,
                            error instanceof Error
                                ? error.message
                                : String(error),
                        );
                    },
                },
            );

            if (this.state === "half-open") {
                this.state = "closed";
                this.failures = 0;
                console.info(
                    `[${this.options.context}] Circuit breaker closed after successful operation`,
                );
            }

            return result as T;
        } catch (error) {
            this.failures++;
            this.lastFailureTime = Date.now();

            if (this.failures >= (this.options.failureThreshold || 3)) {
                this.state = "open";
                console.error(
                    `[${this.options.context}] Circuit breaker opened due to ${this.failures} failures`,
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
        console.info(
            `[${this.options.context}] Circuit breaker manually reset`,
        );
    }
}

/**
 * Request deduplication for data fetching
 */
export class DataFetchingDeduplicator {
    private pendingRequests = new Map<string, Promise<unknown>>();

    async deduplicate<T>(key: string, operation: () => Promise<T>): Promise<T> {
        // Check if request is already pending
        const existingRequest = this.pendingRequests.get(key);
        if (existingRequest) {
            console.debug(
                `[DataFetchingDeduplicator] Deduplicating request: ${key}`,
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
        console.info("[DataFetchingDeduplicator] Cleared all pending requests");
    }

    getPendingCount() {
        return this.pendingRequests.size;
    }
}

/**
 * Resilient data fetching with all resilience features
 */
export class ResilientDataFetcher {
    private circuitBreaker: DataFetchingCircuitBreaker;
    private deduplicator: DataFetchingDeduplicator;

    constructor(
        private options: {
            failureThreshold?: number;
            resetTimeout?: number;
            context?: string;
        } = {},
    ) {
        this.circuitBreaker = new DataFetchingCircuitBreaker({
            failureThreshold: this.options.failureThreshold,
            resetTimeout: this.options.resetTimeout,
            context: this.options.context,
        });

        this.deduplicator = new DataFetchingDeduplicator();
    }

    async fetch<T>(
        operation: () => Promise<T>,
        options: {
            retries?: number;
            timeout?: number;
            deduplicateKey?: string;
        } = {},
    ): Promise<T> {
        const { retries = 2, timeout = 8000, deduplicateKey } = options;

        const executeOperation = async (): Promise<T> => {
            return this.circuitBreaker.execute(operation, { retries, timeout });
        };

        // Use deduplication if key provided
        if (deduplicateKey) {
            return this.deduplicator.deduplicate(
                deduplicateKey,
                executeOperation,
            );
        }

        return executeOperation();
    }

    async fetchBatch<T>(
        operations: Array<() => Promise<T>>,
        options: {
            retries?: number;
            timeout?: number;
        } = {},
    ): Promise<T[]> {
        const { retries = 2, timeout = 8000 } = options;

        const executeOperations = operations.map((operation) => async () => {
            return this.circuitBreaker.execute(operation, { retries, timeout });
        });

        return Promise.all(executeOperations) as Promise<T[]>;
    }

    getStatus() {
        return {
            circuitBreaker: this.circuitBreaker.getState(),
            pendingRequests: this.deduplicator.getPendingCount(),
        };
    }

    reset() {
        this.circuitBreaker.reset();
        this.deduplicator.clear();
        console.info(`[${this.options.context}] Resilient data fetcher reset`);
    }
}

/**
 * Global resilient data fetchers for different data types (lazy initialization)
 */
let _dashboardDataFetcher: ResilientDataFetcher | null = null;
let _balanceDataFetcher: ResilientDataFetcher | null = null;
let _mempoolDataFetcher: ResilientDataFetcher | null = null;
let _networkDataFetcher: ResilientDataFetcher | null = null;
let _peerDataFetcher: ResilientDataFetcher | null = null;
let _historyDataFetcher: ResilientDataFetcher | null = null;
let _utxoDataFetcher: ResilientDataFetcher | null = null;

export function getDashboardDataFetcher(): ResilientDataFetcher {
    if (!_dashboardDataFetcher) {
        _dashboardDataFetcher = new ResilientDataFetcher({
            failureThreshold: 3,
            resetTimeout: 15000,
            context: "dashboard-data",
        });
    }
    return _dashboardDataFetcher;
}

export function getBalanceDataFetcher(): ResilientDataFetcher {
    if (!_balanceDataFetcher) {
        _balanceDataFetcher = new ResilientDataFetcher({
            failureThreshold: 3,
            resetTimeout: 15000,
            context: "balance-data",
        });
    }
    return _balanceDataFetcher;
}

export function getMempoolDataFetcher(): ResilientDataFetcher {
    if (!_mempoolDataFetcher) {
        _mempoolDataFetcher = new ResilientDataFetcher({
            failureThreshold: 3,
            resetTimeout: 15000,
            context: "mempool-data",
        });
    }
    return _mempoolDataFetcher;
}

export function getNetworkDataFetcher(): ResilientDataFetcher {
    if (!_networkDataFetcher) {
        _networkDataFetcher = new ResilientDataFetcher({
            failureThreshold: 3,
            resetTimeout: 15000,
            context: "network-data",
        });
    }
    return _networkDataFetcher;
}

export function getPeerDataFetcher(): ResilientDataFetcher {
    if (!_peerDataFetcher) {
        _peerDataFetcher = new ResilientDataFetcher({
            failureThreshold: 3,
            resetTimeout: 15000,
            context: "peer-data",
        });
    }
    return _peerDataFetcher;
}

export function getHistoryDataFetcher(): ResilientDataFetcher {
    if (!_historyDataFetcher) {
        _historyDataFetcher = new ResilientDataFetcher({
            failureThreshold: 3,
            resetTimeout: 15000,
            context: "history-data",
        });
    }
    return _historyDataFetcher;
}

export function getUtxoDataFetcher(): ResilientDataFetcher {
    if (!_utxoDataFetcher) {
        _utxoDataFetcher = new ResilientDataFetcher({
            failureThreshold: 3,
            resetTimeout: 15000,
            context: "utxo-data",
        });
    }
    return _utxoDataFetcher;
}

// Backward compatibility exports
export const dashboardDataFetcher = new Proxy({} as ResilientDataFetcher, {
    get(_target, prop) {
        const instance = getDashboardDataFetcher();
        const value = (instance as unknown as Record<string, unknown>)[
            prop as string
        ];
        return typeof value === "function" ? value.bind(instance) : value;
    },
});

export const balanceDataFetcher = new Proxy({} as ResilientDataFetcher, {
    get(_target, prop) {
        const instance = getBalanceDataFetcher();
        const value = (instance as unknown as Record<string, unknown>)[
            prop as string
        ];
        return typeof value === "function" ? value.bind(instance) : value;
    },
});

export const mempoolDataFetcher = new Proxy({} as ResilientDataFetcher, {
    get(_target, prop) {
        const instance = getMempoolDataFetcher();
        const value = (instance as unknown as Record<string, unknown>)[
            prop as string
        ];
        return typeof value === "function" ? value.bind(instance) : value;
    },
});

export const networkDataFetcher = new Proxy({} as ResilientDataFetcher, {
    get(_target, prop) {
        const instance = getNetworkDataFetcher();
        const value = (instance as unknown as Record<string, unknown>)[
            prop as string
        ];
        return typeof value === "function" ? value.bind(instance) : value;
    },
});

export const peerDataFetcher = new Proxy({} as ResilientDataFetcher, {
    get(_target, prop) {
        const instance = getPeerDataFetcher();
        const value = (instance as unknown as Record<string, unknown>)[
            prop as string
        ];
        return typeof value === "function" ? value.bind(instance) : value;
    },
});

export const historyDataFetcher = new Proxy({} as ResilientDataFetcher, {
    get(_target, prop) {
        const instance = getHistoryDataFetcher();
        const value = (instance as unknown as Record<string, unknown>)[
            prop as string
        ];
        return typeof value === "function" ? value.bind(instance) : value;
    },
});

export const utxoDataFetcher = new Proxy({} as ResilientDataFetcher, {
    get(_target, prop) {
        const instance = getUtxoDataFetcher();
        const value = (instance as unknown as Record<string, unknown>)[
            prop as string
        ];
        return typeof value === "function" ? value.bind(instance) : value;
    },
});

/**
 * Utility function to create a resilient fetch wrapper
 */
export function createResilientFetch<T>(
    operation: () => Promise<T>,
    options: {
        retries?: number;
        timeout?: number;
        deduplicateKey?: string;
        context?: string;
    } = {},
): () => Promise<T> {
    const { context = "resilient-fetch" } = options;
    const fetcher = new ResilientDataFetcher({ context });

    return () => fetcher.fetch(operation, options);
}

/**
 * Utility function for batch resilient fetching
 */
export function createResilientBatchFetch<T>(
    operations: Array<() => Promise<T>>,
    options: {
        retries?: number;
        timeout?: number;
        context?: string;
    } = {},
): () => Promise<T[]> {
    const { context = "resilient-batch-fetch" } = options;
    const fetcher = new ResilientDataFetcher({ context });

    return () => fetcher.fetchBatch(operations, options);
}
