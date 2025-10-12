# Neptune Transaction Proof Lifecycle

## Overview

Neptune is a **privacy-preserving, quantum-resistant, zk-STARKs-based L1 blockchain** that uses a sophisticated transaction proof system to ensure privacy and security. Understanding the transaction proof lifecycle is crucial for users to make informed decisions about transaction fees and capabilities.

## Transaction Proof Lifecycle

### 1. Primitive Witness

**What it is**: The initial, raw transaction data that contains secret keys and sensitive information.

**Characteristics**:

- Contains private keys and sensitive transaction details
- **Cannot be shared** - would leak secret keys if transmitted
- Must be kept secure on the user's device
- Represents the "draft" of a transaction before proof generation
- **Can be updated** when new blocks are added to the chain

**Security**: Highly sensitive - never transmitted over the network.

### 2. Proof Collection

**What it is**: A collection of cryptographic proofs that validate the transaction without revealing private information.

**Characteristics**:

- Can be generated on most devices (computers, smartphones)
- Suitable for transactions with few inputs
- **Can be shared** - doesn't contain secret keys
- More expensive in terms of fees (≥0.05 NPT)
- Requires third-party services for final processing
- **Cannot be updated** once created

**Device Requirements**:

- Most computers and smartphones can generate proof collections
- Suitable for simple transactions

**Fee Structure**: Higher fees due to the need for third-party proof upgrading services.

### 3. Single Proof

**What it is**: The final, optimized cryptographic proof that makes the transaction ready for inclusion in a block.

**Characteristics**:

- Most efficient and cost-effective proof type
- **Requires significant computational resources** (at least 64GB RAM and powerful CPUs)
- Can be included directly in blocks by composers
- Lowest transaction fees
- **Can be updated** (e.g., if not included in a block, or merged with other Single Proofs)
- **Can be merged** with other Single Proof transactions

**Device Requirements**:

- Requires powerful machines with at least 64GB RAM
- Not feasible for most consumer devices

**Fee Structure**: Lowest fees due to direct block inclusion capability.

### 4. Block Proof

**What it is**: The final, composed proof that represents a single transaction included within a Neptune block.

**Characteristics**:

- Formed from a Single Proof via the "compose" operation
- **A Neptune block contains only one transaction**, meaning Single Proofs must be merged before composition into a Block Proof
- **Important**: This is not a throughput limitation - multiple transactions can be merged into a single transaction before block inclusion
- Represents the ultimate state of a transaction proof ready for the blockchain

**Formation**: The final stage of a transaction proof lifecycle.

## Transaction Operations

Based on the proof lifecycle, Neptune supports several key operations:

### 1. "Raise" Operation

- **Purpose**: Convert a Proof Collection into a Single Proof
- **Requirements**: At least 64GB RAM and powerful CPUs
- **Duration**: Minutes on powerful hardware
- **Actors**: Proof upgraders or users with powerful hardware

### 2. "Compose" Operation

- **Purpose**: Convert a Single Proof into a Block Proof
- **Actors**: Composers (block creators)
- **Result**: Transaction ready for blockchain inclusion

### 3. "Update" Operation

- **Purpose**: Update Single Proofs when new blocks are added and transaction wasn't included
- **Trigger**: New block set as tip, transaction not included in the new block
- **Scope**: Only Primitive Witness and Single Proof can be updated
- **Limitation**: Proof Collections cannot be updated

### 4. "Merge" Operation

- **Purpose**: Combine multiple Single Proof transactions into a single transaction
- **Requirement**: Necessary because Neptune blocks contain only one transaction
- **Throughput**: Enables high throughput by allowing multiple transactions to be processed as one
- **Actors**: Composers or specialized merging services

## Transaction Proving Capabilities

Based on the codebase analysis, Neptune supports three transaction proving capability levels:

### 1. Lockscript (`lockscript`)

- Basic transaction validation
- Minimal computational requirements
- Suitable for simple transactions

### 2. Single Proof (`singleproof`)

- Full cryptographic proof generation
- Requires 64GB+ RAM
- Most cost-effective for high-value transactions
- Direct block inclusion capability

### 3. Proof Collection (`proofcollection`)

- Intermediate proof generation
- Suitable for most consumer devices
- Requires third-party upgrading services
- Higher fees but accessible to more users

## Mining Process

Neptune's mining process consists of three distinct steps:

### 1. Proof Upgrading

- **Purpose**: Convert proof collections to single proofs
- **Actors**: Proof upgraders (specialized nodes)
- **Process**: Process proof collections from the mempool into single proofs
- **Fee**: Charged to transaction creators (typically ≥0.05 NPT)

