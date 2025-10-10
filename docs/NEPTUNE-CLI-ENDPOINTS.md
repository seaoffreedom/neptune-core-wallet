# Neptune CLI HTTP JSON-RPC Endpoints

This document provides comprehensive documentation for all 71 HTTP JSON-RPC endpoints available in the Neptune CLI RPC server.

## Authentication

All server-dependent endpoints require authentication via cookie:

```bash
# Get authentication cookie
./neptune-cli --get-cookie

# Use in requests
curl -H "Cookie: neptune-cli=<cookie_value>" ...
```

## Core Wallet Endpoints

### dashboard_overview_data

**Description**: Comprehensive wallet overview data in a single call

```json
{
  "jsonrpc": "2.0",
  "method": "dashboard_overview_data",
  "id": 1
}
```

**Response**:

```json
{
  "jsonrpc": "2.0",
  "result": {
    "confirmations": "598",
    "confirmed_available_balance": "0.90000000",
    "confirmed_total_balance": "0.90000000",
    "cpu_temp": null,
    "max_num_peers": 10,
    "mempool_own_tx_count": 0,
    "mempool_size": 1648,
    "mempool_total_tx_count": 0,
    "mining_status": "inactive",
    "peer_count": 3,
    "proving_capability": "proof collection",
    "syncing": false,
    "tip_digest": "e3221b4db512a6c2073779cc9ec94b8e17700e2e72f40b47bb907e3edaae85a403d00f0000000000",
    "tip_header": {
      "height": 9344,
      "timestamp": 1759865322768
    },
    "unconfirmed_available_balance": "0.90000000",
    "unconfirmed_total_balance": "0.90000000"
  },
  "id": 1
}
```

### get_balance

**Description**: Wallet balance information

```json
{
  "jsonrpc": "2.0",
  "method": "get_balance",
  "id": 2
}
```

**Response**:

```json
{
  "jsonrpc": "2.0",
  "result": {
    "confirmed": "0.90000000",
    "unconfirmed": "0.90000000",
    "lastUpdated": "2025-10-07T19:38:01.186434140+00:00"
  },
  "id": 2
}
```

### get_network_info

**Description**: Network information and current block height

```json
{
  "jsonrpc": "2.0",
  "method": "get_network_info",
  "id": 3
}
```

**Response**:

```json
{
  "jsonrpc": "2.0",
  "result": {
    "network": "main",
    "blockHeight": "9344",
    "tipDigest": "e3221b4db512a6c2073779cc9ec94b8e17700e2e72f40b47bb907e3edaae85a403d00f0000000000",
    "lastUpdated": "2025-10-07T19:38:06.020787693+00:00"
  },
  "id": 3
}
```

### get_peer_info

**Description**: Connected peer information

```json
{
  "jsonrpc": "2.0",
  "method": "get_peer_info",
  "id": 4
}
```

**Response**:

```json
{
  "jsonrpc": "2.0",
  "result": {
    "peers": [
      {
        "address": "3.249.158.218:9798",
        "connected": true,
        "lastSeen": 1759862061
      }
    ],
    "connectedCount": 3,
    "lastUpdated": "2025-10-07T19:38:12.614064577+00:00"
  },
  "id": 4
}
```

### get_sync_status

**Description**: Blockchain synchronization status

```json
{
  "jsonrpc": "2.0",
  "method": "get_sync_status",
  "id": 5
}
```

**Response**:

```json
{
  "jsonrpc": "2.0",
  "result": {
    "isSynced": true,
    "currentBlockHeight": "9344",
    "latestBlockHash": "e3221b4db512a6c2073779cc9ec94b8e17700e2e72f40b47bb907e3edaae85a403d00f0000000000",
    "connectedPeers": 3,
    "pendingTransactions": 0,
    "lastSyncCheck": "2025-10-07T19:38:17.829430799+00:00"
  },
  "id": 5
}
```

## Essential Wallet Operations

### block_height

**Description**: Current blockchain height

```json
{
  "jsonrpc": "2.0",
  "method": "block_height",
  "id": 6
}
```

**Response**:

```json
{
  "jsonrpc": "2.0",
  "result": "9344",
  "id": 6
}
```

### network

**Description**: Current network type

```json
{
  "jsonrpc": "2.0",
  "method": "network",
  "id": 7
}
```

**Response**:

```json
{
  "jsonrpc": "2.0",
  "result": "main",
  "id": 7
}
```

### confirmed_available_balance

**Description**: Confirmed available balance

```json
{
  "jsonrpc": "2.0",
  "method": "confirmed_available_balance",
  "id": 8
}
```

