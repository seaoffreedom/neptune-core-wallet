/**
 * Price Fetching IPC Handlers
 *
 * Handles IPC communication for price fetching functionality.
 * Provides secure access to price data and configuration from the renderer process.
 */

import { ipcMain } from 'electron';
import pino from 'pino';
import { IPC_CHANNELS } from '../../../shared/constants/ipc-channels';
import { getPriceFetcherService } from '../../services/price-fetcher.service';
import type { PriceFetchingConfig, CachedPriceData } from '../../../shared/types/price-types';

const logger = pino({ level: 'info' });

/**
 * Handle get current prices request
 */
export async function handleGetCurrentPrices(
    _event: Electron.IpcMainInvokeEvent,
): Promise<{
    success: boolean;
    prices?: CachedPriceData;
    error?: string;
}> {
    try {
        const priceService = getPriceFetcherService();
        
        if (!priceService.isEnabled()) {
            return {
                success: false,
                error: 'Price fetching is disabled',
            };
        }

        const prices = await priceService.getPrices();
        
        if (!prices) {
            return {
                success: false,
                error: 'Failed to fetch prices',
            };
        }

        return {
            success: true,
            prices,
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error({ error: errorMessage }, 'Failed to get current prices');
        return {
            success: false,
            error: errorMessage,
        };
    }
}

/**
 * Handle refresh prices request
 */
export async function handleRefreshPrices(
    _event: Electron.IpcMainInvokeEvent,
): Promise<{
    success: boolean;
    prices?: CachedPriceData;
    error?: string;
}> {
    try {
        const priceService = getPriceFetcherService();
        
        if (!priceService.isEnabled()) {
            return {
                success: false,
                error: 'Price fetching is disabled',
            };
        }

        const prices = await priceService.refreshPrices();
        
        if (!prices) {
            return {
                success: false,
                error: 'Failed to refresh prices',
            };
        }

        return {
            success: true,
            prices,
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error({ error: errorMessage }, 'Failed to refresh prices');
        return {
            success: false,
            error: errorMessage,
        };
    }
}

/**
 * Handle get price configuration request
 */
export function handleGetPriceConfig(
    _event: Electron.IpcMainInvokeEvent,
): {
    success: boolean;
    config?: PriceFetchingConfig;
    error?: string;
} {
    try {
        const priceService = getPriceFetcherService();
        const config = priceService.getConfig();
        
        return {
            success: true,
            config,
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error({ error: errorMessage }, 'Failed to get price configuration');
        return {
            success: false,
            error: errorMessage,
        };
    }
}

/**
 * Handle update price configuration request
 */
export function handleUpdatePriceConfig(
    _event: Electron.IpcMainInvokeEvent,
    config: Partial<PriceFetchingConfig>,
): {
    success: boolean;
    error?: string;
} {
    try {
        const priceService = getPriceFetcherService();
        priceService.updateConfig(config);
        
        logger.info({ config }, 'Price configuration updated');
        
        return {
            success: true,
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error({ error: errorMessage }, 'Failed to update price configuration');
        return {
            success: false,
            error: errorMessage,
        };
    }
}

/**
 * Handle clear price cache request
 */
export function handleClearPriceCache(
    _event: Electron.IpcMainInvokeEvent,
): {
    success: boolean;
    error?: string;
} {
    try {
        const priceService = getPriceFetcherService();
        priceService.clearCache();
        
        logger.info('Price cache cleared');
        
        return {
            success: true,
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error({ error: errorMessage }, 'Failed to clear price cache');
        return {
            success: false,
            error: errorMessage,
        };
    }
}

/**
 * Register all price fetching IPC handlers
 */
export function registerPriceHandlers(): void {
    logger.info('Registering price fetching IPC handlers...');

    ipcMain.handle(IPC_CHANNELS.PRICE_GET_CURRENT, handleGetCurrentPrices);
    ipcMain.handle(IPC_CHANNELS.PRICE_REFRESH, handleRefreshPrices);
    ipcMain.handle(IPC_CHANNELS.PRICE_GET_CONFIG, handleGetPriceConfig);
    ipcMain.handle(IPC_CHANNELS.PRICE_UPDATE_CONFIG, handleUpdatePriceConfig);
    ipcMain.handle(IPC_CHANNELS.PRICE_CLEAR_CACHE, handleClearPriceCache);

    logger.info('Price fetching IPC handlers registered successfully');
}

/**
 * Unregister all price fetching IPC handlers
 */
export function unregisterPriceHandlers(): void {
    logger.info('Unregistering price fetching IPC handlers...');

    ipcMain.removeHandler(IPC_CHANNELS.PRICE_GET_CURRENT);
    ipcMain.removeHandler(IPC_CHANNELS.PRICE_REFRESH);
    ipcMain.removeHandler(IPC_CHANNELS.PRICE_GET_CONFIG);
    ipcMain.removeHandler(IPC_CHANNELS.PRICE_UPDATE_CONFIG);
    ipcMain.removeHandler(IPC_CHANNELS.PRICE_CLEAR_CACHE);

    logger.info('Price fetching IPC handlers unregistered successfully');
}
