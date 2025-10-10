/**
 * Worker Manager Service
 *
 * Manages worker threads for CPU-intensive operations
 * using the recommended p-* packages for resilience.
 */

import { Worker } from "worker_threads";
import path from "path";
import pino from "pino";
import pRetry from "p-retry";
import pTimeout from "p-timeout";
import pLimit from "p-limit";

const logger = pino({ level: "info" });

interface WorkerMessage {
    id: string;
    type: string;
    data: any;
}

interface WorkerResponse {
    id: string;
    success: boolean;
    result?: any;
    error?: string;
}

export class WorkerManagerService {
    private workers = new Map<string, Worker>();
    private workerLimit = pLimit(3); // Max 3 concurrent worker operations
    private messageId = 0;

    constructor() {
        logger.info("WorkerManagerService initialized");
    }

    /**
     * Execute a crypto operation in a worker thread
     */
    async executeCryptoOperation(
        type: "hash" | "random" | "validate",
        data: any,
        timeout: number = 10000,
    ): Promise<any> {
        return this.workerLimit(async () => {
            return pRetry(
                () =>
                    pTimeout(
                        this.runWorkerOperation("crypto", type, data),
                        timeout,
                        "Worker operation timeout",
                    ),
                {
                    retries: 2,
                    factor: 2,
                    minTimeout: 1000,
                    maxTimeout: 3000,
                    onFailedAttempt: (error) => {
                        logger.warn(
                            {
                                attempt: error.attemptNumber,
                                error: error.message || "Unknown error",
                                type,
                            },
                            "Worker operation retry attempt failed",
                        );
                    },
                },
            );
        });
    }

    /**
     * Run an operation in a worker thread
     */
    private async runWorkerOperation(
        workerType: string,
        operationType: string,
        data: any,
    ): Promise<any> {
        const worker = this.getOrCreateWorker(workerType);
        const messageId = (++this.messageId).toString();

        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error(`Worker operation timeout: ${operationType}`));
            }, 15000);

            const messageHandler = (response: WorkerResponse) => {
                if (response.id === messageId) {
                    clearTimeout(timeout);
                    worker.off("message", messageHandler);

                    if (response.success) {
                        resolve(response.result);
                    } else {
                        reject(
                            new Error(
                                response.error || "Worker operation failed",
                            ),
                        );
                    }
                }
            };

            worker.on("message", messageHandler);

            const message: WorkerMessage = {
                id: messageId,
                type: operationType,
                data,
            };

            worker.postMessage(message);
        });
    }

    /**
     * Get or create a worker of the specified type
     */
    private getOrCreateWorker(workerType: string): Worker {
        if (!this.workers.has(workerType)) {
            const workerPath = path.join(
                __dirname,
                "..",
                "workers",
                `${workerType}-worker.ts`,
            );
            const worker = new Worker(workerPath);

            worker.on("error", (error) => {
                logger.error({ error, workerType }, "Worker error");
                this.workers.delete(workerType);
            });

            worker.on("exit", (code) => {
                if (code !== 0) {
                    logger.warn(
                        { code, workerType },
                        "Worker exited with non-zero code",
                    );
                }
                this.workers.delete(workerType);
            });

            this.workers.set(workerType, worker);
            logger.info({ workerType }, "Worker created");
        }

        return this.workers.get(workerType)!;
    }

    /**
     * Terminate all workers
     */
    async terminateAll(): Promise<void> {
        const terminationPromises = Array.from(this.workers.values()).map(
            (worker) => {
                return new Promise<void>((resolve) => {
                    worker
                        .terminate()
                        .then(() => resolve())
                        .catch(() => resolve());
                });
            },
        );

        await Promise.all(terminationPromises);
        this.workers.clear();
        logger.info("All workers terminated");
    }

    /**
     * Get worker statistics
     */
    getStats(): { activeWorkers: number; workerTypes: string[] } {
        return {
            activeWorkers: this.workers.size,
            workerTypes: Array.from(this.workers.keys()),
        };
    }
}

// Lazy singleton instance
let _workerManagerInstance: WorkerManagerService | null = null;

/**
 * Get the singleton WorkerManagerService instance (lazy initialization)
 */
export function getWorkerManagerService(): WorkerManagerService {
    if (!_workerManagerInstance) {
        _workerManagerInstance = new WorkerManagerService();
        logger.info(
            "WorkerManagerService instance created (lazy initialization)",
        );
    }
    return _workerManagerInstance;
}

// Backward compatibility - keep the old export for existing code
export const workerManagerService = new Proxy({} as WorkerManagerService, {
    get(_target, prop) {
        const instance = getWorkerManagerService();
        const value = (instance as Record<string, unknown>)[prop];
        return typeof value === "function" ? value.bind(instance) : value;
    },
});
