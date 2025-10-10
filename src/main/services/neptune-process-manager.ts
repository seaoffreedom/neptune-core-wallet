/**
 * Neptune Process Manager Service
 *
 * Manages the lifecycle of neptune-core and neptune-cli processes
 * with proper startup sequence and health monitoring.
 */

import type { ChildProcess } from "node:child_process";
import { access, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { execa } from "execa";
import pRetry from "p-retry";
import pTimeout from "p-timeout";
import pino from "pino";
import { NeptuneCoreArgsBuilder } from "./neptune-core-args-builder";
import { neptuneCoreSettingsService } from "./neptune-core-settings.service";
import { peerService } from "./peer.service";
import { systemResourceService } from "./system-resource.service";

// Get the project root directory
const PROJECT_ROOT = path.resolve(__dirname, "../../../");

// Logger - using simple console transport to avoid worker threads
const logger = pino({
    level: "info",
    // Remove transport to avoid worker threads
    // transport: {
    //     target: "pino-pretty",
    //     options: {
    //         colorize: true,
    //         translateTime: "SYS:standard",
    //         ignore: "pid,hostname", // Ignore these fields for cleaner output
    //     },
    // },
});

// Process configuration
export interface ProcessConfig {
    core: {
        network: "main" | "alpha" | "beta" | "testnet" | "regtest";
        rpcPort: number;
        peerPort: number;
        dataDir: string;
    };
    cli: {
        port: number;
        rpcPort: number;
    };
}

// Default configuration (using standard Neptune ports)
const DEFAULT_CONFIG: ProcessConfig = {
    core: {
        network: "main",
        rpcPort: 9799, // Standard neptune-core RPC port
        peerPort: 9798, // Standard neptune-core peer port
        dataDir: path.join(PROJECT_ROOT, "data"),
    },
    cli: {
        port: 9799, // Connect to core's RPC port
        rpcPort: 9801, // Standard neptune-cli HTTP server port
    },
};

// Process manager class
export class NeptuneProcessManager {
    private coreProcess?: ChildProcess;
    private cliProcess?: ChildProcess;
    private config: ProcessConfig;
    private isInitialized = false;
    private initializing = false;
    private dataPollingInterval?: NodeJS.Timeout;
    private cookie?: string;
    private argsBuilder: NeptuneCoreArgsBuilder;

    constructor(config: Partial<ProcessConfig> = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.argsBuilder = new NeptuneCoreArgsBuilder(peerService);
        logger.info(
            { config: this.config },
            "NeptuneProcessManager initialized",
        );
    }

    /**
     * Validate that required binaries exist and are executable
     */
    private async validateBinaries(): Promise<void> {
        const corePath = path.join(
            PROJECT_ROOT,
            "resources/binaries/neptune-core",
        );
        const cliPath = path.join(
            PROJECT_ROOT,
            "resources/binaries/neptune-cli",
        );

        try {
            await access(corePath);
            await access(cliPath);
            logger.debug("Binary validation successful");
        } catch (error) {
            throw new Error(`Required binaries not found: ${error}`);
        }
    }

    /**
     * Cache process state for faster restarts
     */
    private async cacheProcessState(): Promise<void> {
        const stateFile = path.join(
            this.config.core.dataDir,
            ".process-state.json",
        );
        const state = {
            timestamp: Date.now(),
            config: this.config,
            isInitialized: this.isInitialized,
        };

        try {
            await writeFile(stateFile, JSON.stringify(state, null, 2));
            logger.debug("Process state cached");
        } catch (error) {
            logger.warn({ error }, "Failed to cache process state");
        }
    }

    /**
     * Check if we can skip initialization based on cached state
     */
    private async canSkipInitialization(): Promise<boolean> {
        const stateFile = path.join(
            this.config.core.dataDir,
            ".process-state.json",
        );

        try {
            const stateData = await readFile(stateFile, "utf-8");
            const state = JSON.parse(stateData);

            // Check if state is recent (within last 5 minutes)
            const isRecent = Date.now() - state.timestamp < 5 * 60 * 1000;

            if (isRecent && state.isInitialized) {
                logger.debug(
                    "Found recent process state, checking if processes are still running",
                );
                return true;
            }
        } catch (_error) {
            logger.debug("No cached process state found or invalid");
        }

        return false;
    }

    /**
     * Initialize the complete startup sequence
     */
    async initialize(): Promise<void> {
        if (this.isInitialized) {
            logger.warn("Process manager already initialized");
            return;
        }

        // Prevent concurrent initialization
        if (this.initializing) {
            logger.warn("Initialization already in progress");
            return;
        }

        this.initializing = true;

        try {
            logger.info("Starting Neptune initialization sequence...");

            // Step 0: Check if we can skip initialization
            if (await this.canSkipInitialization()) {
                logger.info(
                    "Skipping initialization - processes may already be running",
                );
                // Verify processes are actually running
                const status = this.getStatus();
                if (status.core.running && status.cli.running) {
                    this.isInitialized = true;
                    this.initializing = false;
                    logger.info(
                        "Processes already running, initialization skipped",
                    );
                    return;
                }
            }

            // Step 1: Validate binaries exist
            await this.validateBinaries();

            // Step 2: Start neptune-core
            await this.startCore();

            // Step 3: Start neptune-cli in parallel while waiting for core
            const [cookie] = await Promise.all([
                this.waitForCoreReady(),
                this.startCli(), // Start CLI in parallel
            ]);

            // Store the cookie
            this.cookie = cookie;

            // Step 4: Start data polling
            this.startDataPolling(cookie);

            this.isInitialized = true;

            // Cache the successful state
            await this.cacheProcessState();

            logger.info("Neptune initialization completed successfully");
        } catch (error) {
            logger.error({ error }, "Neptune initialization failed");
            await this.shutdown();
            throw error;
        } finally {
            this.initializing = false;
        }
    }

    /**
     * Start neptune-core process
     */
    private async startCore(): Promise<void> {
        logger.info("Starting neptune-core...");

        const binaryPath = path.join(
            PROJECT_ROOT,
            "resources/binaries/neptune-core",
        );
        // Build CLI args from settings
        const settings = neptuneCoreSettingsService.getAll();
        const args = await this.argsBuilder.buildArgs(settings);

        logger.info(
            { args: args.join(" ") },
            "Starting neptune-core with generated args",
        );

        try {
            this.coreProcess = execa(binaryPath, args, {
                stdio: ["ignore", "pipe", "pipe"],
                detached: false,
                reject: false, // Don't reject promise on non-zero exit
            });

            // Handle process events
            this.coreProcess.on("error", (error) => {
                logger.error({ error }, "neptune-core process error");
            });

            this.coreProcess.on("exit", (code, signal) => {
                logger.info(
                    `neptune-core exited with code ${code}, signal ${signal}`,
                );
                // Clear the PID from system resource monitoring
                systemResourceService.setNeptuneProcessPids(
                    undefined,
                    this.cliProcess?.pid,
                );
            });

            // Set the PID for system resource monitoring
            if (this.coreProcess.pid) {
                systemResourceService.setNeptuneProcessPids(
                    this.coreProcess.pid,
                    this.cliProcess?.pid,
                );
            }

            // Catch the promise rejection when process is killed
            this.coreProcess.on("error", (error: Error) => {
                // Only log if it's not a graceful SIGTERM shutdown
                if (
                    (error as Error & { signal?: string }).signal !== "SIGTERM"
                ) {
                    logger.error({ error }, "neptune-core process error");
                }
            });

            // Log stdout/stderr for debugging peer connections
            if (this.coreProcess.stdout) {
                this.coreProcess.stdout.on("data", (data) => {
                    const output = data.toString();
                    if (
                        output.includes("peer") ||
                        output.includes("connection")
                    ) {
                        console.log("[neptune-core]", output);
                    }
                });
            }

            if (this.coreProcess.stderr) {
                this.coreProcess.stderr.on("data", (data) => {
                    const output = data.toString();
                    if (
                        output.includes("peer") ||
                        output.includes("connection") ||
                        output.includes("error")
                    ) {
                        console.error("[neptune-core ERROR]", output);
                    }
                });
            }

            // Wait a moment for the process to start
            await new Promise((resolve) => setTimeout(resolve, 2000));

            if (!this.coreProcess.pid) {
                throw new Error(
                    "Failed to start neptune-core - no PID assigned",
                );
            }

            logger.info(
                { pid: this.coreProcess.pid },
                "neptune-core started successfully",
            );
        } catch (error) {
            logger.error({ error }, "Failed to start neptune-core");
            if (this.coreProcess) {
                this.coreProcess.kill("SIGTERM");
            }
            throw error;
        }
    }

    /**
     * Wait for neptune-core to be ready by polling for cookie
     */
    private async waitForCoreReady(): Promise<string> {
        logger.info("Waiting for neptune-core to be ready...");

        const binaryPath = path.join(
            PROJECT_ROOT,
            "resources/binaries/neptune-cli",
        );

        return pRetry(
            async () => {
                try {
                    const result = await pTimeout(
                        execa(binaryPath, [
                            "--port",
                            this.config.cli.port.toString(),
                            "--get-cookie",
                        ]),
                        {
                            milliseconds: 5000,
                        },
                    );

                    const cookie = this.extractCookie(result.stdout);
                    if (!cookie) {
                        throw new Error("Cookie not available yet");
                    }

                    logger.info("Cookie obtained successfully");
                    console.log("🍪 Cookie value:", cookie);
                    return cookie;
                } catch (error) {
                    logger.debug(
                        { error: (error as Error).message },
                        "Core not ready yet, retrying...",
                    );
                    throw error;
                }
            },
            {
                retries: 30, // More retries for faster detection
                factor: 1.1, // Slower backoff for more frequent checks
                minTimeout: 200, // Faster initial checks
                maxTimeout: 1000, // Cap at 1 second
                onFailedAttempt: (error) => {
                    logger.debug(
                        `Core readiness check attempt ${error.attemptNumber} failed`,
                    );
                },
            },
        );
    }

    /**
     * Start neptune-cli in RPC server mode
     */
    private async startCli(): Promise<void> {
        logger.info("Starting neptune-cli in RPC mode...");

        const binaryPath = path.join(
            PROJECT_ROOT,
            "resources/binaries/neptune-cli",
        );
        const args = [
            "--port",
            this.config.core.rpcPort.toString(), // Connect to neptune-core
            "--rpc-mode",
            "--rpc-port",
            this.config.cli.rpcPort.toString(), // CLI's own HTTP server port
        ];

        try {
            this.cliProcess = execa(binaryPath, args, {
                stdio: ["ignore", "pipe", "pipe"],
                detached: false,
                reject: false, // Don't reject promise on non-zero exit
            });

            // Handle process events
            this.cliProcess.on("error", (error) => {
                logger.error({ error }, "neptune-cli process error");
            });

            this.cliProcess.on("exit", (code, signal) => {
                logger.info(
                    `neptune-cli exited with code ${code}, signal ${signal}`,
                );
                // Clear the PID from system resource monitoring
                systemResourceService.setNeptuneProcessPids(
                    this.coreProcess?.pid,
                    undefined,
                );
            });

            // Set the PID for system resource monitoring
            if (this.cliProcess.pid) {
                systemResourceService.setNeptuneProcessPids(
                    this.coreProcess?.pid,
                    this.cliProcess.pid,
                );
            }

            // Catch the promise rejection when process is killed
            this.cliProcess.on("error", (error: Error) => {
                // Only log if it's not a graceful SIGTERM shutdown
                if (
                    (error as Error & { signal?: string }).signal !== "SIGTERM"
                ) {
                    logger.error({ error }, "neptune-cli process error");
                }
            });

            // Wait a moment for the process to start
            await new Promise((resolve) => setTimeout(resolve, 1000));

            if (!this.cliProcess.pid) {
                throw new Error(
                    "Failed to start neptune-cli - no PID assigned",
                );
            }

            logger.info(
                { pid: this.cliProcess.pid },
                "neptune-cli started successfully",
            );
        } catch (error) {
            logger.error({ error }, "Failed to start neptune-cli");
            if (this.cliProcess) {
                this.cliProcess.kill("SIGTERM");
            }
            throw error;
        }
    }

    /**
     * Stop data polling
     */
    private stopDataPolling(): void {
        if (this.dataPollingInterval) {
            logger.debug("Stopping data polling");
            clearInterval(this.dataPollingInterval);
            this.dataPollingInterval = undefined;
        }
    }

    /**
     * Start data polling for wallet information
     */
    private startDataPolling(cookie: string): void {
        // Clear any existing polling interval first
        this.stopDataPolling();

        logger.info("Starting data polling...");

        this.dataPollingInterval = setInterval(async () => {
            try {
                await this.fetchWalletData(cookie);
            } catch (error) {
                logger.error({ error }, "Data polling error");
            }
        }, 5000); // Poll every 5 seconds
    }

    /**
     * Fetch wallet data using the CLI
     */
    private async fetchWalletData(_cookie: string): Promise<void> {
        const binaryPath = path.join(
            PROJECT_ROOT,
            "resources/binaries/neptune-cli",
        );

        try {
            // Fetch balance
            const balanceResult = await execa(binaryPath, [
                "--port",
                this.config.cli.port.toString(),
                "confirmed-available-balance",
            ]);
            const balance = balanceResult.stdout.trim();

            // Fetch wallet status
            // const statusResult = await execa(binaryPath, [
            //     "--port",
            //     this.config.cli.port.toString(),
            //     "wallet-status",
            // ]);
            // const status = JSON.parse(statusResult.stdout);

            logger.debug({ balance }, "Wallet data fetched");

            // TODO: Emit IPC event to update renderer state
        } catch (error) {
            logger.error({ error }, "Failed to fetch wallet data");
            throw error;
        }
    }

    /**
     * Extract cookie from CLI output
     */
    private extractCookie(output: string): string | null {
        // Extract the cookie hash from the output
        // Format: "Cookie: neptune-cli=<hash>"
        const match = output.match(/neptune-cli=([a-f0-9]{64})/);
        if (match?.[1]) {
            return match[1];
        }
        return null;
    }

    /**
     * Get process status
     */
    getStatus() {
        return {
            core: {
                running: Boolean(this.coreProcess && !this.coreProcess.killed),
                pid: this.coreProcess?.pid,
            },
            cli: {
                running: Boolean(this.cliProcess && !this.cliProcess.killed),
                pid: this.cliProcess?.pid,
            },
            initialized: this.isInitialized,
        };
    }

    /**
     * Get authentication cookie
     */
    getCookie(): string | undefined {
        return this.cookie;
    }

    /**
     * Shutdown all processes
     */
    async shutdown(): Promise<void> {
        logger.info("Shutting down Neptune processes...");

        // Stop data polling first
        this.stopDataPolling();

        // Disconnect RPC service to abort any pending requests
        const { neptuneRpcService } = await import("./neptune-rpc.service");
        neptuneRpcService.disconnect();

        // Stop CLI process
        if (this.cliProcess && !this.cliProcess.killed) {
            logger.info("Stopping neptune-cli...");
            try {
                this.cliProcess.kill("SIGTERM");
                await new Promise((resolve) => setTimeout(resolve, 2000));
                if (!this.cliProcess.killed) {
                    this.cliProcess.kill("SIGKILL");
                }
            } catch (error) {
                logger.error({ error }, "Error stopping neptune-cli");
            }
        }

        // Stop Core process
        if (this.coreProcess && !this.coreProcess.killed) {
            logger.info("Stopping neptune-core...");
            try {
                this.coreProcess.kill("SIGTERM");
                await new Promise((resolve) => setTimeout(resolve, 2000));
                if (!this.coreProcess.killed) {
                    this.coreProcess.kill("SIGKILL");
                }
            } catch (error) {
                logger.error({ error }, "Error stopping neptune-core");
            }
        }

        this.isInitialized = false;
        logger.info("Neptune processes shutdown completed");
    }
}

// Lazy singleton instance
let _neptuneProcessManagerInstance: NeptuneProcessManager | null = null;

/**
 * Get the singleton NeptuneProcessManager instance (lazy initialization)
 */
export function getNeptuneProcessManager(): NeptuneProcessManager {
    if (!_neptuneProcessManagerInstance) {
        _neptuneProcessManagerInstance = new NeptuneProcessManager();
        logger.info(
            "NeptuneProcessManager instance created (lazy initialization)",
        );
    }
    return _neptuneProcessManagerInstance;
}

// Backward compatibility - keep the old export for existing code
export const neptuneProcessManager = new Proxy({} as NeptuneProcessManager, {
    get(_target, prop) {
        const instance = getNeptuneProcessManager();
        const value = (instance as Record<string, unknown>)[prop];
        return typeof value === "function" ? value.bind(instance) : value;
    },
});
