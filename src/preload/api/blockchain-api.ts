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
   * Get all mempool transaction IDs
   */
  getMempoolTxIds: () =>
    ipcRenderer.invoke(IPC_CHANNELS.BLOCKCHAIN_GET_MEMPOOL_TX_IDS),

  /**
   * Get comprehensive mempool transaction overview
   */
  getMempoolOverview: (params: { start_index?: number; number?: number }) =>
    ipcRenderer.invoke(IPC_CHANNELS.BLOCKCHAIN_GET_MEMPOOL_OVERVIEW, params),

  /**
   * Broadcast all mempool transactions
   */
  broadcastAllMempoolTxs: () =>
    ipcRenderer.invoke(IPC_CHANNELS.BLOCKCHAIN_BROADCAST_ALL_MEMPOOL_TXS),

  /**
   * Clear all transactions from mempool
   */
  clearMempool: () => ipcRenderer.invoke(IPC_CHANNELS.BLOCKCHAIN_CLEAR_MEMPOOL),

  /**
   * Get mempool transaction kernel by ID
   */
  getMempoolTxKernel: (params: { tx_kernel_id: string }) =>
    ipcRenderer.invoke(IPC_CHANNELS.BLOCKCHAIN_GET_MEMPOOL_TX_KERNEL, params),

  /**
   * Get sync status
   */
  getSyncStatus: () =>
    ipcRenderer.invoke(IPC_CHANNELS.BLOCKCHAIN_GET_SYNC_STATUS),

  /**
   * Get network information
   */
  getNetworkInfo: () =>
    ipcRenderer.invoke(IPC_CHANNELS.BLOCKCHAIN_GET_NETWORK_INFO),

  /**
   * Get peer information
   */
  getPeerInfo: () => ipcRenderer.invoke(IPC_CHANNELS.BLOCKCHAIN_GET_PEER_INFO),

  /**
   * Get total balance
   */
  getBalance: () => ipcRenderer.invoke(IPC_CHANNELS.BLOCKCHAIN_GET_BALANCE),

  /**
   * Get block difficulties
   */
  getBlockDifficulties: (params: {
    block_selector: string;
    max_num_blocks: number;
  }) =>
    ipcRenderer.invoke(IPC_CHANNELS.BLOCKCHAIN_GET_BLOCK_DIFFICULTIES, params),

  /**
   * Get block intervals
   */
  getBlockIntervals: (params: {
    block_selector: string;
    max_num_blocks: number;
  }) => ipcRenderer.invoke(IPC_CHANNELS.BLOCKCHAIN_GET_BLOCK_INTERVALS, params),

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
   * Get best mining proposal
   */
  getBestProposal: () =>
    ipcRenderer.invoke(IPC_CHANNELS.BLOCKCHAIN_GET_BEST_PROPOSAL),

  /**
   * Mine blocks to wallet
   */
  mineBlocksToWallet: (params: { n_blocks: number }) =>
    ipcRenderer.invoke(IPC_CHANNELS.BLOCKCHAIN_MINE_BLOCKS_TO_WALLET, params),

  /**
   * Provide proof-of-work solution
   */
  providePowSolution: (params: { pow: unknown; proposal_id: unknown }) =>
    ipcRenderer.invoke(IPC_CHANNELS.BLOCKCHAIN_PROVIDE_POW_SOLUTION, params),

  /**
   * Provide new block tip
   */
  provideNewTip: (params: { pow: unknown; block_proposal: unknown }) =>
    ipcRenderer.invoke(IPC_CHANNELS.BLOCKCHAIN_PROVIDE_NEW_TIP, params),

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

  /**
   * Get peer info using CLI (for autopolling)
   */
  getPeerInfoCli: () => ipcRenderer.invoke(IPC_CHANNELS.CLI_GET_PEER_INFO),
};
