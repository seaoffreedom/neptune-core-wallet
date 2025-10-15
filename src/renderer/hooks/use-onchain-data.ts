/**
 * Onchain Data Hooks
 *
 * React hooks for fetching and managing blockchain/onchain data
 * Integrates with Zustand store and Electron IPC
 */

import { useCallback, useEffect, useState } from 'react';
import {
  type DashboardOverviewData,
  type TransactionHistoryItem,
  type UTXO,
  useOnchainStore,
} from '@/store/onchain.store';
import { rendererLoggers } from '../utils/logger';
import {
  balanceDataFetcher,
  dashboardDataFetcher,
  mempoolDataFetcher,
} from '../utils/resilient-data-fetching';

const logger = rendererLoggers.hooks;

// ============================================================================
// Transaction Types
// ============================================================================

export interface SendTransactionParams {
  outputs: Array<{ address: string; amount: string }>;
  fee?: string;
  change_policy?: string;
}

export interface SendTransactionResult {
  txId: string;
}

// ============================================================================
// Tier 1: Critical Data Hooks
// ============================================================================

/**
 * Hook for fetching and managing dashboard overview data
 * Automatically updates Zustand store
 */
export function useDashboardData() {
  const dashboardData = useOnchainStore((state) => state.dashboardData);
  const setDashboardData = useOnchainStore((state) => state.setDashboardData);
  const setLoading = useOnchainStore((state) => state.setLoading);
  const setError = useOnchainStore((state) => state.setError);
  const lastUpdate = useOnchainStore((state) => state.lastUpdate);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDashboard = useCallback(async () => {
    setIsRefreshing(true);
    setLoading(true);
    setError(null);

    try {
      const result = await dashboardDataFetcher.fetch(
        () => window.electronAPI.blockchain.getDashboardOverview(),
        {
          retries: 3,
          timeout: 10000,
          deduplicateKey: 'dashboard_overview',
        }
      );

      if (result.success && result.data) {
        setDashboardData(result.data as DashboardOverviewData);
      } else {
        setError(result.error || 'Failed to fetch dashboard data');
      }
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  }, [setDashboardData, setLoading, setError]);

  return {
    data: dashboardData,
    isRefreshing,
    fetchDashboard,
    lastUpdate,
  };
}

/**
 * Hook for fetching current blockchain difficulty
 */
export function useCurrentDifficulty() {
  const currentDifficulty = useOnchainStore((state) => state.currentDifficulty);
  const setCurrentDifficulty = useOnchainStore(
    (state) => state.setCurrentDifficulty
  );
  const setLoading = useOnchainStore((state) => state.setLoading);
  const setError = useOnchainStore((state) => state.setError);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDifficulty = useCallback(async () => {
    setIsRefreshing(true);
    setLoading(true);
    setError(null);

    try {
      const result = await dashboardDataFetcher.fetch(
        () =>
          window.electronAPI.blockchain.getBlockDifficulties({
            block_selector: 'Tip',
            max_num_blocks: 1,
          }),
        {
          retries: 3,
          timeout: 10000,
          deduplicateKey: 'current_difficulty',
        }
      );

      if (result.success && result.result && result.result.length > 0) {
        // Extract difficulty from the first (most recent) block
        // result.result[0] is [height, [difficulty_array]]
        // difficulty_array is [u32, u32, u32, u32, u32] representing a BigUint
        const difficultyArray = result.result[0][1]; // [difficulty_array]

        // Convert difficulty array to BigUint (same logic as CLI)
        // Each u32 represents 32 bits, so we shift and add them
        // Use BigInt to avoid precision loss with large numbers
        let difficulty = BigInt(0);
        for (let i = difficultyArray.length - 1; i >= 0; i--) {
          difficulty =
            difficulty * BigInt(2) ** BigInt(32) + BigInt(difficultyArray[i]);
        }

        // Convert BigInt to number for display (this might lose precision for very large numbers)
        // But for difficulty values, this should be fine
        setCurrentDifficulty(Number(difficulty));
      } else {
        setCurrentDifficulty(null);
      }
    } catch (error) {
      setError((error as Error).message);
      setCurrentDifficulty(null);
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  }, [setCurrentDifficulty, setLoading, setError]);

  return {
    difficulty: currentDifficulty,
    isRefreshing,
    fetchDifficulty,
  };
}

/**
 * Hook for fetching wallet balance
 */
export function useBalance() {
  const confirmedBalance = useOnchainStore((state) => state.confirmedBalance);
  const unconfirmedBalance = useOnchainStore(
    (state) => state.unconfirmedBalance
  );
  const setConfirmedBalance = useOnchainStore(
    (state) => state.setConfirmedBalance
  );
  const setUnconfirmedBalance = useOnchainStore(
    (state) => state.setUnconfirmedBalance
  );
  const setLoading = useOnchainStore((state) => state.setLoading);
  const setError = useOnchainStore((state) => state.setError);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchBalance = useCallback(async () => {
    setIsRefreshing(true);
    setLoading(true);
    setError(null);

    try {
      const result = await balanceDataFetcher.fetch(
        () => window.electronAPI.blockchain.getBalance(),
        {
          retries: 3,
          timeout: 10000,
          deduplicateKey: 'balance',
        }
      );

      if (result.success && result.confirmed && result.unconfirmed) {
        setConfirmedBalance(result.confirmed);
        setUnconfirmedBalance(result.unconfirmed);
      } else {
        setError(result.error || 'Failed to fetch balance');
      }
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  }, [setConfirmedBalance, setUnconfirmedBalance, setLoading, setError]);

  return {
    confirmed: confirmedBalance,
    unconfirmed: unconfirmedBalance,
    isRefreshing,
    fetchBalance,
  };
}

/**
 * Hook for fetching network info
 */
export function useNetworkInfo() {
  const network = useOnchainStore((state) => state.network);
  const blockHeight = useOnchainStore((state) => state.blockHeight);
  const setNetwork = useOnchainStore((state) => state.setNetwork);
  const setBlockHeight = useOnchainStore((state) => state.setBlockHeight);
  const setLoading = useOnchainStore((state) => state.setLoading);
  const setError = useOnchainStore((state) => state.setError);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchNetworkInfo = useCallback(async () => {
    setIsRefreshing(true);
    setLoading(true);
    setError(null);

    try {
      const [networkResult, heightResult] = await Promise.all([
        window.electronAPI.blockchain.getNetwork(),
        window.electronAPI.blockchain.getBlockHeight(),
      ]);

      if (networkResult.success && networkResult.network) {
        setNetwork(networkResult.network);
      }

      if (heightResult.success && heightResult.height) {
        setBlockHeight(heightResult.height);
      }
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  }, [setNetwork, setBlockHeight, setLoading, setError]);

  return {
    network,
    blockHeight,
    isRefreshing,
    fetchNetworkInfo,
  };
}

/**
 * Hook for fetching transaction history
 */
export function useTransactionHistory() {
  const transactionHistory = useOnchainStore(
    (state) => state.transactionHistory
  );
  const setTransactionHistory = useOnchainStore(
    (state) => state.setTransactionHistory
  );
  const setLoading = useOnchainStore((state) => state.setLoading);
  const setError = useOnchainStore((state) => state.setError);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchHistory = useCallback(async () => {
    setIsRefreshing(true);
    setLoading(true);
    setError(null);

    try {
      const result = await window.electronAPI.blockchain.getHistory();

      if (result.success && result.history !== undefined) {
        setTransactionHistory(result.history as TransactionHistoryItem[]);
      }
      // History endpoint can be slow/timeout - silently retry on failure
    } catch {
      // Don't set error state - let it silently fail and retry next poll
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  }, [setTransactionHistory, setLoading, setError]);

  return {
    history: transactionHistory,
    isRefreshing,
    fetchHistory,
  };
}

/**
 * Hook for fetching next receiving address
 */
export function useReceivingAddress() {
  const nextReceivingAddress = useOnchainStore(
    (state) => state.nextReceivingAddress
  );
  const setNextReceivingAddress = useOnchainStore(
    (state) => state.setNextReceivingAddress
  );
  const setLoading = useOnchainStore((state) => state.setLoading);
  const setError = useOnchainStore((state) => state.setError);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchAddress = useCallback(async () => {
    setIsRefreshing(true);
    setLoading(true);
    setError(null);

    try {
      const result =
        await window.electronAPI.blockchain.getNextReceivingAddress();

      if (result.success && result.address) {
        setNextReceivingAddress(result.address);
      } else {
        setError(result.error || 'Failed to fetch receiving address');
      }
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  }, [setNextReceivingAddress, setLoading, setError]);

  return {
    address: nextReceivingAddress,
    isRefreshing,
    fetchAddress,
  };
}

/**
 * Hook for fetching nth receiving address
 * @param n - The index of the address to fetch (0-based)
 */
export function useNthReceivingAddress(n: number = 0) {
  const [address, setAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAddress = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await window.electronAPI.blockchain.getNthReceivingAddress(
        {
          n,
        }
      );

      if (result.success && result.address) {
        setAddress(result.address);
      } else {
        setError(result.error || 'Failed to fetch receiving address');
      }
    } catch (error) {
      setError((error as Error).message);
      logger.error('Failed to fetch nth receiving address', {
        error: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }, [n]);

  return {
    address,
    isLoading,
    error,
    fetchAddress,
  };
}

/**
 * Hook for sending private transactions
 * Provides loading state and error handling
 */
export function useSendTransaction() {
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txId, setTxId] = useState<string | null>(null);

  const sendTransaction = useCallback(
    async (params: SendTransactionParams): Promise<string | null> => {
      setIsSending(true);
      setError(null);
      setTxId(null);

      try {
        logger.info('Sending transaction', params);

        const result = await window.electronAPI.blockchain.send(params);

        if (result.success && result.txId) {
          logger.info('Transaction sent successfully', {
            txId: result.txId,
          });
          setTxId(result.txId);
          return result.txId;
        } else {
          const errorMsg = result.error || 'Failed to send transaction';
          logger.error('Transaction send failed', {
            error: errorMsg,
          });
          setError(errorMsg);
          return null;
        }
      } catch (err) {
        const errorMsg = (err as Error).message;
        logger.error('Transaction send error', { error: errorMsg });
        setError(errorMsg);
        return null;
      } finally {
        setIsSending(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setError(null);
    setTxId(null);
  }, []);

  return {
    sendTransaction,
    isSending,
    error,
    txId,
    reset,
  };
}

// ============================================================================
// Tier 2: Important Data Hooks
// ============================================================================

/**
 * Hook for fetching mempool information
 */
export function useMempoolInfo() {
  const mempoolTxCount = useOnchainStore((state) => state.mempoolTxCount);
  const mempoolSize = useOnchainStore((state) => state.mempoolSize);
  const mempoolOverview = useOnchainStore((state) => state.mempoolOverview);
  const setMempoolTxCount = useOnchainStore((state) => state.setMempoolTxCount);
  const setMempoolSize = useOnchainStore((state) => state.setMempoolSize);
  const setMempoolOverview = useOnchainStore(
    (state) => state.setMempoolOverview
  );
  const setLoading = useOnchainStore((state) => state.setLoading);
  const setError = useOnchainStore((state) => state.setError);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchMempoolInfo = useCallback(async () => {
    setIsRefreshing(true);
    setLoading(true);
    setError(null);

    try {
      const [countResult, sizeResult, overviewResult] = await Promise.all([
        mempoolDataFetcher.fetch(
          () => window.electronAPI.blockchain.getMempoolTxCount(),
          {
            retries: 2,
            timeout: 8000,
            deduplicateKey: 'mempool_tx_count',
          }
        ),
        mempoolDataFetcher.fetch(
          () => window.electronAPI.blockchain.getMempoolSize(),
          {
            retries: 2,
            timeout: 8000,
            deduplicateKey: 'mempool_size',
          }
        ),
        mempoolDataFetcher.fetch(
          () =>
            window.electronAPI.blockchain.getMempoolOverview({
              start_index: 0,
              number: 10,
            }),
          {
            retries: 2,
            timeout: 10000,
            deduplicateKey: 'mempool_overview_0_10',
          }
        ),
      ]);

      // Only set successful results (mempool endpoints may timeout)
      if (countResult.success && countResult.count !== undefined) {
        setMempoolTxCount(countResult.count);
      }

      if (sizeResult.success && sizeResult.size !== undefined) {
        setMempoolSize(sizeResult.size);
      }

      if (overviewResult.success && overviewResult.transactions) {
        setMempoolOverview({
          transactions: overviewResult.transactions,
          count: countResult.success ? countResult.count || 0 : 0,
          lastUpdated: new Date().toISOString(),
        });
      } else {
        // Set empty overview if no transactions or error
        setMempoolOverview({
          transactions: [],
          count: countResult.success ? countResult.count || 0 : 0,
          lastUpdated: new Date().toISOString(),
        });
      }

      // Silently ignore errors (mempool endpoints are optional)
    } catch (error) {
      // Debug: Log any errors that might be causing polling to stop
      logger.error('Mempool fetch error', { error: error.message });
      // Silently ignore mempool fetch errors (non-critical)
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  }, [
    setMempoolTxCount,
    setMempoolSize,
    setMempoolOverview,
    setLoading,
    setError,
  ]);

  const fetchMempoolOverview = useCallback(
    async (startIndex = 0, count = 10) => {
      setIsRefreshing(true);
      setLoading(true);
      setError(null);

      try {
        // Use the comprehensive mempool overview endpoint
        const overviewResult = await mempoolDataFetcher.fetch(
          () =>
            window.electronAPI.blockchain.getMempoolOverview({
              start_index: startIndex,
              number: count,
            }),
          {
            retries: 2,
            timeout: 10000,
            deduplicateKey: `mempool_overview_${startIndex}_${count}`,
          }
        );

        if (overviewResult.success && overviewResult.transactions) {
          // Get total count for the overview
          const txCountResult =
            await window.electronAPI.blockchain.getMempoolTxCount();

          setMempoolOverview({
            transactions: overviewResult.transactions,
            count: txCountResult.success ? txCountResult.count || 0 : 0,
            lastUpdated: new Date().toISOString(),
          });
        } else {
          // No transactions or error, set empty overview
          setMempoolOverview({
            transactions: [],
            count: 0,
            lastUpdated: new Date().toISOString(),
          });
        }
      } catch (error) {
        setError((error as Error).message);
        // Set empty overview on error
        setMempoolOverview({
          transactions: [],
          count: 0,
          lastUpdated: new Date().toISOString(),
        });
      } finally {
        setIsRefreshing(false);
        setLoading(false);
      }
    },
    [setMempoolOverview, setLoading, setError]
  );

  return {
    txCount: mempoolTxCount,
    size: mempoolSize,
    overview: mempoolOverview,
    isRefreshing,
    fetchMempoolInfo,
    fetchMempoolOverview,
  };
}

/**
 * Hook for UTXO management
 */
export function useUtxos() {
  const utxos = useOnchainStore((state) => state.utxos);
  const setUtxos = useOnchainStore((state) => state.setUtxos);
  const setLoading = useOnchainStore((state) => state.setLoading);
  const setError = useOnchainStore((state) => state.setError);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchUtxos = useCallback(async () => {
    setIsRefreshing(true);
    setLoading(true);
    setError(null);

    try {
      const result = await window.electronAPI.blockchain.listOwnCoins();

      if (result.success && result.coins !== undefined) {
        setUtxos(result.coins as UTXO[]);
      }
      // UTXO endpoint can be slow/timeout - silently retry on failure
    } catch {
      // Don't set error state - let it silently fail and retry next poll
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  }, [setUtxos, setLoading, setError]);

  const calculateSummary = useCallback(() => {
    const now = Date.now();

    let totalValue = 0;
    let confirmedCount = 0;
    let confirmedValue = 0;
    let unconfirmedCount = 0;
    let unconfirmedValue = 0;
    let timeLockedCount = 0;
    let timeLockedValue = 0;

    utxos.forEach((utxo) => {
      const amount = parseFloat(utxo.amount);
      totalValue += amount;

      // Check if time-locked
      if (utxo.release_date) {
        const releaseTime = parseInt(utxo.release_date, 10);
        if (releaseTime > now) {
          timeLockedCount++;
          timeLockedValue += amount;
          return;
        }
      }

      // Check if confirmed
      if (utxo.confirmed) {
        confirmedCount++;
        confirmedValue += amount;
      } else {
        unconfirmedCount++;
        unconfirmedValue += amount;
      }
    });

    return {
      totalCount: utxos.length,
      totalValue,
      confirmedCount,
      confirmedValue,
      unconfirmedCount,
      unconfirmedValue,
      timeLockedCount,
      timeLockedValue,
      averageSize: utxos.length > 0 ? totalValue / utxos.length : 0,
    };
  }, [utxos]);

  return {
    utxos,
    isRefreshing,
    fetchUtxos,
    calculateSummary,
  };
}

/**
 * Hook for peer information
 */
export function usePeerInfo() {
  const peerInfo = useOnchainStore((state) => state.peerInfo);
  const setPeerInfoFromCli = useOnchainStore(
    (state) => state.setPeerInfoFromCli
  );
  const setLoading = useOnchainStore((state) => state.setLoading);
  const setError = useOnchainStore((state) => state.setError);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchPeerInfo = useCallback(async () => {
    setIsRefreshing(true);
    setLoading(true);
    setError(null);

    try {
      // Use CLI command for more reliable peer info
      const result = await window.electronAPI.blockchain.getPeerInfoCli();

      if (result.success && result.peers) {
        setPeerInfoFromCli(result.peers);
      } else {
        setError(result.error || 'Failed to fetch peer info');
      }
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  }, [setPeerInfoFromCli, setLoading, setError]);

  return {
    peers: peerInfo,
    peerCount: peerInfo.length,
    isRefreshing,
    fetchPeerInfo,
  };
}

/**
 * Hook for address validation
 */
export function useAddressValidation() {
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateAddress = useCallback(async (address: string) => {
    setIsValidating(true);
    setError(null);

    try {
      const result = await window.electronAPI.blockchain.validateAddress({
        address,
      });

      if (result.success) {
        return result.isValid;
      }
      setError(result.error || 'Validation failed');
      return false;
    } catch (err) {
      const errorMsg = (err as Error).message;
      setError(errorMsg);
      return false;
    } finally {
      setIsValidating(false);
    }
  }, []);

  const validateAmount = useCallback(async (amount: string) => {
    setIsValidating(true);
    setError(null);

    try {
      const result = await window.electronAPI.blockchain.validateAmount({
        amount,
      });

      if (result.success) {
        return result.isValid;
      }
      setError(result.error || 'Validation failed');
      return false;
    } catch (err) {
      const errorMsg = (err as Error).message;
      setError(errorMsg);
      return false;
    } finally {
      setIsValidating(false);
    }
  }, []);

  return {
    validateAddress,
    validateAmount,
    isValidating,
    error,
  };
}

// ============================================================================
// Tier 3: Advanced Hooks
// ============================================================================

/**
 * Hook for mining control
 */
export function useMining() {
  const minerStatus = useOnchainStore((state) => state.minerStatus);
  const setMinerStatus = useOnchainStore((state) => state.setMinerStatus);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pauseMiner = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await window.electronAPI.blockchain.pauseMiner();

      if (result.success) {
        setMinerStatus('paused');
        return true;
      }
      setError(result.error || 'Failed to pause miner');
      return false;
    } catch (err) {
      const errorMsg = (err as Error).message;
      setError(errorMsg);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [setMinerStatus]);

  const restartMiner = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await window.electronAPI.blockchain.restartMiner();

      if (result.success) {
        setMinerStatus('active');
        return true;
      }
      setError(result.error || 'Failed to restart miner');
      return false;
    } catch (err) {
      const errorMsg = (err as Error).message;
      setError(errorMsg);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [setMinerStatus]);

  return {
    status: minerStatus,
    pauseMiner,
    restartMiner,
    isLoading,
    error,
  };
}

/**
 * Hook for wallet management
 */
export function useWalletManagement() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportSeedPhrase = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await window.electronAPI.blockchain.exportSeedPhrase();

      if (result.success && result.seedPhrase) {
        return result.seedPhrase;
      }
      setError(result.error || 'Failed to export seed phrase');
      return null;
    } catch (err) {
      const errorMsg = (err as Error).message;
      setError(errorMsg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const importSeedPhrase = useCallback(async (seedPhrase: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await window.electronAPI.blockchain.importSeedPhrase({
        seed_phrase: seedPhrase,
      });

      if (result.success) {
        return true;
      }
      setError(result.error || 'Failed to import seed phrase');
      return false;
    } catch (err) {
      const errorMsg = (err as Error).message;
      setError(errorMsg);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    exportSeedPhrase,
    importSeedPhrase,
    isLoading,
    error,
  };
}

// ============================================================================
// Auto-Polling Hook
// ============================================================================

/**
 * Hook for automatic data polling with race condition protection
 * Fetches multiple data points on an interval with proper coordination
 */
export function useAutoPolling(intervalMs = 10000) {
  const { fetchDashboard } = useDashboardData();
  const { fetchBalance } = useBalance();
  const { fetchNetworkInfo } = useNetworkInfo();
  const { fetchMempoolInfo } = useMempoolInfo();
  const { fetchHistory } = useTransactionHistory();
  const { fetchUtxos } = useUtxos();
  const { fetchPeerInfo } = usePeerInfo();
  const { fetchDifficulty } = useCurrentDifficulty();

  // Track if a fetch cycle is in progress to prevent overlapping fetches
  const [isFetching, setIsFetching] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  // Connection health check function
  const isConnectionHealthy = useCallback(async (): Promise<boolean> => {
    try {
      // Try a simple, fast RPC call to check connection health
      const result = await window.electronAPI.blockchain.getBlockHeight();
      return result.success;
    } catch {
      return false;
    }
  }, []);

  // Data validation function to ensure consistency
  const validateDataConsistency = useCallback(() => {
    const store = useOnchainStore.getState();
    const issues: string[] = [];

    // Check for data consistency issues
    if (store.dashboardData && store.blockHeight) {
      const dashboardHeight = store.dashboardData.tip_header?.height;
      const networkHeight = parseInt(store.blockHeight, 10);

      if (dashboardHeight && Math.abs(dashboardHeight - networkHeight) > 1) {
        issues.push(
          `Block height mismatch: dashboard=${dashboardHeight}, network=${networkHeight}`
        );
      }
    }

    if (store.dashboardData && store.confirmedBalance) {
      const dashboardBalance = parseFloat(
        store.dashboardData.confirmed_available_balance
      );
      const networkBalance = parseFloat(store.confirmedBalance);

      if (Math.abs(dashboardBalance - networkBalance) > 0.00000001) {
        issues.push(
          `Balance mismatch: dashboard=${dashboardBalance}, network=${networkBalance}`
        );
      }
    }

    if (issues.length > 0) {
      return false;
    }

    return true;
  }, []);

  // Coordinated fetch function that prevents race conditions
  const performCoordinatedFetch = useCallback(
    async (isInitial = false) => {
      // Prevent overlapping fetch cycles
      if (isFetching) {
        return;
      }

      // Check if enough time has passed since last fetch (minimum 2 seconds)
      const now = Date.now();
      if (!isInitial && now - lastFetchTime < 2000) {
        return;
      }

      setIsFetching(true);
      setLastFetchTime(now);

      try {
        // Check connection health once at the start
        if (!(await isConnectionHealthy())) {
          return;
        }

        // Execute all fetches in parallel but with proper error handling
        const fetchPromises = [
          fetchDashboard().catch(() => {}),
          fetchBalance().catch(() => {}),
          fetchNetworkInfo().catch(() => {}),
          fetchMempoolInfo().catch(() => {}),
          fetchHistory().catch(() => {}),
          fetchUtxos().catch(() => {}),
          fetchPeerInfo().catch(() => {}),
          fetchDifficulty().catch(() => {}),
        ];

        // Wait for all fetches to complete (or fail gracefully)
        await Promise.allSettled(fetchPromises);

        // Validate data consistency after fetch
        setTimeout(() => {
          validateDataConsistency();
        }, 100);
      } catch {
        // Silently handle fetch cycle errors
      } finally {
        setIsFetching(false);
      }
    },
    [
      isFetching,
      lastFetchTime,
      isConnectionHealthy,
      validateDataConsistency,
      fetchDashboard,
      fetchBalance,
      fetchNetworkInfo,
      fetchMempoolInfo,
      fetchHistory,
      fetchUtxos,
      fetchPeerInfo,
      fetchDifficulty,
    ]
  );

  useEffect(() => {
    // Wait a moment for RPC server to be fully ready before initial fetch
    const initialFetchTimeout = setTimeout(() => {
      performCoordinatedFetch(true);
    }, 1000); // 1 second delay

    // Set up polling with coordinated fetches
    const interval = setInterval(() => {
      performCoordinatedFetch(false);
    }, intervalMs);

    return () => {
      clearTimeout(initialFetchTimeout);
      clearInterval(interval);
    };
  }, [intervalMs, performCoordinatedFetch]);

  return {
    isFetching,
    lastFetchTime,
    performManualFetch: () => performCoordinatedFetch(false),
  };
}
