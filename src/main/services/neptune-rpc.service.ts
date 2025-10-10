/**
 * Neptune RPC Service
 *
 * Service for making HTTP JSON-RPC calls to neptune-cli RPC server
 * Uses ky for HTTP requests
 */

import { Mutex } from "async-mutex";
import ky from "ky";
import pino from "pino";

const logger = pino({ level: "info" });

// JSON-RPC request/response types
interface JsonRpcRequest {
    jsonrpc: "2.0";
    method: string;
    params?: Record<string, unknown> | unknown[];
    id: number;
}

interface JsonRpcResponse<T = unknown> {
    jsonrpc: "2.0";
    result?: T;
    error?: {
        code: number;
        message: string;
        data?: unknown;
    };
    id: number;
}

// Dashboard overview data structure
export interface DashboardOverviewData {
    confirmations: string;
    confirmed_available_balance: string;
    confirmed_total_balance: string;
    cpu_temp: number | null;
    max_num_peers: number;
    mempool_own_tx_count: number;
    mempool_size: number;
    mempool_total_tx_count: number;
    mining_status: string;
    peer_count: number;
    proving_capability: string;
    syncing: boolean;
    tip_digest: string;
    tip_header: {
        height: number;
        timestamp: number;
    };
    unconfirmed_available_balance: string;
    unconfirmed_total_balance: string;
}

export class NeptuneRpcService {
    private rpcUrl: string;
    private cookie: string | null = null;
    private requestId = 0;
    private isConnected = false;
    private abortController?: AbortController;
    private pendingRequests = new Set<number>();
    private requestMutex = new Mutex();

    constructor(rpcPort: number = 9801) {
        this.rpcUrl = `http://localhost:${rpcPort}`;
    }

    /**
     * Set authentication cookie and mark as connected
     */
    setCookie(cookie: string): void {
        this.cookie = cookie;
        this.isConnected = true;
        logger.info(
            { cookiePreview: `${cookie.substring(0, 16)}...` },
            "RPC cookie set and connection established",
        );
    }

    /**
     * Mark connection as disconnected
     */
    disconnect(): void {
        this.isConnected = false;
        this.cookie = null;
        this.pendingRequests.clear();
        if (this.abortController) {
            this.abortController.abort();
            this.abortController = undefined;
        }
        logger.info("RPC connection marked as disconnected");
    }

    /**
     * Check if connection is healthy
     */
    private isConnectionHealthy(): boolean {
        return this.isConnected && this.cookie !== null;
    }

    /**
     * Make a JSON-RPC call with connection health checks, abort support, and request serialization
     */
    private async call<T>(
        method: string,
        params?: Record<string, unknown> | unknown[],
        timeout: number = 10000,
    ): Promise<T> {
        // Use mutex to serialize all RPC requests
        return this.requestMutex.runExclusive(async () => {
            // Check connection health before making request
            if (!this.isConnectionHealthy()) {
                throw new Error(
                    "RPC connection not available - neptune-cli may be shutting down",
                );
            }

            this.requestId += 1;
            const currentRequestId = this.requestId;

            // Track pending request
            this.pendingRequests.add(currentRequestId);

            const request: JsonRpcRequest = {
                jsonrpc: "2.0",
                method,
                params: params || {}, // Use empty object if params not provided
                id: currentRequestId,
            };

            // Create abort controller for this request
            this.abortController = new AbortController();

            try {
                const headers: Record<string, string> = {
                    "Content-Type": "application/json",
                };

                // Add cookie if available
                if (this.cookie) {
                    headers.Cookie = `neptune-cli=${this.cookie}`;
                }

                logger.info(
                    {
                        method,
                        id: currentRequestId,
                        cookie: this.cookie
                            ? `${this.cookie.substring(0, 16)}...`
                            : "none",
                        requestBody: request,
                        headers,
                    },
                    "Making RPC call",
                );

                const response = await ky
                    .post(this.rpcUrl, {
                        json: request,
                        headers: {
                            ...headers,
                            Connection: "close", // Force new connection each time
                            "Cache-Control": "no-cache", // Prevent caching
                        },
                        timeout, // Configurable timeout
                        signal: this.abortController.signal, // Add abort signal
                        retry: {
                            limit: 0, // Disable automatic retries to prevent duplicate requests
                        },
                    })
                    .json<JsonRpcResponse<T>>();

                logger.info(
                    { method, id: currentRequestId },
                    "RPC call successful",
                );

                if (response.error) {
                    throw new Error(
                        `RPC error ${response.error.code}: ${response.error.message}`,
                    );
                }

                if (response.result === undefined) {
                    throw new Error("RPC response missing result");
                }

                logger.debug(
                    { method, id: currentRequestId },
                    "RPC call successful",
                );

                return response.result;
            } catch (error) {
                // Handle abort errors gracefully
                if (error instanceof Error && error.name === "AbortError") {
                    logger.info(
                        { method, id: currentRequestId },
                        "RPC call aborted",
                    );
                    throw new Error(
                        "RPC call aborted - neptune-cli may be shutting down",
                    );
                }

                // Check if connection is still healthy after error
                if (!this.isConnectionHealthy()) {
                    logger.warn(
                        { method, id: currentRequestId },
                        "RPC call failed - connection lost",
                    );
                    throw new Error(
                        "RPC connection lost - neptune-cli may be shutting down",
                    );
                }

                logger.error(
                    {
                        error: (error as Error).message,
                        method,
                        id: currentRequestId,
                    },
                    "RPC call failed",
                );
                throw error;
            } finally {
                // Clean up abort controller and remove from pending requests
                this.abortController = undefined;
                this.pendingRequests.delete(currentRequestId);
            }
        });
    }