### 2. Composition

- **Purpose**: Assemble transactions into blocks
- **Actors**: Composers (block creators)
- **Process**: Include single proofs and other transactions in blocks
- **Benefit**: Single proofs are easy for composers to include

### 3. Guessing (Proof-of-Work)

- **Purpose**: Secure the blockchain through computational work
- **Actors**: Miners/guessers
- **Process**: Solve cryptographic puzzles to validate blocks
- **Reward**: Block rewards and transaction fees

**Key Insight**: Only composers include transactions in blocks. Proof upgraders and guessers have specialized roles in the mining ecosystem.

### Why This Architecture

**Benefits of Neptune's Three-Step Mining Process**:

- **Scalability**: Separating proof generation from block composition allows for better scalability
- **Accessibility**: Users with different hardware capabilities can participate at different levels
- **Efficiency**: Composers can easily include pre-processed single proofs in blocks
- **Specialization**: Each role (proof upgraders, composers, guessers) can optimize for their specific function

## Proof Upgrading Process

### Proof Upgraders

- **Service**: Specialized nodes called "proof upgraders" upgrade proof collections to single proofs
- **Fee**: Charged by the upgrading service (typically ≥0.05 NPT)
- **Process**: Users submit proof collections to the mempool, proof upgraders process them into single proofs
- **Benefit**: Makes advanced proof generation accessible to users without powerful hardware
- **Role**: Proof upgraders are distinct from composers - they only handle proof upgrading, not block composition

### Upgrade Transaction Endpoint

The Neptune wallet includes an `upgrade` endpoint that allows users to:

- Submit proof collections for upgrading
- Pay upgrading fees
- Receive single proofs for block inclusion

```typescript
// Example upgrade transaction call
await neptuneRpcService.upgradeTransaction({
  tx_kernel_id: "transaction_kernel_id",
});
```

## Fee Economics

### Proof Collection Transactions

- **Fee Range**: ≥0.05 NPT
- **Reason**: Requires third-party upgrading services
- **Target Users**: Users without powerful hardware
- **Trade-off**: Higher fees for accessibility

### Single Proof Transactions

- **Fee Range**: Lowest possible fees
- **Reason**: Direct block inclusion by composers
- **Target Users**: Users with powerful hardware (64GB+ RAM)
- **Trade-off**: Lower fees but requires significant computational resources

## ELI5 (Explain Like I'm 5)

### The Transaction Proof Journey

Imagine you want to send a secret message to your friend, but you need to prove to everyone that the message is legitimate without revealing what it says.

**Step 1: Write the Secret Message (Primitive Witness)**

- You write your secret message on a piece of paper
- This paper has your secret code on it
- You can't show this to anyone because they would see your secret code
- You keep this paper safe at home

**Step 2: Create a Puzzle (Proof Collection)**

- You create a puzzle that proves your message is real
- Anyone can solve this puzzle to verify your message is legitimate
- But solving the puzzle takes time and effort
- You can share this puzzle with others
- You put this puzzle in a public "puzzle box" (mempool) where specialists can see it

**Step 3: Get the Final Answer (Single Proof)**

- The final answer is the easiest way to prove your message is real
- But creating this answer requires a very powerful computer
- If you have a super powerful computer, you can make the answer yourself
- If you don't, you pay a "puzzle solver" (proof upgrader) to make it for you
- Once you have the final answer, it's very cheap to use

**Step 4: Include in the Official Record (Block Composition)**

- Someone called a "composer" takes your final answer and puts it in the official record (block)
- The composer can easily include your final answer because it's already solved
- This is much easier than including unsolved puzzles
- **Important**: Each official record (block) can only contain one transaction, so multiple final answers must be combined first

**Step 5: Update if Needed**

- If your transaction wasn't included in the latest official record, you might need to update your final answer
- This is like updating your passport when the rules change
- Only certain types of answers can be updated (not the puzzle stage)

### Real-World Analogy

Think of it like getting a passport:

