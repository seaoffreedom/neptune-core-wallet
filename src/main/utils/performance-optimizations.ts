/**
 * Performance Optimizations
 *
 * Provides performance optimization utilities for RPC operations,
 * data fetching, and system resource management
 */

import pQueue from 'p-queue';
import pino from 'pino';

const logger = pino({ level: 'info' });

/**
 * Performance metrics collector
 */
export class PerformanceMetrics {
  private metrics = new Map<
    string,
    {
      count: number;
      totalTime: number;
      minTime: number;
      maxTime: number;
      lastCall: number;
    }
  >();

  record(operation: string, duration: number) {
    const existing = this.metrics.get(operation) || {
      count: 0,
      totalTime: 0,
      minTime: Infinity,
      maxTime: 0,
      lastCall: 0,
    };

    existing.count++;
    existing.totalTime += duration;
    existing.minTime = Math.min(existing.minTime, duration);
    existing.maxTime = Math.max(existing.maxTime, duration);
    existing.lastCall = Date.now();

    this.metrics.set(operation, existing);
  }

  getMetrics(operation?: string) {
    if (operation) {
      return this.metrics.get(operation);
    }
    return Object.fromEntries(this.metrics);
  }

  getAverageTime(operation: string) {
    const metric = this.metrics.get(operation);
    return metric ? metric.totalTime / metric.count : 0;
  }

  reset() {
    this.metrics.clear();
    logger.info('Performance metrics reset');
  }
}

/**
 * Global performance metrics instance (lazy initialization)
 */
let _performanceMetrics: PerformanceMetrics | null = null;

export function getPerformanceMetrics(): PerformanceMetrics {
  if (!_performanceMetrics) {
    _performanceMetrics = new PerformanceMetrics();
  }
  return _performanceMetrics;
}

export const performanceMetrics = new Proxy({} as PerformanceMetrics, {
  get(_target, prop) {
    const instance = getPerformanceMetrics();
    const value = (instance as unknown as Record<string, unknown>)[
      prop as string
    ];
    return typeof value === 'function' ? value.bind(instance) : value;
  },
});

/**
 * Performance monitoring decorator
 */
export function withPerformanceMonitoring<
  T extends (...args: unknown[]) => Promise<unknown>,
>(operation: T, operationName: string): T {
  return (async (...args: Parameters<T>) => {
    const startTime = performance.now();
    try {
      const result = await operation(...args);
      const duration = performance.now() - startTime;
      getPerformanceMetrics().record(operationName, duration);
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      getPerformanceMetrics().record(`${operationName}_error`, duration);
      throw error;
    }
  }) as T;
}

/**
 * RPC operation queue with priority support
 */
export class PriorityRpcQueue {
  private highPriorityQueue = new pQueue({ concurrency: 3 });
  private normalPriorityQueue = new pQueue({ concurrency: 2 });
  private lowPriorityQueue = new pQueue({ concurrency: 1 });

  async add<T>(
    operation: () => Promise<T>,
    priority: 'high' | 'normal' | 'low' = 'normal'
  ): Promise<T> {
    const queue = this.getQueue(priority);
    return queue.add(operation);
  }

  async addBatch<T>(
    operations: Array<() => Promise<T>>,
    priority: 'high' | 'normal' | 'low' = 'normal'
  ): Promise<T[]> {
    const queue = this.getQueue(priority);
    return queue.addAll(operations);
  }

  private getQueue(priority: 'high' | 'normal' | 'low') {
    switch (priority) {
      case 'high':
        return this.highPriorityQueue;
      case 'low':
        return this.lowPriorityQueue;
      default:
        return this.normalPriorityQueue;
    }
  }

  getStatus() {
    return {
      highPriority: {
        pending: this.highPriorityQueue.pending,
        size: this.highPriorityQueue.size,
      },
      normalPriority: {
        pending: this.normalPriorityQueue.pending,
        size: this.normalPriorityQueue.size,
      },
      lowPriority: {
        pending: this.lowPriorityQueue.pending,
        size: this.lowPriorityQueue.size,
      },
    };
  }

  clear() {
    this.highPriorityQueue.clear();
    this.normalPriorityQueue.clear();
    this.lowPriorityQueue.clear();
    logger.info('All RPC queues cleared');
  }
}

/**
 * Global priority RPC queue (lazy initialization)
 */
let _priorityRpcQueue: PriorityRpcQueue | null = null;

export function getPriorityRpcQueue(): PriorityRpcQueue {
  if (!_priorityRpcQueue) {
    _priorityRpcQueue = new PriorityRpcQueue();
  }
  return _priorityRpcQueue;
}

