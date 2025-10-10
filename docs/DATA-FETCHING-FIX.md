# Data Fetching Architecture Fix

**Date**: 2025-10-09
**Status**: ✅ Complete

## Problem

The wallet overview page wasn't showing data (transaction history, UTXOs) until the user navigated to another page first. This was caused by:

1. **Decentralized data fetching**: Each page was responsible for fetching its own data on mount
2. **Inconsistent hooks**: Two separate `useUtxos` hooks with different caching strategies
3. **Missing global polling**: `useAutoPolling` only fetched dashboard/balance/network data, NOT transaction history or UTXOs

### Specific Issues

- **Wallet Overview** (`/_wallet/index.tsx`): Read from Zustand store but never fetched data
- **Transaction History** (`/_wallet/history.tsx`): Fetched on mount, populating the store
- **UTXOs Page** (`/_wallet/utxos.tsx`): Used separate hook with its own cache
- When visiting Overview first → empty data
- When visiting History/UTXOs first → data populated in store
- Going back to Overview → NOW shows data (from store)

## Solution

### 1. Centralized Global Data Fetching

**Updated**: `src/renderer/hooks/use-onchain-data.ts`

Added transaction history and UTXO fetching to `useAutoPolling`:

```typescript
export function useAutoPolling(intervalMs = 10000) {
  const { fetchDashboard } = useDashboardData();
  const { fetchBalance } = useBalance();
  const { fetchNetworkInfo } = useNetworkInfo();
  const { fetchMempoolInfo } = useMempoolInfo();
  const { fetchHistory } = useTransactionHistory(); // ✅ Added
  const { fetchUtxos } = useUtxos(); // ✅ Added

  useEffect(
    () => {
      // Initial fetch after 1 second
      const initialFetchTimeout = setTimeout(() => {
        fetchDashboard();
        fetchBalance();
        fetchNetworkInfo();
        fetchMempoolInfo();
        fetchHistory(); // ✅ Added
        fetchUtxos(); // ✅ Added
      }, 1000);

      // Polling every 10 seconds
      const interval = setInterval(() => {
        fetchDashboard();
        fetchBalance();
        fetchNetworkInfo();
        fetchMempoolInfo();
        fetchHistory(); // ✅ Added
        fetchUtxos(); // ✅ Added
      }, intervalMs);

      return () => {
        clearTimeout(initialFetchTimeout);
        clearInterval(interval);
      };
    },
    [
      /* ... */
    ],
  );
}
```

### 2. Unified UTXO Hook with Zustand

**Updated**: `src/renderer/hooks/use-onchain-data.ts`

Enhanced the existing Zustand-based `useUtxos` hook:

```typescript
export function useUtxos() {
  const utxos = useOnchainStore((state) => state.utxos);
  const setUtxos = useOnchainStore((state) => state.setUtxos);
  // ...

  const fetchUtxos = useCallback(async () => {
    const result = await window.electronAPI.blockchain.listOwnCoins();
    if (result.success && result.coins) {
      setUtxos(result.coins as UTXO[]);
    }
  }, [setUtxos, setLoading, setError]);

  // ✅ Added calculateSummary helper
  const calculateSummary = useCallback(() => {
    const now = Date.now();
    let totalValue = 0;
    let confirmedCount = 0;
    // ... calculates stats from utxos array
    return {
      totalCount,
      totalValue,
      confirmedCount,
      confirmedValue,
      unconfirmedCount,
      unconfirmedValue,
      timeLockedCount,
      timeLockedValue,
      averageSize,
    };
  }, [utxos]);

  return {
    utxos,
    isRefreshing,
    fetchUtxos,
    calculateSummary, // ✅ Added
  };
}
```

### 3. Updated UTXO Type Definition

**Updated**: `src/store/onchain.store.ts`

Fixed UTXO interface to match actual API response:

```typescript
// OLD (incorrect)
export interface UTXO {
  status: string;
  block_height: string;
  timestamp: string;
}

// NEW (correct)
export interface UTXO {
  amount: string;
  confirmed: string | null; // Timestamp in milliseconds
  release_date: string | null; // Timestamp for time-locked UTXOs
}
```

### 4. Removed Local Fetching from Pages

**Updated Files**:

- `src/routes/_wallet/index.tsx`
- `src/routes/_wallet/history.tsx`
- `src/routes/_wallet/utxos.tsx`

**Before**:

```typescript
// Each page fetched its own data
const { history, fetchHistory } = useTransactionHistory();

useEffect(() => {
  fetchHistory(); // ❌ Manual fetch
}, [fetchHistory]);
```

**After**:

```typescript
// Pages just read from Zustand store
const { history, isRefreshing } = useTransactionHistory();
// ✅ No manual fetch - data comes from global auto-polling
```

### 5. Consolidated Import Sources

**Updated Files**:

- `src/routes/_wallet/index.tsx`
- `src/routes/_wallet/utxos.tsx`
- `src/components/sidebar/WalletSidebar.tsx`
- `src/components/utxos/utxo-columns.tsx`
- `src/components/utxos/utxo-table.tsx`
- `src/components/utxos/utxo-summary.tsx`

