/**
 * Main Window Management
 *
 * Handles creation and management of the main application window.
 */

import path from "node:path";
import { BrowserWindow } from "electron";
import { getCSPPolicy, SECURITY_HEADERS } from "../security/csp";

// Declare global variables injected by Electron Forge
declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;

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
            nodeIntegration: false, // Security: disable node integration
            contextIsolation: true, // Security: enable context isolation
            webSecurity: true, // Security: enable web security
            allowRunningInsecureContent: false, // Security: disable insecure content
            experimentalFeatures: false, // Security: disable experimental features
        },
        titleBarStyle: "default",
        frame: true,
        resizable: true,
        maximizable: true,
        minimizable: true,
        closable: true,
    });

    // Load the app
    // Check if we're in development or production
    const isDevelopment =
        process.env.NODE_ENV === "development" ||
        process.env.ELECTRON_IS_DEV === "1" ||
        !process.resourcesPath;

    if (isDevelopment && MAIN_WINDOW_VITE_DEV_SERVER_URL) {
        // Development mode: use dev server
        console.log(
            "Development mode - loading from dev server:",
            MAIN_WINDOW_VITE_DEV_SERVER_URL,
        );
        mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    } else {
        // Production mode: load from bundled files
        const rendererPath = path.join(
            __dirname,
            "../renderer/main_window/index.html",
        );

        console.log("Production mode - loading from file:", rendererPath);
        console.log("__dirname:", __dirname);
        console.log("process.resourcesPath:", process.resourcesPath);

        try {
            mainWindow.loadFile(rendererPath);
        } catch (error) {
            console.error("Failed to load bundled file:", error);
            // Fallback to dev server if available
            if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
                console.log(
                    "Falling back to dev server:",
                    MAIN_WINDOW_VITE_DEV_SERVER_URL,
                );
                mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
            } else {
                throw error;
            }
        }
    }

    // Show window when ready to prevent visual flash
    mainWindow.once("ready-to-show", () => {
        if (mainWindow) {
            mainWindow.show();

            // Open DevTools in development
            if (process.env.NODE_ENV === "development") {
                mainWindow.webContents.openDevTools();
            }
        }
    });

    // Handle window closed
    mainWindow.on("closed", () => {
        mainWindow = null;
    });

    // Security: Prevent new window creation
    mainWindow.webContents.setWindowOpenHandler(() => {
        return { action: "deny" };
    });

    // Security: Add enhanced CSP and security headers
    mainWindow.webContents.session.webRequest.onHeadersReceived(
        (details, callback) => {
            const cspPolicy = getCSPPolicy();

            callback({
                responseHeaders: {
                    ...details.responseHeaders,
                    "Content-Security-Policy": [cspPolicy],
                    ...Object.fromEntries(
                        Object.entries(SECURITY_HEADERS).map(([key, value]) => [
                            key,
                            [value],
                        ]),
                    ),
                },
            });
        },
    );

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
