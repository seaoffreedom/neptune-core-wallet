/**
 * Neptune Core Settings IPC Handlers
 *
 * Handles IPC communication for neptune-core settings CRUD operations
 */

import { ipcMain } from 'electron';
import pino from 'pino';
import { neptuneCoreSettingsService } from '@/main/services/neptune-core-settings.service';
import { IPC_CHANNELS } from '@/shared/constants/ipc-channels';

// Logger
const logger = pino({ level: 'info' });

import type {
  AdvancedSettings,
  DataSettings,
  MiningSettings,
  NeptuneCoreSettings,
  NetworkSettings,
  PerformanceSettings,
  PriceFetchingSettings,
  SecuritySettings,
} from '@/shared/types/neptune-core-settings';

/**
 * Register all neptune-core settings IPC handlers
 */
export function registerNeptuneCoreSettingsHandlers(): void {
  // Get all settings
  ipcMain.handle(IPC_CHANNELS.NEPTUNE_SETTINGS_GET_ALL, async () => {
    try {
      const settings = neptuneCoreSettingsService.getAll();
      return {
        success: true,
        settings,
      };
    } catch (error) {
      logger.error(
        { error: (error as Error).message },
        'Failed to get settings'
      );
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  });

  // Update all settings
  ipcMain.handle(
    IPC_CHANNELS.NEPTUNE_SETTINGS_UPDATE,
    async (_event, settings: NeptuneCoreSettings) => {
      try {
        const updated = neptuneCoreSettingsService.updateAll(settings);
        return {
          success: true,
          settings: updated,
        };
      } catch (error) {
        logger.error(
          { error: (error as Error).message },
          'Failed to update settings'
        );
        return {
          success: false,
          error: (error as Error).message,
        };
      }
    }
  );

  // Update network settings
  ipcMain.handle(
    IPC_CHANNELS.NEPTUNE_SETTINGS_UPDATE_NETWORK,
    async (_event, settings: Partial<NetworkSettings>) => {
      try {
        const updated = neptuneCoreSettingsService.updateNetwork(settings);
        return {
          success: true,
          settings: updated,
        };
      } catch (error) {
        logger.error(
          { error: (error as Error).message },
          'Failed to update network settings'
        );
        return {
          success: false,
          error: (error as Error).message,
        };
      }
    }
  );

  // Update mining settings
  ipcMain.handle(
    IPC_CHANNELS.NEPTUNE_SETTINGS_UPDATE_MINING,
    async (_event, settings: Partial<MiningSettings>) => {
      try {
        const updated = neptuneCoreSettingsService.updateMining(settings);
        return {
          success: true,
          settings: updated,
        };
      } catch (error) {
        logger.error(
          { error: (error as Error).message },
          'Failed to update mining settings'
        );
        return {
          success: false,
          error: (error as Error).message,
        };
      }
    }
  );

  // Update performance settings
  ipcMain.handle(
    IPC_CHANNELS.NEPTUNE_SETTINGS_UPDATE_PERFORMANCE,
    async (_event, settings: Partial<PerformanceSettings>) => {
      try {
        const updated = neptuneCoreSettingsService.updatePerformance(settings);
        return {
          success: true,
          settings: updated,
        };
      } catch (error) {
        logger.error(
          { error: (error as Error).message },
          'Failed to update performance settings'
        );
        return {
          success: false,
          error: (error as Error).message,
        };
      }
    }
  );

  // Update security settings
  ipcMain.handle(
    IPC_CHANNELS.NEPTUNE_SETTINGS_UPDATE_SECURITY,
    async (_event, settings: Partial<SecuritySettings>) => {
      try {
        const updated = neptuneCoreSettingsService.updateSecurity(settings);
        return {
          success: true,
          settings: updated,
        };
      } catch (error) {
        logger.error(
          { error: (error as Error).message },
          'Failed to update security settings'
        );
        return {
          success: false,
          error: (error as Error).message,
        };
      }
    }
  );

  // Update data settings
  ipcMain.handle(
    IPC_CHANNELS.NEPTUNE_SETTINGS_UPDATE_DATA,
    async (_event, settings: Partial<DataSettings>) => {
      try {
        const updated = neptuneCoreSettingsService.updateData(settings);
        return {
          success: true,
          settings: updated,
        };
      } catch (error) {
        logger.error(
          { error: (error as Error).message },
          'Failed to update data settings'
        );
        return {
          success: false,
          error: (error as Error).message,
        };
      }
    }
  );

  // Update advanced settings
  ipcMain.handle(
    IPC_CHANNELS.NEPTUNE_SETTINGS_UPDATE_ADVANCED,
    async (_event, settings: Partial<AdvancedSettings>) => {
      try {
        const updated = neptuneCoreSettingsService.updateAdvanced(settings);
        return {
          success: true,
          settings: updated,
        };
      } catch (error) {
        logger.error(
          { error: (error as Error).message },
          'Failed to update advanced settings'
        );
        return {
          success: false,
          error: (error as Error).message,
        };
      }
    }
  );

  // Update price fetching settings
  ipcMain.handle(
    IPC_CHANNELS.NEPTUNE_SETTINGS_UPDATE_PRICE_FETCHING,
    async (_event, settings: Partial<PriceFetchingSettings>) => {
      try {
        const updated =
          neptuneCoreSettingsService.updatePriceFetching(settings);
        return {
          success: true,
          settings: updated,
        };
      } catch (error) {
        logger.error(
          { error: (error as Error).message },
          'Failed to update price fetching settings'
        );
        return {
          success: false,
          error: (error as Error).message,
        };
      }
    }
  );

  // Reset to defaults
  ipcMain.handle(IPC_CHANNELS.NEPTUNE_SETTINGS_RESET_TO_DEFAULTS, async () => {
    try {
      const settings = neptuneCoreSettingsService.resetToDefaults();
      return {
        success: true,
        settings,
      };
    } catch (error) {
      logger.error(
        { error: (error as Error).message },
        'Failed to reset settings'
      );
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  });

  // Export settings
  ipcMain.handle(IPC_CHANNELS.NEPTUNE_SETTINGS_EXPORT, async () => {
    try {
      const json = neptuneCoreSettingsService.exportSettings();
      return {
        success: true,
        json,
      };
    } catch (error) {
      logger.error(
        { error: (error as Error).message },
        'Failed to export settings'
      );
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  });

  // Import settings
  ipcMain.handle(
    IPC_CHANNELS.NEPTUNE_SETTINGS_IMPORT,
    async (_event, jsonString: string) => {
      try {
        const settings = neptuneCoreSettingsService.importSettings(jsonString);
        return {
          success: true,
          settings,
        };
      } catch (error) {
        logger.error(
          { error: (error as Error).message },
          'Failed to import settings'
        );
        return {
          success: false,
          error: (error as Error).message,
        };
      }
    }
  );

  logger.info('Neptune Core settings IPC handlers registered');
}

/**
 * Cleanup neptune-core settings IPC handlers
 */
export function cleanupNeptuneCoreSettingsHandlers(): void {
  ipcMain.removeHandler(IPC_CHANNELS.NEPTUNE_SETTINGS_GET_ALL);
  ipcMain.removeHandler(IPC_CHANNELS.NEPTUNE_SETTINGS_UPDATE);
  ipcMain.removeHandler(IPC_CHANNELS.NEPTUNE_SETTINGS_UPDATE_NETWORK);
  ipcMain.removeHandler(IPC_CHANNELS.NEPTUNE_SETTINGS_UPDATE_MINING);
  ipcMain.removeHandler(IPC_CHANNELS.NEPTUNE_SETTINGS_UPDATE_PERFORMANCE);
  ipcMain.removeHandler(IPC_CHANNELS.NEPTUNE_SETTINGS_UPDATE_SECURITY);
  ipcMain.removeHandler(IPC_CHANNELS.NEPTUNE_SETTINGS_UPDATE_DATA);
  ipcMain.removeHandler(IPC_CHANNELS.NEPTUNE_SETTINGS_UPDATE_ADVANCED);
  ipcMain.removeHandler(IPC_CHANNELS.NEPTUNE_SETTINGS_UPDATE_PRICE_FETCHING);
  ipcMain.removeHandler(IPC_CHANNELS.NEPTUNE_SETTINGS_RESET_TO_DEFAULTS);
  ipcMain.removeHandler(IPC_CHANNELS.NEPTUNE_SETTINGS_EXPORT);
  ipcMain.removeHandler(IPC_CHANNELS.NEPTUNE_SETTINGS_IMPORT);

  logger.info('Neptune Core settings IPC handlers cleaned up');
}
