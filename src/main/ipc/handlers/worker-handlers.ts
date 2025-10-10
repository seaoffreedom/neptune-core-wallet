/**
 * Worker IPC Handlers
 *
 * Handles IPC communication for worker thread operations
 */

import { ipcMain } from "electron";
import { workerManagerService } from "@/main/services/worker-manager.service";
import { IPC_CHANNELS } from "@/shared/constants/ipc-channels";

/**
 * Register worker-related IPC handlers
 */
export function registerWorkerHandlers(): void {
    // Execute crypto hash operation
    ipcMain.handle(
        IPC_CHANNELS.WORKER_CRYPTO_HASH,
        async (_event, data: { input: string; algorithm?: string }) => {
            try {
                const result =
                    await workerManagerService.executeCryptoOperation(
                        "hash",
                        data,
                    );
                return { success: true, result };
            } catch (error) {
                return {
                    success: false,
                    error: (error as Error).message,
                };
            }
        },
    );

    // Execute crypto random operation
    ipcMain.handle(
        IPC_CHANNELS.WORKER_CRYPTO_RANDOM,
        async (_event, data: { length: number }) => {
            try {
                const result =
                    await workerManagerService.executeCryptoOperation(
                        "random",
                        data,
                    );
                return { success: true, result };
            } catch (error) {
                return {
                    success: false,
                    error: (error as Error).message,
                };
            }
        },
    );

    // Execute crypto validation operation
    ipcMain.handle(
        IPC_CHANNELS.WORKER_CRYPTO_VALIDATE,
        async (_event, data: { input: string; pattern: string }) => {
            try {
                const result =
                    await workerManagerService.executeCryptoOperation(
                        "validate",
                        data,
                    );
                return { success: true, result };
            } catch (error) {
                return {
                    success: false,
                    error: (error as Error).message,
                };
            }
        },
    );

    // Get worker statistics
    ipcMain.handle(IPC_CHANNELS.WORKER_GET_STATS, async () => {
        try {
            const stats = workerManagerService.getStats();
            return { success: true, stats };
        } catch (error) {
            return {
                success: false,
                error: (error as Error).message,
            };
        }
    });

    // Terminate all workers
    ipcMain.handle(IPC_CHANNELS.WORKER_TERMINATE_ALL, async () => {
        try {
            await workerManagerService.terminateAll();
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: (error as Error).message,
            };
        }
    });
}

/**
 * Remove worker IPC handlers
 */
export function removeWorkerHandlers(): void {
    ipcMain.removeHandler(IPC_CHANNELS.WORKER_CRYPTO_HASH);
    ipcMain.removeHandler(IPC_CHANNELS.WORKER_CRYPTO_RANDOM);
    ipcMain.removeHandler(IPC_CHANNELS.WORKER_CRYPTO_VALIDATE);
    ipcMain.removeHandler(IPC_CHANNELS.WORKER_GET_STATS);
    ipcMain.removeHandler(IPC_CHANNELS.WORKER_TERMINATE_ALL);
}
