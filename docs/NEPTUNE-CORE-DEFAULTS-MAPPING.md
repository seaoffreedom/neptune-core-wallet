# Neptune Core CLI Arguments - Default Values Mapping

**Source**: `/neptune-core/src/application/config/cli_args.rs`
**Date Verified**: 2025-10-10
**Commit**: Latest from neptune-core repository

This document maps all neptune-core CLI arguments to their default values and TypeScript implementations.

---

## Network Settings

### Basic Network Configuration

| CLI Flag             | Rust Default | TypeScript Default | Type          | Notes                                        |
| -------------------- | ------------ | ------------------ | ------------- | -------------------------------------------- |
| `--network`          | `"main"`     | `"main"`           | `NetworkType` | Options: main, alpha, beta, testnet, regtest |
| `--peer-port`        | `9798`       | `9798`             | `number`      | Port for peer connections                    |
| `--rpc-port`         | `9799`       | `9799`             | `number`      | Port for RPC connections                     |
| `--peer-listen-addr` | `"::"`       | `"::"`             | `string`      | IPv6 all interfaces (includes IPv4)          |

### Peer Management

| CLI Flag                   | Rust Default | TypeScript Default | Type       | Notes                        |
| -------------------------- | ------------ | ------------------ | ---------- | ---------------------------- |
| `--peer`                   | `[]`         | `[]`               | `string[]` | Array of "ip:port" strings   |
| `--max-num-peers`          | `10`         | `10`               | `number`   | Maximum incoming connections |
| `--max-connections-per-ip` | `None`       | `undefined`        | `number?`  | Optional limit per IP        |
| `--peer-tolerance`         | `1000`       | `1000`             | `number`   | Bad standing threshold       |
| `--reconnect-cooldown`     | `1800`       | `1800`             | `number`   | Seconds before reconnection  |
| `--restrict-peers-to-list` | `false`      | `false`            | `boolean`  | Disable peer discovery       |
| `--bootstrap`              | `false`      | `false`            | `boolean`  | Act as bootstrapper node     |

### Security - Network Bans

| CLI Flag | Rust Default | TypeScript Default | Type       | Notes               |
| -------- | ------------ | ------------------ | ---------- | ------------------- |
| `--ban`  | `[]`         | `[]`               | `string[]` | Banned IP addresses |

---

## Mining Settings

### Step 1: Transaction Proof Upgrading

| CLI Flag               | Rust Default | TypeScript Default | Type      | Notes                       |
| ---------------------- | ------------ | ------------------ | --------- | --------------------------- |
| `--tx-proof-upgrading` | `false`      | `false`            | `boolean` | Enable proof upgrading      |
| `--tx-upgrade-filter`  | `"1:0"`      | `"1:0"`            | `string`  | Format: "divisor:remainder" |
| `--gobbling-fraction`  | `0.6`        | `0.6`              | `number`  | Fee fraction consumed (0-1) |
| `--min-gobbling-fee`   | `0.01`       | `0.01`             | `number`  | Minimum fee in coins        |

### Step 2: Block Composition

| CLI Flag                        | Rust Default | TypeScript Default | Type       | Notes                         |
| ------------------------------- | ------------ | ------------------ | ---------- | ----------------------------- |
| `--compose`                     | `false`      | `false`            | `boolean`  | Produce block proposals       |
| `--max-num-compose-mergers`     | `1`          | `1`                | `number`   | Max single-proof txs to merge |
| `--secret-compositions`         | `false`      | `false`            | `boolean`  | Don't share block proposals   |
| `--whitelisted-composer`        | `[]`         | `[]`               | `string[]` | Allowed composer IPs          |
| `--ignore-foreign-compositions` | `false`      | `false`            | `boolean`  | Ignore all peer compositions  |

### Step 3: Guessing (Nonce Finding)

