/**
 * Price API - Exposed to Renderer
 *
 * Exposes price fetching functionality to the renderer process through the context bridge.
 */

import { ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../../shared/constants/ipc-channels';
import type { PriceFetchingConfig, CachedPriceData } from '../../../main/services/price-fetcher.service';

export const priceAPI = {
    /**
     * Get current cached prices
     */
    getCurrentPrices: async (): Promise<{
        success: boolean;
        prices?: CachedPriceData;
        error?: string;
    }> => {
        return await ipcRenderer.invoke(IPC_CHANNELS.PRICE_GET_CURRENT);
    },

    /**
     * Force refresh prices from CoinGecko
     */
    refreshPrices: async (): Promise<{
        success: boolean;
        prices?: CachedPriceData;
        error?: string;
    }> => {
        return await ipcRenderer.invoke(IPC_CHANNELS.PRICE_REFRESH);
    },

    /**
     * Get price fetching configuration
     */
    getConfig: async (): Promise<{
        success: boolean;
        config?: PriceFetchingConfig;
        error?: string;
    }> => {
        return await ipcRenderer.invoke(IPC_CHANNELS.PRICE_GET_CONFIG);
    },

    /**
     * Update price fetching configuration
     */
    updateConfig: async (config: Partial<PriceFetchingConfig>): Promise<{
        success: boolean;
        error?: string;
    }> => {
        return await ipcRenderer.invoke(IPC_CHANNELS.PRICE_UPDATE_CONFIG, config);
    },

    /**
     * Clear cached prices
     */
    clearCache: async (): Promise<{
        success: boolean;
        error?: string;
    }> => {
        return await ipcRenderer.invoke(IPC_CHANNELS.PRICE_CLEAR_CACHE);
    },
};