export const priorityRpcQueue = new Proxy({} as PriorityRpcQueue, {
  get(_target, prop) {
    const instance = getPriorityRpcQueue();
    const value = (instance as unknown as Record<string, unknown>)[
      prop as string
    ];
    return typeof value === 'function' ? value.bind(instance) : value;
  },
});

/**
 * Data fetching queue with concurrency control
 */
export class DataFetchingQueue {
  private queue = new pQueue({ concurrency: 4 });
  private metrics = new PerformanceMetrics();

  async add<T>(operation: () => Promise<T>): Promise<T> {
    const startTime = performance.now();
    try {
      const result = await this.queue.add(operation);
      const duration = performance.now() - startTime;
      this.metrics.record('data_fetch', duration);
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      this.metrics.record('data_fetch_error', duration);
      throw error;
    }
  }

  async addBatch<T>(operations: Array<() => Promise<T>>): Promise<T[]> {
    const startTime = performance.now();
    try {
      const results = await this.queue.addAll(operations);
      const duration = performance.now() - startTime;
      this.metrics.record('data_fetch_batch', duration);
      return results;
    } catch (error) {
      const duration = performance.now() - startTime;
      this.metrics.record('data_fetch_batch_error', duration);
      throw error;
    }
  }

  getStatus() {
    return {
      pending: this.queue.pending,
      size: this.queue.size,
      metrics: this.metrics.getMetrics(),
    };
  }

  clear() {
    this.queue.clear();
    this.metrics.reset();
    logger.info('Data fetching queue cleared');
  }
}

/**
 * Global data fetching queue (lazy initialization)
 */
let _dataFetchingQueue: DataFetchingQueue | null = null;

export function getDataFetchingQueue(): DataFetchingQueue {
  if (!_dataFetchingQueue) {
    _dataFetchingQueue = new DataFetchingQueue();
  }
  return _dataFetchingQueue;
}

export const dataFetchingQueue = new Proxy({} as DataFetchingQueue, {
  get(_target, prop) {
    const instance = getDataFetchingQueue();
    const value = (instance as unknown as Record<string, unknown>)[
      prop as string
    ];
    return typeof value === 'function' ? value.bind(instance) : value;
  },
});

/**
 * Connection pool for RPC operations
 */
export class RpcConnectionPool {
  private connections = new Map<
    string,
    {
      lastUsed: number;
      isHealthy: boolean;
      requestCount: number;
    }
  >();

  constructor(
    private options: {
      maxConnections?: number;
      connectionTimeout?: number;
      healthCheckInterval?: number;
    } = {}
  ) {
    this.options = {
      maxConnections: 5,
      connectionTimeout: 30000, // 30 seconds
      healthCheckInterval: 10000, // 10 seconds
      ...this.options,
    };
  }

  getConnection(url: string) {
    const connection = this.connections.get(url);
    if (connection) {
      connection.lastUsed = Date.now();
      connection.requestCount++;
      return connection;
    }

    // Create new connection if under limit
    if (this.connections.size < (this.options.maxConnections || 5)) {
      const newConnection = {
        lastUsed: Date.now(),
        isHealthy: true,
        requestCount: 1,
      };
      this.connections.set(url, newConnection);
      return newConnection;
    }

    // Reuse oldest connection
    const oldestConnection = Array.from(this.connections.entries()).sort(
      ([, a], [, b]) => a.lastUsed - b.lastUsed
    )[0];

    if (oldestConnection) {
      const [, connection] = oldestConnection;
      connection.lastUsed = Date.now();
      connection.requestCount++;
      return connection;
    }

    return null;
  }

  markConnectionUnhealthy(url: string) {
    const connection = this.connections.get(url);
    if (connection) {
      connection.isHealthy = false;
    }
  }

  markConnectionHealthy(url: string) {
    const connection = this.connections.get(url);
    if (connection) {
      connection.isHealthy = true;
    }
  }

  cleanup() {
    const now = Date.now();
    const timeout = this.options.connectionTimeout || 30000;

    for (const [url, connection] of this.connections.entries()) {
      if (now - connection.lastUsed > timeout) {
        this.connections.delete(url);
      }
    }
  }

  getStatus() {
    return {
      totalConnections: this.connections.size,
      healthyConnections: Array.from(this.connections.values()).filter(
        (conn) => conn.isHealthy
      ).length,
      connections: Object.fromEntries(this.connections),
    };
  }

  reset() {
    this.connections.clear();
    logger.info('RPC connection pool reset');
  }
}

/**
 * Global RPC connection pool (lazy initialization)
 */
let _rpcConnectionPool: RpcConnectionPool | null = null;

export function getRpcConnectionPool(): RpcConnectionPool {
  if (!_rpcConnectionPool) {
    _rpcConnectionPool = new RpcConnectionPool();
  }
  return _rpcConnectionPool;
}

