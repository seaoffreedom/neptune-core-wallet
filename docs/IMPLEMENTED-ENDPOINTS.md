# Implemented Neptune CLI Endpoints

This document lists all Neptune CLI endpoints that are implemented in the wallet application, organized by priority and use case.

## Overview

**Total Endpoints Available**: 71
**Implemented Endpoints**: 40
**Coverage**: 56%
**Target Users**: Power users and advanced wallet operations

---

## Tier 1: Critical Endpoints (Must Have)

These endpoints provide essential wallet functionality and are required for basic operations.

### 1. dashboard_overview_data

**Priority**: Critical
**Category**: Core Wallet
**Description**: Comprehensive wallet overview data in a single call
**Use Case**: Primary dashboard display, quick wallet status check
**Returns**: Balance, confirmations, peers, mempool, mining status, sync status, block height

### 2. block_height

**Priority**: Critical
**Category**: Essential Operations
**Description**: Current blockchain height
**Use Case**: Sync status, transaction confirmations calculation
**Returns**: String (block height)

### 3. network

**Priority**: Critical
**Category**: Essential Operations
**Description**: Network identification (main, testnet, etc.)
**Use Case**: Ensure correct network connection, display network badge
**Returns**: String (network name)

### 4. confirmed_available_balance

**Priority**: Critical
**Category**: Essential Operations
**Description**: Confirmed available balance (excludes time-locked UTXOs)
**Use Case**: Display spendable balance, transaction amount validation
**Returns**: String (amount in Neptune)

### 5. unconfirmed_available_balance

**Priority**: Critical
**Category**: Essential Operations
**Description**: Unconfirmed balance including pending transactions
**Use Case**: Show pending balance, warn users about unconfirmed funds
**Returns**: String (amount in Neptune)

### 6. next_receiving_address

**Priority**: Critical
**Category**: Essential Operations
**Description**: Get next unused receiving address
**Use Case**: Receive payments, generate QR codes
**Returns**: String (Neptune address)

### 7. wallet_status

**Priority**: Critical
**Category**: Essential Operations
**Description**: Wallet status information
**Use Case**: Verify wallet is ready for operations
**Returns**: Object with status and timestamp

### 8. history

**Priority**: Critical
**Category**: Transaction Operations
**Description**: Transaction history
**Use Case**: Display transaction list, export history
**Returns**: Array of transactions with digest, height, timestamp, amount

### 9. send

**Priority**: Critical
**Category**: Transaction Operations
**Description**: Send private transaction
**Use Case**: Primary send functionality with privacy
**Params**: outputs (address, amount), change_policy, fee
**Returns**: Transaction ID

### 10. send_transparent

**Priority**: Critical
**Category**: Transaction Operations
**Description**: Send transparent transaction (no privacy)
**Use Case**: Transparent sends for auditing or compliance
**Params**: outputs (address, amount), change_policy, fee
**Returns**: Transaction artifacts

### 11. list_own_coins

**Priority**: Critical
**Category**: Transaction Operations
**Description**: List own coins/UTXOs
**Use Case**: View coin composition, UTXO management
**Returns**: Array of coins with amount, confirmation, release date

### 12. mempool_tx_count

**Priority**: Critical
**Category**: Mempool Operations
**Description**: Count of transactions in mempool
**Use Case**: Network congestion indicator
**Returns**: Number (transaction count)

### 13. mempool_size

**Priority**: Critical
**Category**: Mempool Operations
**Description**: Mempool size in bytes
**Use Case**: Memory usage monitoring, congestion analysis
**Returns**: Number (bytes)

### 14. peer_info

**Priority**: Critical
**Category**: Advanced Operations
**Description**: Detailed peer connection information
**Use Case**: Network health monitoring, connectivity debugging
**Returns**: Array of peers with address, connection status, last seen

### 15. confirmations

**Priority**: Critical
**Category**: Essential Operations
**Description**: Get confirmation count for transactions
**Use Case**: Transaction security assessment
**Returns**: String (confirmation count)

