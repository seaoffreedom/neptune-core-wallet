/**
 * IPC Setup and Registration
 *
 * Centralized IPC handler registration and management.
 */

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
// Worker handlers temporarily disabled
// import {
//     registerWorkerHandlers,
//     unregisterWorkerHandlers,
// } from "./handlers/worker-handlers";
import {
    registerNeptuneHandlers,
    unregisterNeptuneHandlers,
} from "./handlers/neptune-handlers";
import {
    registerAddressBookHandlers,
    unregisterAddressBookHandlers,
} from "./handlers/address-book-handlers";
import {
    registerNeptuneCoreSettingsHandlers,
    cleanupNeptuneCoreSettingsHandlers,
} from "./handlers/neptune-core-settings-handlers";

/**
 * Register all IPC handlers
 */
export function registerAllHandlers() {
    console.log("Registering IPC handlers...");

    registerAppHandlers();
    registerWindowHandlers();
    registerFileHandlers();
    registerSettingsHandlers();
    registerProcessHandlers();
    registerWalletHandlers();
    // registerWorkerHandlers(); // Temporarily disabled due to path issues
    registerNeptuneHandlers();
    registerBlockchainHandlers();
    registerAddressBookHandlers();
    registerNeptuneCoreSettingsHandlers();

    console.log("All IPC handlers registered successfully");
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
    unregisterProcessHandlers();
    unregisterWalletHandlers();
    // unregisterWorkerHandlers(); // Temporarily disabled due to path issues
    unregisterNeptuneHandlers();
    unregisterBlockchainHandlers();
    unregisterAddressBookHandlers();
    cleanupNeptuneCoreSettingsHandlers();

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
