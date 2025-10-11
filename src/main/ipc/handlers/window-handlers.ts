/**
 * Window Management IPC Handlers
 *
 * Handles window-related IPC communication between main and renderer processes.
 */

import { BrowserWindow, ipcMain } from 'electron';
import pino from 'pino';
import { IPC_CHANNELS } from '../../../shared/constants/ipc-channels';

// Logger
const logger = pino({ level: 'info' });
import type {
  WindowMaximizedResponse,
  WindowTitleRequest,
} from '../../../shared/types/ipc-channels';

/**
 * Handle window minimize request
 */
export function handleWindowMinimize(event: Electron.IpcMainInvokeEvent) {
  try {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window) {
      window.minimize();
      return { success: true };
    }
    return { success: false, error: 'Window not found' };
  } catch (error) {
    logger.error(
      { error: (error as Error).message },
      'Error minimizing window'
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Handle window maximize request
 */
export function handleWindowMaximize(event: Electron.IpcMainInvokeEvent) {
  try {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window) {
      if (window.isMaximized()) {
        window.unmaximize();
      } else {
        window.maximize();
      }
      return { success: true };
    }
    return { success: false, error: 'Window not found' };
  } catch (error) {
    logger.error(
      { error: (error as Error).message },
      'Error maximizing window'
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Handle window close request
 */
export function handleWindowClose(event: Electron.IpcMainInvokeEvent) {
  try {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window) {
      window.close();
      return { success: true };
    }
    return { success: false, error: 'Window not found' };
  } catch (error) {
    logger.error({ error: (error as Error).message }, 'Error closing window');
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Handle check if window is maximized
 */
export function handleWindowIsMaximized(
  event: Electron.IpcMainInvokeEvent
): WindowMaximizedResponse {
  try {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window) {
      return { isMaximized: window.isMaximized() };
    }
    throw new Error('Window not found');
  } catch (error) {
    logger.error(
      { error: (error as Error).message },
      'Error checking window maximized state'
    );
    throw new Error(error instanceof Error ? error.message : 'Unknown error');
  }
}

/**
 * Handle set window title request
 */
export function handleWindowSetTitle(
  event: Electron.IpcMainInvokeEvent,
  request: WindowTitleRequest
) {
  try {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window) {
      window.setTitle(request.title);
      return { success: true };
    }
    return { success: false, error: 'Window not found' };
  } catch (error) {
    logger.error(
      { error: (error as Error).message },
      'Error setting window title'
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Register window IPC handlers
 */
export function registerWindowHandlers() {
  ipcMain.handle(IPC_CHANNELS.WINDOW_MINIMIZE, handleWindowMinimize);
  ipcMain.handle(IPC_CHANNELS.WINDOW_MAXIMIZE, handleWindowMaximize);
  ipcMain.handle(IPC_CHANNELS.WINDOW_CLOSE, handleWindowClose);
  ipcMain.handle(IPC_CHANNELS.WINDOW_IS_MAXIMIZED, handleWindowIsMaximized);
  ipcMain.handle(IPC_CHANNELS.WINDOW_SET_TITLE, handleWindowSetTitle);
}

/**
 * Unregister window IPC handlers
 */
export function unregisterWindowHandlers() {
  ipcMain.removeHandler(IPC_CHANNELS.WINDOW_MINIMIZE);
  ipcMain.removeHandler(IPC_CHANNELS.WINDOW_MAXIMIZE);
  ipcMain.removeHandler(IPC_CHANNELS.WINDOW_CLOSE);
  ipcMain.removeHandler(IPC_CHANNELS.WINDOW_IS_MAXIMIZED);
  ipcMain.removeHandler(IPC_CHANNELS.WINDOW_SET_TITLE);
}
