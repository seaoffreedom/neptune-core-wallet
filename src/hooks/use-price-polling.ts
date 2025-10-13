/**
 * Price Polling Hook
 *
 * Hook for managing background price fetching with automatic polling,
 * caching, and error handling. Integrates with the price fetching settings
 * and provides real-time price updates.
 */

import { useCallback, useEffect, useRef } from "react";
import {
    fetchNeptunePrices,
    hasPriceDataChanged,
    isPriceCacheValid,
} from "@/services/price-fetcher";
import {
    usePriceFetchingSettings,
    useUpdatePriceFetchingSettings,
} from "@/store/neptune-core-settings.store";
import { rendererLoggers, logInfo, logError, logWarning } from "@/renderer/utils/logger";

// Global polling state to prevent multiple instances
let globalPollingInterval: NodeJS.Timeout | null = null;
let isGlobalPollingActive = false;

// Logger for price polling operations
const logger = rendererLoggers.price;

/**
 * Hook for managing price polling
 * @returns Object with polling state and control functions
 */
export function usePricePolling() {
    const priceFetchingSettings = usePriceFetchingSettings();
    const updatePriceFetchingSettings = useUpdatePriceFetchingSettings();
    const previousEnabledRef = useRef<boolean | null>(null);

    // Function to fetch and update prices
    const fetchAndUpdatePrices = useCallback(async () => {
        if (!priceFetchingSettings) return;

        try {
            logInfo(logger, "Fetching Neptune prices");
            const priceData = await fetchNeptunePrices();

            if (priceData) {
                // Check if prices have actually changed
                const currentPrices = priceFetchingSettings.cachedPrices;
                const newPrices = {
                    usd: priceData.usd,
                    eur: priceData.eur,
                    gbp: priceData.gbp,
                };

                const pricesChanged = hasPriceDataChanged(
                    currentPrices
                        ? {
                              usd: currentPrices.usd,
                              eur: currentPrices.eur,
                              gbp: currentPrices.gbp,
                              timestamp: currentPrices.timestamp,
                          }
                        : null,
                    priceData,
                );

                if (pricesChanged) {
                    // Prices have changed - update the store
                    updatePriceFetchingSettings({
                        lastFetched: priceData.timestamp,
                        cachedPrices: {
                            ...newPrices,
                            timestamp: priceData.timestamp,
                        },
                    });

                    logInfo(logger, "Prices updated in store - changes detected");
                } else {
                    // Prices haven't changed - only update timestamp
                    updatePriceFetchingSettings({
                        lastFetched: priceData.timestamp,
                    });

                    logInfo(logger, "Prices checked - no changes detected");
                }
            }
        } catch (error) {
            logError(logger, "Failed to fetch and update prices", error as Error);
        }
    }, [priceFetchingSettings, updatePriceFetchingSettings]);

    // Start polling function
    const startPolling = useCallback(() => {
        if (!priceFetchingSettings) return;

        logInfo(logger, "Starting price polling", {
            active: isGlobalPollingActive,
            enabled: priceFetchingSettings.enabled,
        });

        if (isGlobalPollingActive) {
            logWarning(logger, "Polling already active, skipping start");
            return;
        }

        if (!priceFetchingSettings.enabled) {
            logWarning(logger, "Price fetching not enabled, skipping start");
            return;
        }

        const pollIntervalMs = priceFetchingSettings.cacheTtl * 60 * 1000;

        logInfo(logger, "Starting price polling", {
            intervalMinutes: priceFetchingSettings.cacheTtl,
        });

        isGlobalPollingActive = true;

        // Initial fetch
        fetchAndUpdatePrices();

        // Set up interval
        globalPollingInterval = setInterval(() => {
            fetchAndUpdatePrices();
        }, pollIntervalMs);
    }, [priceFetchingSettings, fetchAndUpdatePrices]);

    // Stop polling function
    const stopPolling = useCallback(() => {
        if (!isGlobalPollingActive) {
            return;
        }

        logInfo(logger, "Stopping price polling");

        isGlobalPollingActive = false;

        if (globalPollingInterval) {
            clearInterval(globalPollingInterval);
            globalPollingInterval = null;
        }
    }, []);

    // Effect to manage polling based on enabled state
    useEffect(() => {
        if (!priceFetchingSettings) return;

        const currentEnabled = priceFetchingSettings.enabled;
        const previousEnabled = previousEnabledRef.current;

        logInfo(logger, "Price polling effect", {
            enabled: currentEnabled,
            previousEnabled,
            active: isGlobalPollingActive,
        });

        // First time or enabled state changed
        if (previousEnabled === null || previousEnabled !== currentEnabled) {
            if (currentEnabled) {
                logInfo(logger, "Starting price polling from effect");
                startPolling();
            } else {
                logInfo(logger, "Stopping price polling from effect");
                stopPolling();
                // Clear cached prices when disabled
                updatePriceFetchingSettings({
                    cachedPrices: undefined,
                    lastFetched: undefined,
                });
            }
        }

        previousEnabledRef.current = currentEnabled;
    }, [
        priceFetchingSettings,
        startPolling,
        stopPolling,
        updatePriceFetchingSettings,
    ]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopPolling();
        };
    }, [stopPolling]);

    return {
        isPollingActive: isGlobalPollingActive,
        startPolling,
        stopPolling,
        fetchAndUpdatePrices,
    };
}

/**
 * Check if price cache is valid
 * @param lastFetched - Last fetch timestamp
 * @param cacheTtl - Cache TTL in minutes
 * @returns boolean - True if cache is valid
 */
export function useIsPriceCacheValid(): boolean {
    const priceFetchingSettings = usePriceFetchingSettings();

    if (!priceFetchingSettings?.lastFetched) return false;

    return isPriceCacheValid(
        priceFetchingSettings.lastFetched,
        priceFetchingSettings.cacheTtl,
    );
}

/**
 * Get cache expiry time
 * @returns Date | null - Cache expiry time or null if no cache
 */
export function useCacheExpiryTime(): Date | null {
    const priceFetchingSettings = usePriceFetchingSettings();

    if (!priceFetchingSettings?.lastFetched) return null;

    const lastFetchedDate =
        typeof priceFetchingSettings.lastFetched === "string"
            ? new Date(priceFetchingSettings.lastFetched)
            : priceFetchingSettings.lastFetched;

    // Check if the date is valid
    if (Number.isNaN(lastFetchedDate.getTime())) {
        return null;
    }

    return new Date(
        lastFetchedDate.getTime() + priceFetchingSettings.cacheTtl * 60 * 1000,
    );
}

// Export for other components to check
export const isPricePollingActive = () => isGlobalPollingActive;
