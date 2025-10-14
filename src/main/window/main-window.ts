/**
 * Main Window Management
 *
 * Handles creation and management of the main application window.
 */

import path from "node:path";
import { BrowserWindow } from "electron";
import { logger } from "../../shared/utils/logger";

// Declare global variables injected by Electron Forge
declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

let mainWindow: BrowserWindow | null = null;

/**
 * Create the main application window
 */
export function createMainWindow(): BrowserWindow {
    // Create the browser window with security settings
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        show: false, // Don't show until ready
        webPreferences: {
            preload: path.join(__dirname, "../preload/index.js"),
            nodeIntegration: true,
            nodeIntegrationInSubFrames: false,
            contextIsolation: true,
        },
        titleBarStyle: "default",
        frame: true,
        resizable: true,
        maximizable: true,
        minimizable: true,
        closable: true,
    });

    // Load the app

    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
        logger.info(
            {
                platform: process.platform,
                devServerUrl: MAIN_WINDOW_VITE_DEV_SERVER_URL,
            },
            "Loading from development server",
        );
        mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    } else {
        const filePath = path.join(
            __dirname,
            `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`,
        );
        logger.info(
            {
                platform: process.platform,
                filePath,
                viteName: MAIN_WINDOW_VITE_NAME,
                resourcesPath: process.resourcesPath,
            },
            "Loading from production file",
        );
        mainWindow.loadFile(filePath);
    }

    // Show window when ready to prevent visual flash
    mainWindow.once("ready-to-show", () => {
        if (mainWindow) {
            logger.info("Main window ready to show");
            mainWindow.show();
        }
    });

    // Handle load errors
    mainWindow.webContents.on(
        "did-fail-load",
        (_, errorCode, errorDescription, validatedURL) => {
            logger.error(
                {
                    errorCode,
                    errorDescription,
                    validatedURL,
                    platform: process.platform,
                },
                "Failed to load main window",
            );
        },
    );

    mainWindow.webContents.on("render-process-gone", (_, details) => {
        logger.error(
            {
                reason: details.reason,
                exitCode: details.exitCode,
            },
            "WebContents render process gone",
        );
    });

    // Handle window closed
    mainWindow.on("closed", () => {
        mainWindow = null;
    });

    return mainWindow;
}

/**
 * Get the main window instance
 */
export function getMainWindow(): BrowserWindow | null {
    return mainWindow;
}

/**
 * Focus the main window
 */
export function focusMainWindow(): void {
    if (mainWindow) {
        if (mainWindow.isMinimized()) {
            mainWindow.restore();
        }
        mainWindow.focus();
    }
}

/**
 * Check if main window exists
 */
export function hasMainWindow(): boolean {
    return mainWindow !== null;
}