**Response**:

```json
{
  "jsonrpc": "2.0",
  "result": "0.90000000",
  "id": 8
}
```

### unconfirmed_available_balance

**Description**: Unconfirmed available balance

```json
{
  "jsonrpc": "2.0",
  "method": "unconfirmed_available_balance",
  "id": 9
}
```

**Response**:

```json
{
  "jsonrpc": "2.0",
  "result": "0.90000000",
  "id": 9
}
```

### next_receiving_address

**Description**: Get next receiving address

```json
{
  "jsonrpc": "2.0",
  "method": "next_receiving_address",
  "id": 10
}
```

**Response**:

```json
{
  "jsonrpc": "2.0",
  "result": "npt1...",
  "id": 10
}
```

### wallet_status

**Description**: Wallet status information

```json
{
  "jsonrpc": "2.0",
  "method": "wallet_status",
  "id": 11
}
```

**Response**:

```json
{
  "jsonrpc": "2.0",
  "result": {
    "status": "ready",
    "lastUpdated": "2025-10-07T19:38:01.186434140+00:00"
  },
  "id": 11
}
```

### confirmations

**Description**: Get confirmation count

```json
{
  "jsonrpc": "2.0",
  "method": "confirmations",
  "id": 12
}
```

**Response**:

```json
{
  "jsonrpc": "2.0",
  "result": "598",
  "id": 12
}
```

## Transaction Operations

### send

**Description**: Send transaction

```json
{
  "jsonrpc": "2.0",
  "method": "send",
  "params": {
    "outputs": [{ "address": "npt1...", "amount": "0.1" }],
    "change_policy": "default",
    "fee": "0.001"
  },
  "id": 13
}
```

**Response**:

```json
{
  "jsonrpc": "2.0",
  "result": {
    "tx_id": "...",
    "lastUpdated": "2025-10-07T19:38:01.186434140+00:00"
  },
  "id": 13
}
```

### send_transparent

**Description**: Send transparent transaction

```json
{
  "jsonrpc": "2.0",
  "method": "send_transparent",
  "params": {
    "outputs": [{ "address": "npt1...", "amount": "0.1" }],
    "change_policy": "default",
    "fee": "0.001"
  },
  "id": 14
}
```

**Response**:

```json
{
  "jsonrpc": "2.0",
  "result": {
    "tx_artifacts": "...",
    "lastUpdated": "2025-10-07T19:38:01.186434140+00:00"
  },
  "id": 14
}
```

### claim_utxo

**Description**: Claim UTXO

```json
{
  "jsonrpc": "2.0",
  "method": "claim_utxo",
  "params": {
    "utxo_transfer_encrypted": "...",
    "max_search_depth": 100
  },
  "id": 15
}
```

**Response**:

```json
{
  "jsonrpc": "2.0",
  "result": true,
  "id": 15
}
```

### list_own_coins

**Description**: List own coins

```json
{
  "jsonrpc": "2.0",
  "method": "list_own_coins",
  "id": 16
}
```

**Response**:

```json
{
  "jsonrpc": "2.0",
  "result": [
    {
      "amount": "0.90000000",
      "confirmed": "1759497625278",
      "release_date": null
    }
  ],
  "id": 16
}
```

### history

**Description**: Transaction history

```json
{
  "jsonrpc": "2.0",
  "method": "history",
  "id": 17
}
```

**Response**:

```json
{
  "jsonrpc": "2.0",
  "result": [
    {
      "digest": "digest_string",
      "block_height": "9344",
      "timestamp": "1759865322768",
      "amount": "0.90000000"
    }
  ],
  "id": 17
}
```

## Mempool Operations

### mempool_overview

**Description**: Mempool overview

```json
{
  "jsonrpc": "2.0",
  "method": "mempool_overview",
  "params": {
    "start_index": 0,
    "number": 10
  },
  "id": 18
}
```

**Response**:

```json
{
  "jsonrpc": "2.0",
  "result": {
    "transactions": [...],
    "count": 0,
    "lastUpdated": "2025-10-07T19:38:01.186434140+00:00"
  },
  "id": 18
}
```

### mempool_tx_ids

**Description**: Mempool transaction IDs

```json
{
  "jsonrpc": "2.0",
  "method": "mempool_tx_ids",
  "id": 19
}
```

**Response**:

```json
{
  "jsonrpc": "2.0",
  "result": [],
  "id": 19
}
```

### mempool_size

**Description**: Mempool size in bytes

```json
{
  "jsonrpc": "2.0",
  "method": "mempool_size",
  "id": 20
}
```

