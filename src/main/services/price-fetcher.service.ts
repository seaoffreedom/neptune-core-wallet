/**
 * Price Fetcher Service
 *
 * Fetches Neptune token prices from CoinGecko API with caching and error handling.
 * Provides a clean interface for the main process to fetch and cache price data.
 */

import pino from 'pino';

const logger = pino({ level: 'info' });

// CoinGecko API configuration
const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';
const NEPTUNE_COIN_ID = 'neptune-cash'; // Update this to the correct CoinGecko ID for Neptune

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

// Default configuration
const DEFAULT_CONFIG: PriceFetchingConfig = {
    enabled: false,
    cacheTtlMinutes: 5, // Cache for 5 minutes
    retryAttempts: 3,
    retryDelayMs: 1000,
};

export class PriceFetcherService {
    private cachedPrices: CachedPriceData | null = null;
    private config: PriceFetchingConfig = DEFAULT_CONFIG;
    private fetchPromise: Promise<PriceData | null> | null = null;

    constructor(config?: Partial<PriceFetchingConfig>) {
        if (config) {
            this.config = { ...DEFAULT_CONFIG, ...config };
        }
        logger.info({ config: this.config }, 'PriceFetcherService initialized');
    }

    /**
     * Update the configuration
     */
    updateConfig(config: Partial<PriceFetchingConfig>): void {
        this.config = { ...this.config, ...config };
        logger.info({ config: this.config }, 'Price fetching configuration updated');
    }

    /**
     * Check if cached prices are still valid
     */
    private isCacheValid(): boolean {
        if (!this.cachedPrices) return false;
        
        const now = new Date();
        const cacheAge = now.getTime() - this.cachedPrices.lastFetched.getTime();
        const cacheTtlMs = this.config.cacheTtlMinutes * 60 * 1000;
        
        return cacheAge < cacheTtlMs;
    }

    /**
     * Fetch prices from CoinGecko API
     */
    private async fetchPricesFromAPI(): Promise<PriceData | null> {
        try {
            const url = `${COINGECKO_API_BASE}/simple/price?ids=${NEPTUNE_COIN_ID}&vs_currencies=usd,eur,gbp`;
            
            logger.info({ url }, 'Fetching Neptune prices from CoinGecko');

            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json() as {
                [key: string]: {
                    usd: number;
                    eur: number;
                    gbp: number;
                };
            };

            const prices = data[NEPTUNE_COIN_ID];
            
            if (!prices || typeof prices.usd !== 'number' || typeof prices.eur !== 'number' || typeof prices.gbp !== 'number') {
                throw new Error('Invalid price data received from CoinGecko');
            }

            const priceData: PriceData = {
                usd: prices.usd,
                eur: prices.eur,
                gbp: prices.gbp,
                timestamp: new Date(),
            };

            logger.info(
                { prices: priceData },
                `Successfully fetched Neptune prices: $${priceData.usd.toFixed(4)} USD, €${priceData.eur.toFixed(4)} EUR, £${priceData.gbp.toFixed(4)} GBP`
            );

            return priceData;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.error({ error: errorMessage }, 'Failed to fetch Neptune prices from CoinGecko');
            return null;
        }
    }

    /**
     * Fetch prices with retry logic
     */
    private async fetchPricesWithRetry(): Promise<PriceData | null> {
        let lastError: Error | null = null;

        for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
            try {
                const result = await this.fetchPricesFromAPI();
                if (result) {
                    return result;
                }
                throw new Error('No price data returned');
            } catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                
                if (attempt < this.config.retryAttempts) {
                    logger.warn(
                        { attempt, maxAttempts: this.config.retryAttempts, error: lastError.message },
                        `Price fetch attempt ${attempt} failed, retrying in ${this.config.retryDelayMs}ms`
                    );
                    await new Promise(resolve => setTimeout(resolve, this.config.retryDelayMs));
                }
            }
        }

        logger.error(
            { attempts: this.config.retryAttempts, error: lastError?.message },
            'All price fetch attempts failed'
        );
        return null;
    }

    /**
     * Get current prices (from cache or fetch new)
     */
    async getPrices(): Promise<CachedPriceData | null> {
        // Return cached data if valid
        if (this.isCacheValid() && this.cachedPrices) {
            logger.debug('Returning cached price data');
            return this.cachedPrices;
        }

        // If already fetching, wait for that promise
        if (this.fetchPromise) {
            logger.debug('Price fetch already in progress, waiting for result');
            const result = await this.fetchPromise;
            return result ? this.cachedPrices : null;
        }

        // Start new fetch
        this.fetchPromise = this.fetchPricesWithRetry();
        
        try {
            const priceData = await this.fetchPromise;
            
            if (priceData) {
                this.cachedPrices = {
                    ...priceData,
                    lastFetched: priceData.timestamp,
                    cacheValid: true,
                };
                
                logger.info('Price data updated and cached');
                return this.cachedPrices;
            }
            
            return null;
        } finally {
            this.fetchPromise = null;
        }
    }

    /**
     * Force refresh prices (bypass cache)
     */
    async refreshPrices(): Promise<CachedPriceData | null> {
        logger.info('Force refreshing price data');
        this.cachedPrices = null; // Clear cache
        return this.getPrices();
    }

    /**
     * Get cached prices without fetching
     */
    getCachedPrices(): CachedPriceData | null {
        return this.isCacheValid() ? this.cachedPrices : null;
    }

    /**
     * Clear cached prices
     */
    clearCache(): void {
        logger.info('Clearing price cache');
        this.cachedPrices = null;
    }

    /**
     * Check if price fetching is enabled
     */
    isEnabled(): boolean {
        return this.config.enabled;
    }

    /**
     * Get current configuration
     */
    getConfig(): PriceFetchingConfig {
        return { ...this.config };
    }
}

// Singleton instance
let _priceFetcherServiceInstance: PriceFetcherService | null = null;

/**
 * Get the singleton PriceFetcherService instance
 */
export function getPriceFetcherService(): PriceFetcherService {
    if (!_priceFetcherServiceInstance) {
        _priceFetcherServiceInstance = new PriceFetcherService();
        logger.info('PriceFetcherService instance created (singleton)');
    }
    return _priceFetcherServiceInstance;
}

// Export for backward compatibility
export const priceFetcherService = new Proxy({} as PriceFetcherService, {
    get(_target, prop) {
        const instance = getPriceFetcherService();
        const value = (instance as unknown as Record<string, unknown>)[prop as string];
        return typeof value === 'function' ? value.bind(instance) : value;
    },
});
