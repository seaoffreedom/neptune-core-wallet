/**
 * Price Store
 *
 * Zustand store for managing price fetching settings and cached price data.
 * Provides a clean interface for the renderer process to manage price display.
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// Price data types
export interface PriceData {
    usd: number;
    eur: number;
    gbp: number;
    timestamp: Date;
}

export interface CachedPriceData extends PriceData {
    lastFetched: Date;
    cacheValid: boolean;
}

// Price fetching configuration
export interface PriceFetchingConfig {
    enabled: boolean;
    cacheTtlMinutes: number;
    selectedCurrency: 'usd' | 'eur' | 'gbp';
    autoRefresh: boolean;
}

// Default configuration
const DEFAULT_CONFIG: PriceFetchingConfig = {
    enabled: false,
    cacheTtlMinutes: 5,
    selectedCurrency: 'usd',
    autoRefresh: true,
};

// Store state interface
interface PriceStore {
    // Configuration
    config: PriceFetchingConfig;
    
    // Cached price data
    cachedPrices: CachedPriceData | null;
    
    // Loading and error states
    isLoading: boolean;
    error: string | null;
    lastFetchAttempt: Date | null;
    
    // Actions
    setConfig: (config: Partial<PriceFetchingConfig>) => void;
    setCachedPrices: (prices: CachedPriceData | null) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    setLastFetchAttempt: (date: Date) => void;
    
    // Utility actions
    clearCache: () => void;
    isCacheValid: () => boolean;
    getPriceForCurrency: (currency: 'usd' | 'eur' | 'gbp') => number | null;
    formatPrice: (nptAmount: number, currency?: 'usd' | 'eur' | 'gbp') => string | null;
}

// Create the store
export const usePriceStore = create<PriceStore>()(
    devtools(
        persist(
            (set, get) => ({
                // Initial state
                config: DEFAULT_CONFIG,
                cachedPrices: null,
                isLoading: false,
                error: null,
                lastFetchAttempt: null,

                // Configuration actions
                setConfig: (newConfig) => {
                    set((state) => ({
                        config: { ...state.config, ...newConfig },
                    }));
                    console.log('💰 Price config updated:', newConfig);
                },

                // Price data actions
                setCachedPrices: (prices) => {
                    set({ cachedPrices: prices });
                    console.log('💰 Cached prices updated:', prices);
                },

                setLoading: (loading) => {
                    set({ isLoading: loading });
                },

                setError: (error) => {
                    set({ error });
                    if (error) {
                        console.error('💰 Price fetch error:', error);
                    }
                },

                setLastFetchAttempt: (date) => {
                    set({ lastFetchAttempt: date });
                },

                // Utility actions
                clearCache: () => {
                    set({ cachedPrices: null, error: null });
                    console.log('💰 Price cache cleared');
                },

                isCacheValid: () => {
                    const { cachedPrices, config } = get();
                    if (!cachedPrices) return false;
                    
                    const now = new Date();
                    const cacheAge = now.getTime() - cachedPrices.lastFetched.getTime();
                    const cacheTtlMs = config.cacheTtlMinutes * 60 * 1000;
                    
                    return cacheAge < cacheTtlMs;
                },

                getPriceForCurrency: (currency) => {
                    const { cachedPrices, config } = get();
                    if (!cachedPrices || !config.enabled) return null;
                    
                    return cachedPrices[currency] || null;
                },

                formatPrice: (nptAmount, currency) => {
                    const { cachedPrices, config } = get();
                    if (!cachedPrices || !config.enabled || nptAmount <= 0) return null;
                    
                    const targetCurrency = currency || config.selectedCurrency;
                    const price = cachedPrices[targetCurrency];
                    
                    if (!price || price <= 0) return null;
                    
                    const fiatAmount = nptAmount * price;
                    
                    // Format based on currency
                    switch (targetCurrency) {
                        case 'usd':
                            return `$${fiatAmount.toFixed(2)}`;
                        case 'eur':
                            return `€${fiatAmount.toFixed(2)}`;
                        case 'gbp':
                            return `£${fiatAmount.toFixed(2)}`;
                        default:
                            return null;
                    }
                },
            }),
            {
                name: 'neptune-price-store',
                partialize: (state) => ({
                    config: state.config,
                    // Don't persist cached prices, loading states, or errors
                }),
            }
        ),
        {
            name: 'price-store',
        }
    )
);

// Selector hooks for common use cases
export const usePriceConfig = () => usePriceStore((state) => state.config);
export const usePriceData = () => usePriceStore((state) => state.cachedPrices);
export const usePriceLoading = () => usePriceStore((state) => state.isLoading);
export const usePriceError = () => usePriceStore((state) => state.error);

// Action hooks
export const useSetPriceConfig = () => usePriceStore((state) => state.setConfig);
export const useSetCachedPrices = () => usePriceStore((state) => state.setCachedPrices);
export const useSetPriceLoading = () => usePriceStore((state) => state.setLoading);
export const useSetPriceError = () => usePriceStore((state) => state.setError);
export const useSetLastFetchAttempt = () => usePriceStore((state) => state.setLastFetchAttempt);
export const useClearPriceCache = () => usePriceStore((state) => state.clearCache);

// Utility hooks
export const useIsPriceCacheValid = () => usePriceStore((state) => state.isCacheValid);
export const useFormatPrice = () => usePriceStore((state) => state.formatPrice);
export const useGetPriceForCurrency = () => usePriceStore((state) => state.getPriceForCurrency);

// Convenience hook for price display
export const usePriceDisplay = (nptAmount: number, currency?: 'usd' | 'eur' | 'gbp') => {
    const config = usePriceConfig();
    const cachedPrices = usePriceData();
    const formatPrice = useFormatPrice();
    
    if (!config.enabled || !cachedPrices || nptAmount <= 0) {
        return null;
    }
    
    return formatPrice(nptAmount, currency);
};
