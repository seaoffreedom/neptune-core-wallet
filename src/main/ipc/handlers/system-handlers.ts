/**
 * System Resource IPC Handlers
 *
 * Handles system resource monitoring IPC communication between main and renderer processes.
 */

import { ipcMain } from "electron";
import pino from "pino";
import { IPC_CHANNELS } from "../../../shared/constants/ipc-channels";
import { systemResourceService } from "../../services/system-resource.service";

// Logger
const logger = pino({ level: "info" });

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
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
        logger.error(
            { error: errorMessage },
            "Error getting system resource stats",
        );
        return {
            success: false,
            error: errorMessage,
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
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
        logger.error(
            { error: errorMessage },
            "Error getting combined resource stats",
        );
        return {
            success: false,
            error: errorMessage,
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
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
        logger.error({ error: errorMessage }, "Error getting process stats");
        return {
            success: false,
            error: errorMessage,
        };
    }
}

/**
 * Handle get total system RAM request
 */
export async function handleGetTotalSystemRAM(): Promise<{
    success: boolean;
    totalRAM?: number;
    error?: string;
}> {
    try {
        const totalRAM = systemResourceService.getTotalSystemRAM();

        return {
            success: true,
            totalRAM,
        };
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
        logger.error({ error: errorMessage }, "Error getting total system RAM");
        return {
            success: false,
            error: errorMessage,
        };
    }
}

/**
 * Handle check if system has sufficient RAM for mining
 */
export async function handleHasSufficientRAMForMining(): Promise<{
    success: boolean;
    hasSufficientRAM?: boolean;
    totalRAM?: number;
    minRAMRequired?: number;
    error?: string;
}> {
    try {
        const hasSufficientRAM =
            systemResourceService.hasSufficientRAMForMining();
        const totalRAM = systemResourceService.getTotalSystemRAM();
        const minRAMRequired = 64 * 1024 * 1024 * 1024; // 64GB in bytes

        return {
            success: true,
            hasSufficientRAM,
            totalRAM,
            minRAMRequired,
        };
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
        logger.error({ error: errorMessage }, "Error checking RAM for mining");
        return {
            success: false,
            error: errorMessage,
        };
    }
}

/**
 * Register system resource handlers
 */
export function registerSystemHandlers(): void {
    logger.info("Registering system resource handlers");

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

    // Add RAM checking handlers
    ipcMain.handle(IPC_CHANNELS.SYSTEM_GET_TOTAL_RAM, handleGetTotalSystemRAM);

    ipcMain.handle(
        IPC_CHANNELS.SYSTEM_HAS_SUFFICIENT_RAM_FOR_MINING,
        handleHasSufficientRAMForMining,
    );

    logger.info("System resource handlers registered");
}

/**
 * Unregister system resource handlers
 */
export function unregisterSystemHandlers(): void {
    logger.info("Unregistering system resource handlers");

    ipcMain.removeHandler(IPC_CHANNELS.SYSTEM_GET_RESOURCE_STATS);
    ipcMain.removeHandler(IPC_CHANNELS.SYSTEM_GET_COMBINED_STATS);
    ipcMain.removeHandler(IPC_CHANNELS.SYSTEM_GET_PROCESS_STATS);

    logger.info("System resource handlers unregistered");
}
