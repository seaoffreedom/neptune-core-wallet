/**
 * Neptune Process Management IPC Handlers
 *
 * Handles IPC communication for neptune-core and neptune-cli process management.
 */

import { ipcMain } from "electron";
import { IPC_CHANNELS } from "../../../shared/constants/ipc-channels";
import { neptuneProcessManager } from "../../services/neptune-process-manager";

/**
 * Register IPC handlers for Neptune process management.
 */
export function registerNeptuneHandlers(): void {
    ipcMain.handle(
        IPC_CHANNELS.NEPTUNE_INITIALIZE || "neptune:initialize",
        handleInitialize,
    );

    ipcMain.handle(
        IPC_CHANNELS.NEPTUNE_STATUS || "neptune:status",
        handleGetStatus,
    );

    ipcMain.handle(
        IPC_CHANNELS.NEPTUNE_SHUTDOWN || "neptune:shutdown",
        handleShutdown,
    );

    ipcMain.handle(
        IPC_CHANNELS.NEPTUNE_RESTART || "neptune:restart",
        handleRestart,
    );

    ipcMain.handle(
        IPC_CHANNELS.NEPTUNE_GET_COOKIE || "neptune:get-cookie",
        handleGetCookie,
    );

    ipcMain.handle(
        IPC_CHANNELS.NEPTUNE_WALLET_DATA || "neptune:wallet-data",
        handleGetWalletData,
    );
}

/**
 * Handle Neptune initialization request.
 */
export async function handleInitialize(
    _event: Electron.IpcMainInvokeEvent,
): Promise<{
    success: boolean;
    error?: string;
}> {
    try {
        await neptuneProcessManager.initialize();
        return { success: true };
    } catch (error) {
        console.error("Neptune initialization failed:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Handle get Neptune status request.
 */
export function handleGetStatus(_event: Electron.IpcMainInvokeEvent): {
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
} {
    try {
        const status = neptuneProcessManager.getStatus();
        return {
            success: true,
            status,
        };
    } catch (error) {
        console.error("Failed to get Neptune status:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Handle Neptune shutdown request.
 */
export async function handleShutdown(
    _event: Electron.IpcMainInvokeEvent,
): Promise<{
    success: boolean;
    error?: string;
}> {
    try {
        await neptuneProcessManager.shutdown();
        return { success: true };
    } catch (error) {
        console.error("Neptune shutdown failed:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Handle Neptune restart request.
 */
export async function handleRestart(
    _event: Electron.IpcMainInvokeEvent,
): Promise<{
    success: boolean;
    error?: string;
}> {
    try {
        await neptuneProcessManager.shutdown();
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds
        await neptuneProcessManager.initialize();
        return { success: true };
    } catch (error) {
        console.error("Neptune restart failed:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Handle get cookie request.
 */
export async function handleGetCookie(
    _event: Electron.IpcMainInvokeEvent,
): Promise<{
    success: boolean;
    cookie?: string;
    error?: string;
}> {
    try {
        const cookie = neptuneProcessManager.getCookie();
        if (!cookie) {
            return {
                success: false,
                error: "Cookie not available yet",
            };
        }
        return {
            success: true,
            cookie,
        };
    } catch (error) {
        console.error("Failed to get cookie:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Handle get wallet data request.
 */
export async function handleGetWalletData(
    _event: Electron.IpcMainInvokeEvent,
): Promise<{
    success: boolean;
    data?: {
        balance: string;
        status: Record<string, unknown>;
        lastUpdated: number;
    };
    error?: string;
}> {
    try {
        // This would typically get the wallet data from the process manager
        // For now, we'll return placeholder data
        return {
            success: true,
            data: {
                balance: "0.00000000",
                status: { connected: true },
                lastUpdated: Date.now(),
            },
        };
    } catch (error) {
        console.error("Failed to get wallet data:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Unregister IPC handlers for Neptune process management.
 */
export function unregisterNeptuneHandlers(): void {
    ipcMain.removeHandler(
        IPC_CHANNELS.NEPTUNE_INITIALIZE || "neptune:initialize",
    );
    ipcMain.removeHandler(IPC_CHANNELS.NEPTUNE_STATUS || "neptune:status");
    ipcMain.removeHandler(IPC_CHANNELS.NEPTUNE_SHUTDOWN || "neptune:shutdown");
    ipcMain.removeHandler(IPC_CHANNELS.NEPTUNE_RESTART || "neptune:restart");
    ipcMain.removeHandler(
        IPC_CHANNELS.NEPTUNE_GET_COOKIE || "neptune:get-cookie",
    );
    ipcMain.removeHandler(
        IPC_CHANNELS.NEPTUNE_WALLET_DATA || "neptune:wallet-data",
    );
}
