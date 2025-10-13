/**
 * Price Polling Hook
 *
 * Manages automatic price fetching and updates the price store.
 * Handles polling intervals, error recovery, and cache management.
 */

import { useEffect, useRef, useCallback } from 'react';
import { usePriceConfig, useSetCachedPrices, useSetPriceLoading, useSetPriceError, useSetLastFetchAttempt } from '@/store/price.store';
import { priceAPI } from '@/preload/api/price-api';

export function usePricePolling() {
    const config = usePriceConfig();
    const setCachedPrices = useSetCachedPrices();
    const setLoading = useSetPriceLoading();
    const setError = useSetPriceError();
    const setLastFetchAttempt = useSetLastFetchAttempt();
    
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const isPollingRef = useRef(false);

    // Fetch and update prices
    const fetchAndUpdatePrices = useCallback(async () => {
        if (!config.enabled || isPollingRef.current) return;

        isPollingRef.current = true;
        setLoading(true);
        setError(null);
        setLastFetchAttempt(new Date());

        try {
            const result = await priceAPI.getCurrentPrices();
            
            if (result.success && result.prices) {
                setCachedPrices(result.prices);
                console.log('💰 Prices updated successfully:', result.prices);
            } else {
                setError(result.error || 'Failed to fetch prices');
                console.error('💰 Price fetch failed:', result.error);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            setError(errorMessage);
            console.error('💰 Price fetch error:', errorMessage);
        } finally {
            setLoading(false);
            isPollingRef.current = false;
        }
    }, [config.enabled, setCachedPrices, setLoading, setError, setLastFetchAttempt]);

    // Start polling
    const startPolling = useCallback(() => {
        if (!config.enabled || !config.autoRefresh || intervalRef.current) return;

        const pollIntervalMs = config.cacheTtlMinutes * 60 * 1000;
        
        console.log(`💰 Starting price polling every ${config.cacheTtlMinutes} minutes`);
        
        // Fetch immediately
        fetchAndUpdatePrices();
        
        // Set up interval
        intervalRef.current = setInterval(() => {
            fetchAndUpdatePrices();
        }, pollIntervalMs);
    }, [config.enabled, config.autoRefresh, config.cacheTtlMinutes, fetchAndUpdatePrices]);

    // Stop polling
    const stopPolling = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            console.log('💰 Price polling stopped');
        }
    }, []);

    // Effect to manage polling based on config changes
    useEffect(() => {
        if (config.enabled && config.autoRefresh) {
            startPolling();
        } else {
            stopPolling();
        }

        // Cleanup on unmount
        return () => {
            stopPolling();
        };
    }, [config.enabled, config.autoRefresh, startPolling, stopPolling]);

    // Manual refresh function
    const refreshPrices = useCallback(async () => {
        if (!config.enabled) return;

        setLoading(true);
        setError(null);
        setLastFetchAttempt(new Date());

        try {
            const result = await priceAPI.refreshPrices();
            
            if (result.success && result.prices) {
                setCachedPrices(result.prices);
                console.log('💰 Prices refreshed manually:', result.prices);
                return true;
            } else {
                setError(result.error || 'Failed to refresh prices');
                console.error('💰 Price refresh failed:', result.error);
                return false;
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            setError(errorMessage);
            console.error('💰 Price refresh error:', errorMessage);
            return false;
        } finally {
            setLoading(false);
        }
    }, [config.enabled, setCachedPrices, setLoading, setError, setLastFetchAttempt]);

    return {
        fetchAndUpdatePrices,
        refreshPrices,
        startPolling,
        stopPolling,
        isPolling: intervalRef.current !== null,
    };
}
