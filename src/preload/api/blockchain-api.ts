/**
 * Blockchain Data Preload API
 *
 * Exposes blockchain data fetching functions to the renderer process
 */

import { ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '@/shared/constants/ipc-channels';

export const blockchainAPI = {
  /**
   * Set authentication cookie for RPC requests
   */
  setCookie: (cookie: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.BLOCKCHAIN_SET_COOKIE, cookie),

  /**
   * Get comprehensive dashboard overview data
   */
  getDashboardOverview: () =>
    ipcRenderer.invoke(IPC_CHANNELS.BLOCKCHAIN_GET_DASHBOARD),

  /**
   * Get current block height
   */
  getBlockHeight: () =>
    ipcRenderer.invoke(IPC_CHANNELS.BLOCKCHAIN_GET_BLOCK_HEIGHT),

  /**
   * Get network type
   */
  getNetwork: () => ipcRenderer.invoke(IPC_CHANNELS.BLOCKCHAIN_GET_NETWORK),

  /**
   * Get wallet balance (confirmed and unconfirmed)
   */
  getBalance: () => ipcRenderer.invoke(IPC_CHANNELS.BLOCKCHAIN_GET_BALANCE),

  /**
   * Get wallet status
   */
  getWalletStatus: () =>
    ipcRenderer.invoke(IPC_CHANNELS.BLOCKCHAIN_GET_WALLET_STATUS),

  /**
   * Get next receiving address
   */
  getNextReceivingAddress: () =>
    ipcRenderer.invoke(IPC_CHANNELS.BLOCKCHAIN_GET_NEXT_ADDRESS),

  /**
   * Get transaction history
   */
  getHistory: () => ipcRenderer.invoke(IPC_CHANNELS.BLOCKCHAIN_GET_HISTORY),

  // ========================================================================
  // Tier 1: Additional Critical Endpoints
  // ========================================================================

  /**
   * Get confirmations count
   */
  getConfirmations: () =>
    ipcRenderer.invoke(IPC_CHANNELS.BLOCKCHAIN_GET_CONFIRMATIONS),

  /**
   * List own coins/UTXOs
   */
  listOwnCoins: () =>
    ipcRenderer.invoke(IPC_CHANNELS.BLOCKCHAIN_LIST_OWN_COINS),

  /**
   * Send private transaction
   */
  send: (params: {
    outputs: Array<{ address: string; amount: string }>;
    change_policy?: string;
    fee?: string;
  }) => ipcRenderer.invoke(IPC_CHANNELS.BLOCKCHAIN_SEND, params),

  /**
   * Send transparent transaction
   */
  sendTransparent: (params: {
    outputs: Array<{ address: string; amount: string }>;
    change_policy?: string;
    fee?: string;
  }) => ipcRenderer.invoke(IPC_CHANNELS.BLOCKCHAIN_SEND_TRANSPARENT, params),

  /**
   * Get mempool transaction count
   */
  getMempoolTxCount: () =>
    ipcRenderer.invoke(IPC_CHANNELS.BLOCKCHAIN_GET_MEMPOOL_TX_COUNT),

  /**
   * Get mempool size in bytes
   */
  getMempoolSize: () =>
    ipcRenderer.invoke(IPC_CHANNELS.BLOCKCHAIN_GET_MEMPOOL_SIZE),

  /**
   * Get peer info
   */
  getPeerInfo: () => ipcRenderer.invoke(IPC_CHANNELS.BLOCKCHAIN_GET_PEER_INFO),

  // ========================================================================
  // Tier 2: Important Endpoints
  // ========================================================================

  /**
   * List all UTXOs
   */
  listUtxos: () => ipcRenderer.invoke(IPC_CHANNELS.BLOCKCHAIN_LIST_UTXOS),

  /**
   * Get all spendable inputs
   */
  getSpendableInputs: () =>
    ipcRenderer.invoke(IPC_CHANNELS.BLOCKCHAIN_GET_SPENDABLE_INPUTS),

  /**
   * Select spendable inputs for amount
   */
  selectSpendableInputs: (params: { amount: string }) =>
    ipcRenderer.invoke(IPC_CHANNELS.BLOCKCHAIN_SELECT_SPENDABLE_INPUTS, params),

  /**
   * Get mempool overview with pagination
   */
  getMempoolOverview: (params: { start_index: number; number: number }) =>
    ipcRenderer.invoke(IPC_CHANNELS.BLOCKCHAIN_GET_MEMPOOL_OVERVIEW, params),

  /**
   * Get all mempool transaction IDs
   */
  getMempoolTxIds: () =>
    ipcRenderer.invoke(IPC_CHANNELS.BLOCKCHAIN_GET_MEMPOOL_TX_IDS),

  /**
   * Validate Neptune address
   */
  validateAddress: (params: { address: string }) =>
    ipcRenderer.invoke(IPC_CHANNELS.BLOCKCHAIN_VALIDATE_ADDRESS, params),

  /**
   * Validate amount
   */
  validateAmount: (params: { amount: string }) =>
    ipcRenderer.invoke(IPC_CHANNELS.BLOCKCHAIN_VALIDATE_AMOUNT, params),

  /**
   * Get nth receiving address
   */
  getNthReceivingAddress: (params: { n: number }) =>
    ipcRenderer.invoke(IPC_CHANNELS.BLOCKCHAIN_GET_NTH_ADDRESS, params),

  /**
   * Get block digest by height
   */
  getBlockDigest: (params: { height: number }) =>
    ipcRenderer.invoke(IPC_CHANNELS.BLOCKCHAIN_GET_BLOCK_DIGEST, params),

  /**
   * Get latest N tip digests
   */
  getLatestTipDigests: (params: { n: number }) =>
    ipcRenderer.invoke(IPC_CHANNELS.BLOCKCHAIN_GET_LATEST_TIP_DIGESTS, params),

  /**
   * Get own instance ID
   */
  getInstanceId: () =>
    ipcRenderer.invoke(IPC_CHANNELS.BLOCKCHAIN_GET_INSTANCE_ID),

  /**
   * Shutdown neptune-core
   */
  shutdown: () => ipcRenderer.invoke(IPC_CHANNELS.BLOCKCHAIN_SHUTDOWN),

  /**
   * Get number of expected UTXOs
   */
  getNumExpectedUtxos: () =>
    ipcRenderer.invoke(IPC_CHANNELS.BLOCKCHAIN_GET_NUM_EXPECTED_UTXOS),

  /**
   * Upgrade transaction proof
   */
  upgradeTransaction: (params: { tx_kernel_id: string }) =>
    ipcRenderer.invoke(IPC_CHANNELS.BLOCKCHAIN_UPGRADE_TRANSACTION, params),

  /**
   * Claim off-chain UTXO
   */
  claimUtxo: (params: {
    utxo_transfer_encrypted: string;
    max_search_depth: number;
  }) => ipcRenderer.invoke(IPC_CHANNELS.BLOCKCHAIN_CLAIM_UTXO, params),

  // ========================================================================
  // Tier 3: Advanced Endpoints
  // ========================================================================

  /**
   * Pause miner
   */
  pauseMiner: () => ipcRenderer.invoke(IPC_CHANNELS.BLOCKCHAIN_PAUSE_MINER),

  /**
   * Restart miner
   */
  restartMiner: () => ipcRenderer.invoke(IPC_CHANNELS.BLOCKCHAIN_RESTART_MINER),

  /**
   * Get CPU temperature
   */
  getCpuTemp: () => ipcRenderer.invoke(IPC_CHANNELS.BLOCKCHAIN_GET_CPU_TEMP),

  /**
   * Generate new wallet
   */
  generateWallet: () =>
    ipcRenderer.invoke(IPC_CHANNELS.BLOCKCHAIN_GENERATE_WALLET),

  /**
   * Export seed phrase
   */
  exportSeedPhrase: () =>
    ipcRenderer.invoke(IPC_CHANNELS.BLOCKCHAIN_EXPORT_SEED),

  /**
   * Import seed phrase
   */
  importSeedPhrase: (params: { seed_phrase: string }) =>
    ipcRenderer.invoke(IPC_CHANNELS.BLOCKCHAIN_IMPORT_SEED, params),

  /**
   * Get wallet file path
   */
  whichWallet: () => ipcRenderer.invoke(IPC_CHANNELS.BLOCKCHAIN_WHICH_WALLET),
};