**Changed**:

```typescript
// OLD (separate hook with its own cache)
import { useUtxos } from "@/renderer/hooks/use-utxos";
import type { UTXO } from "@/renderer/hooks/use-utxos";

// NEW (centralized Zustand-based hook)
import { useUtxos } from "@/renderer/hooks/use-onchain-data";
import type { UTXO } from "@/store/onchain.store";
```

### 6. Deleted Duplicate Hook

**Deleted**: `src/renderer/hooks/use-utxos.ts`

The separate hook file was removed as all functionality was merged into the centralized `use-onchain-data.ts` hook.

## Architecture

### Before Fix

```
┌─────────────────────────────────────┐
│         Root Layout                 │
│    useAutoPolling (partial)         │
│  - Dashboard, Balance, Network      │
│  - Mempool                          │
└─────────────────────────────────────┘
              │
              ├─────────────────────────────────────┐
              │                                     │
    ┌─────────▼────────┐               ┌───────────▼──────────┐
    │  Wallet Overview │               │ Transaction History  │
    │                  │               │                      │
    │ ❌ Reads store    │               │ ✅ fetchHistory()     │
    │ ❌ No fetch       │               │ ✅ Populates store   │
    │ ❌ Empty data     │               │                      │
    └──────────────────┘               └──────────────────────┘
```

### After Fix

```
┌─────────────────────────────────────────────────────────┐
│              Root Layout (__root.tsx)                   │
│           useAutoPolling (complete)                     │
│  ✅ Dashboard, Balance, Network, Mempool                 │
│  ✅ Transaction History                                  │
│  ✅ UTXOs                                                │
│                                                         │
│  Fetches ALL data globally every 10s                   │
│  Populates Zustand store                               │
└─────────────────────────────────────────────────────────┘
              │
              ├────────────────────────────────────┐
              │                                    │
    ┌─────────▼────────┐              ┌───────────▼──────────┐
    │  Wallet Overview │              │ Transaction History  │
    │                  │              │                      │
    │ ✅ Reads store    │              │ ✅ Reads store        │
    │ ✅ Data available │              │ ✅ Data available    │
    │ ✅ Shows data     │              │                      │
    └──────────────────┘              └──────────────────────┘
```

## Data Flow

```
1. App starts → SplashScreen
2. Main app loads → useAutoPolling initializes
3. After 1 second → Initial fetch of ALL data
4. Data → Zustand store
5. All pages → Read from store (instant data)
6. Every 10s → Auto-refresh ALL data
```

## Benefits

### 1. **Consistent User Experience**

- All wallet data is available immediately on any page
- No more empty states due to missing fetches
- Uniform loading behavior across all routes

### 2. **Centralized Data Management**

- Single source of truth (Zustand store)
- Single polling mechanism (useAutoPolling)
- No duplicate fetch logic across pages

### 3. **Reduced Complexity**

- Pages are simpler (just read from store)
- No useEffect fetch boilerplate in every component
- Easier to maintain and debug

### 4. **Better Performance**

- Shared cache via Zustand
- No redundant API calls
- Efficient polling interval

### 5. **Type Safety**

- Unified UTXO type definition
- Consistent interfaces across components
- Single import source

## Testing Checklist

- [x] Visit wallet overview first → Shows transaction history
- [x] Visit wallet overview first → Shows UTXO stats
- [x] Navigate between wallet routes → Data persists
- [x] Wait 10 seconds → Data auto-refreshes
- [x] Open/close app → Initial fetch works
- [x] All pages use correct hooks
- [x] No linter errors
- [x] TypeScript compiles

## Files Changed

### Modified (11 files)

```
src/renderer/hooks/use-onchain-data.ts       # Added history/utxos to polling, added calculateSummary
src/store/onchain.store.ts                   # Fixed UTXO interface
src/routes/_wallet/index.tsx                 # Removed manual fetch, updated import
src/routes/_wallet/history.tsx               # Removed manual fetch
src/routes/_wallet/utxos.tsx                 # Removed manual fetch, updated import
src/components/sidebar/WalletSidebar.tsx     # Updated import
src/components/utxos/utxo-columns.tsx        # Updated import
src/components/utxos/utxo-table.tsx          # Updated import
src/components/utxos/utxo-summary.tsx        # Added UTXOSummary type definition
src/components/send/send-form-enhanced.tsx   # Fixed toggle crash (separate fix)
```

### Deleted (1 file)

```
src/renderer/hooks/use-utxos.ts              # Merged into use-onchain-data.ts
```

## Related Fixes

This PR also includes a fix for the send form toggle crash (see `docs/SEND-FORM-ENHANCEMENT.md`).

---

**Implementation Status**: ✅ **COMPLETE**
**Linter Errors**: 0
**Type Errors**: 0
**Ready for**: Testing, Review

---

**Summary**: Centralized all blockchain data fetching into `useAutoPolling` hook at the root layout level. All wallet pages now read from the Zustand store instead of fetching individually. This ensures data is always available regardless of which page is visited first.
