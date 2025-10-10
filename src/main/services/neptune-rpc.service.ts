/**
 * Neptune RPC Service
 *
 * Service for making HTTP JSON-RPC calls to neptune-cli RPC server
 * Uses ky for HTTP requests
 */

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

    constructor(rpcPort: number = 9801) {
        this.rpcUrl = `http://localhost:${rpcPort}`;
    }

    /**
     * Set authentication cookie
     */
    setCookie(cookie: string): void {
        this.cookie = cookie;
        logger.info(
            { cookiePreview: `${cookie.substring(0, 16)}...` },
            "RPC cookie set",
        );
    }

    /**
     * Make a JSON-RPC call
     */
    private async call<T>(
        method: string,
        params?: Record<string, unknown> | unknown[],
        timeout: number = 10000,
    ): Promise<T> {
        this.requestId += 1;

        const request: JsonRpcRequest = {
            jsonrpc: "2.0",
            method,
            params: params || {}, // Use empty object if params not provided
            id: this.requestId,
        };

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
                    id: this.requestId,
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
                    },
                    timeout, // Configurable timeout
                })
                .json<JsonRpcResponse<T>>();

            logger.info({ method, id: this.requestId }, "RPC call successful");

            if (response.error) {
                throw new Error(
                    `RPC error ${response.error.code}: ${response.error.message}`,
                );
            }

            if (response.result === undefined) {
                throw new Error("RPC response missing result");
            }

            logger.debug({ method, id: this.requestId }, "RPC call successful");

            return response.result;
        } catch (error) {
            logger.error(
                { error: (error as Error).message, method },
                "RPC call failed",
            );
            throw error;
        }
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
        return this.call<{ tx_id: string; lastUpdated: string }>(
            "send",
            params,
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
     * Get detailed peer information
     */
    async getPeerInfo(): Promise<unknown[]> {
        return this.call<unknown[]>("peer_info");
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
     * Get mempool overview with pagination
     */
    async getMempoolOverview(params: {
        start_index: number;
        number: number;
    }): Promise<unknown> {
        return this.call<unknown>("mempool_overview", params);
    }

    /**
     * Get all mempool transaction IDs
     */
    async getMempoolTxIds(): Promise<string[]> {
        return this.call<string[]>("mempool_tx_ids");
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