| CLI Flag                                 | Rust Default | TypeScript Default | Type      | Notes                               |
| ---------------------------------------- | ------------ | ------------------ | --------- | ----------------------------------- |
| `--guess`                                | `false`      | `false`            | `boolean` | Enable nonce guessing               |
| `--guesser-threads`                      | `None`       | `undefined`        | `number?` | Defaults to CPU core count          |
| `--guesser-fraction`                     | `0.5`        | `0.5`              | `number`  | Fraction of subsidy to guesser      |
| `--minimum-guesser-fraction`             | `0.5`        | `0.5`              | `number`  | Min fraction to start guessing      |
| `--minimum-guesser-improvement-fraction` | `0.17`       | `0.17`             | `number`  | Min improvement to switch proposals |

---

## Performance Settings

### Proof Generation

| CLI Flag                              | Rust Default | TypeScript Default | Type      | Notes                           |
| ------------------------------------- | ------------ | ------------------ | --------- | ------------------------------- |
| `--max-log2-padded-height-for-proofs` | `None`       | `undefined`        | `number?` | Range: 10-32, no limit if unset |
| `--max-num-proofs`                    | `16`         | `16`               | `number`  | Max proofs in ProofCollection   |
| `--triton-vm-env-vars`                | `""`         | `undefined`        | `string?` | Format: 'height:"KEY=VAL ..."'  |

### Sync & Memory

| CLI Flag                | Rust Default | TypeScript Default | Type     | Notes                   |
| ----------------------- | ------------ | ------------------ | -------- | ----------------------- |
| `--sync-mode-threshold` | `1000`       | `1000`             | `number` | Blocks before sync mode |
| `--max-mempool-size`    | `"1G"`       | `"1G"`             | `string` | Format: B, K, M, G      |

### Transaction Capability

| CLI Flag                   | Rust Default | TypeScript Default | Type                   | Notes                      |
| -------------------------- | ------------ | ------------------ | ---------------------- | -------------------------- |
| `--tx-proving-capability`  | `None`       | `undefined`        | `TxProvingCapability?` | Auto-estimated if not set  |
| `--number-of-mps-per-utxo` | `3`          | `3`                | `number`               | Membership proofs per UTXO |

**TxProvingCapability Options**:

- `lockscript` - Basic (not private, leaks info)
- `proofcollection` - Medium (2+ cores, 16GB RAM)
- `singleproof` - Advanced (19+ cores, 120GB RAM)

---

## Security Settings

### Privacy & Access Control

| CLI Flag                | Rust Default | TypeScript Default | Type       | Notes                          |
| ----------------------- | ------------ | ------------------ | ---------- | ------------------------------ |
| `--disable-cookie-hint` | `false`      | `false`            | `boolean`  | Disable data directory RPC API |
| `--ban`                 | `[]`         | `[]`               | `string[]` | Banned IP addresses            |

### Transaction Controls

| CLI Flag                      | Rust Default           | TypeScript Default     | Type                    | Notes                         |
| ----------------------------- | ---------------------- | ---------------------- | ----------------------- | ----------------------------- |
| `--no-transaction-initiation` | `false`                | `false`                | `boolean`               | Refuse to create transactions |
| `--fee-notification`          | `"on-chain-symmetric"` | `"on-chain-symmetric"` | `FeeNotificationMethod` | UTXO backup strategy          |

**FeeNotificationMethod Options**:

- `on-chain-symmetric` - Symmetric encryption (default)
- `on-chain-generation` - Public key encryption (larger)
- `off-chain` - No backup (risks loss)

### Block Scanning (Wallet Recovery)

| CLI Flag        | Rust Default | TypeScript Default | Type      | Notes                             |
| --------------- | ------------ | ------------------ | --------- | --------------------------------- |
| `--scan-blocks` | `None`       | `undefined`        | `string?` | Format: "..", "..1337", "13..=37" |
| `--scan-keys`   | `None`       | `undefined`        | `number?` | Number of future keys to scan     |

---

## Data & Storage Settings

| CLI Flag                               | Rust Default | TypeScript Default | Type      | Notes                             |
| -------------------------------------- | ------------ | ------------------ | --------- | --------------------------------- |
| `--data-dir`                           | `None`       | `undefined`        | `string?` | Custom data directory path        |
| `--import-blocks-from-directory`       | `None`       | `undefined`        | `string?` | Bootstrap from blocks             |
| `--import-block-flush-period`          | `250`        | `250`              | `number`  | Blocks between DB flush (0=never) |
| `--disable-validation-in-block-import` | `false`      | `false`            | `boolean` | Faster import, skip validation    |

