/**
 * Neptune Core Settings Types
 *
 * TypeScript interfaces for all neptune-core CLI arguments
 * Organized by category for easy management
 */

// Network Types
export type NetworkType = "main" | "alpha" | "beta" | "testnet" | "regtest";
export type FeeNotificationMethod =
    | "on-chain-symmetric"
    | "on-chain-generation"
    | "off-chain";
export type TxProvingCapability =
    | "lockscript"
    | "singleproof"
    | "proofcollection";

// Network Settings
export interface NetworkSettings {
    // Basic Network Configuration
    network: NetworkType;
    peerPort: number;
    rpcPort: number;
    peerListenAddr: string;

    // Peer Management
    peers: string[]; // Array of "ip:port" strings
    maxNumPeers: number;
    maxConnectionsPerIp?: number;
    peerTolerance: number;
    reconnectCooldown: number;
    restrictPeersToList: boolean;
    bootstrap: boolean;
}

// Mining Settings
export interface MiningSettings {
    // Step 1: Proof Upgrading
    txProofUpgrading: boolean;
    txUpgradeFilter?: string; // Format: "divisor:remainder" e.g., "4:2"
    gobblingFraction: number;
    minGobblingFee: number;

    // Step 2: Block Composition
    compose: boolean;
    maxNumComposeMergers: number;
    secretCompositions: boolean;
    whitelistedComposers: string[]; // Array of IP addresses
    ignoreForeignCompositions: boolean;

    // Step 3: Guessing
    guess: boolean;
    guesserThreads?: number; // Default: number of CPU cores
    guesserFraction: number;
    minimumGuesserFraction: number;
    minimumGuesserImprovementFraction: number;
}

// Performance Settings
export interface PerformanceSettings {
    // Proof Generation
    maxLog2PaddedHeightForProofs?: number;
    maxNumProofs: number;
    tritonVmEnvVars?: string; // Complex format: 'height:"KEY=VAL ..."'

    // Sync & Memory
    syncModeThreshold: number;
    maxMempoolSize: string; // Format: "1G", "500M", etc.

    // Transaction Capability
    txProvingCapability?: TxProvingCapability;
    numberOfMpsPerUtxo: number;
}

// Security Settings
export interface SecuritySettings {
    // Privacy & Access Control
    disableCookieHint: boolean;
    bannedIps: string[]; // Array of IP addresses

    // Transaction Controls
    noTransactionInitiation: boolean;
    feeNotification: FeeNotificationMethod;

    // Block Scanning (Recovery)
    scanBlocks?: string; // Format: "..", "..1337", "1337..", "13..=37"
    scanKeys?: number;
}

// Data & Storage Settings
export interface DataSettings {
    dataDir?: string; // Custom data directory path
    importBlocksFromDirectory?: string;
    importBlockFlushPeriod: number;
    disableValidationInBlockImport: boolean;
}

// Advanced Settings
export interface AdvancedSettings {
    // Development & Debugging
    tokioConsole: boolean;

    // Block Notification
    blockNotifyCommand?: string; // Execute command when best block changes
}

// Price Fetching Settings
export interface PriceFetchingSettings {
    enabled: boolean;
    currency: "USD" | "EUR" | "GBP";
    cacheTtl: number; // Cache TTL in minutes (1-60)
    lastFetched?: Date;
    cachedPrices?: {
        usd: number;
        eur: number;
        gbp: number;
        timestamp: Date;
    };
}

// Complete Settings Structure
export interface NeptuneCoreSettings {
    network: NetworkSettings;
    mining: MiningSettings;
    performance: PerformanceSettings;
    security: SecuritySettings;
    data: DataSettings;
    advanced: AdvancedSettings;
    priceFetching: PriceFetchingSettings;
}

// Default values
export const DEFAULT_NETWORK_SETTINGS: NetworkSettings = {
    network: "main",
    peerPort: 9798,
    rpcPort: 9799,
    peerListenAddr: "::",
    peers: [],
    maxNumPeers: 10,
    maxConnectionsPerIp: undefined,
    peerTolerance: 1000,
    reconnectCooldown: 1800,
    restrictPeersToList: false,
    bootstrap: false,
};

export const DEFAULT_MINING_SETTINGS: MiningSettings = {
    txProofUpgrading: false,
    txUpgradeFilter: "1:0",
    gobblingFraction: 0.6,
    minGobblingFee: 0.01,
    compose: false,
    maxNumComposeMergers: 1,
    secretCompositions: false,
    whitelistedComposers: [],
    ignoreForeignCompositions: false,
    guess: false,
    guesserThreads: undefined,
    guesserFraction: 0.5,
    minimumGuesserFraction: 0.5,
    minimumGuesserImprovementFraction: 0.17,
};

export const DEFAULT_PERFORMANCE_SETTINGS: PerformanceSettings = {
    maxLog2PaddedHeightForProofs: undefined,
    maxNumProofs: 16,
    tritonVmEnvVars: undefined,
    syncModeThreshold: 1000,
    maxMempoolSize: "1G",
    txProvingCapability: undefined,
    numberOfMpsPerUtxo: 3,
};

export const DEFAULT_SECURITY_SETTINGS: SecuritySettings = {
    disableCookieHint: false,
    bannedIps: [],
    noTransactionInitiation: false,
    feeNotification: "on-chain-symmetric",
    scanBlocks: undefined,
    scanKeys: undefined,
};

export const DEFAULT_DATA_SETTINGS: DataSettings = {
    dataDir: undefined,
    importBlocksFromDirectory: undefined,
    importBlockFlushPeriod: 250,
    disableValidationInBlockImport: false,
};

export const DEFAULT_ADVANCED_SETTINGS: AdvancedSettings = {
    tokioConsole: false,
    blockNotifyCommand: undefined,
};

export const DEFAULT_PRICE_FETCHING_SETTINGS: PriceFetchingSettings = {
    enabled: false,
    currency: "USD",
    cacheTtl: 5, // 5 minutes default
    lastFetched: undefined,
    cachedPrices: undefined,
};

export const DEFAULT_NEPTUNE_CORE_SETTINGS: NeptuneCoreSettings = {
    network: DEFAULT_NETWORK_SETTINGS,
    mining: DEFAULT_MINING_SETTINGS,
    performance: DEFAULT_PERFORMANCE_SETTINGS,
    security: DEFAULT_SECURITY_SETTINGS,
    data: DEFAULT_DATA_SETTINGS,
    advanced: DEFAULT_ADVANCED_SETTINGS,
    priceFetching: DEFAULT_PRICE_FETCHING_SETTINGS,
};
