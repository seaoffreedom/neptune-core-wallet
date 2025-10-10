/**
 * System Resource IPC Handlers
 *
 * Handles system resource monitoring IPC communication between main and renderer processes.
 */

import { ipcMain } from "electron";
import { IPC_CHANNELS } from "../../../shared/constants/ipc-channels";
import { systemResourceService } from "../../services/system-resource.service";

/**
 * Handle get system resource stats request
 */
export async function handleGetSystemResourceStats(): Promise<{
    success: boolean;
    stats?: {
        cpu: number;
        memory: number;
        timestamp: number;
    };
    error?: string;
}> {
    try {
        const stats = await systemResourceService.getSystemStats();

        if (!stats) {
            return {
                success: false,
                error: "Failed to get system resource stats",
            };
        }

        return {
            success: true,
            stats,
        };
    } catch (error) {
        console.error("Error getting system resource stats:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Handle get combined resource stats request
 */
export async function handleGetCombinedResourceStats(): Promise<{
    success: boolean;
    stats?: {
        system: {
            cpu: number;
            memory: number;
            timestamp: number;
        } | null;
        neptuneCore: {
            pid: number;
            cpu: number;
            memory: number;
            timestamp: number;
        } | null;
        neptuneCli: {
            pid: number;
            cpu: number;
            memory: number;
            timestamp: number;
        } | null;
        totalCpu: number;
        totalMemory: number;
    };
    error?: string;
}> {
    try {
        const stats = await systemResourceService.getCombinedStats();

        return {
            success: true,
            stats,
        };
    } catch (error) {
        console.error("Error getting combined resource stats:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Handle get process stats by PID request
 */
export async function handleGetProcessStats(pid: number): Promise<{
    success: boolean;
    stats?: {
        isRunning: boolean;
        stats?: {
            cpu: number;
            memory: number;
            elapsed: number;
        };
        error?: string;
    };
    error?: string;
}> {
    try {
        const stats = await systemResourceService.getProcessStats(pid);

        return {
            success: true,
            stats,
        };
    } catch (error) {
        console.error("Error getting process stats:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Register system resource handlers
 */
export function registerSystemHandlers(): void {
    console.log("Registering system resource handlers...");

    ipcMain.handle(
        IPC_CHANNELS.SYSTEM_GET_RESOURCE_STATS,
        handleGetSystemResourceStats,
    );

    ipcMain.handle(
        IPC_CHANNELS.SYSTEM_GET_COMBINED_STATS,
        handleGetCombinedResourceStats,
    );

    // Add process stats handler (similar to trident-wallet)
    ipcMain.handle(
        IPC_CHANNELS.SYSTEM_GET_PROCESS_STATS,
        async (_event, pid: number) => {
            return handleGetProcessStats(pid);
        },
    );

    console.log("✅ System resource handlers registered");
}

/**
 * Unregister system resource handlers
 */
export function unregisterSystemHandlers(): void {
    console.log("Unregistering system resource handlers...");

    ipcMain.removeHandler(IPC_CHANNELS.SYSTEM_GET_RESOURCE_STATS);
    ipcMain.removeHandler(IPC_CHANNELS.SYSTEM_GET_COMBINED_STATS);
    ipcMain.removeHandler(IPC_CHANNELS.SYSTEM_GET_PROCESS_STATS);

    console.log("✅ System resource handlers unregistered");
}