---

## Tier 2: Important Endpoints (Power Users)

These endpoints provide advanced functionality for power users who need fine-grained control.

### 16. list_utxos

**Priority**: Important
**Category**: UTXO Operations
**Description**: List all UTXOs with detailed information
**Use Case**: Advanced UTXO management, coin control
**Returns**: Array of UTXOs with status, block height, timestamp

### 17. spendable_inputs

**Priority**: Important
**Category**: UTXO Operations
**Description**: Get all spendable inputs
**Use Case**: Manual transaction construction, optimal input selection
**Returns**: Array of spendable inputs with lock script, membership proof, UTXO

### 18. select_spendable_inputs

**Priority**: Important
**Category**: UTXO Operations
**Description**: Select optimal spendable inputs for specific amount
**Use Case**: Automatic coin selection for transactions
**Params**: amount
**Returns**: Selected inputs

### 19. mempool_overview

**Priority**: Important
**Category**: Mempool Operations
**Description**: Detailed mempool overview with pagination
**Use Case**: Detailed mempool inspection, transaction tracking
**Params**: start_index, number
**Returns**: Transactions array with metadata

### 20. mempool_tx_ids

**Priority**: Important
**Category**: Mempool Operations
**Description**: List all mempool transaction IDs
**Use Case**: Track specific transactions, mempool monitoring
**Returns**: Array of transaction IDs

### 21. validate_address

**Priority**: Important
**Category**: Address Operations
**Description**: Validate Neptune address format
**Use Case**: User input validation, error prevention
**Params**: address
**Returns**: Boolean

### 22. validate_amount

**Priority**: Important
**Category**: Address Operations
**Description**: Validate amount format and value
**Use Case**: Transaction form validation
**Params**: amount
**Returns**: Boolean

### 23. nth_receiving_address

**Priority**: Important
**Category**: Address Operations
**Description**: Get specific receiving address by index
**Use Case**: Address management, deterministic address generation
**Params**: n (index)
**Returns**: String (Neptune address)

### 24. block_digest

**Priority**: Important
**Category**: Block Operations
**Description**: Get block digest/hash for specific height
**Use Case**: Block explorer functionality, chain verification
**Params**: height
**Returns**: Digest string and found status

### 25. latest_tip_digests

**Priority**: Important
**Category**: Block Operations
**Description**: Get latest N block digests
**Use Case**: Recent block history, chain tip monitoring
**Params**: n (number of blocks)
**Returns**: Array of digests

### 26. own_instance_id

**Priority**: Important
**Category**: Advanced Operations
**Description**: Get node instance ID
**Use Case**: Node identification, multi-node management
**Returns**: Instance ID string

### 27. shutdown

**Priority**: Important
**Category**: Advanced Operations
**Description**: Gracefully shutdown neptune-core
**Use Case**: Clean application exit, maintenance operations
**Returns**: Boolean

### 28. num_expected_utxos

**Priority**: Important
**Category**: UTXO Operations
**Description**: Number of expected UTXOs
**Use Case**: Sync progress, wallet completeness check
**Returns**: String (count)

### 29. upgrade

**Priority**: Important
**Category**: Advanced Operations
**Description**: Upgrade transaction proof
**Use Case**: Transaction proof optimization, fee reclaiming
**Params**: tx_kernel_id
**Returns**: Boolean

### 30. claim_utxo

**Priority**: Important
**Category**: Transaction Operations
**Description**: Claim off-chain UTXO transfer
**Use Case**: Receive off-chain payments, UTXO imports
**Params**: utxo_transfer_encrypted, max_search_depth
**Returns**: Boolean

---

## Tier 3: Nice to Have (Advanced Users)

These endpoints are useful for specific scenarios and advanced users.

### 31. pause_miner

**Priority**: Nice to Have
**Category**: Mining Operations
**Description**: Pause mining operations
**Use Case**: Resource management, testing
**Returns**: String (status message)

### 32. restart_miner