    /**
     * Get comprehensive dashboard overview data
     */
    async getDashboardOverview(): Promise<DashboardOverviewData> {
        return this.call<DashboardOverviewData>("dashboard_overview_data");
    }

    /**
     * Get block height
     */
    async getBlockHeight(): Promise<string> {
        return this.call<string>("block_height");
    }

    /**
     * Get network type
     */
    async getNetwork(): Promise<string> {
        return this.call<string>("network");
    }

    /**
     * Get confirmed available balance
     */
    async getConfirmedAvailableBalance(): Promise<string> {
        return this.call<string>("confirmed_available_balance");
    }

    /**
     * Get unconfirmed available balance
     */
    async getUnconfirmedAvailableBalance(): Promise<string> {
        return this.call<string>("unconfirmed_available_balance");
    }

    /**
     * Get wallet status
     */
    async getWalletStatus(): Promise<Record<string, unknown>> {
        return this.call<Record<string, unknown>>("wallet_status");
    }

    /**
     * Get next receiving address
     */
    async getNextReceivingAddress(): Promise<string> {
        return this.call<string>("next_receiving_address");
    }

    /**
     * Get transaction history
     * Note: This endpoint can be slow, using extended timeout
     */
    async getHistory(): Promise<unknown[]> {
        return this.call<unknown[]>("history", undefined, 30000); // 30 second timeout
    }

    /**
     * Get confirmations count
     */
    async getConfirmations(): Promise<string> {
        return this.call<string>("confirmations");
    }

    /**
     * List own coins/UTXOs
     * Note: This endpoint can be slow, using extended timeout
     */
    async listOwnCoins(): Promise<unknown[]> {
        return this.call<unknown[]>("list_own_coins", undefined, 30000); // 30 second timeout
    }

    /**
     * Send private transaction
     */
    async send(params: {
        outputs: Array<{ address: string; amount: string }>;
        change_policy?: string;
        fee?: string;
    }): Promise<{ tx_id: string; lastUpdated: string }> {
        // Modified neptune-cli now accepts wallet-friendly format and handles all parsing server-side
        // See: neptune-core-cli/src/rpc/handlers.rs "send" handler
        //
        // neptune-cli will:
        // 1. Parse bech32m addresses to ReceivingAddress enum
        // 2. Convert to OutputFormat::AddressAndAmount
        // 3. Apply default change policy (RecoverToNextUnusedKey + Generation + OnChain)
        // 4. Parse fee as NativeCurrencyAmount

        const rpcParams = {
            outputs: params.outputs, // Simple format: [{address: "nolgam1...", amount: "123"}]
            fee: params.fee || "0", // Optional, defaults to "0" if not provided
        };

        logger.info(
            { rpcParams, inputParams: params },
            "Sending transaction with params",
        );

        return this.call<{ tx_id: string; lastUpdated: string }>(
            "send",
            rpcParams,
        );
    }