- **Primitive Witness** = Your birth certificate (contains sensitive info, keep it safe, can be updated)
- **Proof Collection** = Getting a passport photo taken (most people can do this, but you might pay a service, cannot be updated once taken)
- **Single Proof** = Having the actual passport (requires government processing, but once you have it, travel is easy and cheap, can be updated or merged with other passports)
- **Block Proof** = Your passport being stamped for a specific trip (final state, one transaction per trip)
- **Proof Upgrader** = The passport office that processes your photo into a passport
- **Composer** = The airline that accepts your passport for travel (only accepts valid passports, not photos, but each flight can only carry one passenger's passport)

### Why This Matters

- **If you have a powerful computer**: You can make your own "passport" (single proof) and pay the lowest fees
- **If you have a regular computer**: You make a "photo" (proof collection) and pay the "passport office" (proof upgrader) to process it into a "passport" (single proof)
- **The more powerful your computer**: The less you pay in fees
- **The less powerful your computer**: The more you pay in fees, but you can still participate
- **The "airline" (composer)**: Only accepts valid "passports" (single proofs), making them much easier to include in blocks

## Technical Implementation

### Wallet Configuration

Users can configure their transaction proving capability in the wallet settings:

```typescript
interface PerformanceSettings {
  txProvingCapability?: "lockscript" | "singleproof" | "proofcollection";
  maxNumProofs: number;
  numberOfMpsPerUtxo: number;
}
```

### Mining Settings

The wallet includes mining settings that affect proof generation:

```typescript
interface MiningSettings {
  txProofUpgrading: boolean;
  txUpgradeFilter: string;
  // ... other mining configurations
}
```

### Upgrade Process

The upgrade process is handled through the mempool and RPC interface:

1. User generates proof collection locally
2. User submits proof collection to the mempool (publicly broadcast)
3. Proof upgraders monitor the mempool for proof collections
4. Proof upgrader processes proof collection into single proof
5. User pays upgrading fee to the proof upgrader
6. Single proof becomes available for composers to include in blocks
7. Composers include single proofs in blocks (much easier than including proof collections)

### Mempool Synchronization

When a new block is added to the blockchain, Neptune's mempool is automatically synchronized through the `update_with_block` method:

**Location**: `neptune-core/src/state/mempool.rs` (lines 925-1089)

**Key Functions**:

- **Double-spend Detection**: Removes transactions that conflict with the new block's inputs using SWBF (Sparse Witness Bloom Filter) indices
- **Reorganization Handling**: Clears mempool if a blockchain reorganization is detected
- **Transaction Restoration**: Restores temporarily removed transactions that become valid again
- **Update Job Creation**: Generates update jobs for different proof types:
  - Primitive witness transactions → Update to new mutator set
  - Proof collection transactions → Update if primitive witness available
  - Single proof transactions → Update if node can produce single proofs
- **Mempool Management**: Removes transactions that can't be updated and shrinks to maximum size

This method ensures the mempool stays synchronized with the blockchain state and manages the lifecycle of different proof types during block updates.

## Best Practices

### For Users with Powerful Hardware (64GB+ RAM)

- Set `txProvingCapability` to `'singleproof'`
- Generate single proofs locally
- Pay the lowest transaction fees
- Ideal for high-value transactions

### For Users with Standard Hardware

- Set `txProvingCapability` to `'proofcollection'`
- Generate proof collections locally
- Use third-party upgrading services
- Accept higher fees for accessibility

### For Users with Limited Hardware

- Set `txProvingCapability` to `'lockscript'`
- Use basic transaction validation
- Suitable for simple, low-value transactions

## Security Considerations

### Primitive Witness Security

- **Never transmit** primitive witnesses over the network
- Keep primitive witnesses secure on the user's device
- Use secure storage for sensitive transaction data

### Proof Collection Security

- Proof collections can be safely transmitted
- Don't contain secret keys
- Can be shared with upgrading services

### Single Proof Security

- Single proofs are safe to broadcast
- Don't contain sensitive information
- Can be included in public blockchain data

## Future Developments

The Neptune protocol continues to evolve, with potential improvements including:

- More efficient proof generation algorithms
- Reduced hardware requirements for single proof generation
- Lower-cost upgrading services
- Enhanced privacy features
- Better integration with mobile devices

## Conclusion

Neptune's transaction proof lifecycle provides a flexible system that balances privacy, security, and accessibility. The three-step mining process (proof upgrading, composition, and guessing) creates specialized roles that optimize the network for different user capabilities and hardware resources.

**Key Insights**:

- **More powerful hardware = lower fees**: Users with 64GB+ RAM can generate single proofs locally
- **Inclusive design**: Users with standard hardware can participate through proof upgraders
- **Specialized roles**: Proof upgraders, composers, and guessers each have distinct responsibilities
- **Efficient block composition**: Composers can easily include pre-processed single proofs in blocks
- **One transaction per block**: Neptune's unique design requires merging single proofs before block composition (not a throughput limitation)
- **Update constraints**: Only primitive witnesses and single proofs can be updated; proof collections cannot
- **Four-stage lifecycle**: Primitive Witness → Proof Collection → Single Proof → Block Proof

The system ensures that the network remains accessible to users with varying levels of computational power while maintaining the highest standards of privacy and security through its unique zk-STARKs implementation and specialized mining architecture.
