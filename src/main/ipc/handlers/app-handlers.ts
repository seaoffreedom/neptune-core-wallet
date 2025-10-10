/**
 * App Lifecycle IPC Handlers
 *
 * Handles app-related IPC communication between main and renderer processes.
 */

import { app, ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../../shared/constants/ipc-channels';
import type {
  AppQuitRequest,
  AppVersionResponse,
} from '../../../shared/types/ipc-channels';

/**
 * Handle app quit request
 */
export function handleAppQuit(
  event: Electron.IpcMainInvokeEvent,
  request: AppQuitRequest
) {
  try {
    if (request.force) {
      app.exit(0);
    } else {
      app.quit();
    }
    return { success: true };
  } catch (error) {
    console.error('Error quitting app:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Handle app restart request
 */
export function handleAppRestart(event: Electron.IpcMainInvokeEvent) {
  try {
    app.relaunch();
    app.quit();
    return { success: true };
  } catch (error) {
    console.error('Error restarting app:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Handle get app version request
 */
export function handleGetVersion(
  event: Electron.IpcMainInvokeEvent
): AppVersionResponse {
  try {
    return {
      version: app.getVersion(),
      electronVersion: process.versions.electron,
      nodeVersion: process.versions.node,
    };
  } catch (error) {
    console.error('Error getting app version:', error);
    throw new Error(error instanceof Error ? error.message : 'Unknown error');
  }
}

/**
 * Register app IPC handlers
 */
export function registerAppHandlers() {
  ipcMain.handle(IPC_CHANNELS.APP_QUIT, handleAppQuit);
  ipcMain.handle(IPC_CHANNELS.APP_RESTART, handleAppRestart);
  ipcMain.handle(IPC_CHANNELS.APP_GET_VERSION, handleGetVersion);
}

/**
 * Unregister app IPC handlers
 */
export function unregisterAppHandlers() {
  ipcMain.removeHandler(IPC_CHANNELS.APP_QUIT);
  ipcMain.removeHandler(IPC_CHANNELS.APP_RESTART);
  ipcMain.removeHandler(IPC_CHANNELS.APP_GET_VERSION);
}