export const rpcConnectionPool = new Proxy({} as RpcConnectionPool, {
  get(_target, prop) {
    const instance = getRpcConnectionPool();
    const value = (instance as unknown as Record<string, unknown>)[
      prop as string
    ];
    return typeof value === 'function' ? value.bind(instance) : value;
  },
});

/**
 * Memory usage monitor
 */
export class MemoryUsageMonitor {
  private memorySnapshots: Array<{
    timestamp: number;
    used: number;
    total: number;
  }> = [];

  recordSnapshot() {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const usage = process.memoryUsage();
      this.memorySnapshots.push({
        timestamp: Date.now(),
        used: usage.heapUsed,
        total: usage.heapTotal,
      });

      // Keep only last 100 snapshots
      if (this.memorySnapshots.length > 100) {
        this.memorySnapshots = this.memorySnapshots.slice(-100);
      }
    }
  }

  getMemoryTrend() {
    if (this.memorySnapshots.length < 2) {
      return { trend: 'stable', change: 0 };
    }

    const latest = this.memorySnapshots[this.memorySnapshots.length - 1];
    const previous = this.memorySnapshots[this.memorySnapshots.length - 2];

    const change = latest.used - previous.used;
    const changePercent = (change / previous.used) * 100;

    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (changePercent > 5) {
      trend = 'increasing';
    } else if (changePercent < -5) {
      trend = 'decreasing';
    }

    return { trend, change, changePercent };
  }

  getCurrentUsage() {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage();
    }
    return null;
  }

  reset() {
    this.memorySnapshots = [];
    logger.info('Memory usage monitor reset');
  }
}

/**
 * Global memory usage monitor (lazy initialization)
 */
let _memoryUsageMonitor: MemoryUsageMonitor | null = null;

export function getMemoryUsageMonitor(): MemoryUsageMonitor {
  if (!_memoryUsageMonitor) {
    _memoryUsageMonitor = new MemoryUsageMonitor();
  }
  return _memoryUsageMonitor;
}

export const memoryUsageMonitor = new Proxy({} as MemoryUsageMonitor, {
  get(_target, prop) {
    const instance = getMemoryUsageMonitor();
    const value = (instance as unknown as Record<string, unknown>)[
      prop as string
    ];
    return typeof value === 'function' ? value.bind(instance) : value;
  },
});

/**
 * Performance optimization manager
 */
export class PerformanceOptimizationManager {
  private isMonitoring = false;
  private monitoringInterval?: NodeJS.Timeout;

  startMonitoring(intervalMs = 30000) {
    if (this.isMonitoring) {
      return;
    }

    this.isMonitoring = true;
    this.monitoringInterval = setInterval(() => {
      this.performMaintenance();
    }, intervalMs);

    logger.info('Performance monitoring started');
  }

  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
    this.isMonitoring = false;
    logger.info('Performance monitoring stopped');
  }

  private performMaintenance() {
    // Clean up connection pool
    getRpcConnectionPool().cleanup();

    // Record memory snapshot
    getMemoryUsageMonitor().recordSnapshot();

    // Log performance metrics
    const metrics = getPerformanceMetrics().getMetrics();
    if (metrics && Object.keys(metrics).length > 0) {
      logger.info({ metrics }, 'Performance metrics');
    }
  }

  getStatus() {
    return {
      isMonitoring: this.isMonitoring,
      performanceMetrics: getPerformanceMetrics().getMetrics(),
      rpcQueue: getPriorityRpcQueue().getStatus(),
      dataQueue: getDataFetchingQueue().getStatus(),
      connectionPool: getRpcConnectionPool().getStatus(),
      memoryTrend: getMemoryUsageMonitor().getMemoryTrend(),
    };
  }

  reset() {
    getPerformanceMetrics().reset();
    getPriorityRpcQueue().clear();
    getDataFetchingQueue().clear();
    getRpcConnectionPool().reset();
    getMemoryUsageMonitor().reset();
    logger.info('Performance optimization manager reset');
  }
}

/**
 * Global performance optimization manager (lazy initialization)
 */
let _performanceOptimizationManager: PerformanceOptimizationManager | null =
  null;

export function getPerformanceOptimizationManager(): PerformanceOptimizationManager {
  if (!_performanceOptimizationManager) {
    _performanceOptimizationManager = new PerformanceOptimizationManager();
  }
  return _performanceOptimizationManager;
}

export const performanceOptimizationManager = new Proxy(
  {} as PerformanceOptimizationManager,
  {
    get(_target, prop) {
      const instance = getPerformanceOptimizationManager();
      const value = (instance as unknown as Record<string, unknown>)[
        prop as string
      ];
      return typeof value === 'function' ? value.bind(instance) : value;
    },
  }
);