**Priority**: Nice to Have
**Category**: Mining Operations
**Description**: Restart mining operations
**Use Case**: Resume mining after pause
**Returns**: String (status message)

### 33. block_digests_by_height

**Priority**: Nice to Have
**Category**: Block Operations
**Description**: Get all block digests at specific height
**Use Case**: Fork detection, historical analysis
**Params**: height
**Returns**: Array of digests

### 34. utxo_digest

**Priority**: Nice to Have
**Category**: Block Operations
**Description**: Get UTXO digest by leaf index
**Use Case**: UTXO set verification, debugging
**Params**: leaf_index
**Returns**: Digest string

### 35. cpu_temp

**Priority**: Nice to Have
**Category**: Advanced Operations
**Description**: Get CPU temperature
**Use Case**: System monitoring, overheating prevention
**Returns**: Number or null

### 36. generate_wallet

**Priority**: Nice to Have
**Category**: Standalone Operations
**Description**: Generate new wallet
**Use Case**: Initial wallet creation
**Returns**: Success status

### 37. export_seed_phrase

**Priority**: Nice to Have
**Category**: Standalone Operations
**Description**: Export mnemonic seed phrase
**Use Case**: Wallet backup, recovery
**Returns**: Seed phrase string

### 38. import_seed_phrase

**Priority**: Nice to Have
**Category**: Standalone Operations
**Description**: Import mnemonic seed phrase
**Use Case**: Wallet restoration
**Params**: seed_phrase
**Returns**: Success status

### 39. which_wallet

**Priority**: Nice to Have
**Category**: Standalone Operations
**Description**: Display wallet file path
**Use Case**: Debugging, manual backup
**Returns**: File path string

### 40. pow_puzzle_internal_key

**Priority**: Nice to Have
**Category**: Mining Operations
**Description**: Get POW puzzle internal key
**Use Case**: Mining setup, reward claiming
**Returns**: Key object

---

## Not Implemented (Lower Priority)

The following endpoint categories are **not** currently implemented but may be added in future versions:

### Transaction Assembly (8 endpoints)

- generate_tx_outputs
- generate_tx_details
- generate_witness_proof
- assemble_transaction
- assemble_transaction_artifacts

These are low-level transaction construction methods typically used by advanced tooling rather than end-user wallets.

### Advanced Mining (3 endpoints)

- pow_puzzle_external_key
- full_pow_puzzle_external_key
- mine_blocks_to_wallet

These are specialized mining endpoints for pool operators and testing.

### Shamir Secret Sharing (2 endpoints)

- shamir_share
- shamir_combine

While useful, these are specialized security features that can be added later.

### Standalone Utilities (2 endpoints)

- completions
- help

These are CLI-specific utilities not relevant to GUI applications.

---

## Implementation Status

| Tier      | Endpoints | Status         | Notes                                  |
| --------- | --------- | -------------- | -------------------------------------- |
| Tier 1    | 15        | ⏳ Pending     | Core wallet functionality              |
| Tier 2    | 15        | ⏳ Pending     | Power user features                    |
| Tier 3    | 10        | ⏳ Pending     | Advanced operations                    |
| **Total** | **40**    | **⏳ Pending** | **56% coverage of 71 total endpoints** |

---

## Next Steps

1. ✅ Update `NeptuneRpcService` with all Tier 1 methods
2. ⏳ Create TypeScript interfaces for all response types
3. ⏳ Update IPC handlers and API types
4. ⏳ Create React hooks for common use cases
5. ⏳ Build UI components for each feature
6. ⏳ Add comprehensive error handling
7. ⏳ Write unit tests for each endpoint

---

## Notes

- All endpoints require authentication via cookie except standalone methods
- Large numbers are returned as strings to avoid JavaScript precision issues
- All timestamps use ISO 8601 format with UTC timezone
- The wallet prioritizes privacy-preserving operations (use `send` instead of `send_transparent` by default)
- Endpoints are implemented progressively based on user needs and feedback

---

**Last Updated**: 2025-10-09
**Version**: 1.0.0
**Target Release**: MVP
