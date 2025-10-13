/**
 * Application Constants
 *
 * Centralized configuration for binary paths and other constants
 */

import path from "node:path";

/**
 * Detect if we're running in development or production mode
 */
const isDevelopment =
    process.env.NODE_ENV === "development" ||
    process.env.ELECTRON_IS_DEV === "1" ||
    !process.resourcesPath ||
    process.resourcesPath.includes("node_modules");

/**
 * Binary paths for Neptune executables
 *
 * Automatically detects development vs production mode and uses appropriate paths
 */
export const BINARY_PATHS = {
    // Development paths (local neptune-core build)
    DEV_NEPTUNE_CORE:
        "/home/anon/Documents/GitHub/neptune-core/target/release/neptune-core",
    DEV_NEPTUNE_CLI:
        "/home/anon/Documents/GitHub/neptune-core/target/release/neptune-cli",
    DEV_TRITON_VM_PROVER:
        "/home/anon/Documents/GitHub/neptune-core/target/release/triton-vm-prover",

    // Production paths (bundled binaries in packaged app)
    PROD_NEPTUNE_CORE: path.join(
        process.resourcesPath,
        "binaries",
        "neptune-core",
    ),
    PROD_NEPTUNE_CLI: path.join(
        process.resourcesPath,
        "binaries",
        "neptune-cli",
    ),
    PROD_TRITON_VM_PROVER: path.join(
        process.resourcesPath,
        "binaries",
        "triton-vm-prover",
    ),

    // Auto-selected paths based on environment
    NEPTUNE_CORE: isDevelopment
        ? "/home/anon/Documents/GitHub/neptune-core/target/release/neptune-core"
        : path.join(process.resourcesPath, "binaries", "neptune-core"),
    NEPTUNE_CLI: isDevelopment
        ? "/home/anon/Documents/GitHub/neptune-core/target/release/neptune-cli"
        : path.join(process.resourcesPath, "binaries", "neptune-cli"),
    TRITON_VM_PROVER: isDevelopment
        ? "/home/anon/Documents/GitHub/neptune-core/target/release/triton-vm-prover"
        : path.join(process.resourcesPath, "binaries", "triton-vm-prover"),
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
