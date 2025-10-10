/**
 * Application Constants
 *
 * Centralized constants used throughout the application.
 */

export const APP_CONSTANTS = {
  // App information
  APP_NAME: 'Neptune Core Wallet',
  APP_VERSION: '1.0.0',

  // File paths
  SETTINGS_FILE: 'settings.json',
  WALLETS_DIR: 'wallets',
  LOGS_DIR: 'logs',

  // Default settings
  DEFAULT_SETTINGS: {
    theme: 'dark',
    language: 'en',
    autoSave: true,
    notifications: true,
    minimizeToTray: false,
    startMinimized: false,
  },

  // File filters
  FILE_FILTERS: {
    WALLET: [
      { name: 'Wallet Files', extensions: ['wallet', 'json'] },
      { name: 'All Files', extensions: ['*'] },
    ],
    SETTINGS: [
      { name: 'Settings Files', extensions: ['json'] },
      { name: 'All Files', extensions: ['*'] },
    ],
    ALL: [{ name: 'All Files', extensions: ['*'] }],
  },

  // Process management
  MAX_PROCESS_TIMEOUT: 30000, // 30 seconds
  PROCESS_CHECK_INTERVAL: 1000, // 1 second

  // Security
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,

  // UI
  SIDEBAR_WIDTH: 320,
  ICON_SIDEBAR_WIDTH: 64,
  HEADER_HEIGHT: 64,
  FOOTER_HEIGHT: 64,
} as const;
