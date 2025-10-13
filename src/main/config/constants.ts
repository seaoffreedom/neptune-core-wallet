/**
 * Application Constants
 *
 * Centralized configuration for binary paths and other constants
 */

import path from "node:path";

/**
 * Binary paths for Neptune executables
 * 
 * In production, binaries are bundled in resources/binaries/
 * In development, we can fall back to local build paths
 */
export const BINARY_PATHS = {
    // Production paths - bundled binaries
    NEPTUNE_CORE: path.join(process.resourcesPath, "binaries", "neptune-core"),
    NEPTUNE_CLI: path.join(process.resourcesPath, "binaries", "neptune-cli"),
    TRITON_VM_PROVER: path.join(process.resourcesPath, "binaries", "triton-vm-prover"),

    // Development fallback paths (for local development)
    DEV_NEPTUNE_CORE: "/home/anon/Documents/GitHub/neptune-core/target/release/neptune-core",
    DEV_NEPTUNE_CLI: "/home/anon/Documents/GitHub/neptune-core/target/release/neptune-cli",
} as const;

/**
 * Default data directory (let neptune-core use its default)
 * We don't need to specify a custom data directory
 */
export const DEFAULT_DATA_DIR = path.join(
    process.env.HOME || "~",
    ".local",
    "share",
    "neptune",
    "main",
);

/**
 * RPC Ports
 */
export const RPC_PORTS = {
    CORE: 9799,
    CLI: 9801,
} as const;

/**
 * Network Ports
 */
export const NETWORK_PORTS = {
    PEER: 9798,
} as const;

/**
 * Timeouts (in milliseconds)
 */
export const TIMEOUTS = {
    CLI_COMMAND: 30000, // 30 seconds
    RPC_CALL: 30000, // 30 seconds
    PROCESS_STARTUP: 10000, // 10 seconds
} as const;
