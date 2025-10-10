# Send Transaction Fix

## Problem
Private transaction sending was failing with RPC errors when trying to send funds through the wallet UI:
- `RPC error -32603: Internal error: Missing outputs parameter`
- `RPC error -32603: Internal error: unknown variant 'address'`

## Root Causes

### 1. HTTP Buffer Size Too Small (Primary Issue)
The neptune-cli RPC server had a 4KB HTTP buffer, which was too small to handle Neptune's large bech32m generation addresses (~3600 characters). When the buffer was exceeded, the JSON body was truncated, causing `params` to be `None`.

### 2. Complex Rust Enum Serialization
The wallet was attempting to serialize Rust enum types (`OutputFormat`, `ReceivingAddress`) in TypeScript, which is error-prone and requires intimate knowledge of Serde's enum serialization format.

## Solution

### neptune-cli Changes (neptune-core repo)

#### 1. Increased HTTP Buffer Size
```rust
// src/rpc/server.rs
let mut buffer = [0; 8192]; // Increased from 4096 to 8192 bytes
```

#### 2. Simplified RPC Handler
Modified the `send` RPC handler to accept wallet-friendly format:

**Before (complex):**
```json
{
  "outputs": "[{\"AddressAndAmount\":[\"nolgam1...\",\"0.1\"]}]",  // JSON-stringified Rust enum
  "change_policy": "{\"RecoverToNextUnusedKey\":{...}}",           // JSON-stringified
  "fee": "\"0\""                                                    // JSON-stringified
}
```

**After (simple):**
```json
{
  "outputs": [{"address": "nolgam1...", "amount": "0.1"}],  // Plain JSON
  "fee": "0"                                                  // Optional, defaults to "0"
}
```

#### 3. Server-Side Parsing
The RPC handler now:
- Parses bech32m addresses to `ReceivingAddress` enum using `ReceivingAddress::from_bech32m()`
- Converts to `OutputFormat::AddressAndAmount` variant
- Applies default change policy: `RecoverToNextUnusedKey` + `Generation` + `OnChain`
- Parses fee using `NativeCurrencyAmount::coins_from_str()`

```rust
// src/rpc/handlers.rs
"send" => {
    let network = client.network(ctx).await??;
    let outputs_json = extract_param(&request.params, "outputs")?;
    let fee_str = extract_param(&request.params, "fee")
        .ok()
        .and_then(|v| v.as_str().map(String::from))
        .unwrap_or_else(|| "0".to_string());
    
    let outputs_array = outputs_json.as_array()?;
    let mut outputs_parsed = Vec::new();
    
    for output in outputs_array {
        let address_str = output.get("address")?.as_str()?;
        let amount_str = output.get("amount")?.as_str()?;
        
        let receiving_address = ReceivingAddress::from_bech32m(address_str, network)?;
        let amount = NativeCurrencyAmount::coins_from_str(amount_str)?;
        
        outputs_parsed.push(OutputFormat::AddressAndAmount(receiving_address, amount));
    }
    
    let change_policy = ChangePolicy::recover_to_next_unused_key(
        KeyType::Generation,
        UtxoNotificationMedium::OnChain,
    );
    let fee = NativeCurrencyAmount::coins_from_str(&fee_str)?;
    
    client.send(ctx, token, outputs_parsed, change_policy, fee).await??
}
```

### neptune-core-wallet Changes

#### Simplified RPC Service
```typescript
// src/main/services/neptune-rpc.service.ts
async send(params: {
    outputs: Array<{ address: string; amount: string }>;
    fee?: string;
}): Promise<{ tx_id: string; lastUpdated: string }> {
    const rpcParams = {
        outputs: params.outputs,  // Simple format: [{address: "nolgam1...", amount: "0.1"}]
        fee: params.fee || "0",   // Optional, defaults to "0"
    };
    
    return this.call<{ tx_id: string; lastUpdated: string }>("send", rpcParams);
}
```

## Benefits

1. **Simpler Integration**: Wallets don't need to understand Rust enum serialization
2. **More Robust**: No manual JSON-stringification of complex nested structures
3. **Better Defaults**: Server applies sensible defaults (change policy, fee)
4. **Handles Large Addresses**: 8KB buffer supports Neptune's long generation addresses
5. **Type Safety**: Server-side parsing catches errors early with proper validation

## Testing

Successfully sent 0.01 NPT transaction:
- **From**: Wallet with 0.90 NPT balance
- **To**: Long bech32m generation address (3606 characters)
- **Fee**: 0 NPT
- **Result**: Transaction accepted, proof generated, broadcast initiated
- **Transaction ID**: `007e5f34d8caf714d0f95bfdc56f6585e74a5b27ce5883a5873fb021a78e7e058c7510c03caaecc3`

## Commits

### neptune-core
- `13417db2`: Initial RPC simplification
- `bfdeecfb`: Buffer size increase and logging

### neptune-core-wallet
- `708892f`: Simplified send transaction format
- `481947b`: Added debugging logs

## Future Improvements

1. Remove debug logging once stable
2. Consider dynamic buffer size allocation for very large requests
3. Add support for custom change policies via optional parameter
4. Support other `OutputFormat` variants (time-locked outputs, etc.)
