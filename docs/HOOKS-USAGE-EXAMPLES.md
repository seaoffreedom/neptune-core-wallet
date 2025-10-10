# Onchain Data Hooks - Usage Examples

This document provides comprehensive examples of how to use the onchain data hooks in your React components.

## Table of Contents

1. [Basic Usage](#basic-usage)
2. [Tier 1: Critical Hooks](#tier-1-critical-hooks)
3. [Tier 2: Important Hooks](#tier-2-important-hooks)
4. [Tier 3: Advanced Hooks](#tier-3-advanced-hooks)
5. [Auto-Polling](#auto-polling)
6. [Complete Component Examples](#complete-component-examples)

---

## Basic Usage

All hooks are available from `@/renderer/hooks/use-onchain-data`:

```tsx
import {
  useDashboardData,
  useBalance,
  useNetworkInfo,
  // ... other hooks
} from "@/renderer/hooks/use-onchain-data";
```

---

## Tier 1: Critical Hooks

### 1. Dashboard Overview

```tsx
import { useDashboardData } from "@/renderer/hooks/use-onchain-data";

function DashboardOverview() {
  const { data, isRefreshing, fetchDashboard, lastUpdate } = useDashboardData();

  // Fetch on component mount
  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (!data) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div>
      <h2>Wallet Dashboard</h2>
      <p>Block Height: {data.tip_header.height}</p>
      <p>Confirmed Balance: {data.confirmed_available_balance}</p>
      <p>Peer Count: {data.peer_count}</p>
      <p>Syncing: {data.syncing ? "Yes" : "No"}</p>
      <p>Mining: {data.mining_status}</p>

      <button onClick={fetchDashboard} disabled={isRefreshing}>
        {isRefreshing ? "Refreshing..." : "Refresh"}
      </button>

      {lastUpdate && (
        <p>Last updated: {new Date(lastUpdate).toLocaleTimeString()}</p>
      )}
    </div>
  );
}
```

### 2. Balance Display

```tsx
import { useBalance } from "@/renderer/hooks/use-onchain-data";

function WalletBalance() {
  const { confirmed, unconfirmed, isRefreshing, fetchBalance } = useBalance();

  useEffect(() => {
    fetchBalance();
    // Poll every 30 seconds
    const interval = setInterval(fetchBalance, 30000);
    return () => clearInterval(interval);
  }, [fetchBalance]);

  return (
    <div className="balance-card">
      <h3>Wallet Balance</h3>
      <div>
        <label>Confirmed:</label>
        <span>{confirmed || "0.00000000"} NPT</span>
      </div>
      <div>
        <label>Pending:</label>
        <span>{unconfirmed || "0.00000000"} NPT</span>
      </div>
      {isRefreshing && <span className="spinner">↻</span>}
    </div>
  );
}
```

### 3. Network Information

```tsx
import { useNetworkInfo } from "@/renderer/hooks/use-onchain-data";

function NetworkStatus() {
  const { network, blockHeight, isRefreshing, fetchNetworkInfo } =
    useNetworkInfo();

  useEffect(() => {
    fetchNetworkInfo();
  }, [fetchNetworkInfo]);

  return (
    <div>
      <h3>Network Status</h3>
      <div>Network: {network || "Unknown"}</div>
      <div>Block Height: {blockHeight || "..."}</div>
    </div>
  );
}
```

### 4. Transaction History

```tsx
import { useTransactionHistory } from "@/renderer/hooks/use-onchain-data";

function TransactionList() {
  const { history, isRefreshing, fetchHistory } = useTransactionHistory();

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return (
    <div>
      <h3>Recent Transactions</h3>
      <button onClick={fetchHistory} disabled={isRefreshing}>
        Refresh
      </button>

      {history.length === 0 ? (
        <p>No transactions yet</p>
      ) : (
        <ul>
          {history.map((tx, index) => (
            <li key={index}>
              <div>Amount: {tx.amount}</div>
              <div>Height: {tx.block_height}</div>
              <div>Time: {new Date(Number(tx.timestamp)).toLocaleString()}</div>
              <div>Digest: {tx.digest.slice(0, 16)}...</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### 5. Receiving Address

```tsx
import { useReceivingAddress } from "@/renderer/hooks/use-onchain-data";
import { useState } from "react";

function ReceiveAddress() {
  const { address, isRefreshing, fetchAddress } = useReceivingAddress();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!address) {
      fetchAddress();
    }
  }, [address, fetchAddress]);

  const copyToClipboard = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="receive-address">
      <h3>Receive Neptune</h3>
      {address ? (
        <>
          <code>{address}</code>
          <button onClick={copyToClipboard}>
            {copied ? "Copied!" : "Copy Address"}
          </button>
          <button onClick={fetchAddress}>Generate New</button>
        </>
      ) : (
        <div>Loading address...</div>
      )}
    </div>
  );
}
```

### 6. Send Transaction

```tsx
import { useSendTransaction } from "@/renderer/hooks/use-onchain-data";
import { useState } from "react";

function SendForm() {
  const { send, sendTransparent, isSending, error, txResult } =
    useSendTransaction();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [usePrivacy, setUsePrivacy] = useState(true);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    const params = {
      outputs: [{ address: recipient, amount }],
      fee: "0.001",
    };

    const result = usePrivacy
      ? await send(params)
      : await sendTransparent(params);

    if (result) {
      console.log("Transaction sent:", result);
      // Clear form
      setRecipient("");
      setAmount("");
    }
  };

  return (
    <form onSubmit={handleSend}>
      <h3>Send Neptune</h3>

      <input
        type="text"
        placeholder="Recipient address"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
        required
      />

      <input
        type="text"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
      />

      <label>
        <input
          type="checkbox"
          checked={usePrivacy}
          onChange={(e) => setUsePrivacy(e.target.checked)}
        />
        Private transaction (recommended)
      </label>

      <button type="submit" disabled={isSending}>
        {isSending ? "Sending..." : "Send"}
      </button>

      {error && <div className="error">{error}</div>}
      {txResult && (
        <div className="success">Transaction sent successfully!</div>
      )}
    </form>
  );
}
```

---

## Tier 2: Important Hooks

### 7. Mempool Information

```tsx
import { useMempoolInfo } from "@/renderer/hooks/use-onchain-data";

function MempoolStatus() {
  const {
    txCount,
    size,
    overview,
    isRefreshing,
    fetchMempoolInfo,
    fetchMempoolOverview,
  } = useMempoolInfo();

  useEffect(() => {
    fetchMempoolInfo();
    fetchMempoolOverview(0, 10); // Get first 10 transactions
  }, [fetchMempoolInfo, fetchMempoolOverview]);

  return (
    <div>
      <h3>Mempool Status</h3>
      <div>
        <p>Transactions: {txCount}</p>
        <p>Size: {size ? `${(size / 1024).toFixed(2)} KB` : "..."}</p>
      </div>

      {overview && overview.transactions.length > 0 && (
        <div>
          <h4>Recent Mempool Transactions</h4>
          <ul>
            {overview.transactions.map((tx) => (
              <li key={tx.tx_id}>
                <div>Fee: {tx.fee}</div>
                <div>Size: {tx.size} bytes</div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button onClick={fetchMempoolInfo} disabled={isRefreshing}>
        Refresh
      </button>
    </div>
  );
}
```

### 8. UTXO Management

```tsx
import { useUtxos } from "@/renderer/hooks/use-onchain-data";

function UtxoList() {
  const { utxos, isRefreshing, fetchUtxos } = useUtxos();

  useEffect(() => {
    fetchUtxos();
  }, [fetchUtxos]);

  return (
    <div>
      <h3>UTXOs ({utxos.length})</h3>
      <button onClick={fetchUtxos} disabled={isRefreshing}>
        {isRefreshing ? "Loading..." : "Refresh"}
      </button>

      <table>
        <thead>
          <tr>
            <th>Status</th>
            <th>Block Height</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {utxos.map((utxo, index) => (
            <tr key={index}>
              <td>{utxo.status}</td>
              <td>{utxo.block_height}</td>
              <td>{new Date(Number(utxo.timestamp)).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### 9. Peer Information

```tsx
import { usePeerInfo } from "@/renderer/hooks/use-onchain-data";

function PeerList() {
  const { peers, peerCount, isRefreshing, fetchPeerInfo } = usePeerInfo();

  useEffect(() => {
    fetchPeerInfo();
  }, [fetchPeerInfo]);

  return (
    <div>
      <h3>Connected Peers ({peerCount})</h3>
      <button onClick={fetchPeerInfo} disabled={isRefreshing}>
        Refresh
      </button>

      <ul>
        {peers.map((peer, index) => (
          <li key={index}>
            <span>{peer.address}</span>
            <span className={peer.connected ? "online" : "offline"}>
              {peer.connected ? "● Online" : "○ Offline"}
            </span>
            <span>
              Last seen: {new Date(peer.lastSeen * 1000).toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 10. Address & Amount Validation

```tsx
import { useAddressValidation } from "@/renderer/hooks/use-onchain-data";
import { useState, useEffect } from "react";

function ValidatedInput() {
  const { validateAddress, validateAmount, isValidating, error } =
    useAddressValidation();
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [addressValid, setAddressValid] = useState<boolean | null>(null);
  const [amountValid, setAmountValid] = useState<boolean | null>(null);

  // Debounce validation
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (address) {
        const isValid = await validateAddress(address);
        setAddressValid(isValid);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [address, validateAddress]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (amount) {
        const isValid = await validateAmount(amount);
        setAmountValid(isValid);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [amount, validateAmount]);

  return (
    <div>
      <div>
        <input
          type="text"
          placeholder="Neptune address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className={
            addressValid === null ? "" : addressValid ? "valid" : "invalid"
          }
        />
        {addressValid === false && <span>Invalid address</span>}
        {addressValid === true && <span>✓ Valid</span>}
      </div>

      <div>
        <input
          type="text"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className={
            amountValid === null ? "" : amountValid ? "valid" : "invalid"
          }
        />
        {amountValid === false && <span>Invalid amount</span>}
        {amountValid === true && <span>✓ Valid</span>}
      </div>

      {isValidating && <span>Validating...</span>}
      {error && <div className="error">{error}</div>}
    </div>
  );
}
```

---

## Tier 3: Advanced Hooks

### 11. Mining Control

```tsx
import { useMining } from "@/renderer/hooks/use-onchain-data";

function MiningControls() {
  const { status, pauseMiner, restartMiner, isLoading, error } = useMining();

  return (
    <div>
      <h3>Mining Control</h3>
      <div>Status: {status}</div>

      {status === "active" ? (
        <button onClick={pauseMiner} disabled={isLoading}>
          Pause Mining
        </button>
      ) : (
        <button onClick={restartMiner} disabled={isLoading}>
          Start Mining
        </button>
      )}

      {error && <div className="error">{error}</div>}
    </div>
  );
}
```

### 12. Wallet Management (Seed Phrase)

```tsx
import { useWalletManagement } from "@/renderer/hooks/use-onchain-data";
import { useState } from "react";

function WalletBackup() {
  const { exportSeedPhrase, importSeedPhrase, isLoading, error } =
    useWalletManagement();
  const [seedPhrase, setSeedPhrase] = useState("");
  const [showExport, setShowExport] = useState(false);

  const handleExport = async () => {
    const phrase = await exportSeedPhrase();
    if (phrase) {
      setSeedPhrase(phrase);
      setShowExport(true);
    }
  };

  const handleImport = async () => {
    const success = await importSeedPhrase(seedPhrase);
    if (success) {
      alert("Wallet restored successfully!");
      setSeedPhrase("");
    }
  };

  return (
    <div>
      <h3>Wallet Backup & Restore</h3>

      <div>
        <h4>Export Seed Phrase</h4>
        <button onClick={handleExport} disabled={isLoading}>
          Export Seed Phrase
        </button>

        {showExport && seedPhrase && (
          <div className="seed-phrase-warning">
            <p>⚠️ Keep this safe! Never share with anyone!</p>
            <code>{seedPhrase}</code>
            <button onClick={() => setShowExport(false)}>Hide</button>
          </div>
        )}
      </div>

      <div>
        <h4>Import Seed Phrase</h4>
        <textarea
          placeholder="Enter your 24-word seed phrase"
          value={seedPhrase}
          onChange={(e) => setSeedPhrase(e.target.value)}
          rows={3}
        />
        <button onClick={handleImport} disabled={isLoading || !seedPhrase}>
          Restore Wallet
        </button>
      </div>

      {error && <div className="error">{error}</div>}
    </div>
  );
}
```

---

## Auto-Polling

### 13. Automatic Data Updates

```tsx
import { useAutoPolling } from "@/renderer/hooks/use-onchain-data";
import { useOnchainStore } from "@/store/onchain.store";

function AutoUpdatingDashboard() {
  // Automatically poll every 10 seconds (default)
  useAutoPolling(10000);

  // Access data from the store
  const { dashboardData, confirmedBalance, blockHeight, mempoolTxCount } =
    useOnchainStore();

  return (
    <div>
      <h2>Live Dashboard</h2>
      <p>Updates automatically every 10 seconds</p>

      <div className="stats">
        <div>Balance: {confirmedBalance || "..."}</div>
        <div>Block Height: {blockHeight || "..."}</div>
        <div>Mempool: {mempoolTxCount || 0} txs</div>
        <div>Syncing: {dashboardData?.syncing ? "Yes" : "No"}</div>
      </div>
    </div>
  );
}
```

---

## Complete Component Examples

### Full Wallet Dashboard

```tsx
import {
  useAutoPolling,
  useBalance,
  useNetworkInfo,
  usePeerInfo,
  useMempoolInfo,
} from "@/renderer/hooks/use-onchain-data";

function FullWalletDashboard() {
  // Auto-poll critical data
  useAutoPolling(15000);

  const { confirmed, unconfirmed } = useBalance();
  const { network, blockHeight } = useNetworkInfo();
  const { peerCount } = usePeerInfo();
  const { txCount, size } = useMempoolInfo();

  return (
    <div className="dashboard">
      <header>
        <h1>Neptune Wallet</h1>
        <div className="network-badge">{network}</div>
      </header>

      <div className="balance-section">
        <h2>Balance</h2>
        <div className="balance-confirmed">{confirmed} NPT</div>
        {unconfirmed !== confirmed && (
          <div className="balance-pending">+{unconfirmed} NPT pending</div>
        )}
      </div>

      <div className="stats-grid">
        <div className="stat">
          <label>Block Height</label>
          <value>{blockHeight}</value>
        </div>
        <div className="stat">
          <label>Peers</label>
          <value>{peerCount}</value>
        </div>
        <div className="stat">
          <label>Mempool</label>
          <value>{txCount} txs</value>
        </div>
        <div className="stat">
          <label>Mempool Size</label>
          <value>{size ? `${(size / 1024).toFixed(1)} KB` : "..."}</value>
        </div>
      </div>
    </div>
  );
}
```

---

## Direct API Access (Without Hooks)

If you need to call the blockchain API directly without using hooks:

```tsx
async function directApiCall() {
  // Call any blockchain endpoint directly
  const balanceResult = await window.electronAPI.blockchain.getBalance();

  if (balanceResult.success) {
    console.log("Confirmed:", balanceResult.confirmed);
    console.log("Unconfirmed:", balanceResult.unconfirmed);
  } else {
    console.error("Error:", balanceResult.error);
  }

  // Send transaction
  const sendResult = await window.electronAPI.blockchain.send({
    outputs: [{ address: "npt1...", amount: "1.0" }],
    fee: "0.001",
  });

  // Validate address
  const validResult = await window.electronAPI.blockchain.validateAddress({
    address: "npt1...",
  });

  console.log("Is valid address:", validResult.isValid);
}
```

---

## Best Practices

1. **Use hooks for component-level state** - Hooks automatically manage loading states and errors
2. **Use Zustand store for global state** - Access data across components without prop drilling
3. **Use auto-polling for dashboard views** - Keep data fresh automatically
4. **Validate user input** - Use validation hooks before submitting transactions
5. **Handle errors gracefully** - All hooks provide error states
6. **Show loading indicators** - All hooks provide `isLoading`/`isRefreshing` states
7. **Debounce validations** - Don't validate on every keystroke

---

## TypeScript Support

All hooks are fully typed. TypeScript will provide autocomplete and type checking:

```tsx
import { useDashboardData } from "@/renderer/hooks/use-onchain-data";

function TypedComponent() {
  const { data } = useDashboardData();

  // TypeScript knows the exact structure
  if (data) {
    const height: number = data.tip_header.height;
    const balance: string = data.confirmed_available_balance;
    const syncing: boolean = data.syncing;
  }

  return <div>...</div>;
}
```

---

## Summary

- ✅ **40 endpoints** exposed via hooks
- ✅ **Type-safe** with full TypeScript support
- ✅ **Auto-polling** for real-time updates
- ✅ **Zustand integration** for global state
- ✅ **Error handling** built into every hook
- ✅ **Loading states** for better UX

For more details, see:

- `src/renderer/hooks/use-onchain-data.ts` - Hook implementations
- `src/store/onchain.store.ts` - Zustand store
- `src/preload/api/blockchain-api.ts` - Preload API
