/**
 * Settings API - Exposed to Renderer
 *
 * Exposes settings-related functionality to the renderer process through the context bridge.
 */

import { ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../../shared/constants/ipc-channels';
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
} from '../../shared/types/ipc-channels';

export const settingsAPI = {
  /**
   * Get setting value
   */
  getSetting: async <T = any>(
    key: string
  ): Promise<{
    success: boolean;
    value?: T;
    error?: string;
  }> => {
    const request: SettingsGetRequest = { key };
    const response: SettingsGetResponse<T> = await ipcRenderer.invoke(
      IPC_CHANNELS.SETTINGS_GET,
      request
    );
    return {
      success: response.success,
      value: response.value,
      error: response.error,
    };
  },

  /**
   * Set setting value
   */
  setSetting: async <T = any>(
    key: string,
    value: T
  ): Promise<{
    success: boolean;
    error?: string;
  }> => {
    const request: SettingsSetRequest<T> = { key, value };
    const response: SettingsSetResponse = await ipcRenderer.invoke(
      IPC_CHANNELS.SETTINGS_SET,
      request
    );
    return {
      success: response.success,
      error: response.error,
    };
  },

  /**
   * Reset setting to default
   */
  resetSetting: async (
    key?: string
  ): Promise<{
    success: boolean;
    error?: string;
  }> => {
    const request: SettingsResetRequest = { key };
    const response: SettingsResetResponse = await ipcRenderer.invoke(
      IPC_CHANNELS.SETTINGS_RESET,
      request
    );
    return {
      success: response.success,
      error: response.error,
    };
  },

  /**
   * Export settings to file
   */
  exportSettings: async (
    path?: string
  ): Promise<{
    success: boolean;
    path?: string;
    error?: string;
  }> => {
    const request: SettingsExportRequest = { path };
    const response: SettingsExportResponse = await ipcRenderer.invoke(
      IPC_CHANNELS.SETTINGS_EXPORT,
      request
    );
    return {
      success: response.success,
      path: response.path,
      error: response.error,
    };
  },

  /**
   * Import settings from file
   */
  importSettings: async (
    path: string
  ): Promise<{
    success: boolean;
    error?: string;
  }> => {
    const request: SettingsImportRequest = { path };
    const response: SettingsImportResponse = await ipcRenderer.invoke(
      IPC_CHANNELS.SETTINGS_IMPORT,
      request
    );
    return {
      success: response.success,
      error: response.error,
    };
  },
};
