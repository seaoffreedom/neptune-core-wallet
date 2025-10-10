/**
 * Onchain Data Hooks
 *
 * React hooks for fetching and managing blockchain/onchain data
 * Integrates with Zustand store and Electron IPC
 */

import { useCallback, useEffect, useState } from 'react';
import {
  type DashboardOverviewData,
  type PeerInfo,
  type TransactionHistoryItem,
  type UTXO,
  useOnchainStore,
} from '@/store/onchain.store';

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
      const result = await window.electronAPI.blockchain.getDashboardOverview();

      console.log('📊 Dashboard data received:', result);

      if (result.success && result.data) {
        console.log('✅ Setting dashboard data:', result.data);
        setDashboardData(result.data as DashboardOverviewData);
      } else {
        console.error('❌ Dashboard fetch failed:', result.error);
        setError(result.error || 'Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('❌ Dashboard fetch error:', error);
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
      const result = await window.electronAPI.blockchain.getBalance();

      console.log('💰 Balance data received:', result);

      if (result.success && result.confirmed && result.unconfirmed) {
        console.log(
          '✅ Setting balance - Confirmed:',
          result.confirmed,
          'Unconfirmed:',
          result.unconfirmed
        );
        setConfirmedBalance(result.confirmed);
        setUnconfirmedBalance(result.unconfirmed);
      } else {
        console.error('❌ Balance fetch failed:', result.error);
        setError(result.error || 'Failed to fetch balance');
      }
    } catch (error) {
      console.error('❌ Balance fetch error:', error);
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

      console.log('🌐 Network data received:', networkResult);
      console.log('📏 Block height received:', heightResult);

      if (networkResult.success && networkResult.network) {
        console.log('✅ Setting network:', networkResult.network);
        setNetwork(networkResult.network);
      }

      if (heightResult.success && heightResult.height) {
        console.log('✅ Setting block height:', heightResult.height);
        setBlockHeight(heightResult.height);
      }
    } catch (error) {
      console.error('❌ Network info fetch error:', error);
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

      console.log('📜 Transaction history received:', result);

      if (result.success && result.history !== undefined) {
        console.log(
          '✅ Setting transaction history:',
          Array.isArray(result.history) ? result.history.length : 0,
          'transactions'
        );
        setTransactionHistory(result.history as TransactionHistoryItem[]);
      } else {
        // History endpoint can be slow/timeout - don't show error, just log
        console.warn('⚠️  History fetch failed (will retry):', result.error);
        // Don't set error state - let it silently fail and retry next poll
      }
    } catch (error) {
      console.warn(
        '⚠️  History fetch error (will retry):',
        (error as Error).message
      );
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
      console.error('Failed to fetch nth receiving address:', error);
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
        console.log('📤 Sending transaction:', params);

        const result = await window.electronAPI.blockchain.send(params);

        if (result.success && result.txId) {
          console.log('✅ Transaction sent successfully:', result.txId);
          setTxId(result.txId);
          return result.txId;
        } else {
          const errorMsg = result.error || 'Failed to send transaction';
          console.error('❌ Transaction send failed:', errorMsg);
          setError(errorMsg);
          return null;
        }
      } catch (err) {
        const errorMsg = (err as Error).message;
        console.error('❌ Transaction send error:', errorMsg);
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
      const [countResult, sizeResult] = await Promise.all([
        window.electronAPI.blockchain.getMempoolTxCount(),
        window.electronAPI.blockchain.getMempoolSize(),
      ]);

      // Only log successful results (mempool endpoints may timeout)
      if (countResult.success && countResult.count !== undefined) {
        console.log('✅ Mempool tx count:', countResult.count);
        setMempoolTxCount(countResult.count);
      }

      if (sizeResult.success && sizeResult.size !== undefined) {
        console.log('✅ Mempool size:', sizeResult.size);
        setMempoolSize(sizeResult.size);
      }

      // Silently ignore errors (mempool endpoints are optional)
    } catch {
      // Silently ignore mempool fetch errors (non-critical)
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  }, [setMempoolTxCount, setMempoolSize, setLoading, setError]);

  const fetchMempoolOverview = useCallback(
    async (startIndex = 0, count = 10) => {
      setIsRefreshing(true);
      setLoading(true);
      setError(null);

      try {
        // First check if there are any transactions
        const txCountResult =
          await window.electronAPI.blockchain.getMempoolTxCount();

        console.log('fetchMempoolOverview: txCountResult:', txCountResult);

        if (
          !txCountResult.success ||
          !txCountResult.count ||
          txCountResult.count === 0
        ) {
          // No transactions, set empty overview
          console.log(
            'fetchMempoolOverview: No transactions, setting empty overview'
          );
          setMempoolOverview({
            transactions: [],
            count: 0,
            lastUpdated: new Date().toISOString(),
          });
          return;
        }

        // Get transaction IDs first
        const txIdsResult =
          await window.electronAPI.blockchain.getMempoolTxIds();

        console.log('fetchMempoolOverview: txIdsResult:', txIdsResult);

        if (
          !txIdsResult.success ||
          !txIdsResult.txIds ||
          txIdsResult.txIds.length === 0
        ) {
          // No transaction IDs, set empty overview
          console.log(
            'fetchMempoolOverview: No transaction IDs, setting empty overview'
          );
          setMempoolOverview({
            transactions: [],
            count: 0,
            lastUpdated: new Date().toISOString(),
          });
          return;
        }

        // Create overview with transaction IDs (mempool_overview endpoint doesn't exist)
        console.log(
          'fetchMempoolOverview: Creating overview with transaction IDs'
        );
        const transactions = txIdsResult.txIds
          .slice(startIndex, startIndex + count)
          .map((txId) => ({
            tx_id: txId,
            fee: '0', // We don't have fee info from tx_ids
            size: 0, // We don't have size info from tx_ids
            timestamp: new Date().toISOString(),
          }));

        console.log(
          'fetchMempoolOverview: Created transactions from IDs:',
          transactions
        );

        setMempoolOverview({
          transactions,
          count: txCountResult.count,
          lastUpdated: new Date().toISOString(),
        });
      } catch (error) {
        setError((error as Error).message);
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

      console.log('🪙 UTXOs received:', result);

      if (result.success && result.coins !== undefined) {
        console.log(
          '✅ Setting UTXOs:',
          Array.isArray(result.coins) ? result.coins.length : 0,
          'coins'
        );
        setUtxos(result.coins as UTXO[]);
      } else {
        // UTXO endpoint can be slow/timeout - don't show error, just log
        console.warn('⚠️  UTXO fetch failed (will retry):', result.error);
        // Don't set error state - let it silently fail and retry next poll
      }
    } catch (error) {
      console.warn(
        '⚠️  UTXO fetch error (will retry):',
        (error as Error).message
      );
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
  const setPeerInfo = useOnchainStore((state) => state.setPeerInfo);
  const setLoading = useOnchainStore((state) => state.setLoading);
  const setError = useOnchainStore((state) => state.setError);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchPeerInfo = useCallback(async () => {
    setIsRefreshing(true);
    setLoading(true);
    setError(null);

    try {
      const result = await window.electronAPI.blockchain.getPeerInfo();

      if (result.success && result.peers) {
        setPeerInfo(result.peers as PeerInfo[]);
      } else {
        setError(result.error || 'Failed to fetch peer info');
      }
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  }, [setPeerInfo, setLoading, setError]);

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

  // Track if a fetch cycle is in progress to prevent overlapping fetches
  const [isFetching, setIsFetching] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  // Connection health check function
  const isConnectionHealthy = useCallback(async (): Promise<boolean> => {
    try {
      // Try a simple, fast RPC call to check connection health
      const result = await window.electronAPI.blockchain.getBlockHeight();
      return result.success;
    } catch (error) {
      console.warn(
        '🔍 Connection health check failed:',
        (error as Error).message
      );
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
      console.warn('⚠️ Data consistency issues detected:', issues);
      return false;
    }

    return true;
  }, []);

  // Coordinated fetch function that prevents race conditions
  const performCoordinatedFetch = useCallback(
    async (isInitial = false) => {
      // Prevent overlapping fetch cycles
      if (isFetching) {
        console.log('⏳ Fetch already in progress, skipping...');
        return;
      }

      // Check if enough time has passed since last fetch (minimum 2 seconds)
      const now = Date.now();
      if (!isInitial && now - lastFetchTime < 2000) {
        console.log('⏳ Too soon since last fetch, skipping...');
        return;
      }

      setIsFetching(true);
      setLastFetchTime(now);

      try {
        console.log('📡 Starting coordinated blockchain data fetch...');

        // Check connection health once at the start
        if (!(await isConnectionHealthy())) {
          console.warn('⚠️ Connection not healthy, skipping fetch cycle');
          return;
        }

        // Execute all fetches in parallel but with proper error handling
        const fetchPromises = [
          fetchDashboard().catch((error) =>
            console.warn('Dashboard fetch failed:', error)
          ),
          fetchBalance().catch((error) =>
            console.warn('Balance fetch failed:', error)
          ),
          fetchNetworkInfo().catch((error) =>
            console.warn('Network info fetch failed:', error)
          ),
          fetchMempoolInfo().catch((error) =>
            console.warn('Mempool info fetch failed:', error)
          ),
          fetchHistory().catch((error) =>
            console.warn('History fetch failed:', error)
          ),
          fetchUtxos().catch((error) =>
            console.warn('UTXOs fetch failed:', error)
          ),
          fetchPeerInfo().catch((error) =>
            console.warn('Peer info fetch failed:', error)
          ),
        ];

        // Wait for all fetches to complete (or fail gracefully)
        await Promise.allSettled(fetchPromises);

        // Validate data consistency after fetch
        setTimeout(() => {
          validateDataConsistency();
        }, 100);

        console.log('✅ Coordinated fetch cycle completed');
      } catch (error) {
        console.error('❌ Coordinated fetch cycle failed:', error);
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
    ]
  );

  useEffect(() => {
    console.log('🔄 Auto-polling initialized with interval:', intervalMs);

    // Wait a moment for RPC server to be fully ready before initial fetch
    const initialFetchTimeout = setTimeout(() => {
      performCoordinatedFetch(true);
    }, 1000); // 1 second delay

    // Set up polling with coordinated fetches
    const interval = setInterval(() => {
      // Only poll if the app is visible and not in background
      if (document.visibilityState === 'visible') {
        performCoordinatedFetch(false);
      } else {
        console.log('⏸️ Skipping poll - app in background');
      }
    }, intervalMs);

    // Pause polling when app goes to background, resume when visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('▶️ Resuming polling - app visible');
        // Perform immediate fetch when becoming visible
        performCoordinatedFetch(false);
      } else {
        console.log('⏸️ App went to background');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      console.log('🛑 Auto-polling stopped');
      clearTimeout(initialFetchTimeout);
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [intervalMs, performCoordinatedFetch]);

  return {
    isFetching,
    lastFetchTime,
    performManualFetch: () => performCoordinatedFetch(false),
  };
}
