/**
 * Onchain Data Store
 *
 * Zustand store for managing blockchain/onchain data state
 * Handles all data fetched from Neptune CLI RPC endpoints
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============================================================================
// Types - Tier 1: Critical Endpoints
// ============================================================================

export interface DashboardOverviewData {
  confirmations: string;
  confirmed_available_balance: string;
  confirmed_total_balance: string;
  cpu_temp: number | null;
  max_num_peers: number;
  mempool_own_tx_count: number;
  mempool_size: number;
  mempool_total_tx_count: number;
  mining_status: string;
  peer_count: number;
  proving_capability: string;
  syncing: boolean;
  tip_digest: string;
  tip_header: {
    height: number;
    timestamp: number;
  };
  unconfirmed_available_balance: string;
  unconfirmed_total_balance: string;
}

export interface WalletStatus {
  status: string;
  lastUpdated: string;
}

export interface TransactionHistoryItem {
  digest: string;
  height: string; // Changed from block_height to match RPC response
  timestamp: string;
  amount: string;
}

export interface Coin {
  amount: string;
  confirmed: string | null;
  release_date: string | null;
}

export interface PeerInfo {
  address: string;
  connected: boolean;
  lastSeen: number;
}

// ============================================================================
// Types - Tier 2: Important Endpoints
// ============================================================================

export interface UTXO {
  amount: string;
  confirmed: string | null; // Timestamp in milliseconds
  release_date: string | null; // Timestamp in milliseconds for time-locked UTXOs
}

export interface SpendableInput {
  lock_script_and_witness: Record<string, unknown>;
  membership_proof: Record<string, unknown>;
  utxo: Record<string, unknown>;
}

export interface MempoolTransaction {
  tx_id: string;
  fee: string;
  size: number;
  timestamp: string;
}

export interface MempoolOverview {
  transactions: MempoolTransaction[];
  count: number;
  lastUpdated: string;
}

export interface BlockDigest {
  digest: string;
  found: boolean;
  lastUpdated: string;
}

export interface BlockDigestsByHeight {
  digests: string[];
  height: string;
  count: number;
  lastUpdated: string;
}

export interface LatestTipDigests {
  digests: string[];
  count: number;
  requested: number;
  lastUpdated: string;
}

export interface InstanceId {
  instance_id: string;
  lastUpdated: string;
}

// ============================================================================
// Store State Interface
// ============================================================================

export interface OnchainState {
  // Tier 1: Critical Data
  dashboardData: DashboardOverviewData | null;
  blockHeight: string | null;
  network: string | null;
  confirmedBalance: string | null;
  unconfirmedBalance: string | null;
  nextReceivingAddress: string | null;
  walletStatus: WalletStatus | null;
  transactionHistory: TransactionHistoryItem[];
  ownCoins: Coin[];
  mempoolTxCount: number | null;
  mempoolSize: number | null;
  peerInfo: PeerInfo[];
  confirmations: string | null;

  // Tier 2: Important Data
  utxos: UTXO[];
  spendableInputs: SpendableInput[];
  mempoolOverview: MempoolOverview | null;
  mempoolTxIds: string[];
  blockDigests: Map<number, BlockDigest>;
  latestTipDigests: LatestTipDigests | null;
  instanceId: InstanceId | null;
  numExpectedUtxos: string | null;

  // Tier 3: Advanced Data
  cpuTemp: number | null;
  minerStatus: 'active' | 'paused' | 'unknown';

  // Metadata
  lastUpdate: number | null;
  isLoading: boolean;
  error: string | null;
}

// ============================================================================
// Store Actions Interface
// ============================================================================

export interface OnchainActions {
  // Tier 1: Critical Actions
  setDashboardData: (data: DashboardOverviewData) => void;
  setBlockHeight: (height: string) => void;
  setNetwork: (network: string) => void;
  setConfirmedBalance: (balance: string) => void;
  setUnconfirmedBalance: (balance: string) => void;
  setNextReceivingAddress: (address: string) => void;
  setWalletStatus: (status: WalletStatus) => void;
  setTransactionHistory: (history: TransactionHistoryItem[]) => void;
  addTransaction: (tx: TransactionHistoryItem) => void;
  setOwnCoins: (coins: Coin[]) => void;
  setMempoolTxCount: (count: number) => void;
  setMempoolSize: (size: number) => void;
  setPeerInfo: (peers: PeerInfo[]) => void;
  setConfirmations: (confirmations: string) => void;

  // Tier 2: Important Actions
  setUtxos: (utxos: UTXO[]) => void;
  setSpendableInputs: (inputs: SpendableInput[]) => void;
  setMempoolOverview: (overview: MempoolOverview) => void;
  setMempoolTxIds: (ids: string[]) => void;
  setBlockDigest: (height: number, digest: BlockDigest) => void;
  setLatestTipDigests: (digests: LatestTipDigests) => void;
  setInstanceId: (id: InstanceId) => void;
  setNumExpectedUtxos: (count: string) => void;

  // Tier 3: Advanced Actions
  setCpuTemp: (temp: number | null) => void;
  setMinerStatus: (status: 'active' | 'paused' | 'unknown') => void;

  // Utility Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
  updateTimestamp: () => void;
}

// ============================================================================
// Initial State
// ============================================================================

const initialState: OnchainState = {
  // Tier 1
  dashboardData: null,
  blockHeight: null,
  network: null,
  confirmedBalance: null,
  unconfirmedBalance: null,
  nextReceivingAddress: null,
  walletStatus: null,
  transactionHistory: [],
  ownCoins: [],
  mempoolTxCount: null,
  mempoolSize: null,
  peerInfo: [],
  confirmations: null,

  // Tier 2
  utxos: [],
  spendableInputs: [],
  mempoolOverview: null,
  mempoolTxIds: [],
  blockDigests: new Map(),
  latestTipDigests: null,
  instanceId: null,
  numExpectedUtxos: null,

  // Tier 3
  cpuTemp: null,
  minerStatus: 'unknown',

  // Metadata
  lastUpdate: null,
  isLoading: false,
  error: null,
};

// ============================================================================
// Zustand Store
// ============================================================================

export const useOnchainStore = create<OnchainState & OnchainActions>()(
  persist(
    (set) => ({
      ...initialState,

      // Tier 1: Critical Actions
      setDashboardData: (data) =>
        set({
          dashboardData: data,
          lastUpdate: Date.now(),
        }),

      setBlockHeight: (height) =>
        set({
          blockHeight: height,
          lastUpdate: Date.now(),
        }),

      setNetwork: (network) =>
        set({
          network,
          lastUpdate: Date.now(),
        }),

      setConfirmedBalance: (balance) =>
        set({
          confirmedBalance: balance,
          lastUpdate: Date.now(),
        }),

      setUnconfirmedBalance: (balance) =>
        set({
          unconfirmedBalance: balance,
          lastUpdate: Date.now(),
        }),

      setNextReceivingAddress: (address) =>
        set({
          nextReceivingAddress: address,
          lastUpdate: Date.now(),
        }),

      setWalletStatus: (status) =>
        set({
          walletStatus: status,
          lastUpdate: Date.now(),
        }),

      setTransactionHistory: (history) =>
        set({
          transactionHistory: history,
          lastUpdate: Date.now(),
        }),

      addTransaction: (tx) =>
        set((state) => ({
          transactionHistory: [tx, ...state.transactionHistory],
          lastUpdate: Date.now(),
        })),

      setOwnCoins: (coins) =>
        set({
          ownCoins: coins,
          lastUpdate: Date.now(),
        }),

      setMempoolTxCount: (count) =>
        set({
          mempoolTxCount: count,
          lastUpdate: Date.now(),
        }),

      setMempoolSize: (size) =>
        set({
          mempoolSize: size,
          lastUpdate: Date.now(),
        }),

      setPeerInfo: (peers) =>
        set({
          peerInfo: peers,
          lastUpdate: Date.now(),
        }),

      setConfirmations: (confirmations) =>
        set({
          confirmations,
          lastUpdate: Date.now(),
        }),

      // Tier 2: Important Actions
      setUtxos: (utxos) =>
        set({
          utxos,
          lastUpdate: Date.now(),
        }),

      setSpendableInputs: (inputs) =>
        set({
          spendableInputs: inputs,
          lastUpdate: Date.now(),
        }),

      setMempoolOverview: (overview) =>
        set({
          mempoolOverview: overview,
          lastUpdate: Date.now(),
        }),

      setMempoolTxIds: (ids) =>
        set({
          mempoolTxIds: ids,
          lastUpdate: Date.now(),
        }),

      setBlockDigest: (height, digest) =>
        set((state) => {
          const newDigests = new Map(state.blockDigests);
          newDigests.set(height, digest);
          return {
            blockDigests: newDigests,
            lastUpdate: Date.now(),
          };
        }),

      setLatestTipDigests: (digests) =>
        set({
          latestTipDigests: digests,
          lastUpdate: Date.now(),
        }),

      setInstanceId: (id) =>
        set({
          instanceId: id,
          lastUpdate: Date.now(),
        }),

      setNumExpectedUtxos: (count) =>
        set({
          numExpectedUtxos: count,
          lastUpdate: Date.now(),
        }),

      // Tier 3: Advanced Actions
      setCpuTemp: (temp) =>
        set({
          cpuTemp: temp,
          lastUpdate: Date.now(),
        }),

      setMinerStatus: (status) =>
        set({
          minerStatus: status,
          lastUpdate: Date.now(),
        }),

      // Utility Actions
      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      clearError: () => set({ error: null }),

      reset: () => set(initialState),

      updateTimestamp: () => set({ lastUpdate: Date.now() }),
    }),
    {
      name: 'onchain-storage',
      // Don't persist large data structures
      partialize: (state) => ({
        blockHeight: state.blockHeight,
        network: state.network,
        confirmedBalance: state.confirmedBalance,
        unconfirmedBalance: state.unconfirmedBalance,
        nextReceivingAddress: state.nextReceivingAddress,
        lastUpdate: state.lastUpdate,
      }),
    }
  )
);

// ============================================================================
// Selectors (for optimized component rendering)
// ============================================================================

export const selectBalance = (state: OnchainState) => ({
  confirmed: state.confirmedBalance,
  unconfirmed: state.unconfirmedBalance,
});

export const selectNetworkInfo = (state: OnchainState) => ({
  network: state.network,
  blockHeight: state.blockHeight,
  syncing: state.dashboardData?.syncing ?? false,
});

export const selectMempoolInfo = (state: OnchainState) => ({
  txCount: state.mempoolTxCount,
  size: state.mempoolSize,
  overview: state.mempoolOverview,
});

export const selectPeerStatus = (state: OnchainState) => ({
  peerCount: state.peerInfo.length,
  peers: state.peerInfo,
});
