/**
 * Neptune Process Management API
 *
 * Exposes Neptune process management functions to the renderer process.
 */

import { ipcRenderer } from "electron";
import { IPC_CHANNELS } from "../../shared/constants/ipc-channels";

/**
 * Exposes Neptune process management functions to the renderer process.
 */
export const neptuneAPI = {
    /**
     * Initialize Neptune processes (core + CLI)
     */
    initialize: (): Promise<{
        success: boolean;
        error?: string;
    }> => ipcRenderer.invoke(IPC_CHANNELS.NEPTUNE_INITIALIZE),

    /**
     * Get Neptune process status
     */
    getStatus: (): Promise<{
        success: boolean;
        status?: {
            core: {
                running: boolean;
                pid?: number;
            };
            cli: {
                running: boolean;
                pid?: number;
            };
            initialized: boolean;
        };
        error?: string;
    }> => ipcRenderer.invoke(IPC_CHANNELS.NEPTUNE_STATUS),

    /**
     * Shutdown Neptune processes
     */
    shutdown: (): Promise<{
        success: boolean;
        error?: string;
    }> => ipcRenderer.invoke(IPC_CHANNELS.NEPTUNE_SHUTDOWN),

    /**
     * Restart Neptune processes
     */
    restart: (): Promise<{
        success: boolean;
        error?: string;
    }> => ipcRenderer.invoke(IPC_CHANNELS.NEPTUNE_RESTART),

    /**
     * Get authentication cookie
     */
    getCookie: (): Promise<{
        success: boolean;
        cookie?: string;
        error?: string;
    }> => ipcRenderer.invoke(IPC_CHANNELS.NEPTUNE_GET_COOKIE),

    /**
     * Get wallet data
     */
    getWalletData: (): Promise<{
        success: boolean;
        data?: {
            balance: string;
            status: Record<string, unknown>;
            lastUpdated: number;
        };
        error?: string;
    }> => ipcRenderer.invoke(IPC_CHANNELS.NEPTUNE_WALLET_DATA),
};
