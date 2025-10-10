/**
 * Cache Service
 *
 * Provides in-memory caching for expensive operations using node-cache
 */

import NodeCache from "node-cache";
import pino from "pino";

const logger = pino({ level: "info" });

export interface CacheConfig {
    stdTTL?: number; // Default TTL in seconds
    checkperiod?: number; // Check for expired keys interval
    useClones?: boolean; // Clone objects when storing
    maxKeys?: number; // Maximum number of keys
}

export class CacheService {
    private cache: NodeCache;
    private stats = {
        hits: 0,
        misses: 0,
        sets: 0,
        deletes: 0,
    };

    constructor(config: CacheConfig = {}) {
        this.cache = new NodeCache({
            stdTTL: config.stdTTL || 300, // 5 minutes default
            checkperiod: config.checkperiod || 60, // 1 minute
            useClones: config.useClones ?? true,
            maxKeys: config.maxKeys || 1000,
        });

        // Set up event listeners for statistics
        this.cache.on("set", () => {
            this.stats.sets++;
        });

        this.cache.on("del", () => {
            this.stats.deletes++;
        });

        logger.info(
            {
                stdTTL: this.cache.options.stdTTL,
                maxKeys: this.cache.options.maxKeys,
            },
            "Cache service initialized",
        );
    }

    /**
     * Get value from cache
     */
    get<T>(key: string): T | undefined {
        const value = this.cache.get<T>(key);
        if (value !== undefined) {
            this.stats.hits++;
            logger.debug({ key }, "Cache hit");
        } else {
            this.stats.misses++;
            logger.debug({ key }, "Cache miss");
        }
        return value;
    }

    /**
     * Set value in cache with optional TTL
     */
    set<T>(key: string, value: T, ttl?: number): boolean {
        const success = this.cache.set(key, value, ttl);
        if (success) {
            logger.debug({ key, ttl }, "Cache set");
        } else {
            logger.warn({ key }, "Cache set failed");
        }
        return success;
    }

    /**
     * Delete value from cache
     */
    del(key: string): number {
        const deleted = this.cache.del(key);
        if (deleted > 0) {
            logger.debug({ key }, "Cache delete");
        }
        return deleted;
    }

    /**
     * Check if key exists in cache
     */
    has(key: string): boolean {
        return this.cache.has(key);
    }

    /**
     * Get or set pattern - get from cache or compute and cache
     */
    async getOrSet<T>(
        key: string,
        computeFn: () => Promise<T>,
        ttl?: number,
    ): Promise<T> {
        const cached = this.get<T>(key);
        if (cached !== undefined) {
            return cached;
        }

        const value = await computeFn();
        this.set(key, value, ttl);
        return value;
    }

    /**
     * Clear all cache entries
     */
    flush(): void {
        this.cache.flushAll();
        logger.info("Cache flushed");
    }

    /**
     * Get cache statistics
     */
    getStats() {
        const nodeCacheStats = this.cache.getStats();
        return {
            ...this.stats,
            ...nodeCacheStats,
            hitRate:
                this.stats.hits / (this.stats.hits + this.stats.misses) || 0,
        };
    }

    /**
     * Get cache keys
     */
    keys(): string[] {
        return this.cache.keys();
    }

    /**
     * Get cache size
     */
    size(): number {
        return this.cache.keys().length;
    }
}

// Lazy singleton instance
let _cacheServiceInstance: CacheService | null = null;

/**
 * Get the singleton CacheService instance (lazy initialization)
 */
export function getCacheService(): CacheService {
    if (!_cacheServiceInstance) {
        _cacheServiceInstance = new CacheService();
        logger.info("CacheService instance created (lazy initialization)");
    }
    return _cacheServiceInstance;
}

// Backward compatibility - keep the old export for existing code
export const cacheService = new Proxy({} as CacheService, {
    get(_target, prop: string | symbol) {
        const instance = getCacheService();
        const value = (instance as any)[prop];
        return typeof value === "function" ? value.bind(instance) : value;
    },
});
