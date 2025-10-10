/**
 * CLI Flag Mapping for Neptune Core
 *
 * Maps settings keys to neptune-core CLI flags
 * Based on actual neptune-core --help output
 */

export interface CLIFlagConfig {
    flag: string; // CLI flag name
    type: "value" | "boolean" | "array"; // Flag type
    valueMap?: Record<string, string>; // Optional value transformation
    arraySeparator?: string; // For array types, how to separate values
}

/**
 * Maps settings keys to neptune-core CLI flags
 *
 * Format: 'category.key' -> CLI flag info
 */
export const CLI_FLAG_MAP: Record<string, CLIFlagConfig> = {
    // Network Settings
    "network.network": {
        flag: "--network",
        type: "value",
        valueMap: {
            main: "main",
            alpha: "alpha",
            beta: "beta",
            testnet: "testnet",
            regtest: "regtest",
        },
    },
    "network.peerPort": {
        flag: "--peer-port",
        type: "value",
    },
    "network.rpcPort": {
        flag: "--rpc-port",
        type: "value",
    },
    "network.peerListenAddr": {
        flag: "--peer-listen-addr",
        type: "value",
    },
    "network.maxNumPeers": {
        flag: "--max-num-peers",
        type: "value",
    },
    "network.maxConnectionsPerIp": {
        flag: "--max-connections-per-ip",
        type: "value",
    },
    "network.peerTolerance": {
        flag: "--peer-tolerance",
        type: "value",
    },
    "network.reconnectCooldown": {
        flag: "--reconnect-cooldown",
        type: "value",
    },
    "network.restrictPeersToList": {
        flag: "--restrict-peers-to-list",
        type: "boolean",
    },
    "network.bootstrap": {
        flag: "--bootstrap",
        type: "boolean",
    },
    "network.peers": {
        flag: "--peer",
        type: "array",
        arraySeparator: " ", // Multiple --peer flags
    },
    "network.bannedIps": {
        flag: "--ban",
        type: "array",
        arraySeparator: " ", // Multiple --ban flags
    },

    // Mining Settings
    "mining.txProofUpgrading": {
        flag: "--tx-proof-upgrading",
        type: "boolean",
    },
    "mining.txUpgradeFilter": {
        flag: "--tx-upgrade-filter",
        type: "value",
    },
    "mining.gobblingFraction": {
        flag: "--gobbling-fraction",
        type: "value",
    },
    "mining.minGobblingFee": {
        flag: "--min-gobbling-fee",
        type: "value",
    },
    "mining.compose": {
        flag: "--compose",
        type: "boolean",
    },
    "mining.maxNumComposeMergers": {
        flag: "--max-num-compose-mergers",
        type: "value",
    },
    "mining.secretCompositions": {
        flag: "--secret-compositions",
        type: "boolean",
    },
    "mining.whitelistedComposers": {
        flag: "--whitelisted-composer",
        type: "array",
        arraySeparator: " ", // Multiple --whitelisted-composer flags
    },
    "mining.ignoreForeignCompositions": {
        flag: "--ignore-foreign-compositions",
        type: "boolean",
    },
    "mining.guess": {
        flag: "--guess",
        type: "boolean",
    },
    "mining.guesserThreads": {
        flag: "--guesser-threads",
        type: "value",
    },
    "mining.guesserFraction": {
        flag: "--guesser-fraction",
        type: "value",
    },
    "mining.minimumGuesserFraction": {
        flag: "--minimum-guesser-fraction",
        type: "value",
    },
    "mining.minimumGuesserImprovementFraction": {
        flag: "--minimum-guesser-improvement-fraction",
        type: "value",
    },

    // Performance Settings
    "performance.maxLog2PaddedHeightForProofs": {
        flag: "--max-log2-padded-height-for-proofs",
        type: "value",
    },
    "performance.maxNumProofs": {
        flag: "--max-num-proofs",
        type: "value",
    },
    "performance.tritonVmEnvVars": {
        flag: "--triton-vm-env-vars",
        type: "value",
    },
    "performance.syncModeThreshold": {
        flag: "--sync-mode-threshold",
        type: "value",
    },
    "performance.maxMempoolSize": {
        flag: "--max-mempool-size",
        type: "value",
    },
    "performance.txProvingCapability": {
        flag: "--tx-proving-capability",
        type: "value",
        valueMap: {
            lockscript: "lockscript",
            singleproof: "singleproof",
            proofcollection: "proofcollection",
        },
    },
    "performance.numberOfMpsPerUtxo": {
        flag: "--number-of-mps-per-utxo",
        type: "value",
    },

    // Security Settings
    "security.disableCookieHint": {
        flag: "--disable-cookie-hint",
        type: "boolean",
    },
    "security.noTransactionInitiation": {
        flag: "--no-transaction-initiation",
        type: "boolean",
    },
    "security.feeNotification": {
        flag: "--fee-notification",
        type: "value",
        valueMap: {
            "on-chain-symmetric": "on-chain-symmetric",
            "on-chain-generation": "on-chain-generation",
            "off-chain": "off-chain",
        },
    },
    "security.scanBlocks": {
        flag: "--scan-blocks",
        type: "value",
    },
    "security.scanKeys": {
        flag: "--scan-keys",
        type: "value",
    },

    // Data Settings
    "data.dataDir": {
        flag: "--data-dir",
        type: "value",
    },
    "data.importBlocksFromDirectory": {
        flag: "--import-blocks-from-directory",
        type: "value",
    },
    "data.importBlockFlushPeriod": {
        flag: "--import-block-flush-period",
        type: "value",
    },
    "data.disableValidationInBlockImport": {
        flag: "--disable-validation-in-block-import",
        type: "boolean",
    },

    // Advanced Settings
    "advanced.tokioConsole": {
        flag: "--tokio-console",
        type: "boolean",
    },
    "advanced.blockNotifyCommand": {
        flag: "", // This is a positional argument, not a flag
        type: "value",
    },
};

/**
 * Special computed flags that don't map directly to settings
 */
export const COMPUTED_FLAGS = {
    // --mine is computed from compose || guess
    MINE: "--mine",
} as const;

/**
 * Positional arguments (not flags)
 */
export const POSITIONAL_ARGS = {
    BLOCK_NOTIFY: "blockNotifyCommand",
} as const;

/**
 * Get CLI flag configuration for a settings key
 */
export function getCLIFlagConfig(settingKey: string): CLIFlagConfig | null {
    return CLI_FLAG_MAP[settingKey] || null;
}

/**
 * Check if a setting key has a CLI flag mapping
 */
export function hasCLIFlagMapping(settingKey: string): boolean {
    return settingKey in CLI_FLAG_MAP;
}

/**
 * Get all settings keys that have CLI flag mappings
 */
export function getAllMappedSettings(): string[] {
    return Object.keys(CLI_FLAG_MAP);
}

/**
 * Get settings keys for a specific category
 */
export function getCategoryMappings(
    category: string,
): Record<string, CLIFlagConfig> {
    const result: Record<string, CLIFlagConfig> = {};
    for (const [key, config] of Object.entries(CLI_FLAG_MAP)) {
        if (key.startsWith(`${category}.`)) {
            result[key] = config;
        }
    }
    return result;
}