    /**
     * Send transparent transaction
     */
    async sendTransparent(params: {
        outputs: Array<{ address: string; amount: string }>;
        change_policy?: string;
        fee?: string;
    }): Promise<{ tx_artifacts: string; lastUpdated: string }> {
        return this.call<{ tx_artifacts: string; lastUpdated: string }>(
            "send_transparent",
            params,
        );
    }

    // ========================================================================
    // Tier 1: Mempool Operations
    // ========================================================================

    /**
     * Get mempool transaction count
     */
    async getMempoolTxCount(): Promise<number> {
        return this.call<number>("mempool_tx_count");
    }

    /**
     * Get mempool size in bytes
     */
    async getMempoolSize(): Promise<number> {
        return this.call<number>("mempool_size");
    }

    /**
     * Get all punished/banned peers
     */
    async getAllPunishedPeers(): Promise<unknown[]> {
        return this.call<unknown[]>("all_punished_peers");
    }

    /**
     * Get own listen address for peers
     */
    async getOwnListenAddressForPeers(): Promise<string> {
        return this.call<string>("own_listen_address_for_peers");
    }

    // ========================================================================
    // Tier 2: Important Endpoints
    // ========================================================================

    /**
     * List all UTXOs
     */
    async listUtxos(): Promise<unknown> {
        return this.call<unknown>("list_utxos");
    }

    /**
     * Get all spendable inputs
     */
    async getSpendableInputs(): Promise<unknown[]> {
        return this.call<unknown[]>("spendable_inputs");
    }

    /**
     * Select spendable inputs for specific amount
     */
    async selectSpendableInputs(params: {
        amount: string;
    }): Promise<unknown[]> {
        return this.call<unknown[]>("select_spendable_inputs", params);
    }

    /**
     * Get all mempool transaction IDs
     */
    async getMempoolTxIds(): Promise<string[]> {
        return this.call<string[]>("mempool_tx_ids");
    }

    /**
     * Broadcast all mempool transactions
     */
    async broadcastAllMempoolTxs(): Promise<string> {
        return this.call<string>("broadcast_all_mempool_txs");
    }

    /**
     * Clear all transactions from mempool
     */
    async clearMempool(): Promise<string> {
        return this.call<string>("clear_mempool");
    }

    /**
     * Get mempool transaction kernel by ID
     */
    async getMempoolTxKernel(params: {
        tx_kernel_id: string;
    }): Promise<unknown> {
        return this.call<unknown>("mempool_tx_kernel", params);
    }

    /**
     * Validate Neptune address
     */
    async validateAddress(params: { address: string }): Promise<boolean> {
        return this.call<boolean>("validate_address", params);
    }

    /**
     * Validate amount
     */
    async validateAmount(params: { amount: string }): Promise<boolean> {
        return this.call<boolean>("validate_amount", params);
    }

    /**
     * Get nth receiving address
     */
    async getNthReceivingAddress(params: { n: number }): Promise<string> {
        return this.call<string>("nth_receiving_address", params);
    }

    /**
     * Get block digest by height
     */
    async getBlockDigest(params: { height: number }): Promise<unknown> {
        return this.call<unknown>("block_digest", params);
    }

    /**
     * Get block digests by height
     */
    async getBlockDigestsByHeight(params: {
        height: number;
    }): Promise<unknown> {
        return this.call<unknown>("block_digests_by_height", params);
    }

    /**
     * Get latest N tip digests
     */
    async getLatestTipDigests(params: { n: number }): Promise<unknown> {
        return this.call<unknown>("latest_tip_digests", params);
    }

    /**
     * Get own instance ID
     */
    async getOwnInstanceId(): Promise<unknown> {
        return this.call<unknown>("own_instance_id");
    }

    /**
     * Shutdown neptune-core
     */
    async shutdown(): Promise<boolean> {
        return this.call<boolean>("shutdown");
    }

    /**
     * Get number of expected UTXOs
     */
    async getNumExpectedUtxos(): Promise<string> {
        return this.call<string>("num_expected_utxos");
    }

