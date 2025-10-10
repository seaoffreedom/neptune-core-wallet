/**
 * Preload Script Entry Point
 *
 * This script runs in the renderer process before the web page is loaded.
 * It exposes secure APIs to the renderer process through the context bridge.
 */

import { contextBridge } from "electron";
import type { ElectronAPI } from "../shared/types/api-types";
import {
    addressBookAPI,
    appAPI,
    blockchainAPI,
    fileAPI,
    neptuneAPI,
    neptuneCoreSettingsAPI,
    processAPI,
    settingsAPI,
    walletAPI,
    windowAPI,
    // workerAPI, // Temporarily disabled
} from "./api";

// Expose the Electron API to the renderer process
const electronAPI: ElectronAPI = {
    // App lifecycle
    quit: appAPI.quit,
    restart: appAPI.restart,
    getVersion: appAPI.getVersion,

    // Window management
    minimize: windowAPI.minimize,
    maximize: windowAPI.maximize,
    close: windowAPI.close,
    isMaximized: windowAPI.isMaximized,
    setTitle: windowAPI.setTitle,

    // File operations
    openDialog: fileAPI.openDialog,
    saveDialog: fileAPI.saveDialog,
    readFile: fileAPI.readFile,
    writeFile: fileAPI.writeFile,
    fileExists: fileAPI.fileExists,
    deleteFile: fileAPI.deleteFile,

    // Settings management
    getSetting: settingsAPI.getSetting,
    setSetting: settingsAPI.setSetting,
    resetSetting: settingsAPI.resetSetting,
    exportSettings: settingsAPI.exportSettings,
    importSettings: settingsAPI.importSettings,

    // Process management
    spawnProcess: processAPI.spawnProcess,
    killProcess: processAPI.killProcess,
    getProcessStatus: processAPI.getProcessStatus,

    // Wallet operations
    createWallet: walletAPI.createWallet,
    loadWallet: walletAPI.loadWallet,
    saveWallet: walletAPI.saveWallet,
    encryptWallet: walletAPI.encryptWallet,
    decryptWallet: walletAPI.decryptWallet,

    // Worker operations (temporarily disabled)
    // executeWorker: workerAPI.executeWorker,
    // getWorkerStatus: workerAPI.getWorkerStatus,
    // terminateAllWorkers: workerAPI.terminateAllWorkers,
    // executeMockTask: workerAPI.executeMockTask,

    // Neptune process management
    initializeNeptune: neptuneAPI.initialize,
    getNeptuneStatus: neptuneAPI.getStatus,
    shutdownNeptune: neptuneAPI.shutdown,
    restartNeptune: neptuneAPI.restart,
    getNeptuneCookie: neptuneAPI.getCookie,
    getNeptuneWalletData: neptuneAPI.getWalletData,

    // Blockchain data fetching - expose as nested object
    blockchain: blockchainAPI,

    // Address book management - expose as nested object
    addressBook: addressBookAPI,

    // Neptune Core settings management - expose as nested object
    neptuneCoreSettings: neptuneCoreSettingsAPI,

    // System integration (placeholder implementations)
    showNotification: async (
        title: string,
        options?: {
            body?: string;
            icon?: string;
            silent?: boolean;
        },
    ) => {
        // This would be implemented with proper notification handlers
        console.log("Notification:", title, options);
        return { success: true };
    },

    getPlatform: async () => {
        return {
            platform: process.platform,
            arch: process.arch,
        };
    },

    getPath: async (
        name:
            | "home"
            | "appData"
            | "userData"
            | "temp"
            | "exe"
            | "module"
            | "desktop"
            | "documents"
            | "downloads"
            | "music"
            | "pictures"
            | "videos",
    ) => {
        // This would be implemented with proper path handlers
        const { app } = await import("electron");
        try {
            const path = app.getPath(name);
            return { success: true, path };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    },
};

// Expose the API to the renderer process
contextBridge.exposeInMainWorld("electronAPI", electronAPI);

// Log that the preload script has loaded
console.log("Preload script loaded successfully");
