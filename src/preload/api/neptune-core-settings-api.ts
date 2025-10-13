/**
 * Neptune Core Settings Preload API
 *
 * Exposes neptune-core settings operations to the renderer process
 */

import { ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '@/shared/constants/ipc-channels';
import type {
  AdvancedSettings,
  DataSettings,
  MiningSettings,
  NeptuneCoreSettings,
  NetworkSettings,
  PerformanceSettings,
  SecuritySettings,
  PriceFetchingSettings,
} from '@/shared/types/neptune-core-settings';

export const neptuneCoreSettingsAPI = {
  /**
   * Get all settings
   */
  getAll: (): Promise<{
    success: boolean;
    settings?: NeptuneCoreSettings;
    error?: string;
  }> => {
    return ipcRenderer.invoke(IPC_CHANNELS.NEPTUNE_SETTINGS_GET_ALL);
  },

  /**
   * Update all settings
   */
  updateAll: (
    settings: NeptuneCoreSettings
  ): Promise<{
    success: boolean;
    settings?: NeptuneCoreSettings;
    error?: string;
  }> => {
    return ipcRenderer.invoke(IPC_CHANNELS.NEPTUNE_SETTINGS_UPDATE, settings);
  },

  /**
   * Update network settings
   */
  updateNetwork: (
    settings: Partial<NetworkSettings>
  ): Promise<{
    success: boolean;
    settings?: NeptuneCoreSettings;
    error?: string;
  }> => {
    return ipcRenderer.invoke(
      IPC_CHANNELS.NEPTUNE_SETTINGS_UPDATE_NETWORK,
      settings
    );
  },

  /**
   * Update mining settings
   */
  updateMining: (
    settings: Partial<MiningSettings>
  ): Promise<{
    success: boolean;
    settings?: NeptuneCoreSettings;
    error?: string;
  }> => {
    return ipcRenderer.invoke(
      IPC_CHANNELS.NEPTUNE_SETTINGS_UPDATE_MINING,
      settings
    );
  },

  /**
   * Update performance settings
   */
  updatePerformance: (
    settings: Partial<PerformanceSettings>
  ): Promise<{
    success: boolean;
    settings?: NeptuneCoreSettings;
    error?: string;
  }> => {
    return ipcRenderer.invoke(
      IPC_CHANNELS.NEPTUNE_SETTINGS_UPDATE_PERFORMANCE,
      settings
    );
  },

  /**
   * Update security settings
   */
  updateSecurity: (
    settings: Partial<SecuritySettings>
  ): Promise<{
    success: boolean;
    settings?: NeptuneCoreSettings;
    error?: string;
  }> => {
    return ipcRenderer.invoke(
      IPC_CHANNELS.NEPTUNE_SETTINGS_UPDATE_SECURITY,
      settings
    );
  },

  /**
   * Update data settings
   */
  updateData: (
    settings: Partial<DataSettings>
  ): Promise<{
    success: boolean;
    settings?: NeptuneCoreSettings;
    error?: string;
  }> => {
    return ipcRenderer.invoke(
      IPC_CHANNELS.NEPTUNE_SETTINGS_UPDATE_DATA,
      settings
    );
  },

  /**
   * Update advanced settings
   */
  updateAdvanced: (
    settings: Partial<AdvancedSettings>
  ): Promise<{
    success: boolean;
    settings?: NeptuneCoreSettings;
    error?: string;
  }> => {
    return ipcRenderer.invoke(
      IPC_CHANNELS.NEPTUNE_SETTINGS_UPDATE_ADVANCED,
      settings
    );
  },

  /**
   * Update price fetching settings
   */
  updatePriceFetching: (
    settings: Partial<PriceFetchingSettings>
  ): Promise<{
    success: boolean;
    settings?: NeptuneCoreSettings;
    error?: string;
  }> => {
    return ipcRenderer.invoke(
      IPC_CHANNELS.NEPTUNE_SETTINGS_UPDATE_PRICE_FETCHING,
      settings
    );
  },

  /**
   * Reset all settings to defaults
   */
  resetToDefaults: (): Promise<{
    success: boolean;
    settings?: NeptuneCoreSettings;
    error?: string;
  }> => {
    return ipcRenderer.invoke(IPC_CHANNELS.NEPTUNE_SETTINGS_RESET_TO_DEFAULTS);
  },

  /**
   * Export settings as JSON
   */
  export: (): Promise<{
    success: boolean;
    json?: string;
    error?: string;
  }> => {
    return ipcRenderer.invoke(IPC_CHANNELS.NEPTUNE_SETTINGS_EXPORT);
  },

  /**
   * Import settings from JSON
   */
  import: (
    jsonString: string
  ): Promise<{
    success: boolean;
    settings?: NeptuneCoreSettings;
    error?: string;
  }> => {
    return ipcRenderer.invoke(IPC_CHANNELS.NEPTUNE_SETTINGS_IMPORT, jsonString);
  },
};