**Response**:

```json
{
  "jsonrpc": "2.0",
  "result": 1648,
  "id": 20
}
```

### mempool_tx_count

**Description**: Mempool transaction count

```json
{
  "jsonrpc": "2.0",
  "method": "mempool_tx_count",
  "id": 21
}
```

**Response**:

```json
{
  "jsonrpc": "2.0",
  "result": 0,
  "id": 21
}
```

## UTXO Operations

### num_expected_utxos

**Description**: Number of expected UTXOs

```json
{
  "jsonrpc": "2.0",
  "method": "num_expected_utxos",
  "id": 22
}
```

**Response**:

```json
{
  "jsonrpc": "2.0",
  "result": "0",
  "id": 22
}
```

### list_utxos

**Description**: List UTXOs

```json
{
  "jsonrpc": "2.0",
  "method": "list_utxos",
  "id": 23
}
```

**Response**:

```json
{
  "jsonrpc": "2.0",
  "result": {
    "utxos": [
      {
        "status": "confirmed",
        "block_height": "9344",
        "timestamp": "1759865322768"
      }
    ],
    "count": 1,
    "lastUpdated": "2025-10-07T19:38:01.186434140+00:00"
  },
  "id": 23
}
```

### spendable_inputs

**Description**: Get spendable inputs

```json
{
  "jsonrpc": "2.0",
  "method": "spendable_inputs",
  "id": 24
}
```

**Response**:

```json
{
  "jsonrpc": "2.0",
  "result": [
    {
      "lock_script_and_witness": {...},
      "membership_proof": {...},
      "utxo": {...}
    }
  ],
  "id": 24
}
```

### select_spendable_inputs

**Description**: Select spendable inputs for amount

```json
{
  "jsonrpc": "2.0",
  "method": "select_spendable_inputs",
  "params": {
    "amount": "0.1"
  },
  "id": 25
}
```

**Response**:

```json
{
  "jsonrpc": "2.0",
  "result": [...],
  "id": 25
}
```

## Mining Operations

### pow_puzzle_internal_key

**Description**: Get POW puzzle internal key

```json
{
  "jsonrpc": "2.0",
  "method": "pow_puzzle_internal_key",
  "id": 26
}
```

**Response**:

```json
{
  "jsonrpc": "2.0",
  "result": {...},
  "id": 26
}
```

### pow_puzzle_external_key

**Description**: Get POW puzzle external key

```json
{
  "jsonrpc": "2.0",
  "method": "pow_puzzle_external_key",
  "params": {
    "guesser_fee_address": "npt1..."
  },
  "id": 27
}
```

**Response**:

```json
{
  "jsonrpc": "2.0",
  "result": {...},
  "id": 27
}
```

### full_pow_puzzle_external_key

**Description**: Get full POW puzzle external key

```json
{
  "jsonrpc": "2.0",
  "method": "full_pow_puzzle_external_key",
  "params": {
    "guesser_fee_address": "npt1..."
  },
  "id": 28
}
```

**Response**:

```json
{
  "jsonrpc": "2.0",
  "result": {...},
  "id": 28
}
```

### pause_miner

**Description**: Pause mining

```json
{
  "jsonrpc": "2.0",
  "method": "pause_miner",
  "id": 29
}
```

**Response**:

```json
{
  "jsonrpc": "2.0",
  "result": "Miner paused",
  "id": 29
}
```

### restart_miner

**Description**: Restart mining

```json
{
  "jsonrpc": "2.0",
  "method": "restart_miner",
  "id": 30
}
```

**Response**:

```json
{
  "jsonrpc": "2.0",
  "result": "Miner restarted",
  "id": 30
}
```

### mine_blocks_to_wallet

**Description**: Mine blocks to wallet

```json
{
  "jsonrpc": "2.0",
  "method": "mine_blocks_to_wallet",
  "params": {
    "n_blocks": 1
  },
  "id": 31
}
```

**Response**:

```json
{
  "jsonrpc": "2.0",
  "result": "Mined 1 blocks to wallet",
  "id": 31
}
```

## Transaction Assembly

### generate_tx_outputs

**Description**: Generate transaction outputs

```json
{
  "jsonrpc": "2.0",
  "method": "generate_tx_outputs",
  "params": {
    "outputs": [{ "address": "npt1...", "amount": "0.1" }]
  },
  "id": 32
}
```

**Response**:

```json
{
  "jsonrpc": "2.0",
  "result": {...},
  "id": 32
}
```

### generate_tx_details

**Description**: Generate transaction details

