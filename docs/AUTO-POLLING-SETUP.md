# Auto-Polling Setup for Blockchain Data

## Overview

The Neptune wallet now automatically polls blockchain data as soon as the app loads and Neptune processes are successfully spawned. This document explains the setup and how it works.

## Architecture

### Flow Diagram

```
┌─────────────────┐
│  App Startup    │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ Splash Screen   │
│ - Spawn neptune │
│   -core         │
│ - Fetch cookie  │
│ - Spawn neptune │
│   -cli RPC      │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ onReady()       │
│ callback        │
└────────┬────────┘
         │
         v
┌─────────────────┐
│  Main App       │
│  Loads          │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ useAutoPolling  │
│ Hook Activates  │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ Continuous      │
│ Data Polling    │
│ Every 10s       │
└─────────────────┘
```

## Implementation

### 1. Root Route (`src/routes/__root.tsx`)

The root route was updated to:

- Separate the main app into a `MainApp` component
- Call `useAutoPolling(10000)` hook in the `MainApp` component
- Start polling immediately when splash screen completes

```tsx
const MainApp = () => {
  // Start auto-polling blockchain data every 10 seconds
  useAutoPolling(10000);

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 min-h-0">
        <SidebarWrapper />
        <main className="flex-1 overflow-auto">
          <div className="container py-6">
            <Outlet />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};
```

### 2. Auto-Polling Hook (`src/renderer/hooks/use-onchain-data.ts`)

The `useAutoPolling` hook:

- Fetches multiple data points in parallel
- Runs immediately on mount
- Sets up an interval for continuous polling
- Cleans up interval on unmount

```tsx
export function useAutoPolling(intervalMs = 10000) {
  const { fetchDashboard } = useDashboardData();
  const { fetchBalance } = useBalance();
  const { fetchNetworkInfo } = useNetworkInfo();
  const { fetchMempoolInfo } = useMempoolInfo();

  useEffect(() => {
    // Initial fetch
    fetchDashboard();
    fetchBalance();
    fetchNetworkInfo();
    fetchMempoolInfo();

    // Set up polling
    const interval = setInterval(() => {
      fetchDashboard();
      fetchBalance();
      fetchNetworkInfo();
      fetchMempoolInfo();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [
    intervalMs,
    fetchDashboard,
    fetchBalance,
    fetchNetworkInfo,
    fetchMempoolInfo,
  ]);
}
```

### 3. Data Hooks

Each data hook:

- Uses Zustand store selectors for optimal re-rendering
- Provides a `fetch` function for manual updates
- Tracks loading and error states
- Updates the global store when data arrives

Example:

```tsx
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

      if (result.success && result.data) {
        setDashboardData(result.data as DashboardOverviewData);
      } else {
        setError(result.error || "Failed to fetch dashboard data");
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
```

## What Gets Polled

Every 10 seconds, the app fetches:

1. **Dashboard Overview** (`dashboard_overview_data`)
   - Balance (confirmed & unconfirmed)
   - Block height & tip digest
   - Peer count
   - Mining status
   - Sync status
   - Mempool stats
   - CPU temperature

2. **Balance** (`confirmed_available_balance`, `unconfirmed_available_balance`)
   - Confirmed balance
   - Unconfirmed/pending balance

3. **Network Info** (`network`, `block_height`)
   - Network type (main/testnet)
   - Current block height

4. **Mempool Info** (`mempool_tx_count`, `mempool_size`)
   - Transaction count
   - Mempool size in bytes

## Accessing Polled Data in Components

### Option 1: Use Hooks (Recommended)

```tsx
import { useDashboardData } from "@/renderer/hooks/use-onchain-data";

function MyComponent() {
  const { data, isRefreshing } = useDashboardData();

  return (
    <div>
      <p>Block Height: {data?.tip_header.height}</p>
      <p>Balance: {data?.confirmed_available_balance}</p>
    </div>
  );
}
```

### Option 2: Direct Store Access

```tsx
import { useOnchainStore } from "@/store/onchain.store";

function MyComponent() {
  const dashboardData = useOnchainStore((state) => state.dashboardData);
  const confirmedBalance = useOnchainStore((state) => state.confirmedBalance);

  return (
    <div>
      <p>Balance: {confirmedBalance}</p>
    </div>
  );
}
```

