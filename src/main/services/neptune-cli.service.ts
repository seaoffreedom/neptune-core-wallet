/**
 * Neptune CLI Service
 *
 * Handles Neptune operations using direct CLI commands instead of RPC.
 * This provides more reliable operations with better error handling.
 * We'll migrate commands here as needed for performance and reliability.
 */

import { execa } from "execa";
import { BINARY_PATHS, TIMEOUTS } from "../config/constants";

export interface CliResult<T> {
    success: boolean;
    data?: T;
    error?: string;
}

export interface PeerInfo {
    address: string;
    port: number;
    connected: boolean;
    lastSeen: number;
}

export class NeptuneCliService {
    private cliBinaryPath: string;

    constructor() {
        this.cliBinaryPath = BINARY_PATHS.NEPTUNE_CLI;
    }

    /**
     * Execute a CLI command directly without port flag
     */
    private async executeCommandDirect(
        command: string,
        args: string[] = [],
    ): Promise<CliResult<string>> {
        try {
            const fullArgs = [command, ...args];
            const { stdout } = await execa(this.cliBinaryPath, fullArgs, {
                timeout: TIMEOUTS.CLI_COMMAND,
                encoding: "utf8",
            });

            return {
                success: true,
                data: stdout,
            };
        } catch (error) {
            const execaError = error as { stderr?: string; message?: string };
            return {
                success: false,
                error: execaError.stderr || execaError.message,
            };
        }
    }

    /**
     * Get peer information using CLI
     */
    async getPeerInfo(): Promise<CliResult<PeerInfo[]>> {
        try {
            // Execute peer-info command without port flag for cleaner output
            const result = await this.executeCommandDirect("peer-info");

            if (result.success && result.data) {
                // Parse the CLI output to extract peer information
                // The CLI typically returns JSON or formatted text with peer details
                const peers: PeerInfo[] = [];

                // Use regex to extract peer addresses from connected_address fields
                // This specifically looks for the connected_address pattern in the JSON
                const connectedAddressRegex = /"connected_address":"([^"]+)"/g;
                let match: RegExpExecArray | null;

                match = connectedAddressRegex.exec(result.data);
                while (match !== null) {
                    const fullAddress = match[1]; // e.g., "63.33.46.180:9798" or "[::ffff:83.56.49.168]:9798"

                    // Parse the address and port
                    let address: string;
                    let port: number;

                    if (
                        fullAddress.startsWith("[") &&
                        fullAddress.includes("]:")
                    ) {
                        // IPv6 format: [::ffff:83.56.49.168]:9798
                        const bracketEnd = fullAddress.indexOf("]:");
                        const ipv6Address = fullAddress.substring(
                            1,
                            bracketEnd,
                        );
                        port = parseInt(
                            fullAddress.substring(bracketEnd + 2),
                            10,
                        );

                        // Extract IPv4 from IPv4-mapped IPv6 addresses (::ffff:x.x.x.x)
                        if (ipv6Address.startsWith("::ffff:")) {
                            address = ipv6Address.substring(7); // Remove '::ffff:' prefix
                        } else {
                            address = ipv6Address; // Keep as-is for pure IPv6
                        }
                    } else if (fullAddress.includes(":")) {
                        // IPv4 format: 84.32.185.161:9798
                        const [addr, portStr] = fullAddress.split(":");
                        address = addr;
                        port = parseInt(portStr, 10);
                    } else {
                        // Skip invalid addresses
                        continue;
                    }

                    // Validate the parsed address and port
                    if (address && port && port > 0 && port < 65536) {
                        peers.push({
                            address: address,
                            port: port,
                            connected: true,
                            lastSeen: Date.now(),
                        });
                    }

                    match = connectedAddressRegex.exec(result.data);
                }

                return {
                    success: true,
                    data: peers,
                };
            } else {
                return {
                    success: false,
                    error: result.error || "Failed to get peer info",
                };
            }
        } catch (error) {
            return {
                success: false,
                error: (error as Error).message,
            };
        }
    }
}

// Export singleton instance
export const neptuneCliService = new NeptuneCliService();