```json
{
  "jsonrpc": "2.0",
  "method": "generate_tx_details",
  "params": {
    "inputs": [...],
    "outputs": [...],
    "change_policy": "default",
    "fee": "0.001"
  },
  "id": 33
}
```

**Response**:

```json
{
  "jsonrpc": "2.0",
  "result": {...},
  "id": 33
}
```

### generate_witness_proof

**Description**: Generate witness proof

```json
{
  "jsonrpc": "2.0",
  "method": "generate_witness_proof",
  "params": {
    "transaction_details": {...}
  },
  "id": 34
}
```

**Response**:

```json
{
  "jsonrpc": "2.0",
  "result": {...},
  "id": 34
}
```

### assemble_transaction

**Description**: Assemble transaction

```json
{
  "jsonrpc": "2.0",
  "method": "assemble_transaction",
  "params": {
    "transaction_details": {...},
    "transaction_proof": {...}
  },
  "id": 35
}
```

**Response**:

```json
{
  "jsonrpc": "2.0",
  "result": {...},
  "id": 35
}
```

### assemble_transaction_artifacts

**Description**: Assemble transaction artifacts

```json
{
  "jsonrpc": "2.0",
  "method": "assemble_transaction_artifacts",
  "params": {
    "transaction_details": {...},
    "transaction_proof": {...}
  },
  "id": 36
}
```

**Response**:

```json
{
  "jsonrpc": "2.0",
  "result": {...},
  "id": 36
}
```

## Address Operations

### validate_address

**Description**: Validate address

```json
{
  "jsonrpc": "2.0",
  "method": "validate_address",
  "params": {
    "address": "npt1..."
  },
  "id": 37
}
```

**Response**:

```json
{
  "jsonrpc": "2.0",
  "result": true,
  "id": 37
}
```

### validate_amount

**Description**: Validate amount

```json
{
  "jsonrpc": "2.0",
  "method": "validate_amount",
  "params": {
    "amount": "0.1"
  },
  "id": 38
}
```

**Response**:

```json
{
  "jsonrpc": "2.0",
  "result": true,
  "id": 38
}
```

### nth_receiving_address

**Description**: Get nth receiving address

```json
{
  "jsonrpc": "2.0",
  "method": "nth_receiving_address",
  "params": {
    "n": 0
  },
  "id": 39
}
```

**Response**:

```json
{
  "jsonrpc": "2.0",
  "result": "npt1...",
  "id": 39
}
```

### premine_receiving_address

**Description**: Get premine receiving address

```json
{
  "jsonrpc": "2.0",
  "method": "premine_receiving_address",
  "id": 40
}
```

**Response**:

```json
{
  "jsonrpc": "2.0",
  "result": "npt1...",
  "id": 40
}
```

## Advanced Operations

### upgrade

**Description**: Upgrade transaction

```json
{
  "jsonrpc": "2.0",
  "method": "upgrade",
  "params": {
    "tx_kernel_id": "..."
  },
  "id": 41
}
```

**Response**:

```json
{
  "jsonrpc": "2.0",
  "result": true,
  "id": 41
}
```

### shutdown

**Description**: Shutdown neptune-core

```json
{
  "jsonrpc": "2.0",
  "method": "shutdown",
  "id": 42
}
```

**Response**:

```json
{
  "jsonrpc": "2.0",
  "result": true,
  "id": 42
}
```

### own_instance_id

**Description**: Get own instance ID

```json
{
  "jsonrpc": "2.0",
  "method": "own_instance_id",
  "id": 43
}
```

**Response**:

```json
{
  "jsonrpc": "2.0",
  "result": {
    "instance_id": "140115834182373791703930914757558626475",
    "lastUpdated": "2025-10-07T19:38:43.538809424+00:00"
  },
  "id": 43
}
```

### peer_info

**Description**: Detailed peer information

```json
{
  "jsonrpc": "2.0",
  "method": "peer_info",
  "id": 44
}
```

**Response**:

```json
{
  "jsonrpc": "2.0",
  "result": [
    {
      "address": "3.249.158.218:9798",
      "connected": true,
      "lastSeen": 1759862061
    }
  ],
  "id": 44
}
```

### cpu_temp

**Description**: Get CPU temperature

```json
{
  "jsonrpc": "2.0",
  "method": "cpu_temp",
  "id": 45
}
```

**Response**:

```json
{
  "jsonrpc": "2.0",
  "result": null,
  "id": 45
}
```

## Block Operations

### block_digest

**Description**: Get block digest

