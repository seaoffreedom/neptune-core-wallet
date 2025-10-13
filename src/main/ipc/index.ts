/**
 * IPC Setup and Registration
 *
 * Centralized IPC handler registration and management.
 */

import pino from "pino";
import {
    registerAddressBookHandlers,
    unregisterAddressBookHandlers,
} from "./handlers/address-book-handlers";

const logger = pino({ level: "info" });

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
    registerPriceHandlers,
    unregisterPriceHandlers,
} from "./handlers/price-handlers";
// Worker handlers temporarily disabled
// import {
//     registerWorkerHandlers,
//     unregisterWorkerHandlers,
// } from "./handlers/worker-handlers";
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
    registerSystemHandlers,
    unregisterSystemHandlers,
} from "./handlers/system-handlers";
import {
    registerWalletHandlers,
    unregisterWalletHandlers,
} from "./handlers/wallet-handlers";
import {
    registerWindowHandlers,
    unregisterWindowHandlers,
} from "./handlers/window-handlers";

/**
 * Register all IPC handlers
 */
export function registerAllHandlers() {
    logger.info("Registering IPC handlers...");

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
    registerPeerHandlers();
    registerPriceHandlers();
    registerSystemHandlers();

    logger.info("All IPC handlers registered successfully");
}

/**
 * Unregister all IPC handlers
 */
export function unregisterAllHandlers() {
    logger.info("Unregistering IPC handlers...");

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
    unregisterPriceHandlers();
    unregisterSystemHandlers();

    logger.info("All IPC handlers unregistered successfully");
}

/**
 * Cleanup resources
 */
export async function cleanup() {
    logger.info("Cleaning up IPC resources...");
    cleanupProcesses();

    // Shutdown Neptune processes
    const { neptuneProcessManager } = await import(
        "../services/neptune-process-manager"
    );
    await neptuneProcessManager.shutdown();

    logger.info("IPC cleanup completed");
}
