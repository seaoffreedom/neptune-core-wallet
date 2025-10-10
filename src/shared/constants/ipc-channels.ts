/**
 * IPC Channel Constants
 *
 * Centralized definition of all IPC channel names used throughout the application.
 * This ensures type safety and prevents channel name conflicts.
 */

export const IPC_CHANNELS = {
  // App lifecycle
  APP_QUIT: 'app:quit',
  APP_RESTART: 'app:restart',
  APP_GET_VERSION: 'app:get-version',

  // Window management
  WINDOW_MINIMIZE: 'window:minimize',
  WINDOW_MAXIMIZE: 'window:maximize',
  WINDOW_CLOSE: 'window:close',
  WINDOW_IS_MAXIMIZED: 'window:is-maximized',
  WINDOW_SET_TITLE: 'window:set-title',

  // File operations
  FILE_OPEN_DIALOG: 'file:open-dialog',
  FILE_SAVE_DIALOG: 'file:save-dialog',
  FILE_READ: 'file:read',
  FILE_WRITE: 'file:write',
  FILE_EXISTS: 'file:exists',
  FILE_DELETE: 'file:delete',

  // Settings management
  SETTINGS_GET: 'settings:get',
  SETTINGS_SET: 'settings:set',
  SETTINGS_RESET: 'settings:reset',
  SETTINGS_EXPORT: 'settings:export',
  SETTINGS_IMPORT: 'settings:import',

  // Process management
  PROCESS_SPAWN: 'process:spawn',
  PROCESS_KILL: 'process:kill',
  PROCESS_GET_STATUS: 'process:get-status',

  // Wallet operations
  WALLET_CREATE: 'wallet:create',
  WALLET_LOAD: 'wallet:load',
  WALLET_SAVE: 'wallet:save',
  WALLET_ENCRYPT: 'wallet:encrypt',
  WALLET_DECRYPT: 'wallet:decrypt',

  // System integration
  SYSTEM_SHOW_NOTIFICATION: 'system:show-notification',
  SYSTEM_GET_PLATFORM: 'system:get-platform',
  SYSTEM_GET_PATH: 'system:get-path',

  // Worker management (temporarily disabled)
  // WORKER_EXECUTE: 'worker:execute',
  // WORKER_STATUS: 'worker:status',
  // WORKER_TERMINATE_ALL: 'worker:terminate-all',

  // Neptune process management
  NEPTUNE_INITIALIZE: 'neptune:initialize',
  NEPTUNE_STATUS: 'neptune:status',
  NEPTUNE_SHUTDOWN: 'neptune:shutdown',
  NEPTUNE_RESTART: 'neptune:restart',
  NEPTUNE_GET_COOKIE: 'neptune:get-cookie',
  NEPTUNE_WALLET_DATA: 'neptune:wallet-data',

  // Blockchain data fetching (HTTP JSON-RPC) - Tier 1: Critical
  BLOCKCHAIN_SET_COOKIE: 'blockchain:set-cookie',
  BLOCKCHAIN_GET_DASHBOARD: 'blockchain:get-dashboard',
  BLOCKCHAIN_GET_BLOCK_HEIGHT: 'blockchain:get-block-height',
  BLOCKCHAIN_GET_NETWORK: 'blockchain:get-network',
  BLOCKCHAIN_GET_BALANCE: 'blockchain:get-balance',
  BLOCKCHAIN_GET_WALLET_STATUS: 'blockchain:get-wallet-status',
  BLOCKCHAIN_GET_NEXT_ADDRESS: 'blockchain:get-next-address',
  BLOCKCHAIN_GET_HISTORY: 'blockchain:get-history',
  BLOCKCHAIN_GET_CONFIRMATIONS: 'blockchain:get-confirmations',
  BLOCKCHAIN_LIST_OWN_COINS: 'blockchain:list-own-coins',
  BLOCKCHAIN_SEND: 'blockchain:send',
  BLOCKCHAIN_SEND_TRANSPARENT: 'blockchain:send-transparent',
  BLOCKCHAIN_GET_MEMPOOL_TX_COUNT: 'blockchain:get-mempool-tx-count',
  BLOCKCHAIN_GET_MEMPOOL_SIZE: 'blockchain:get-mempool-size',
  BLOCKCHAIN_GET_PEER_INFO: 'blockchain:get-peer-info',

  // Blockchain - Tier 2: Important
  BLOCKCHAIN_LIST_UTXOS: 'blockchain:list-utxos',
  BLOCKCHAIN_GET_SPENDABLE_INPUTS: 'blockchain:get-spendable-inputs',
  BLOCKCHAIN_SELECT_SPENDABLE_INPUTS: 'blockchain:select-spendable-inputs',
  BLOCKCHAIN_GET_MEMPOOL_OVERVIEW: 'blockchain:get-mempool-overview',
  BLOCKCHAIN_GET_MEMPOOL_TX_IDS: 'blockchain:get-mempool-tx-ids',
  BLOCKCHAIN_VALIDATE_ADDRESS: 'blockchain:validate-address',
  BLOCKCHAIN_VALIDATE_AMOUNT: 'blockchain:validate-amount',
  BLOCKCHAIN_GET_NTH_ADDRESS: 'blockchain:get-nth-address',
  BLOCKCHAIN_GET_BLOCK_DIGEST: 'blockchain:get-block-digest',
  BLOCKCHAIN_GET_LATEST_TIP_DIGESTS: 'blockchain:get-latest-tip-digests',
  BLOCKCHAIN_GET_INSTANCE_ID: 'blockchain:get-instance-id',
  BLOCKCHAIN_SHUTDOWN: 'blockchain:shutdown',
  BLOCKCHAIN_GET_NUM_EXPECTED_UTXOS: 'blockchain:get-num-expected-utxos',
  BLOCKCHAIN_UPGRADE_TRANSACTION: 'blockchain:upgrade-transaction',
  BLOCKCHAIN_CLAIM_UTXO: 'blockchain:claim-utxo',

  // Blockchain - Tier 3: Advanced
  BLOCKCHAIN_PAUSE_MINER: 'blockchain:pause-miner',
  BLOCKCHAIN_RESTART_MINER: 'blockchain:restart-miner',
  BLOCKCHAIN_GET_CPU_TEMP: 'blockchain:get-cpu-temp',
  BLOCKCHAIN_GENERATE_WALLET: 'blockchain:generate-wallet',
  BLOCKCHAIN_EXPORT_SEED: 'blockchain:export-seed',
  BLOCKCHAIN_IMPORT_SEED: 'blockchain:import-seed',
  BLOCKCHAIN_WHICH_WALLET: 'blockchain:which-wallet',

  // Address Book
  ADDRESS_BOOK_GET_ALL: 'address-book:get-all',
  ADDRESS_BOOK_GET_BY_ID: 'address-book:get-by-id',
  ADDRESS_BOOK_CREATE: 'address-book:create',
  ADDRESS_BOOK_UPDATE: 'address-book:update',
  ADDRESS_BOOK_DELETE: 'address-book:delete',
  ADDRESS_BOOK_SEARCH: 'address-book:search',
  ADDRESS_BOOK_EXPORT: 'address-book:export',
  ADDRESS_BOOK_IMPORT: 'address-book:import',
  ADDRESS_BOOK_CLEAR_ALL: 'address-book:clear-all',

  // Neptune Core Settings
  NEPTUNE_SETTINGS_GET_ALL: 'neptune-settings:get-all',
  NEPTUNE_SETTINGS_UPDATE: 'neptune-settings:update',
  NEPTUNE_SETTINGS_UPDATE_NETWORK: 'neptune-settings:update-network',
  NEPTUNE_SETTINGS_UPDATE_MINING: 'neptune-settings:update-mining',
  NEPTUNE_SETTINGS_UPDATE_PERFORMANCE: 'neptune-settings:update-performance',
  NEPTUNE_SETTINGS_UPDATE_SECURITY: 'neptune-settings:update-security',
  NEPTUNE_SETTINGS_UPDATE_DATA: 'neptune-settings:update-data',
  NEPTUNE_SETTINGS_UPDATE_ADVANCED: 'neptune-settings:update-advanced',
  NEPTUNE_SETTINGS_RESET_TO_DEFAULTS: 'neptune-settings:reset-to-defaults',
  NEPTUNE_SETTINGS_EXPORT: 'neptune-settings:export',
  NEPTUNE_SETTINGS_IMPORT: 'neptune-settings:import',
} as const;

export type IpcChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS];
