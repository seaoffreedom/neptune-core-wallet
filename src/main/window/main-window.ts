/**
 * Main Window Management
 *
 * Handles creation and management of the main application window.
 */

import path from 'node:path';
import { BrowserWindow } from 'electron';

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
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    show: false, // Don't show until ready
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      nodeIntegration: true,
      nodeIntegrationInSubFrames: false,
      contextIsolation: true,
    },
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'hidden',
    trafficLightPosition:
      process.platform === 'darwin' ? { x: 5, y: 5 } : undefined,
    frame: true,
    resizable: true,
    maximizable: true,
    minimizable: true,
    closable: true,
  });

  // Load the app
  // Check if we're in development or production
  const _isDevelopment =
    process.env.NODE_ENV === 'development' ||
    process.env.ELECTRON_IS_DEV === '1' ||
    !process.resourcesPath;

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    if (mainWindow) {
      mainWindow.show();
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
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