    /**
     * Upgrade transaction proof
     */
    async upgradeTransaction(params: {
        tx_kernel_id: string;
    }): Promise<boolean> {
        return this.call<boolean>("upgrade", params);
    }

    /**
     * Claim off-chain UTXO
     */
    async claimUtxo(params: {
        utxo_transfer_encrypted: string;
        max_search_depth: number;
    }): Promise<boolean> {
        return this.call<boolean>("claim_utxo", params);
    }

    // ========================================================================
    // Tier 3: Advanced Endpoints
    // ========================================================================

    /**
     * Pause miner
     */
    async pauseMiner(): Promise<string> {
        return this.call<string>("pause_miner");
    }

    /**
     * Restart miner
     */
    async restartMiner(): Promise<string> {
        return this.call<string>("restart_miner");
    }

    /**
     * Get UTXO digest
     */
    async getUtxoDigest(params: { leaf_index: number }): Promise<unknown> {
        return this.call<unknown>("utxo_digest", params);
    }

    /**
     * Get CPU temperature
     */
    async getCpuTemp(): Promise<number | null> {
        return this.call<number | null>("cpu_temp");
    }

    /**
     * Get sync status
     */
    async getSyncStatus(): Promise<{
        connectedPeers: number;
        currentBlockHeight: string;
        isSynced: boolean;
        lastSyncCheck: string;
        latestBlockHash: string;
        pendingTransactions: number;
    }> {
        return this.call<{
            connectedPeers: number;
            currentBlockHeight: string;
            isSynced: boolean;
            lastSyncCheck: string;
            latestBlockHash: string;
            pendingTransactions: number;
        }>("get_sync_status");
    }

    /**
     * Get network information
     */
    async getNetworkInfo(): Promise<{
        blockHeight: string;
        lastUpdated: string;
        network: string;
        tipDigest: string;
    }> {
        return this.call<{
            blockHeight: string;
            lastUpdated: string;
            network: string;
            tipDigest: string;
        }>("get_network_info");
    }

    /**
     * Get peer information
     */
    async getPeerInfo(): Promise<{
        connectedCount: number;
        lastUpdated: string;
        peers: Array<{
            address: string;
            connected: boolean;
            lastSeen: number;
        }>;
    }> {
        return this.call<{
            connectedCount: number;
            lastUpdated: string;
            peers: Array<{
                address: string;
                connected: boolean;
                lastSeen: number;
            }>;
        }>("get_peer_info");
    }

    /**
     * Get total wallet balance
     */
    async getBalance(): Promise<{
        confirmed: string;
        lastUpdated: string;
        unconfirmed: string;
    }> {
        return this.call<{
            confirmed: string;
            lastUpdated: string;
            unconfirmed: string;
        }>("get_balance");
    }

    /**
     * Get block difficulties
     */
    async getBlockDifficulties(params: {
        block_selector: string;
        max_num_blocks: number;
    }): Promise<Array<[number, number[]]>> {
        return this.call<Array<[number, number[]]>>(
            "block_difficulties",
            params,
        );
    }

    /**
     * Get block intervals
     */
    async getBlockIntervals(params: {
        block_selector: string;
        max_num_blocks: number;
    }): Promise<Array<[number, number]>> {
        return this.call<Array<[number, number]>>("block_intervals", params);
    }

    /**
     * Generate new wallet
     */
    async generateWallet(): Promise<unknown> {
        return this.call<unknown>("generate_wallet");
    }

    /**
     * Export seed phrase
     */
    async exportSeedPhrase(): Promise<string> {
        return this.call<string>("export_seed_phrase");
    }

    /**
     * Import seed phrase
     */
    async importSeedPhrase(params: { seed_phrase: string }): Promise<unknown> {
        return this.call<unknown>("import_seed_phrase", params);
    }

    /**
     * Get wallet file path
     */
    async whichWallet(): Promise<string> {
        return this.call<string>("which_wallet");
    }

    /**
     * Get POW puzzle internal key
     */
    async getPowPuzzleInternalKey(): Promise<unknown> {
        return this.call<unknown>("pow_puzzle_internal_key");
    }
}

// Export singleton instance
export const neptuneRpcService = new NeptuneRpcService();