## Manual Data Fetching

You can also fetch data manually on-demand:

```tsx
import { useDashboardData } from "@/renderer/hooks/use-onchain-data";

function MyComponent() {
  const { data, fetchDashboard, isRefreshing } = useDashboardData();

  return (
    <div>
      <button onClick={fetchDashboard} disabled={isRefreshing}>
        {isRefreshing ? "Refreshing..." : "Refresh"}
      </button>
    </div>
  );
}
```

## Customizing Poll Interval

To change the polling interval, update the value in `__root.tsx`:

```tsx
// Poll every 5 seconds
useAutoPolling(5000);

// Poll every 30 seconds
useAutoPolling(30000);
```

## Conditional Polling

If you need to conditionally enable/disable polling:

```tsx
const MainApp = () => {
    const isOnline = useOnlineStatus(); // Custom hook

    // Only poll when online
    if (isOnline) {
        useAutoPolling(10000);
    }

    return (/* ... */);
};
```

## Performance Considerations

### Optimized Selectors

The hooks use Zustand's selector pattern to prevent unnecessary re-renders:

```tsx
// ✅ Only re-renders when dashboardData changes
const dashboardData = useOnchainStore((state) => state.dashboardData);

// ❌ Re-renders on ANY store change
const store = useOnchainStore();
```

### Parallel Requests

All polling requests are made in parallel for optimal performance:

```tsx
// These all fire simultaneously, not sequentially
fetchDashboard();
fetchBalance();
fetchNetworkInfo();
fetchMempoolInfo();
```

### Request Deduplication

The hooks use `useCallback` to ensure fetch functions don't recreate unnecessarily, preventing duplicate polling intervals.

## Error Handling

Errors are stored in the global store:

```tsx
const error = useOnchainStore((state) => state.error);

if (error) {
  return <div>Error: {error}</div>;
}
```

## Loading States

Track loading across the entire store:

```tsx
const isLoading = useOnchainStore((state) => state.isLoading);

if (isLoading) {
  return <Spinner />;
}
```

## Data Freshness

Check when data was last updated:

```tsx
const lastUpdate = useOnchainStore((state) => state.lastUpdate);

const minutesAgo = lastUpdate
  ? Math.floor((Date.now() - lastUpdate) / 60000)
  : null;

return <div>Last updated: {minutesAgo} minutes ago</div>;
```

## Debugging

To see polling activity in the console:

1. Open DevTools (Ctrl+Shift+I)
2. Watch for:
   - `"🚀 Initializing Neptune from splash screen..."` (startup)
   - `"✅ Splash screen ready, loading main app with auto-polling"` (transition)
   - RPC request/response logs from `neptune-rpc.service.ts`

## Testing

To test the polling:

1. Start the app: `pnpm start`
2. Wait for splash screen to complete
3. Open DevTools console
4. Watch for periodic RPC calls every 10 seconds
5. Observe UI updates as data arrives

## Files Modified

- `src/routes/__root.tsx` - Integrated `useAutoPolling`
- `src/renderer/hooks/use-onchain-data.ts` - All data hooks and auto-polling
- `src/shared/types/api-types.ts` - Added `blockchain` API types
- `src/store/onchain.store.ts` - Zustand store for all blockchain data

## Next Steps

### Additional Polling Endpoints

To add more data to the auto-poll loop:

1. Import the hook in `useAutoPolling`:

   ```tsx
   import { useTransactionHistory } from "@/renderer/hooks/use-onchain-data";
   ```

2. Call the fetch function:

   ```tsx
   const { fetchHistory } = useTransactionHistory();

   useEffect(() => {
     // Initial
     fetchHistory();

     // Interval
     const interval = setInterval(() => {
       fetchHistory();
     }, intervalMs);

     return () => clearInterval(interval);
   }, [fetchHistory, intervalMs]);
   ```

### Smart Polling

Implement adaptive polling based on activity:

```tsx
export function useSmartPolling() {
  const { syncing } = useOnchainStore((state) => state.dashboardData || {});

  // Poll faster when syncing
  const interval = syncing ? 5000 : 30000;

  useAutoPolling(interval);
}
```

### Background Sync

Use Web Workers for background polling (future enhancement).

---

**Last Updated**: 2025-10-09
**Version**: 1.0.0
**Status**: ✅ Production Ready
