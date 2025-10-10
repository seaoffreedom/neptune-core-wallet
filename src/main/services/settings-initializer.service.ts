/**
 * Settings Initializer Service
 *
 * Ensures default settings are saved on first run or when no settings exist
 */

import pino from 'pino';
import { neptuneCoreSettingsService } from './neptune-core-settings.service';

const logger = pino({ level: 'info' });

/**
 * Settings Initializer Service
 */
export class SettingsInitializerService {
  private initialized = false;

  /**
   * Initialize settings on first run
   * This should be called early in the app startup sequence
   */
  async initializeSettings(): Promise<void> {
    if (this.initialized) {
      logger.info('Settings already initialized, skipping');
      return;
    }

    try {
      logger.info('Checking if settings exist...');

      // Try to get existing settings
      const existingSettings = neptuneCoreSettingsService.getAll();

      // Check if settings exist and are valid
      // If any required category is missing, re-initialize
      const hasValidSettings =
        existingSettings?.network &&
        existingSettings?.mining &&
        existingSettings?.performance &&
        existingSettings?.security &&
        existingSettings?.data &&
        existingSettings?.advanced;

      if (!hasValidSettings) {
        logger.info('No valid settings found, initializing with defaults...');
        neptuneCoreSettingsService.resetToDefaults();
        logger.info(
          { storePath: neptuneCoreSettingsService.getStorePath() },
          '✅ Default settings initialized successfully'
        );
      } else {
        logger.info('✅ Existing settings found and valid');
      }

      this.initialized = true;
    } catch (error) {
      logger.error({ error }, 'Failed to initialize settings');
      // Try to reset to defaults as fallback
      try {
        logger.warn('Attempting to reset to defaults as fallback...');
        neptuneCoreSettingsService.resetToDefaults();
        logger.info('✅ Fallback initialization successful');
        this.initialized = true;
      } catch (fallbackError) {
        logger.error(
          { error: fallbackError },
          'Failed to initialize settings even with fallback'
        );
        throw new Error(
          `Settings initialization failed: ${(error as Error).message}`
        );
      }
    }
  }

  /**
   * Check if settings have been initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Force re-initialization (useful for testing or recovery)
   */
  async forceReinitialize(): Promise<void> {
    this.initialized = false;
    await this.initializeSettings();
  }
}

// Export singleton instance
export const settingsInitializerService = new SettingsInitializerService();
