/**
 * Price Types
 *
 * Shared type definitions for price fetching functionality.
 * These types are used in both main and renderer processes.
 */

// Price data interface
export interface PriceData {
    usd: number;
    eur: number;
    gbp: number;
    timestamp: Date;
}

// Cached price data with metadata
export interface CachedPriceData extends PriceData {
    lastFetched: Date;
    cacheValid: boolean;
}

// Price fetching configuration
export interface PriceFetchingConfig {
    enabled: boolean;
    cacheTtlMinutes: number;
    retryAttempts: number;
    retryDelayMs: number;
}
