/**
 * Settings Management IPC Handlers
 *
 * Handles settings-related IPC communication between main and renderer processes.
 */

import path from 'node:path';
import { app, ipcMain } from 'electron';
import fs from 'fs-extra';
import pino from 'pino';
import { APP_CONSTANTS } from '../../../shared/constants/app-constants';
import { IPC_CHANNELS } from '../../../shared/constants/ipc-channels';
import {
  readJsonWithRetry,
  writeJsonWithRetry,
} from '../../utils/async-file-operations';

// Logger
const logger = pino({ level: 'info' });

import type {
  SettingsExportRequest,
  SettingsExportResponse,
  SettingsGetRequest,
  SettingsGetResponse,
  SettingsImportRequest,
  SettingsImportResponse,
  SettingsResetRequest,
  SettingsResetResponse,
  SettingsSetRequest,
  SettingsSetResponse,
} from '../../../shared/types/ipc-channels';

// In-memory settings cache
let settingsCache: Record<string, unknown> = {};
let settingsLoaded = false;

/**
 * Get settings file path
 */
function getSettingsPath(): string {
  return path.join(app.getPath('userData'), APP_CONSTANTS.SETTINGS_FILE);
}

/**
 * Load settings from file
 */
async function loadSettings(): Promise<void> {
  try {
    const settingsPath = getSettingsPath();
    const data = await readJsonWithRetry(settingsPath, {
      retries: 2,
      timeout: 3000,
    });
    settingsCache = {
      ...APP_CONSTANTS.DEFAULT_SETTINGS,
      ...data,
    };
    settingsLoaded = true;
  } catch (_error) {
    // If file doesn't exist or is invalid, use defaults
    settingsCache = { ...APP_CONSTANTS.DEFAULT_SETTINGS };
    settingsLoaded = true;
    await saveSettings();
  }
}

/**
 * Save settings to file
 */
async function saveSettings(): Promise<void> {
  try {
    const settingsPath = getSettingsPath();
    await writeJsonWithRetry(settingsPath, settingsCache, {
      spaces: 2,
      retries: 2,
      timeout: 3000,
    });
  } catch (error) {
    logger.error({ error: (error as Error).message }, 'Error saving settings');
    throw error;
  }
}

/**
 * Handle get setting request
 */
export async function handleSettingsGet<T = unknown>(
  _event: Electron.IpcMainInvokeEvent,
  request: SettingsGetRequest
): Promise<SettingsGetResponse<T>> {
  try {
    if (!settingsLoaded) {
      await loadSettings();
    }

    const value = settingsCache[request.key];
    return {
      success: true,
      value,
    };
  } catch (error) {
    logger.error({ error: (error as Error).message }, 'Error getting setting');
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Handle set setting request
 */
export async function handleSettingsSet<T = unknown>(
  _event: Electron.IpcMainInvokeEvent,
  request: SettingsSetRequest<T>
): Promise<SettingsSetResponse> {
  try {
    if (!settingsLoaded) {
      await loadSettings();
    }

    settingsCache[request.key] = request.value;
    await saveSettings();

    return {
      success: true,
    };
  } catch (error) {
    logger.error({ error: (error as Error).message }, 'Error setting setting');
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Handle reset setting request
 */
export async function handleSettingsReset(
  _event: Electron.IpcMainInvokeEvent,
  request: SettingsResetRequest
): Promise<SettingsResetResponse> {
  try {
    if (!settingsLoaded) {
      await loadSettings();
    }

    if (request.key) {
      // Reset specific setting to default
      if (request.key in APP_CONSTANTS.DEFAULT_SETTINGS) {
        settingsCache[request.key] =
          APP_CONSTANTS.DEFAULT_SETTINGS[
            request.key as keyof typeof APP_CONSTANTS.DEFAULT_SETTINGS
          ];
      } else {
        delete settingsCache[request.key];
      }
    } else {
      // Reset all settings to defaults
      settingsCache = { ...APP_CONSTANTS.DEFAULT_SETTINGS };
    }

    await saveSettings();

    return {
      success: true,
    };
  } catch (error) {
    logger.error(
      { error: (error as Error).message },
      'Error resetting settings'
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Handle export settings request
 */
export async function handleSettingsExport(
  _event: Electron.IpcMainInvokeEvent,
  request: SettingsExportRequest
): Promise<SettingsExportResponse> {
  try {
    if (!settingsLoaded) {
      await loadSettings();
    }

    const exportPath =
      request.path ||
      path.join(app.getPath('desktop'), `neptune-settings-${Date.now()}.json`);
    await fs.writeFile(
      exportPath,
      JSON.stringify(settingsCache, null, 2),
      'utf8'
    );

    return {
      success: true,
      path: exportPath,
    };
  } catch (error) {
    logger.error(
      { error: (error as Error).message },
      'Error exporting settings'
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Handle import settings request
 */
export async function handleSettingsImport(
  _event: Electron.IpcMainInvokeEvent,
  request: SettingsImportRequest
): Promise<SettingsImportResponse> {
  try {
    const data = await fs.readFile(request.path, 'utf8');
    const importedSettings = JSON.parse(data);

    // Merge with current settings (imported settings take precedence)
    settingsCache = { ...settingsCache, ...importedSettings };
    await saveSettings();

    return {
      success: true,
    };
  } catch (error) {
    logger.error(
      { error: (error as Error).message },
      'Error importing settings'
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Register settings IPC handlers
 */
export function registerSettingsHandlers() {
  ipcMain.handle(IPC_CHANNELS.SETTINGS_GET, handleSettingsGet);
  ipcMain.handle(IPC_CHANNELS.SETTINGS_SET, handleSettingsSet);
  ipcMain.handle(IPC_CHANNELS.SETTINGS_RESET, handleSettingsReset);
  ipcMain.handle(IPC_CHANNELS.SETTINGS_EXPORT, handleSettingsExport);
  ipcMain.handle(IPC_CHANNELS.SETTINGS_IMPORT, handleSettingsImport);
}

/**
 * Unregister settings IPC handlers
 */
export function unregisterSettingsHandlers() {
  ipcMain.removeHandler(IPC_CHANNELS.SETTINGS_GET);
  ipcMain.removeHandler(IPC_CHANNELS.SETTINGS_SET);
  ipcMain.removeHandler(IPC_CHANNELS.SETTINGS_RESET);
  ipcMain.removeHandler(IPC_CHANNELS.SETTINGS_EXPORT);
  ipcMain.removeHandler(IPC_CHANNELS.SETTINGS_IMPORT);
}
