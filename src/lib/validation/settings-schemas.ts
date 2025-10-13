/**
 * Zod Validation Schemas for Neptune Core Settings
 *
 * Validates all settings categories before saving to ensure data integrity
 */

import { z } from "zod";

// Network Type Enum
const networkTypeSchema = z.enum([
    "main",
    "alpha",
    "beta",
    "testnet",
    "regtest",
]);

// Network Settings Schema
export const networkSettingsSchema = z.object({
    // Basic Network Configuration
    network: networkTypeSchema,
    peerPort: z
        .number()
        .int()
        .min(1, "Port must be at least 1")
        .max(65535, "Port must be at most 65535"),
    rpcPort: z
        .number()
        .int()
        .min(1, "Port must be at least 1")
        .max(65535, "Port must be at most 65535"),
    peerListenAddr: z.string().min(1, "Peer listen address is required"),

    // Peer Management
    peers: z.array(z.string()).default([]),
    maxNumPeers: z
        .number()
        .int()
        .min(0, "Must be at least 0")
        .max(1000, "Must be at most 1000"),
    maxConnectionsPerIp: z
        .number()
        .int()
        .min(1, "Must be at least 1")
        .optional(),
    peerTolerance: z
        .number()
        .int()
        .min(1, "Must be at least 1")
        .max(10000, "Must be at most 10000"),
    reconnectCooldown: z
        .number()
        .int()
        .min(0, "Must be at least 0")
        .max(86400, "Must be at most 86400 (1 day)"),
    restrictPeersToList: z.boolean(),
    bootstrap: z.boolean(),
});

export type NetworkSettingsFormData = z.infer<typeof networkSettingsSchema>;

// Mining Settings Schema
export const miningSettingsSchema = z.object({
    // Step 1: Proof Upgrading
    txProofUpgrading: z.boolean(),
    txUpgradeFilter: z.string().optional(),
    gobblingFraction: z
        .number()
        .min(0, "Must be between 0 and 1")
        .max(1, "Must be between 0 and 1"),
    minGobblingFee: z.number().min(0, "Must be at least 0"),

    // Step 2: Block Composition
    compose: z.boolean(),
    maxNumComposeMergers: z.number().int().min(1, "Must be at least 1"),
    secretCompositions: z.boolean(),
    whitelistedComposers: z.array(z.string()).default([]),
    ignoreForeignCompositions: z.boolean(),

    // Step 3: Guessing
    guess: z.boolean(),
    guesserThreads: z.number().int().min(1, "Must be at least 1").optional(),
    guesserFraction: z
        .number()
        .min(0, "Must be between 0 and 1")
        .max(1, "Must be between 0 and 1"),
    minimumGuesserFraction: z
        .number()
        .min(0, "Must be between 0 and 1")
        .max(1, "Must be between 0 and 1"),
    minimumGuesserImprovementFraction: z
        .number()
        .min(0, "Must be between 0 and 1")
        .max(1, "Must be between 0 and 1"),
});

export type MiningSettingsFormData = z.infer<typeof miningSettingsSchema>;

// Performance Settings Schema
export const performanceSettingsSchema = z.object({
    maxLog2PaddedHeightForProofs: z
        .number()
        .int()
        .min(10, "Must be at least 10")
        .max(32, "Must be at most 32")
        .optional(),
    maxNumProofs: z.number().int().min(1, "Must be at least 1"),
    tritonVmEnvVars: z.string().optional(),
    syncModeThreshold: z
        .number()
        .int()
        .min(10, "Must be at least 10")
        .max(100000, "Must be at most 100000"),
    maxMempoolSize: z
        .string()
        .regex(/^\d+[BKMG]$/, "Must be format: 1G, 500M, etc"),
    txProvingCapability: z
        .enum(["lockscript", "singleproof", "proofcollection"])
        .optional(),
    numberOfMpsPerUtxo: z.number().int().min(1, "Must be at least 1"),
});

export type PerformanceSettingsFormData = z.infer<
    typeof performanceSettingsSchema
>;

// Security Settings Schema
export const securitySettingsSchema = z.object({
    disableCookieHint: z.boolean(),
    bannedIps: z.array(z.string()).default([]),
    noTransactionInitiation: z.boolean(),
    feeNotification: z.enum([
        "on-chain-symmetric",
        "on-chain-generation",
        "off-chain",
    ]),
    scanBlocks: z.string().optional(),
    scanKeys: z.number().int().min(1, "Must be at least 1").optional(),
});

export type SecuritySettingsFormData = z.infer<typeof securitySettingsSchema>;

// Data Settings Schema
export const dataSettingsSchema = z.object({
    dataDir: z.string().optional(),
    importBlocksFromDirectory: z.string().optional(),
    importBlockFlushPeriod: z.number().int().min(0, "Must be at least 0"),
    disableValidationInBlockImport: z.boolean(),
});

export type DataSettingsFormData = z.infer<typeof dataSettingsSchema>;

// Advanced Settings Schema
export const advancedSettingsSchema = z.object({
    tokioConsole: z.boolean(),
    blockNotifyCommand: z.string().optional(),
});

export type AdvancedSettingsFormData = z.infer<typeof advancedSettingsSchema>;

// Price Fetching Settings Schema (for form - uses strings)
export const priceSettingsSchema = z.object({
    enabled: z.boolean(),
    currency: z.enum(["USD", "EUR", "GBP"]),
    cacheTtl: z
        .string()
        .min(1, "Cache TTL must be at least 1 minute")
        .max(2, "Cache TTL must be at most 60 minutes")
        .refine((val) => {
            const num = parseInt(val, 10);
            return !isNaN(num) && num >= 1 && num <= 60;
        }, "Cache TTL must be between 1 and 60 minutes"),
});

export type PriceSettingsFormData = z.infer<typeof priceSettingsSchema>;