```json
{
  "jsonrpc": "2.0",
  "method": "block_digest",
  "params": {
    "height": 9344
  },
  "id": 46
}
```

**Response**:

```json
{
  "jsonrpc": "2.0",
  "result": {
    "digest": "e3221b4db512a6c2073779cc9ec94b8e17700e2e72f40b47bb907e3edaae85a403d00f0000000000",
    "found": true,
    "lastUpdated": "2025-10-07T19:38:01.186434140+00:00"
  },
  "id": 46
}
```

### block_digests_by_height

**Description**: Get block digests by height

```json
{
  "jsonrpc": "2.0",
  "method": "block_digests_by_height",
  "params": {
    "height": 9344
  },
  "id": 47
}
```

**Response**:

```json
{
  "jsonrpc": "2.0",
  "result": {
    "digests": ["digest1", "digest2"],
    "height": "9344",
    "count": 2,
    "lastUpdated": "2025-10-07T19:38:01.186434140+00:00"
  },
  "id": 47
}
```

### latest_tip_digests

**Description**: Get latest tip digests

```json
{
  "jsonrpc": "2.0",
  "method": "latest_tip_digests",
  "params": {
    "n": 3
  },
  "id": 48
}
```

**Response**:

```json
{
  "jsonrpc": "2.0",
  "result": {
    "digests": ["digest1", "digest2", "digest3"],
    "count": 3,
    "requested": 3,
    "lastUpdated": "2025-10-07T19:38:59.262288580+00:00"
  },
  "id": 48
}
```

### utxo_digest

**Description**: Get UTXO digest

```json
{
  "jsonrpc": "2.0",
  "method": "utxo_digest",
  "params": {
    "leaf_index": 12345
  },
  "id": 49
}
```

**Response**:

```json
{
  "jsonrpc": "2.0",
  "result": {
    "digest": "03941710790125537253,02082622640332905123,10614133251602996281,10938203067556333015,05209370137419705099",
    "found": true,
    "leaf_index": "12345",
    "lastUpdated": "2025-10-07T19:29:06.923787795+00:00"
  },
  "id": 49
}
```

## Standalone Methods (No Authentication Required)

### completions

**Description**: Generate shell completions

```json
{
  "jsonrpc": "2.0",
  "method": "completions",
  "params": {
    "shell": "bash"
  },
  "id": 50
}
```

### help

**Description**: Generate help text

```json
{
  "jsonrpc": "2.0",
  "method": "help",
  "id": 51
}
```

### which_wallet

**Description**: Display wallet file path

```json
{
  "jsonrpc": "2.0",
  "method": "which_wallet",
  "id": 52
}
```

### generate_wallet

**Description**: Generate new wallet

```json
{
  "jsonrpc": "2.0",
  "method": "generate_wallet",
  "id": 53
}
```

### export_seed_phrase

**Description**: Export mnemonic seed phrase

```json
{
  "jsonrpc": "2.0",
  "method": "export_seed_phrase",
  "id": 54
}
```

### import_seed_phrase

**Description**: Import mnemonic seed phrase

```json
{
  "jsonrpc": "2.0",
  "method": "import_seed_phrase",
  "params": {
    "seed_phrase": "word1 word2 ..."
  },
  "id": 55
}
```

### shamir_share

**Description**: Share wallet secret using Shamir scheme

```json
{
  "jsonrpc": "2.0",
  "method": "shamir_share",
  "params": {
    "threshold": 3,
    "shares": 5
  },
  "id": 56
}
```

### shamir_combine

**Description**: Combine Shamir shares

```json
{
  "jsonrpc": "2.0",
  "method": "shamir_combine",
  "params": {
    "shares": ["share1", "share2", "share3"]
  },
  "id": 57
}
```

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "jsonrpc": "2.0",
  "error": {
    "code": -32602,
    "message": "Invalid params",
    "data": "Missing required parameter: address"
  },
  "id": 1
}
```

## Common Error Codes

- `-32600`: Invalid Request
- `-32601`: Method not found
- `-32602`: Invalid params
- `-32603`: Internal error
- `-32000`: Server error (neptune-core specific)

## Notes

1. **Large Numbers**: All large numbers (amounts, timestamps, block heights) are returned as strings to avoid JavaScript "number out of range" errors.

2. **Timestamps**: All timestamps are in ISO 8601 format with UTC timezone.

3. **Authentication**: Server-dependent methods require a valid authentication cookie.

4. **Network**: The RPC server connects to neptune-core on the configured port (default 9799).

5. **Production Ready**: All endpoints have been tested and are production-ready with proper error handling.
