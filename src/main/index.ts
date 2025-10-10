/**
 * Main Process Entry Point
 *
 * This is the main process entry point for the Electron application.
 * It handles app lifecycle, window creation, and IPC setup.
 */

import { app, BrowserWindow } from "electron";
import started from "electron-squirrel-startup";
import { cleanup, registerAllHandlers, unregisterAllHandlers } from "./ipc";
import { settingsInitializerService } from "./services/settings-initializer.service";
import { systemResourceService } from "./services/system-resource.service";
import {
    createMainWindow,
    focusMainWindow,
    getMainWindow,
    hasMainWindow,
} from "./window/main-window";

// Handle creating/removing shortcuts on Windows when installing/uninstalling
if (started) {
    app.quit();
}

/**
 * Create the main window when the app is ready
 */
function createWindow() {
    createMainWindow();
}

/**
 * Handle app ready event
 */
app.whenReady().then(async () => {
    // Create the main window first for faster perceived startup
    createWindow();

    // Register core IPC handlers (lightweight)
    registerAllHandlers();

    // Defer heavy initialization operations
    setTimeout(async () => {
        try {
            // Initialize settings on first run (deferred)
            await settingsInitializerService.initializeSettings();

            // Initialize peer service (deferred)
            const { peerService } = await import("./services/peer.service");
            console.log("Peer service initialized with default peers");
        } catch (error) {
            console.error("Error during deferred initialization:", error);
        }
    }, 100); // Small delay to let UI render first

    // Handle app activation (macOS)
    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        } else {
            focusMainWindow();
        }
    });
});

/**
 * Handle all windows closed
 */
app.on("window-all-closed", () => {
    // On macOS, keep the app running even when all windows are closed
    if (process.platform !== "darwin") {
        app.quit();
    }
});

/**
 * Handle app before quit
 */
app.on("before-quit", async (event) => {
    // Prevent default quit to allow async cleanup
    event.preventDefault();

    console.log("App shutting down, cleaning up resources...");

    // Cleanup resources
    await cleanup();

    // Now actually quit
    app.exit(0);
});

/**
 * Handle app will quit
 */
app.on("will-quit", () => {
    // Unregister IPC handlers
    unregisterAllHandlers();
});

/**
 * Security: Prevent new window creation
 */
app.on("web-contents-created", (_event, contents) => {
    contents.setWindowOpenHandler(() => {
        // Prevent opening new windows
        return { action: "deny" };
    });
});

/**
 * Security: Prevent navigation to external URLs
 */
app.on("web-contents-created", (_event, contents) => {
    contents.on("will-navigate", (event, navigationUrl) => {
        const parsedUrl = new URL(navigationUrl);

        // Allow navigation to localhost in development
        if (
            process.env.NODE_ENV === "development" &&
            parsedUrl.origin === "http://localhost:5173"
        ) {
            return;
        }

        // Prevent navigation to external URLs
        if (parsedUrl.origin !== "file://") {
            event.preventDefault();
        }
    });
});

// Export for potential use in other modules
export { getMainWindow, hasMainWindow };