**Data Directory Defaults** (OS-specific):

- **Linux**: `~/.config/neptune/core/{network}`
- **Windows**: `%APPDATA%\neptune\core\{network}`
- **macOS**: `~/Library/Application Support/neptune/{network}`

---

## Advanced Settings

### Development & Debugging

| CLI Flag          | Rust Default | TypeScript Default | Type      | Notes                        |
| ----------------- | ------------ | ------------------ | --------- | ---------------------------- |
| `--tokio-console` | `false`      | `false`            | `boolean` | Enable tokio-console tracing |

### Block Notification

| CLI Flag         | Rust Default | TypeScript Default | Type      | Notes                                |
| ---------------- | ------------ | ------------------ | --------- | ------------------------------------ |
| `--block-notify` | `None`       | `undefined`        | `string?` | Command when block changes (%s=hash) |

---

## Verification Summary

✅ **All defaults verified** against neptune-core source code
✅ **All CLI flags mapped** to TypeScript interfaces
✅ **Type safety** ensured with strict TypeScript types
✅ **Documentation** matches neptune-core help output

### Missing from neptune-core CLI args (Not Implemented):

_None - All fields in our TypeScript interfaces map to actual CLI flags_

### Additional neptune-core CLI args not yet implemented:

- `--import-blocks-from-directory` - Implemented ✅
- `--import-block-flush-period` - Implemented ✅
- `--disable-validation-in-block-import` - Implemented ✅
- `--block-notify` - Implemented ✅
- `--ban` - Implemented ✅
- `--max-connections-per-ip` - Implemented ✅
- `--triton-vm-env-vars` - Implemented ✅
- `--whitelisted-composer` - Implemented ✅
- `--scan-blocks` - Implemented ✅
- `--scan-keys` - Implemented ✅
- `--reconnect-cooldown` - Implemented ✅
- `--disable-cookie-hint` - Implemented ✅

All CLI flags are now implemented! ✅

---

## Usage in Wallet

### Storage Location

Settings are persisted using `electron-store` with encryption:

- **Linux**: `~/.config/neptune-core-wallet/neptune-core-settings.json`
- **Windows**: `%APPDATA%\neptune-core-wallet\neptune-core-settings.json`
- **macOS**: `~/Library/Application Support/neptune-core-wallet/neptune-core-settings.json`

### Initialization

Settings are automatically initialized with defaults on first run:

```typescript
// In src/main/index.ts
app.whenReady().then(async () => {
  // Initialize settings on first run (must happen before IPC handlers)
  await settingsInitializerService.initializeSettings();
  // ...
});
```

### Access from Renderer

```typescript
// Get all settings
const result = await window.electronAPI.neptuneCoreSettings.getAll();

// Update network settings
const result = await window.electronAPI.neptuneCoreSettings.updateNetwork({
  maxNumPeers: 20,
  peerPort: 9798,
});

// Reset to defaults
const result = await window.electronAPI.neptuneCoreSettings.resetToDefaults();
```

---

## Next Steps

1. ✅ **IPC Channels** - Implemented
2. ✅ **TypeScript Types** - Verified with defaults
3. ✅ **electron-store Service** - Implemented with encryption
4. ✅ **Initialization Service** - Auto-init on first run
5. ⏳ **UI Implementation** - Settings forms in renderer
6. ⏳ **CLI Argument Generation** - Convert settings → CLI flags for spawning neptune-core
7. ⏳ **Integration Testing** - Verify spawning with custom settings

---

## References

- **Source Code**: `/neptune-core/src/application/config/cli_args.rs`
- **TypeScript Types**: `/src/shared/types/neptune-core-settings.ts`
- **Service**: `/src/main/services/neptune-core-settings.service.ts`
- **IPC Handlers**: `/src/main/ipc/handlers/neptune-core-settings-handlers.ts`
- **Initializer**: `/src/main/services/settings-initializer.service.ts`
