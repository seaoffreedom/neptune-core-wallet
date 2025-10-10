# Blockchain Data Fetching

This document describes the blockchain data fetching infrastructure using HTTP JSON-RPC calls to `neptune-cli`.

## Overview

The app now has two separate systems for interacting with Neptune:

1. **Process Management** (`neptune-process-manager.ts`) - Handles spawning and managing `neptune-core` and `neptune-cli` processes
2. **Data Fetching** (`neptune-rpc.service.ts`) - Makes HTTP JSON-RPC calls to `neptune-cli` RPC server for blockchain data

## Architecture

### Main Process

- **`src/main/services/neptune-rpc.service.ts`** - HTTP client using `ky` for JSON-RPC calls
- **`src/main/ipc/handlers/blockchain-handlers.ts`** - IPC handlers for blockchain data requests

### Preload

- **`src/preload/api/blockchain-api.ts`** - Exposes blockchain methods to renderer via context bridge

### Renderer

- **`src/renderer/hooks/use-blockchain-api.ts`** - React hook for easy blockchain data fetching
- Automatically sets the RPC cookie from Zustand store when it changes

## Available RPC Methods

All methods use the authentication cookie stored in the Zustand `neptune.store`:

### Dashboard Data

```typescript
getDashboardOverview() -> DashboardOverviewData
```

Returns comprehensive dashboard data including:

- Balance (confirmed/unconfirmed)
- Block height and sync status
- Peer count and network info
- Mempool statistics
- Mining status

### Individual Queries

```typescript
getBlockHeight() -> string
getNetwork() -> string
getBalance() -> { confirmed: string, unconfirmed: string }
getWalletStatus() -> Record<string, unknown>
getNextReceivingAddress() -> string
getTransactionHistory() -> unknown[]
```

## Usage Example

```tsx
import { useBlockchainAPI } from "@/renderer/hooks/use-blockchain-api";

function MyComponent() {
  const blockchainAPI = useBlockchainAPI();

  const fetchData = async () => {
    // Cookie is automatically set from Zustand store
    const result = await blockchainAPI.getDashboardOverview();

    if (result.success) {
      console.log("Dashboard data:", result.data);
      // Use result.data.tip_header.height, result.data.confirmed_available_balance, etc.
    } else {
      console.error("Error:", result.error);
    }
  };

  return <button onClick={fetchData}>Fetch Data</button>;
}
```

## Authentication Flow

1. `neptune-process-manager` fetches the cookie during startup using `neptune-cli --get-cookie`
2. Cookie is stored in Zustand `neptune.store`
3. `use-blockchain-api` hook automatically calls `setBlockchainCookie()` when cookie changes
4. All subsequent RPC calls include the cookie in the `Cookie` header

## Error Handling

All methods return a consistent response format:

```typescript
{
    success: boolean;
    data?: T;        // On success
    error?: string;  // On failure
}
```

## Implementation Details

### JSON-RPC Request Format

```json
{
  "jsonrpc": "2.0",
  "method": "dashboard_overview_data",
  "params": {},
  "id": 1
}
```

### HTTP Headers

```
Content-Type: application/json
Cookie: neptune-cli=<authentication-cookie>
```

### RPC Server Configuration

- Default port: `9802`
- Configurable in `neptune-process-manager.ts`

## Testing

A test UI is available on the index route:

1. Start the app (processes start automatically)
2. Click "Fetch Dashboard Data" button
3. View the returned JSON data in the UI

## Future Enhancements

- [ ] Add request/response caching
- [ ] Implement real-time data polling with configurable intervals
- [ ] Add retry logic with exponential backoff
- [ ] Create typed interfaces for all RPC response types
- [ ] Add request queuing to prevent overwhelming the RPC server
