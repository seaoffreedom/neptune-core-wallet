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
import {
    getRuntimeBinaryPath,
    NETWORK_PORTS,
    RPC_PORTS,
} from "../config/constants";
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

// Log handling options
export type LogLevel = "suppress" | "file" | "errors-only" | "verbose";

// Process configuration
export interface ProcessConfig {
    core: {
        network: "main" | "alpha" | "beta" | "testnet" | "regtest";
        rpcPort: number;
        peerPort: number;
        dataDir?: string; // Optional - let neptune-core use default if not specified
    };
    cli: {
        port: number;
        rpcPort: number;
    };
    logging: {
        level: LogLevel;
        logDir?: string;
    };
}

// Default configuration (using standard Neptune ports)
const DEFAULT_CONFIG: ProcessConfig = {
    core: {
        network: "main",
        rpcPort: RPC_PORTS.CORE,
        peerPort: NETWORK_PORTS.PEER,
        // No dataDir - let neptune-core use its default ~/.local/share/neptune/main/
    },
    cli: {
        port: RPC_PORTS.CORE,
        rpcPort: RPC_PORTS.CLI,
    },
    logging: {
        level: (process.env.NEPTUNE_LOG_LEVEL as LogLevel) || "info", // Show info level by default for better debugging
        logDir: path.join(PROJECT_ROOT, "logs"),
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
    private validatedCorePath?: string;
    private validatedCliPath?: string;

    constructor(config: Partial<ProcessConfig> = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.argsBuilder = new NeptuneCoreArgsBuilder(peerService);
        logger.info(
            { config: this.config },
            "NeptuneProcessManager initialized",
        );
    }

    /**
     * Setup log handling for neptune-core process
     */
    private setupLogHandling(process: ChildProcess, processName: string): void {
        const logLevel = this.config.logging.level;

        if (logLevel === "suppress") {
            // Completely suppress all output
            return;
        }

        // Ensure log directory exists for file logging
        if (logLevel === "file" && this.config.logging.logDir) {
            try {
                const fs = require("node:fs");
                if (!fs.existsSync(this.config.logging.logDir)) {
                    fs.mkdirSync(this.config.logging.logDir, {
                        recursive: true,
                    });
                }
            } catch (error) {
                logger.warn(
                    { error },
                    "Failed to create log directory, falling back to console",
                );
            }
        }

        // Handle stdout
        if (process.stdout) {
            process.stdout.on("data", (data) => {
                const output = data.toString();
                this.handleLogOutput(output, "stdout", processName, logLevel);
            });
        }

        // Handle stderr
        if (process.stderr) {
            process.stderr.on("data", (data) => {
                const output = data.toString();
                this.handleLogOutput(output, "stderr", processName, logLevel);
            });
        }
    }

    /**
     * Handle log output based on configuration
     */
    private handleLogOutput(
        output: string,
        stream: "stdout" | "stderr",
        processName: string,
        logLevel: LogLevel,
    ): void {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] [${processName}] ${output}`;

        switch (logLevel) {
            case "suppress":
                // Do nothing - completely suppress
                break;

            case "file":
                // Write to log file
                if (this.config.logging.logDir) {
                    const logFile = path.join(
                        this.config.logging.logDir,
                        `${processName}.log`,
                    );
                    try {
                        const fs = require("node:fs");
                        fs.appendFileSync(logFile, logEntry);
                    } catch {
                        // Fallback to logger if file write fails
                        logger.info(logEntry);
                    }
                }
                break;

            case "errors-only":
                // Only show errors and critical messages
                if (
                    stream === "stderr" ||
                    output.toLowerCase().includes("error") ||
                    output.toLowerCase().includes("fatal") ||
                    output.toLowerCase().includes("panic")
                ) {
                    logger.error(logEntry);
                }
                break;

            case "verbose":
                // Show everything (original behavior)
                if (stream === "stderr") {
                    logger.error(logEntry);
                } else {
                    logger.info(logEntry);
                }
                break;
        }
    }

    /**
     * Validate that required binaries exist and are executable
     */
    private async validateBinaries(): Promise<void> {
        // Get runtime binary paths (determined at execution time, not module load time)
        let corePath = getRuntimeBinaryPath("neptune-core");
        let cliPath = getRuntimeBinaryPath("neptune-cli");

        logger.info(`Checking neptune-core at: ${corePath}`);
        logger.info(`Checking neptune-cli at: ${cliPath}`);
        logger.info(`process.resourcesPath: ${process.resourcesPath}`);
        logger.info(`process.cwd: ${process.cwd()}`);

        // Check if auto-selected binaries exist
        try {
            await access(corePath);
            logger.info(`Using neptune-core: ${corePath}`);
        } catch (error) {
            // In production mode, don't fall back to development paths
            const isPackaged =
                process.resourcesPath &&
                !process.resourcesPath.includes("node_modules/electron/dist");
            if (isPackaged) {
                logger.error(
                    {
                        error: (error as Error).message,
                        corePath,
                        productionPath: getRuntimeBinaryPath("neptune-core"),
                        platform: process.platform,
                        resourcesPath: process.resourcesPath,
                    },
                    `neptune-core binary not found in production package at ${corePath}`,
                );
                throw new Error(
                    `neptune-core binary not found in production package at ${corePath}. The application may not be properly packaged.`,
                );
            }

            // In development mode, fall back to development path
            logger.error(
                {
                    error: (error as Error).message,
                    corePath,
                    productionPath: getRuntimeBinaryPath("neptune-core"),
                    platform: process.platform,
                    resourcesPath: process.resourcesPath,
                },
                `Auto-selected neptune-core not found at ${corePath}, trying development path`,
            );
            // For development fallback, we need to construct the path manually
            const devPath = path.join(
                process.cwd(),
                "..",
                "neptune-core",
                "target",
                "release",
                "neptune-core",
            );
            corePath = devPath;
            try {
                await access(corePath);
                logger.info(`Using development neptune-core: ${corePath}`);
            } catch {
                logger.error(`neptune-core not found at either path:`);
                logger.error(
                    `  Production: ${getRuntimeBinaryPath("neptune-core")}`,
                );
                logger.error(`  Development: ${corePath}`);
                throw new Error(
                    `neptune-core binary not found at ${getRuntimeBinaryPath("neptune-core")} or ${corePath}. Please ensure binaries are available.`,
                );
            }
        }

        try {
            await access(cliPath);
            logger.info(`Using neptune-cli: ${cliPath}`);
        } catch (error) {
            // In production mode, don't fall back to development paths
            const isPackaged =
                process.resourcesPath &&
                !process.resourcesPath.includes("node_modules/electron/dist");
            if (isPackaged) {
                logger.error(
                    {
                        error: (error as Error).message,
                        cliPath,
                        productionPath: getRuntimeBinaryPath("neptune-cli"),
                        platform: process.platform,
                        resourcesPath: process.resourcesPath,
                    },
                    `neptune-cli binary not found in production package at ${cliPath}`,
                );
                throw new Error(
                    `neptune-cli binary not found in production package at ${cliPath}. The application may not be properly packaged.`,
                );
            }

            // In development mode, fall back to development path
            logger.warn(
                `Auto-selected neptune-cli not found at ${cliPath}, trying development path`,
            );
            // For development fallback, we need to construct the path manually
            const devPath = path.join(
                process.cwd(),
                "..",
                "neptune-core",
                "target",
                "release",
                "neptune-cli",
            );
            cliPath = devPath;
            try {
                await access(cliPath);
                logger.info(`Using development neptune-cli: ${cliPath}`);
            } catch {
                logger.error(`neptune-cli not found at either path:`);
                logger.error(
                    `  Production: ${getRuntimeBinaryPath("neptune-cli")}`,
                );
                logger.error(`  Development: ${cliPath}`);
                throw new Error(
                    `neptune-cli binary not found at ${getRuntimeBinaryPath("neptune-cli")} or ${cliPath}. Please ensure binaries are available.`,
                );
            }
        }

        // Store the validated paths for use in process spawning
        this.validatedCorePath = corePath;
        this.validatedCliPath = cliPath;

        logger.info("All required binaries validated successfully");
    }

    /**
     * Cache process state for faster restarts
     */
    private async cacheProcessState(): Promise<void> {
        // Skip caching if no custom data directory is set
        if (!this.config.core.dataDir) {
            return;
        }

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
        // Skip initialization check if no custom data directory is set
        if (!this.config.core.dataDir) {
            return false;
        }

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

            // Wrap entire initialization in a timeout
            await pTimeout(this.performInitialization(), {
                milliseconds: 120000, // 2 minutes total timeout
            });

            logger.info("Neptune initialization completed successfully");
        } catch (error) {
            if (error instanceof Error && error.name === "TimeoutError") {
                logger.error(
                    "Neptune initialization timed out after 2 minutes",
                );
                await this.shutdown();
                throw new Error(
                    "Initialization timeout - processes may be unresponsive",
                );
            }
            logger.error(
                {
                    error:
                        error instanceof Error ? error.message : String(error),
                    stack: error instanceof Error ? error.stack : undefined,
                },
                "Neptune initialization failed",
            );
            await this.shutdown();
            throw error;
        } finally {
            this.initializing = false;
        }
    }

    /**
     * Perform the actual initialization steps
     */
    private async performInitialization(): Promise<void> {
        try {
            // Step 0: Check if we can skip initialization
            if (await this.canSkipInitialization()) {
                logger.info(
                    "Skipping initialization - processes may already be running",
                );
                // Verify processes are actually running
                const status = this.getStatus();
                if (status.core.running && status.cli.running) {
                    this.isInitialized = true;
                    logger.info(
                        "Processes already running, initialization skipped",
                    );
                    return;
                }
            }

            // Step 1: Validate binaries exist
            logger.info("Step 1: Validating binaries...");
            await this.validateBinaries();
            logger.info("Binaries validated successfully");

            // Step 2: Start neptune-core
            logger.info("Step 2: Starting neptune-core...");
            await this.startCore();
            logger.info("neptune-core started successfully");

            // Step 3: Start neptune-cli in parallel while waiting for core
            logger.info(
                "Step 3: Starting neptune-cli and waiting for core readiness...",
            );
            const [cookie] = await Promise.all([
                this.waitForCoreReady(),
                this.startCli(), // Start CLI in parallel
            ]);
            logger.info("neptune-cli started and core is ready");

            // Store the cookie
            this.cookie = cookie;
            logger.info("Cookie obtained and stored");

            // Step 4: Start data polling
            logger.info("Step 4: Starting data polling...");
            this.startDataPolling(cookie);
            logger.info("Data polling started");

            this.isInitialized = true;
            logger.info("Initialization completed - isInitialized set to true");

            // Cache the successful state
            await this.cacheProcessState();
            logger.info("Process state cached");
        } catch (error) {
            logger.error(
                {
                    error:
                        error instanceof Error ? error.message : String(error),
                    stack: error instanceof Error ? error.stack : undefined,
                },
                "Initialization step failed",
            );
            throw error;
        }
    }

    /**
     * Start neptune-core process
     */
    private async startCore(): Promise<void> {
        logger.info("Starting neptune-core...");

        if (!this.validatedCorePath) {
            throw new Error(
                "neptune-core binary path not validated. Call validateBinaries() first.",
            );
        }
        const binaryPath = this.validatedCorePath;
        // Build CLI args from settings
        const settings = neptuneCoreSettingsService.getAll();
        const args = await this.argsBuilder.buildArgs(settings);

        logger.info(
            { args: args.join(" ") },
            "Starting neptune-core with generated args",
        );

        try {
            logger.info(
                {
                    binaryPath,
                    args: args.join(" "),
                    cwd: process.cwd(),
                    platform: process.platform,
                    arch: process.arch,
                },
                "Starting neptune-core with full context",
            );

            this.coreProcess = execa(binaryPath, args, {
                stdio: ["ignore", "pipe", "pipe"],
                detached: false,
                reject: false, // Don't reject promise on non-zero exit
            });

            // Handle process events
            this.coreProcess.on("error", (error) => {
                logger.error(
                    {
                        error: error.message,
                        binaryPath,
                        args: args.join(" "),
                        suggestion:
                            "Check if neptune-core binary is executable and has required dependencies",
                    },
                    "neptune-core process error",
                );
            });

            this.coreProcess.on("exit", (code, signal) => {
                logger.error(
                    {
                        code,
                        signal,
                        binaryPath,
                        args: args.join(" "),
                        platform: process.platform,
                    },
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

            // Setup log handling based on configuration
            this.setupLogHandling(this.coreProcess, "neptune-core");

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

        if (!this.validatedCliPath) {
            throw new Error(
                "neptune-cli binary path not validated. Call validateBinaries() first.",
            );
        }
        const binaryPath = this.validatedCliPath;

        // Get the actual RPC port that neptune-core is configured to use
        const settings = neptuneCoreSettingsService.getAll();
        const actualCoreRpcPort = settings.network.rpcPort;

        logger.info(
            {
                coreRpcPort: actualCoreRpcPort,
                binaryPath,
                settings: {
                    network: settings.network.network,
                    peerPort: settings.network.peerPort,
                    rpcPort: settings.network.rpcPort,
                },
            },
            "Waiting for neptune-core to be ready on configured RPC port",
        );

        return pRetry(
            async () => {
                try {
                    const result = await pTimeout(
                        execa(binaryPath, [
                            "--port",
                            actualCoreRpcPort.toString(),
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
                    // Cookie retrieved successfully
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
                    logger.warn(
                        {
                            attempt: error.attemptNumber,
                            error: error.error?.message || "Unknown error",
                            remainingAttempts: 30 - error.attemptNumber,
                        },
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

        if (!this.validatedCliPath) {
            throw new Error(
                "neptune-cli binary path not validated. Call validateBinaries() first.",
            );
        }
        const binaryPath = this.validatedCliPath;

        // Get the actual RPC port that neptune-core is configured to use
        const settings = neptuneCoreSettingsService.getAll();
        const actualCoreRpcPort = settings.network.rpcPort;

        logger.info(
            {
                coreRpcPort: actualCoreRpcPort,
                cliRpcPort: this.config.cli.rpcPort,
            },
            "Configuring neptune-cli to connect to neptune-core",
        );

        const args = [
            "--port",
            actualCoreRpcPort.toString(), // Connect to neptune-core's actual RPC port
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

            // Setup log handling based on configuration
            this.setupLogHandling(this.cliProcess, "neptune-cli");

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
        if (!this.validatedCliPath) {
            logger.error("CLI binary path not validated yet");
            return;
        }

        try {
            // Fetch balance
            const balanceResult = await execa(this.validatedCliPath, [
                "--port",
                this.config.cli.port.toString(),
                "confirmed-available-balance",
            ]);
            const balance = balanceResult.stdout.trim();

            // Fetch wallet status
            // const statusResult = await execa(this.validatedCliPath, [
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
     * Update log level configuration
     */
    setLogLevel(level: LogLevel): void {
        this.config.logging.level = level;
        logger.info({ level }, "Neptune process log level updated");
    }

    /**
     * Get current log level
     */
    getLogLevel(): LogLevel {
        return this.config.logging.level;
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
        const value = (instance as unknown as Record<string, unknown>)[
            prop as string
        ];
        return typeof value === "function" ? value.bind(instance) : value;
    },
});
