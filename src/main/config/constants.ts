/**
 * Application Constants
 *
 * Centralized configuration for binary paths and other constants
 */

import path from "node:path";
import { platform, arch } from "node:os";

/**
 * Get cross-platform development binary path
 * @param binaryName - The name of the binary (without extension)
 * @returns The full path to the development binary for the current platform
 */
function getDevBinaryPath(binaryName: string): string {
    const platformName = platform();
    const extension = platformName === "win32" ? ".exe" : "";

    // Common development paths for different platforms
    const devPaths = {
        win32: [
            path.join(
                process.cwd(),
                "..",
                "neptune-core",
                "target",
                "release",
                `${binaryName}${extension}`,
            ),
            path.join(
                process.env.USERPROFILE || "~",
                "Documents",
                "GitHub",
                "neptune-core",
                "target",
                "release",
                `${binaryName}${extension}`,
            ),
        ],
        darwin: [
            path.join(
                process.cwd(),
                "..",
                "neptune-core",
                "target",
                "release",
                `${binaryName}${extension}`,
            ),
            path.join(
                process.env.HOME || "~",
                "Documents",
                "GitHub",
                "neptune-core",
                "target",
                "release",
                `${binaryName}${extension}`,
            ),
        ],
        linux: [
            path.join(
                process.cwd(),
                "..",
                "neptune-core",
                "target",
                "release",
                `${binaryName}${extension}`,
            ),
            path.join(
                process.env.HOME || "~",
                "Documents",
                "GitHub",
                "neptune-core",
                "target",
                "release",
                `${binaryName}${extension}`,
            ),
        ],
    };

    // Return the first path for the current platform
    return devPaths[platformName as keyof typeof devPaths]?.[0] || "";
}

/**
 * Get the platform-specific binary path
 * @param binaryName - The name of the binary (without extension)
 * @returns The full path to the binary for the current platform
 */
function getBinaryPath(binaryName: string): string {
    // Map Node.js platform names to our directory structure
    const platformMap: Record<string, string> = {
        linux: "linux-x64",
        darwin: arch() === "arm64" ? "mac-arm64" : "mac-x64",
        win32: "win-x64",
    };

    const platformDir = platformMap[platform()] || "linux-x64";
    const extension = platform() === "win32" ? ".exe" : "";

    // Check if we're in a packaged app vs development
    const isPackaged =
        process.resourcesPath &&
        !process.resourcesPath.includes("node_modules/electron/dist");

    if (isPackaged) {
        // Production mode - use process.resourcesPath
        return path.join(
            process.resourcesPath,
            "binaries",
            platformDir,
            `${binaryName}${extension}`,
        );
    } else {
        // Development mode - use project root
        return path.join(
            process.cwd(),
            "resources",
            "binaries",
            platformDir,
            `${binaryName}${extension}`,
        );
    }
}

/**
 * Get the correct binary path for the current environment
 * @param binaryName - The name of the binary (without extension)
 * @returns The full path to the binary, always using bundled binaries
 */
function getValidBinaryPath(binaryName: string): string {
    // Check if we're in a packaged app vs development
    const isPackaged =
        process.resourcesPath &&
        !process.resourcesPath.includes("node_modules/electron/dist");
    const mode = isPackaged ? "production" : "development";

    // Always use bundled binaries from resources/binaries/
    const bundledPath = getBinaryPath(binaryName);
    console.log(
        `[BINARY_PATH] ${mode} mode - using bundled path for ${binaryName}: ${bundledPath}`,
    );
    return bundledPath;
}

/**
 * Binary paths for Neptune executables
 *
 * Cross-platform approach: Automatically detects platform and architecture
 * and uses the appropriate binary path with fallback logic
 */
export const BINARY_PATHS = {
    // Smart paths that automatically choose production or development
    NEPTUNE_CORE: getValidBinaryPath("neptune-core"),
    NEPTUNE_CLI: getValidBinaryPath("neptune-cli"),
    TRITON_VM_PROVER: getValidBinaryPath("triton-vm-prover"),

    // Explicit production paths (for debugging)
    PROD_NEPTUNE_CORE: getBinaryPath("neptune-core"),
    PROD_NEPTUNE_CLI: getBinaryPath("neptune-cli"),
    PROD_TRITON_VM_PROVER: getBinaryPath("triton-vm-prover"),

    // Explicit development fallback paths (cross-platform)
    DEV_NEPTUNE_CORE: getDevBinaryPath("neptune-core"),
    DEV_NEPTUNE_CLI: getDevBinaryPath("neptune-cli"),
    DEV_TRITON_VM_PROVER: getDevBinaryPath("triton-vm-prover"),
} as const;

/**
 * Get cross-platform data directory
 * Uses appropriate directory structure for each platform
 */
function getCrossPlatformDataDir(): string {
    const platformName = platform();

    if (platformName === "win32") {
        // Windows: %APPDATA%\Neptune\main
        return path.join(
            process.env.APPDATA || process.env.LOCALAPPDATA || "~",
            "Neptune",
            "main",
        );
    } else if (platformName === "darwin") {
        // macOS: ~/Library/Application Support/Neptune/main
        return path.join(
            process.env.HOME || "~",
            "Library",
            "Application Support",
            "Neptune",
            "main",
        );
    } else {
        // Linux: ~/.local/share/neptune/main
        return path.join(
            process.env.HOME || "~",
            ".local",
            "share",
            "neptune",
            "main",
        );
    }
}

/**
 * Default data directory (cross-platform)
 * Uses appropriate directory structure for each platform
 */
export const DEFAULT_DATA_DIR = getCrossPlatformDataDir();

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
