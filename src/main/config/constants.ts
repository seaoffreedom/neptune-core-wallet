/**
 * Application Constants
 *
 * Centralized configuration for binary paths and other constants
 */

import path from "node:path";
import { platform, arch } from "node:os";

/**
 * Get the platform-specific binary path
 * @param binaryName - The name of the binary (without extension)
 * @returns The full path to the binary for the current platform
 */
function getBinaryPath(binaryName: string): string {
    // Map Node.js platform names to our directory structure
    const platformMap: Record<string, string> = {
        "linux": "linux-x64",
        "darwin": arch() === "arm64" ? "mac-arm64" : "mac-x64",
        "win32": "win-x64",
    };

    const platformDir = platformMap[platform()] || "linux-x64";
    const extension = platform() === "win32" ? ".exe" : "";

    return path.join(
        process.resourcesPath || "",
        "binaries",
        platformDir,
        `${binaryName}${extension}`,
    );
}

/**
 * Binary paths for Neptune executables
 *
 * Cross-platform approach: Automatically detects platform and architecture
 * and uses the appropriate binary path
 */
export const BINARY_PATHS = {
    // Production paths (bundled binaries in packaged app)
    NEPTUNE_CORE: getBinaryPath("neptune-core"),
    NEPTUNE_CLI: getBinaryPath("neptune-cli"),
    TRITON_VM_PROVER: getBinaryPath("triton-vm-prover"),

    // Development fallback paths (for local development)
    DEV_NEPTUNE_CORE:
        "/home/anon/Documents/GitHub/neptune-core/target/release/neptune-core",
    DEV_NEPTUNE_CLI:
        "/home/anon/Documents/GitHub/neptune-core/target/release/neptune-cli",
    DEV_TRITON_VM_PROVER:
        "/home/anon/Documents/GitHub/neptune-core/target/release/triton-vm-prover",
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
