/**
 * IPC Setup and Registration
 *
 * Centralized IPC handler registration and management.
 */

import {
    registerAddressBookHandlers,
    unregisterAddressBookHandlers,
} from "./handlers/address-book-handlers";
import {
    registerAppHandlers,
    unregisterAppHandlers,
} from "./handlers/app-handlers";
import {
    registerBlockchainHandlers,
    unregisterBlockchainHandlers,
} from "./handlers/blockchain-handlers";
import {
    registerFileHandlers,
    unregisterFileHandlers,
} from "./handlers/file-handlers";
import {
    cleanupNeptuneCoreSettingsHandlers,
    registerNeptuneCoreSettingsHandlers,
} from "./handlers/neptune-core-settings-handlers";
import {
    registerNeptuneHandlers,
    unregisterNeptuneHandlers,
} from "./handlers/neptune-handlers";
import { registerPeerHandlers } from "./handlers/peer-handlers";
import {
    cleanupProcesses,
    registerProcessHandlers,
    unregisterProcessHandlers,
} from "./handlers/process-handlers";
import {
    registerSettingsHandlers,
    unregisterSettingsHandlers,
} from "./handlers/settings-handlers";
import {
    registerWalletHandlers,
    unregisterWalletHandlers,
} from "./handlers/wallet-handlers";
import {
    registerWindowHandlers,
    unregisterWindowHandlers,
} from "./handlers/window-handlers";
import {
    registerSystemHandlers,
    unregisterSystemHandlers,
} from "./handlers/system-handlers";
import { createLazyHandler } from "./lazy-handlers";

/**
 * Register all IPC handlers
 */
export function registerAllHandlers() {
    console.log("Registering IPC handlers...");

    // Core handlers - always needed
    registerAppHandlers();
    registerWindowHandlers();
    registerFileHandlers();
    registerSettingsHandlers();

    // Lazy load heavy handlers only when needed
    registerLazyHandlers();

    console.log("Core IPC handlers registered successfully");
}

/**
 * Register handlers that are only needed when specific features are used
 */
function registerLazyHandlers() {
    // Register lazy handlers that will load heavy modules on-demand
    const { ipcMain } = require("electron");

    // Lazy blockchain handler
    ipcMain.handle(
        "lazy:blockchain",
        createLazyHandler("lazy:blockchain", "blockchain", async () => ({
            success: true,
            message: "Blockchain handlers loaded",
        })),
    );

    // Lazy process handler
    ipcMain.handle(
        "lazy:process",
        createLazyHandler("lazy:process", "process", async () => ({
            success: true,
            message: "Process handlers loaded",
        })),
    );

    // Lazy neptune handler
    ipcMain.handle(
        "lazy:neptune",
        createLazyHandler("lazy:neptune", "neptune", async () => ({
            success: true,
            message: "Neptune handlers loaded",
        })),
    );

    console.log("Lazy handler triggers registered");
}

/**
 * Unregister all IPC handlers
 */
export function unregisterAllHandlers() {
    console.log("Unregistering IPC handlers...");

    unregisterAppHandlers();
    unregisterWindowHandlers();
    unregisterFileHandlers();
    unregisterSettingsHandlers();
    // Lazy handlers will be cleaned up automatically
    // unregisterProcessHandlers();
    // unregisterWalletHandlers();
    // unregisterNeptuneHandlers();
    // unregisterBlockchainHandlers();
    // unregisterAddressBookHandlers();
    // cleanupNeptuneCoreSettingsHandlers();
    // unregisterSystemHandlers();

    console.log("All IPC handlers unregistered successfully");
}

/**
 * Cleanup resources
 */
export async function cleanup() {
    console.log("Cleaning up IPC resources...");
    cleanupProcesses();

    // Shutdown Neptune processes
    const { neptuneProcessManager } = await import(
        "../services/neptune-process-manager"
    );
    await neptuneProcessManager.shutdown();

    console.log("IPC cleanup completed");
}
